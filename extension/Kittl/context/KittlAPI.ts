import { kittl } from "@kittl/sdk";
import type { PixelPainterMethods, Vec2 } from "../../../src/lib";

type ReadImage = PixelPainterMethods["imageImporter"]["readImage"];

export type CreateKittlAPIType = ReturnType<typeof createKittlAPI>;
export type ImportedActiveSegment = Awaited<ReturnType<ReadImage>>;
export type ImportActiveSegmentResult =
  | { data: ImportedActiveSegment & { name: string }; error: null }
  | { data: null; error: unknown };

export const createKittlAPI = (readImage: ReadImage) => {
  const uploadImage = async (blob: Blob) => {
    const uploadResult = await kittl.upload.image.upload({ blob });
    return uploadResult;
  };

  const addImageToCanvas = async (ObjectName: string, size: Vec2) => {
    await kittl.design.image.addImage({
      src: ObjectName,
      size: { width: size.x, height: size.y, applyViewportScale: false },
      position: { relative: { to: "viewport", location: "center" } },
    });
  };

  const importActiveSegment = async () => {
    try {
      const response = await kittl.state.getSelectedObjectsIds();
      if (response.isOk) {
        const id = response.result[0];

        const blobResult = await kittl.design.canvas.getExport({
          format: "png",
          target: {
            nodeIds: [id],
          },
          dimensions: {
            multiplier: 1,
          },
        });

        if (blobResult.isOk) {
          if (blobResult.result) {
            const { width, height, buffer } = await readImage(
              blobResult.result,
            );

            return {
              data: { width, height, buffer, name: id },
              error: null,
            };
          }
        }

        if (blobResult.error) {
          throw blobResult.error;
        }
      }

      if (response.error) {
        throw response.error;
      }
    } catch (error) {
      return {
        data: null,
        error,
      } satisfies ImportActiveSegmentResult;
    }

    return {
      data: null,
      error: new Error("No active segment available to import"),
    } satisfies ImportActiveSegmentResult;
  };

  return {
    uploadImage,
    addImageToCanvas,
    importActiveSegment,
  };
};
