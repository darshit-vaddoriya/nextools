declare module 'gifenc' {
  export function GIFEncoder(opts?: Record<string, unknown>): {
    writeFrame(index: Uint8Array, width: number, height: number, opts: {
      palette: Uint32Array;
      delay?: number;
      transparent?: boolean;
      transparentIndex?: number;
      repeat?: number;
      dispose?: number;
    }): void;
    finish(): void;
    bytes(): Uint8Array<ArrayBuffer>;
    reset(): void;
  };
  export function quantize(rgba: Uint8Array | Uint8ClampedArray, maxColors: number): Uint32Array;
  export function applyPalette(rgba: Uint8Array | Uint8ClampedArray, palette: Uint32Array, format?: string): Uint8Array;
}
