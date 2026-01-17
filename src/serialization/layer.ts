const CUR_VERSION = 0.1;

const serialize = (buffer: Uint32Array) => {
  const colorMap = new Map<number, number[]>();

  let cColor = buffer[0];

  let rangeStart = 0;
  let index = 0;

  for (const color of buffer) {
    if (color !== cColor) {
      const rangeArray = [rangeStart, index - 1, -1];
      const colorRanges = colorMap.get(cColor) || [];
      colorMap.set(cColor, [...colorRanges, ...rangeArray]);

      cColor = color;
      rangeStart = index;
    }

    index++;
  }

  const colorDataArray = [CUR_VERSION];

  for (const [key, colors] of colorMap) {
    const data = [-2, key, ...colors];
    colorDataArray.push(...data);
  }
};

export const layer = {
  serialize,
};
