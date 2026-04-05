function uint8ToBase64(uint8: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < uint8.length; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}


function base64ToUint8(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

const serialize = (buffer: Uint8Array) => {
  return uint8ToBase64((buffer));
}

const deserialize = (base64: string) => {
  return base64ToUint8(base64);
}

export const layer = {
  serialize,
  deserialize,
};
