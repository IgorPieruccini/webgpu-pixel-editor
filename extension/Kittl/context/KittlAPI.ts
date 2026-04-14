import { kittl } from "@kittl/sdk";
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

  return {
    uploadImage,
    addImageToCanvas,
  };
};
