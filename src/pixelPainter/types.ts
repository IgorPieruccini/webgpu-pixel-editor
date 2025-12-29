import { pixelPainter } from "./pixelPainter";

export type PixelPainterMethods = Awaited<ReturnType<typeof pixelPainter>>;

export type Layer = {
  id: string;
  name: string;
  display: boolean;
  opacity: number;
};

export type Layers = Layer[];

export type RGB = {
  r: number;
  g: number;
  b: number;
};

export type RGBA = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export type ShaderType = "grid" | "ui";
