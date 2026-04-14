import type { Vec2 } from "../../editor/types";
import { createUniformBufferHandler } from "../uniformBuffersHandler";
import type { LayerHandler } from "./layerHandler";
import { createRenderHandler } from "./renderHandler";

export const createExportHandler = (
  projectName: string,
  gridSize: Vec2,
  layerHandler: LayerHandler,
) => {
  const renderToCanvas = async () => {
    // Create the canvas and set to the gridSize
    const canvas = document.createElement("canvas");
    canvas.width = gridSize.x;
    canvas.height = gridSize.y;

    const uniformBufferHandler = createUniformBufferHandler(gridSize, gridSize);

    const renderHandler = await createRenderHandler(
      layerHandler,
      uniformBufferHandler,
      gridSize,
      canvas,
      false, // don't render UI
    );

    for (const layer of layerHandler.getList()) {
      renderHandler.addLayerTexture(layer.id);
    }

    uniformBufferHandler.updateZoom(1);

    renderHandler.draw();

    return canvas;
  };

  const getBlob = async (): Promise<Blob> => {
    const canvas = await renderToCanvas();

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Something went wrong while exporting image"));
          return;
        }

        resolve(blob);
      }, "image/png");
    });
  };

  const exportImage = async () => {
    const blob = await getBlob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectName}.png`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return { exportImage, getBlob };
};
