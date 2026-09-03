import React, { useState, useEffect, useCallback } from 'react';
import { CopyButton } from '../components/CopyButton';
import { Shield } from 'lucide-react';
import { DarkPanel } from '../components/DevToolChrome';

export const HashGenerator: React.FC = () => {
  const [input, setInput] = useState<string>('NextTool - free online tools');
  const [hashes, setHashes] = useState<{
    sha256: string;
    sha1: string;
    sha512: string;
    md5: string;
  }>({
    sha256: '',
    sha1: '',
    sha512: '',
    md5: ''
  });

  const computeMD5 = useCallback((str: string): string => {
    const rotateLeft = (x: number, c: number) => (x << c) | (x >>> (32 - c));
    const utf8 = unescape(encodeURIComponent(str));
    const bytes: number[] = [];
    for (let i = 0; i < utf8.length; i++) bytes.push(utf8.charCodeAt(i));

    const originalLen = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);

    for (let i = 0; i < 8; i++) bytes.push(Math.floor(originalLen / Math.pow(2, 8 * i)) % 256);

    let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
    const T = (n: number) => Math.floor(Math.abs(Math.sin(n)) * 4294967296);

    for (let chunkStart = 0; chunkStart < bytes.length; chunkStart += 64) {
      const M: number[] = [];
      for (let i = 0; i < 16; i++) {
        M[i] = bytes[chunkStart + i * 4] |
          (bytes[chunkStart + i * 4 + 1] << 8) |
          (bytes[chunkStart + i * 4 + 2] << 16) |
          (bytes[chunkStart + i * 4 + 3] << 24);
      }

      let A = a0, B = b0, C = c0, D = d0;
      for (let i = 0; i < 64; i++) {
        let F: number, g: number;
        if (i < 16) { F = (B & C) | (~B & D); g = i; }
        else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
        else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
        else { F = C ^ (B | ~D); g = (7 * i) % 16; }
        const temp = D;
        D = C;
        C = B;
        B = (B + rotateLeft((A + F + T(i + 1) + M[g]) >>> 0, [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21][Math.floor(i / 16) * 4 + (i % 4)])) >>> 0;
        A = temp;
      }
      a0 = (a0 + A) >>> 0;
      b0 = (b0 + B) >>> 0;
      c0 = (c0 + C) >>> 0;
      d0 = (d0 + D) >>> 0;
    }

    const toHex = (n: number) =>
      [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]
        .map(b => ('00' + b.toString(16)).slice(-2))
        .join('');
    return toHex(a0) + toHex(b0) + toHex(c0) + toHex(d0);
  }, []);

  const generateHashes = useCallback(async () => {
    if (!input) {
      setHashes({ sha256: '', sha1: '', sha512: '', md5: '' });
      return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    try {
      const buffer256 = await window.crypto.subtle.digest('SHA-256', data);
      const sha256Hex = Array.from(new Uint8Array(buffer256))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const buffer1 = await window.crypto.subtle.digest('SHA-1', data);
      const sha1Hex = Array.from(new Uint8Array(buffer1))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const buffer512 = await window.crypto.subtle.digest('SHA-512', data);
      const sha512Hex = Array.from(new Uint8Array(buffer512))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const md5Hex = computeMD5(input);

      setHashes({
        sha256: sha256Hex,
        sha1: sha1Hex,
        sha512: sha512Hex,
        md5: md5Hex
      });
    } catch (e) {
      console.error(e);
    }
  }, [input, computeMD5]);

  useEffect(() => {
    generateHashes();
  }, [input, generateHashes]);

  const hashRows: { key: keyof typeof hashes; label: string; icon?: boolean }[] = [
    { key: 'sha256', label: 'SHA-256', icon: true },
    { key: 'sha512', label: 'SHA-512' },
    { key: 'sha1', label: 'SHA-1' },
    { key: 'md5', label: 'MD5' },
  ];

  return (
    <div className="space-y-3.5">
      {/* Input Section */}
      <DarkPanel
        label="Input"
        headerRight={<span className="font-mono text-[11px] text-[color:var(--devpanel-label)]">{input.length} chars</span>}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder="Enter text to generate cryptographic hashes..."
          className="w-full h-[160px] bg-transparent p-4 text-[13.5px] font-mono text-[color:var(--devpanel-text)] placeholder:text-[color:var(--devpanel-label)] resize-none focus:outline-none leading-relaxed outline-none"
        />
      </DarkPanel>

      {/* Hashes List */}
      <div className="space-y-3">
        {hashRows.map(({ key, label, icon }) => (
          <div
            key={key}
            className="bg-card border border-border rounded-2xl px-[18px] py-[18px] flex items-center gap-3"
          >
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground shrink-0 w-20">
              {icon && <Shield className="w-3.5 h-3.5 text-primary" />} {label}
            </span>
            <span className="flex-1 font-mono text-[14px] break-all select-all">{hashes[key] || 'Generating...'}</span>
            <CopyButton text={hashes[key]} className="shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};
