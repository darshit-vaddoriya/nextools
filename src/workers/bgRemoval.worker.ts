let libPromise: Promise<typeof import('@imgly/background-removal')> | null = null;
let lastPostedPct = -1;

const post = (message: Record<string, unknown>) => {
  (self as unknown as Worker).postMessage(message);
};

const run = async (e: MessageEvent<{ file: ArrayBuffer; type: string; name: string }>) => {
  const { file, type, name } = e.data;
  try {
    if (!libPromise) libPromise = import('@imgly/background-removal');
    const { removeBackground } = await libPromise;
    const input = new File([file], name, { type });
    const out = await removeBackground(input, {
      model: 'isnet_fp16',
      progress: (key, current, total) => {
        let pct = 0;
        if (key.includes('compute')) {
          pct = total > 0 ? 90 + (current / total) * 10 : 95;
        } else if (key.includes('fetch')) {
          pct = total > 0 ? (current / total) * 90 : 0;
        }
        const rounded = Math.max(1, Math.min(99, Math.round(pct)));
        if (rounded !== lastPostedPct) {
          lastPostedPct = rounded;
          post({
            type: 'progress',
            pct: rounded,
            stage: key.includes('compute') ? 'Removing background…' : 'Downloading AI model…',
          });
        }
      },
    });
    const buf = new Uint8Array(await out.arrayBuffer());
    post({ type: 'result', buffer: buf.buffer, mime: out.type });
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : 'Background removal failed.' });
  }
};

const compress = async (msg: { file: ArrayBuffer; type: string; maxDim: number }) => {
  try {
    post({ type: 'progress', pct: 94, stage: 'Compressing image…' });
    const blob = new Blob([msg.file], { type: msg.type });
    const bmp = await createImageBitmap(blob);
    const scale = Math.min(1, msg.maxDim / Math.max(bmp.width, bmp.height));
    const cw = Math.max(1, Math.round(bmp.width * scale));
    const ch = Math.max(1, Math.round(bmp.height * scale));
    const canvas = new OffscreenCanvas(cw, ch);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas unavailable.');
    ctx.drawImage(bmp, 0, 0, cw, ch);
    const out = await canvas.convertToBlob({ type: 'image/png' });
    const buf = new Uint8Array(await out.arrayBuffer());
    post({ type: 'compressed', buffer: buf.buffer, mime: 'image/png', width: cw, height: ch });
  } catch (err) {
    post({ type: 'compress-error', message: err instanceof Error ? err.message : 'Compression failed.' });
  }
};

(self as unknown as Worker).onmessage = (e: MessageEvent<{ action?: string } & Record<string, unknown>>) => {
  lastPostedPct = -1;
  if (e.data.action === 'compress') {
    void compress(e.data as never);
  } else {
    void run(e as never);
  }
};
