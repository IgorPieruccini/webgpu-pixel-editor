import { bindAlphaTexture } from "./alpha";
import { bindTexture } from "./pixel";
import { bind } from "./ui";

export const material = {
  pixel: bindTexture,
  alpha: bindAlphaTexture,
  ui: bind,
};
