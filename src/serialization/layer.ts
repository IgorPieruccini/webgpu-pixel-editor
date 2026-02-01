import type { Vec2 } from "../editor/types";

const CUR_VERSION = 0.1;

const RANGE_SEPARATOR = -1;
const LAYER_DATA_SEPARATOR = -2;

const serialize = (buffer: Uint8Array, gridSize: Vec2): number[] => {
  const colorMap = new Map<number, number[]>();

  // Convert RGBA buffer to 32-bit color values
  const getPixelColor = (pixelIndex: number): number => {
    const baseIndex = pixelIndex * 4;
    const r = buffer[baseIndex];
    const g = buffer[baseIndex + 1];
    const b = buffer[baseIndex + 2];
    const a = buffer[baseIndex + 3];
    return (a << 24) | (r << 16) | (g << 8) | b;
  };

  const totalPixels = gridSize.x * gridSize.y;
  let cColor = getPixelColor(0);
  let rangeStart = 0;

  for (let pixelIndex = 0; pixelIndex < totalPixels; pixelIndex++) {
    const color = getPixelColor(pixelIndex);

    if (color !== cColor || pixelIndex === totalPixels - 1) {
      const rangeArray = [
        rangeStart,
        pixelIndex === totalPixels - 1 ? pixelIndex : pixelIndex - 1,
        RANGE_SEPARATOR,
      ];
      const colorRanges = colorMap.get(cColor) || [];
      colorMap.set(cColor, [...colorRanges, ...rangeArray]);

      cColor = color;
      rangeStart = pixelIndex;
    }
  }

  const colorDataArray = [CUR_VERSION, gridSize.x, gridSize.y];

  for (const [key, colors] of colorMap) {
    const data = [LAYER_DATA_SEPARATOR, key, ...colors];
    colorDataArray.push(...data);
  }

  return [...colorDataArray, LAYER_DATA_SEPARATOR];
};

const deserialize = (data: number[]): Uint8Array<ArrayBuffer> => {
  const version = data[0];
  console.log(
    "only one version exist for now, so nothing to do with it",
    version,
  );

  const layerGridSize = { x: data[1], y: data[2] };

  // 4 is after the LAYER_DATA_SEPARATOR
  const dataLayer = data.slice(3, data.length);

  const buffer: Uint8Array<ArrayBuffer> = new Uint8Array(
    layerGridSize.x * layerGridSize.y * 4,
  );

  const paintRange = (color: number, start: number, end: number) => {
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;
    const a = (color >> 24) & 0xff;

    for (let pixelIndex = start; pixelIndex <= end; pixelIndex++) {
      const baseIndex = pixelIndex * 4;
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
      color = _color;
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
