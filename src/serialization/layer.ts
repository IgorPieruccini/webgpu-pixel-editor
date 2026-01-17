import type { Vec2 } from "../editor/types";

const CUR_VERSION = 0.1;

const RANGE_SEPARATOR = -1;
const LAYER_DATA_SEPARATOR = -2;

const serialize = (buffer: Uint32Array, gridSize: Vec2): number[] => {
  const colorMap = new Map<number, number[]>();

  let cColor = buffer[0];

  let rangeStart = 0;
  let index = 0;

  for (const color of buffer) {
    if (color !== cColor || index === buffer.length - 1) {
      const rangeArray = [
        rangeStart,
        index === buffer.length - 1 ? index : index - 1,
        RANGE_SEPARATOR,
      ];
      const colorRanges = colorMap.get(cColor) || [];
      colorMap.set(cColor, [...colorRanges, ...rangeArray]);

      cColor = color;
      rangeStart = index;
    }

    index++;
  }

  const colorDataArray = [CUR_VERSION, gridSize.x, gridSize.y];

  for (const [key, colors] of colorMap) {
    const data = [LAYER_DATA_SEPARATOR, key, ...colors];
    colorDataArray.push(...data);
  }

  return [...colorDataArray, LAYER_DATA_SEPARATOR];
};

const deserialize = (data: number[]): Uint32Array<ArrayBuffer> => {
  const version = data[0];
  console.log(
    "only one version exist for now, so nothing to do with it",
    version,
  );

  const layerGridSize = { x: data[1], y: data[2] };

  // 4 is after the LAYER_DATA_SEPARATOR
  const dataLayer = data.slice(3, data.length);

  const buffer: Uint32Array<ArrayBuffer> = new Uint32Array(
    layerGridSize.x * layerGridSize.x,
  );

  const paintRange = (color: number, start: number, end: number) => {
    for (let i = start; i <= end; i++) {
      buffer[i] = color;
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
