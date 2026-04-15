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
        const nodeIds = response.result;

        if (nodeIds.length === 0) {
          throw "An element needs to be selected";
        }

        const firstObject = nodeIds[0];
        const obj = await kittl.design.object.getObject({ id: firstObject });

        //@ts-expect-error - objectName exist but the type is narrowing down by type, let's suppress this for now
        const objectName = obj.result.name;
        //@ts-expect-error - objectName exist but the type is narrowing down by type, let's suppress this for now
        const objectDefaultName = obj.result.defaultName;

        const name = objectName ?? objectDefaultName ?? "new project";

        let width = 0;
        let height = 0;

        if (obj.result?.type === "illustrationImage") {
          width = obj.result.width;
          height = obj.result.height;
        }

        const hasDimensions = width > 0 && height > 0;

        const dimensions = hasDimensions
          ? { target: { width, height } }
          : { multiplier: 1 };

        const blobResult = await kittl.design.canvas.getExport({
          format: "png",
          target: {
            nodeIds,
          },
          dimensions,
        });

        if (blobResult.isOk) {
          if (blobResult.result) {
            const { width, height, buffer } = await readImage(
              blobResult.result,
            );

            console.log({ width, height });

            return {
              data: { width, height, buffer, name: name },
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
