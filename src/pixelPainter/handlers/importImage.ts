export type ImportImageHandler = ReturnType<typeof createImportImageHandler>;

export const createImportImageHandler = () => {
  const parseBlobToUint8Array = async (
    blob: Blob,
  ): Promise<{
    buffer: Uint8Array<ArrayBuffer>;
    width: number;
    height: number;
  }> => {
    const bitmap = await createImageBitmap(blob);

    try {
      const canvas =
        typeof OffscreenCanvas !== "undefined"
          ? new OffscreenCanvas(bitmap.width, bitmap.height)
          : Object.assign(document.createElement("canvas"), {
              width: bitmap.width,
              height: bitmap.height,
            });

      const context = canvas.getContext("2d", {
        willReadFrequently: true,
      });

      if (!context) {
        throw new Error("Could not create 2D canvas context for image import");
      }

      context.drawImage(bitmap, 0, 0);

      const { data } = context.getImageData(0, 0, bitmap.width, bitmap.height);
      const buffer = new Uint8Array(data);

      return {
        buffer,
        width: bitmap.width,
        height: bitmap.height,
      };
    } catch {
      throw new Error("Error on parsing blob");
    } finally {
      bitmap.close();
    }
  };

  return {
    parseBlobToUint8Array,
  };
};
