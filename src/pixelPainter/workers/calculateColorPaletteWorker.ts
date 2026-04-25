export type WorkerRequest = {
  buffers: Array<Uint8Array<ArrayBuffer>>;
};

export type WorkerResponse = {
  colors: string[];
};

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { buffers } = event.data;

  const stride = 4;
  const hexColor = new Set<string>();

  const bufferArray = Object.values(buffers);

  const byteToHex = (value: number) => value.toString(16).padStart(2, "0");

  for (let i = 0; i < bufferArray.length; i++) {
    const buffer = buffers[i];
    for (let i = 0; i < buffer.length; i += stride) {
      const r = buffer[i];
      const g = buffer[i + 1];
      const b = buffer[i + 2];
      const hex = `#${byteToHex(r)}${byteToHex(g)}${byteToHex(b)}`;
      if (hex === "#000000") {
        continue;
      }
      hexColor.add(hex);
    }
  }

  const response: WorkerResponse = {
    colors: Array.from(hexColor),
  };

  self.postMessage(response);
};
