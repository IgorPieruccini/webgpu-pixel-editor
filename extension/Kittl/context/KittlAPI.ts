import { kittl } from "@kittl/sdk";
import { toastError } from "../../ui/toast/errorToast";
import { parseBlobToUint8Array } from "../../../src/pixelPainter/utils";
import type { Vec2 } from "../../../src/lib";

export type CreateKittlAPIType = ReturnType<typeof createKittlAPI>;

export const createKittlAPI = () => {
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
          throw toastError(
            "Please select one or multiple element from the Canvas",
          );
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
            const { width, height, buffer } = await parseBlobToUint8Array(
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
          throw toastError(blobResult.error, "Kittl export failed");
        }
      }

      if (response.error) {
        throw toastError(
          response.error,
          "Failed to read selected Kittl objects",
        );
      }
    } catch (error) {
      return {
        data: null,
        error,
      };
    }

    return {
      data: null,
      error: new Error("No active segment available to import"),
    };
  };

  return {
    uploadImage,
    addImageToCanvas,
    importActiveSegment,
  };
};
