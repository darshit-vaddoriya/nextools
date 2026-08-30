import React, { useState, useEffect, useCallback } from 'react';
import { CopyButton } from '../components/CopyButton';
import { Shield } from 'lucide-react';

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

  return (
    <div className="space-y-5">
      {/* Input Section */}
      <div className="rounded-xl border   bg-card border-border p-4 space-y-2 shadow-xs">
        <label className="text-xs font-bold uppercase tracking-wider  text-foreground flex items-center justify-between">
          <span>Input String / Data</span>
          <span className="text-muted-foreground font-mono text-[11px]">{input.length} chars</span>
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to generate cryptographic hashes..."
          className="w-full    bg-muted border-border border rounded-lg p-3 text-xs font-mono placeholder:text-muted-foreground focus:outline-none leading-relaxed h-24"
        />
      </div>

      {/* Hashes List */}
      <div className="space-y-3">
        {/* SHA-256 */}
        <div className="rounded-xl border   bg-card border-border p-4 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold  text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-primary" /> SHA-256 (Recommended)
            </span>
            <CopyButton text={hashes.sha256} />
          </div>
          <div className="p-2.5   bg-muted border-border border rounded-lg text-xs font-mono text-success break-all select-all font-semibold">
            {hashes.sha256 || 'Generating...'}
          </div>
        </div>

        {/* SHA-512 */}
        <div className="rounded-xl border   bg-card border-border p-4 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold  text-foreground uppercase tracking-wider">
              SHA-512
            </span>
            <CopyButton text={hashes.sha512} />
          </div>
          <div className="p-2.5   bg-muted border-border border rounded-lg text-xs font-mono text-sky-600 dark:text-sky-400 break-all select-all font-semibold">
            {hashes.sha512 || 'Generating...'}
          </div>
        </div>

        {/* SHA-1 */}
        <div className="rounded-xl border   bg-card border-border p-4 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold  text-foreground uppercase tracking-wider">
              SHA-1
            </span>
            <CopyButton text={hashes.sha1} />
          </div>
          <div className="p-2.5   bg-muted border-border border rounded-lg text-xs font-mono text-amber-600 dark:text-amber-400 break-all select-all font-semibold">
            {hashes.sha1 || 'Generating...'}
          </div>
        </div>

        {/* MD5 */}
        <div className="rounded-xl border   bg-card border-border p-4 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold  text-foreground uppercase tracking-wider">
              MD5 Digest
            </span>
            <CopyButton text={hashes.md5} />
          </div>
          <div className="p-2.5   bg-muted border-border border rounded-lg text-xs font-mono text-purple-600 dark:text-purple-400 break-all select-all font-semibold">
            {hashes.md5 || 'Generating...'}
          </div>
        </div>
      </div>
    </div>
  );
};
