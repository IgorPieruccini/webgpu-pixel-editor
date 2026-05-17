/**
 * @fileoverview Declare all constants of the application
 */

import type { Vec2 } from "./pixelPainter/types";

export const ZOOM_SENSITIVITY = 0.001;

export const MIN_GRID_SIZE = 8;

export const MAX_GRID_SIZE = 1024;

export const DEFAULT_GRID_SIZE: Vec2 = { x: 128, y: 128 };

export const LAYER_PREVIEW_SIZE: Vec2 = { x: 300, y: 300 };

/**
 * Number of 8-bit components per pixel (for example, RGBA = 4).
 *
 * Used when performing byte-level operations on image buffers (e.g.
 * Uint8ClampedArray) to convert between pixel counts and byte lengths,
 * compute offsets, and calculate strides.
 */
export const BYTES_PER_PIXEL = 4;

/**
 * RGBA component offsets for accessing color channels in pixel buffers.
 * Used when accessing individual color components in Uint8Array buffers.
 */
export const RGBA_OFFSET = {
  RED: 0,
  GREEN: 1,
  BLUE: 2,
  ALPHA: 3,
} as const;

export const FILE_FORMAT = ".pxart";
