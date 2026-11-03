/**
 * A small EXIF reader: finds the TIFF block in a JPEG (APP1 "Exif") or a PNG
 * (eXIf chunk) and returns the handful of fields people check before sharing
 * a photo, as readable label/value pairs. Every read is bounds-checked, so a
 * truncated or malformed block yields fewer fields rather than an exception.
 */

export interface ExifField {
  label: string;
  value: string;
  /** Location fields are the ones worth flagging before a photo is shared. */
  sensitive?: boolean;
}

/** The TIFF header and IFDs, wherever the container keeps them. */
function findTiff(bytes: Uint8Array): Uint8Array | null {
  // JPEG: walk the marker segments up to the image data.
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let p = 2;
    while (p + 4 <= bytes.length && bytes[p] === 0xff) {
      const marker = bytes[p + 1];
      if (marker === 0xda || marker === 0xd9) break; // start of scan / end of image
      const len = (bytes[p + 2] << 8) | bytes[p + 3];
      if (len < 2) break;
      if (marker === 0xe1 && len >= 8
        && bytes[p + 4] === 0x45 && bytes[p + 5] === 0x78 && bytes[p + 6] === 0x69 && bytes[p + 7] === 0x66) {
        return bytes.subarray(p + 10, Math.min(bytes.length, p + 2 + len));
      }
      p += 2 + len;
    }
    return null;
  }
  // PNG: chunks are length, type, data, CRC.
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    let p = 8;
    while (p + 8 <= bytes.length) {
      const len = ((bytes[p] << 24) | (bytes[p + 1] << 16) | (bytes[p + 2] << 8) | bytes[p + 3]) >>> 0;
      const type = String.fromCharCode(bytes[p + 4], bytes[p + 5], bytes[p + 6], bytes[p + 7]);
      if (type === 'eXIf') return bytes.subarray(p + 8, Math.min(bytes.length, p + 8 + len));
      if (type === 'IDAT' || type === 'IEND') break;
      p += 12 + len;
    }
  }
  return null;
}

type Raw = string | number | number[];

function readIfd(t: DataView, off: number, le: boolean): Map<number, Raw> {
  const out = new Map<number, Raw>();
  if (off + 2 > t.byteLength) return out;
  const count = t.getUint16(off, le);
  for (let i = 0; i < count; i++) {
    const e = off + 2 + i * 12;
    if (e + 12 > t.byteLength) break;
    const tag = t.getUint16(e, le);
    const type = t.getUint16(e + 2, le);
    const n = t.getUint32(e + 4, le);
    const size = ({ 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 } as Record<number, number>)[type];
    if (!size || n > 1 << 16) continue;
    const total = size * n;
    const at = total <= 4 ? e + 8 : t.getUint32(e + 8, le);
    if (at + total > t.byteLength) continue;
    if (type === 2) {
      let str = '';
      for (let k = 0; k < n; k++) {
        const c = t.getUint8(at + k);
        if (c === 0) break;
        str += String.fromCharCode(c);
      }
      out.set(tag, str.trim());
    } else if (type === 5 || type === 10) {
      const vals: number[] = [];
      for (let k = 0; k < n; k++) {
        const num = type === 5 ? t.getUint32(at + k * 8, le) : t.getInt32(at + k * 8, le);
        const den = type === 5 ? t.getUint32(at + k * 8 + 4, le) : t.getInt32(at + k * 8 + 4, le);
        vals.push(den ? num / den : 0);
      }
      out.set(tag, n === 1 ? vals[0] : vals);
    } else if (type === 3 || type === 4 || type === 9) {
      const vals: number[] = [];
      for (let k = 0; k < n; k++) {
        vals.push(type === 3 ? t.getUint16(at + k * 2, le) : type === 4 ? t.getUint32(at + k * 4, le) : t.getInt32(at + k * 4, le));
      }
      out.set(tag, n === 1 ? vals[0] : vals);
    } else {
      // BYTE / UNDEFINED: only short ones are worth keeping (version fields).
      if (n <= 8) out.set(tag, Array.from({ length: n }, (_, k) => t.getUint8(at + k)));
    }
  }
  return out;
}

