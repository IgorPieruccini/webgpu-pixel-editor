import { pixelPainter } from "./pixelPainter";

export const init = async () => {
  const gridSize: number = 32;
  const cellPosition = { x: 0, y: 0 };

  const canvas = document.getElementById("main-canvas");
  if (!canvas) {
    throw new Error("Canvas element not found");
  }

  const canvasBounds = canvas.getBoundingClientRect();

  const { drawFrame, paintPixel } = await pixelPainter(gridSize, {
    x: canvasBounds.width,
    y: canvasBounds.height,
  });

  const cellSize = {
    x: canvasBounds.width / gridSize,
    y: canvasBounds.height / gridSize,
  };

  window.addEventListener("mousemove", (e) => {
    const mousePosRelativeToCanvas = {
      x: e.clientX - canvasBounds.left,
      y: e.clientY - canvasBounds.top,
    };

    cellPosition.x = Math.floor(mousePosRelativeToCanvas.x / cellSize.x);
    cellPosition.y = Math.floor(mousePosRelativeToCanvas.y / cellSize.y);
  });

  window.addEventListener("mousedown", () => {
    paintPixel(cellPosition);
  });

  const loop = () => {
    drawFrame(cellPosition);
    requestAnimationFrame(loop);
  };

  loop();
};
