import { pixelPainter } from "./pixelPainter";

export const init = async () => {
  const gridSize: number = 32;
  const cellPosition = { x: 0, y: 0 };

  const canvas = document.getElementById("main-canvas");
  if (!canvas) {
    throw new Error("Canvas element not found");
  }

  //@ts-expect-error - fix it
  const viewport = window.viewport.segments[0];

  canvas.setAttribute("width", `${viewport.width}px`);
  canvas.setAttribute("height", `${viewport.height}px`);

  const { drawFrame, paintPixel } = await pixelPainter(gridSize, {
    x: viewport.width,
    y: viewport.height,
  });

  const cellSize = {
    x: viewport.width / gridSize,
    y: viewport.height / gridSize,
  };

  window.addEventListener("mousemove", (e) => {
    const mousePosRelativeToCanvas = {
      x: e.clientX - viewport.left,
      y: e.clientY - viewport.top,
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
