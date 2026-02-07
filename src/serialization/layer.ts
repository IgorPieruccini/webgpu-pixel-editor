import type { Vec2 } from "../editor/types";
import { BYTES_PER_PIXEL } from "../constants";

const CUR_VERSION = 0.1;

const RANGE_SEPARATOR = -1;
const LAYER_DATA_SEPARATOR = -2;

const serialize = (buffer: Uint8Array, gridSize: Vec2): number[] => {
  const colorMap = new Map<number, number[]>();

  // Convert RGBA buffer to 32-bit color values
  const getPixelColor = (pixelIndex: number): number => {
    const baseIndex = pixelIndex;
    const r = buffer[baseIndex];
    const g = buffer[baseIndex + 1];
    const b = buffer[baseIndex + 2];
    const a = buffer[baseIndex + 3];
    // Force unsigned so separator values (-1, -2) can't collide with colors.
    return ((a << 24) | (r << 16) | (g << 8) | b) >>> 0;
  };

  const totalPixels = gridSize.x * gridSize.y * BYTES_PER_PIXEL;
  const totalPixelCount = totalPixels / BYTES_PER_PIXEL;
  let cColor = getPixelColor(0);
  let rangeStart = 0;

  for (
    let pixelIndex = 0;
    pixelIndex < totalPixels;
    pixelIndex += BYTES_PER_PIXEL
  ) {
    const color = getPixelColor(pixelIndex);
    if (color !== cColor) {
      const rangeEnd = pixelIndex / BYTES_PER_PIXEL - 1;
      const rangeArray = [rangeStart, rangeEnd, RANGE_SEPARATOR];
      const colorRanges = colorMap.get(cColor) || [];
      colorMap.set(cColor, [...colorRanges, ...rangeArray]);

      cColor = color;
      rangeStart = pixelIndex / BYTES_PER_PIXEL;
    }
  }

  // Flush the last range (including the final pixel).
  const lastRangeArray = [rangeStart, totalPixelCount - 1, RANGE_SEPARATOR];
  const lastColorRanges = colorMap.get(cColor) || [];
  colorMap.set(cColor, [...lastColorRanges, ...lastRangeArray]);

  const colorDataArray = [CUR_VERSION, gridSize.x, gridSize.y];

  for (const [key, colors] of colorMap) {
    const data = [LAYER_DATA_SEPARATOR, key, ...colors];
    colorDataArray.push(...data);
  }

  return [...colorDataArray, LAYER_DATA_SEPARATOR];
};

const deserialize = (data: number[]): Uint8Array<ArrayBuffer> => {
  //@ts-expect-error - only one version for now, so nothing to do with it
  const version = data[0];

  const layerGridSize = { x: data[1], y: data[2] };

  // 4 is after the LAYER_DATA_SEPARATOR
  const dataLayer = data.slice(3, data.length);

  const buffer: Uint8Array<ArrayBuffer> = new Uint8Array(
    layerGridSize.x * layerGridSize.y * BYTES_PER_PIXEL,
  );

  const paintRange = (color: number, start: number, end: number) => {
    const r = (color >>> 16) & 0xff;
    const g = (color >>> 8) & 0xff;
    const b = color & 0xff;
    const a = (color >>> 24) & 0xff;

    for (let pixelIndex = start; pixelIndex <= end; pixelIndex++) {
      const baseIndex = pixelIndex * BYTES_PER_PIXEL;
      buffer[baseIndex] = r;
      buffer[baseIndex + 1] = g;
      buffer[baseIndex + 2] = b;
      buffer[baseIndex + 3] = a;
    }
  };

  let color = 0;

  const readCell = () => {
    const cell = dataLayer[0];

    if (cell === LAYER_DATA_SEPARATOR) {
      dataLayer.shift();

      if (dataLayer.length === 0) {
        return;
      }

      const [_color, start, end] = dataLayer;
      color = _color >>> 0;
      paintRange(color, start, end);

      dataLayer.splice(0, 3);

      return;
    }

    if (cell == RANGE_SEPARATOR) {
      dataLayer.shift();

      if (dataLayer[0] === LAYER_DATA_SEPARATOR) {
        return;
      }

      const [start, end] = dataLayer;
      paintRange(color, start, end);

      dataLayer.splice(0, 2);
      return;
    }

    throw new Error(
      `Invalid layer data: unexpected cell value ${String(cell)}`,
    );
  };

  while (dataLayer.length !== 0) {
    readCell();
  }

  return buffer;
};

export const layer = {
  serialize,
  deserialize,
};