const ORIENTATION: Record<number, string> = {
  1: 'Normal', 2: 'Mirrored', 3: 'Rotated 180°', 4: 'Mirrored vertically',
  5: 'Mirrored, rotated 90° anticlockwise', 6: 'Rotated 90° clockwise',
  7: 'Mirrored, rotated 90° clockwise', 8: 'Rotated 90° anticlockwise',
};

const dms = (v: Raw | undefined): number | null =>
  Array.isArray(v) && v.length >= 3 ? v[0] + v[1] / 60 + v[2] / 3600 : typeof v === 'number' ? v : null;

/** "2026:11:01 14:05:09" → "2026-11-01 14:05:09" */
const exifDate = (v: Raw | undefined) =>
  typeof v === 'string' && v ? v.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3') : null;

export function readExif(bytes: Uint8Array): ExifField[] | null {
  const tiff = findTiff(bytes);
  if (!tiff || tiff.length < 8) return null;
  const t = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength);
  const order = t.getUint16(0);
  if (order !== 0x4949 && order !== 0x4d4d) return null;
  const le = order === 0x4949;
  if (t.getUint16(2, le) !== 42) return null;

  const ifd0 = readIfd(t, t.getUint32(4, le), le);
  const exifPtr = ifd0.get(0x8769);
  const gpsPtr = ifd0.get(0x8825);
  const exif = typeof exifPtr === 'number' ? readIfd(t, exifPtr, le) : new Map<number, Raw>();
  const gps = typeof gpsPtr === 'number' ? readIfd(t, gpsPtr, le) : new Map<number, Raw>();

  const fields: ExifField[] = [];
  const add = (label: string, value: string | null | undefined, sensitive = false) => {
    if (value) fields.push({ label, value, sensitive });
  };
  const str = (m: Map<number, Raw>, tag: number) => {
    const v = m.get(tag);
    return typeof v === 'string' ? v : null;
  };

  const make = str(ifd0, 0x010f);
  const model = str(ifd0, 0x0110);
  // Many models already start with the maker's name ("Canon EOS R6").
  add('Camera', make && model && !model.toLowerCase().startsWith(make.toLowerCase().split(' ')[0]) ? `${make} ${model}` : model ?? make);
  add('Lens', str(exif, 0xa434));
  add('Date taken', exifDate(exif.get(0x9003)) ?? exifDate(ifd0.get(0x0132)));
  const exposure = exif.get(0x829a);
  if (typeof exposure === 'number' && exposure > 0) add('Exposure', exposure < 1 ? `1/${Math.round(1 / exposure)} s` : `${exposure} s`);
  const fnum = exif.get(0x829d);
  if (typeof fnum === 'number' && fnum > 0) add('Aperture', `f/${fnum.toFixed(1)}`);
  const iso = exif.get(0x8827);
  if (typeof iso === 'number') add('ISO', String(iso));
  const focal = exif.get(0x920a);
  if (typeof focal === 'number' && focal > 0) add('Focal length', `${Math.round(focal * 10) / 10} mm`);
  const orient = ifd0.get(0x0112);
  if (typeof orient === 'number') add('Orientation', ORIENTATION[orient]);
  add('Software', str(ifd0, 0x0131));
  add('Artist', str(ifd0, 0x013b), true);
  add('Copyright', str(ifd0, 0x8298));

  const lat = dms(gps.get(2));
  const lon = dms(gps.get(4));
  if (lat !== null && lon !== null && !(lat === 0 && lon === 0)) {
    const la = str(gps, 1) === 'S' ? -lat : lat;
    const lo = str(gps, 3) === 'W' ? -lon : lon;
    add('GPS location', `${la.toFixed(6)}, ${lo.toFixed(6)}`, true);
    const alt = gps.get(6);
    if (typeof alt === 'number') {
      const below = Array.isArray(gps.get(5)) ? (gps.get(5) as number[])[0] === 1 : gps.get(5) === 1;
      add('Altitude', `${below ? '-' : ''}${Math.round(alt)} m`, true);
    }
  } else if (gps.size) {
    add('GPS block', 'Present, but holds no coordinates', true);
  }
  return fields;
}
