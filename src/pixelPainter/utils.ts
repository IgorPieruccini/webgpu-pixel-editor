import type { RGBA } from "./types";

export const uintToRGBA = ([r, g, b, a]: Array<number>): RGBA => {
  return { r, g, b, a: a / 255 };
};

export const numberToRGBA = (argb: number): RGBA => {
  const hasAlpha = argb.toString(16).length > 6;

  if (hasAlpha) {
    return {
      // low byte is alpha (0-255) -> normalize to 0-1
      a: (argb & 0xff) / 255,
      // high bytes are R, G, B
      r: (argb >>> 24) & 0xff,
      g: (argb >>> 16) & 0xff,
      b: (argb >>> 8) & 0xff,
    };
  }

  return {
    a: 1,
    r: (argb >>> 16) & 0xff,
    g: (argb >>> 8) & 0xff,
    b: argb & 0xff,
  };
};

export const rgbaToHex = ({ r, g, b, a }: RGBA): number => {
  // Convert RGBA object to RGBA format (0xRRGGBBAA)
  // r, g, b are expected in 0-255 range; a is expected in 0-1 range
  const rByte = Math.round(Math.max(0, Math.min(255, r))) & 0xff;
  const gByte = Math.round(Math.max(0, Math.min(255, g))) & 0xff;
  const bByte = Math.round(Math.max(0, Math.min(255, b))) & 0xff;
  const aByte = Math.round(Math.max(0, Math.min(1, a)) * 255) & 0xff;

  // Compose into 0xRRGGBBAA using unsigned right shift to avoid negative numbers
  return (
    ((rByte << 24) >>> 0) |
    ((gByte << 16) >>> 0) |
    ((bByte << 8) >>> 0) |
    (aByte >>> 0)
  );
};

export const alphaComposite = (src: RGBA, dst: RGBA) => {
  const outA = src.a + dst.a * (1 - src.a);

  const outR = (src.r * src.a + dst.r * dst.a * (1 - src.a)) / outA;
  const outG = (src.g * src.a + dst.g * dst.a * (1 - src.a)) / outA;
  const outB = (src.b * src.a + dst.b * dst.a * (1 - src.a)) / outA;

  return { r: outR, g: outG, b: outB, a: outA };
};
