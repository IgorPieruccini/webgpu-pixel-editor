import { initGrid } from "./test";

export const init = async () => {
  const draw = await initGrid();

  let gridSize: number = 32;

  const cellPosition = { x: 0, y: 0 };

  const canvas = document.getElementById("main-canvas");
  if (!canvas) {
    throw new Error("Canvas element not found");
  }

  const canvasBounds = canvas.getBoundingClientRect();

  window.addEventListener("mousemove", (e) => {
    const cellSize = {
      x: canvasBounds.width / gridSize,
      y: canvasBounds.height / gridSize,
    };

    const mousePosRelativeToCanvas = {
      x: e.clientX - canvasBounds.left,
      y: e.clientY - canvasBounds.top,
    };

    cellPosition.x = Math.floor(mousePosRelativeToCanvas.x / cellSize.x);

    cellPosition.y = Math.floor(
      (canvasBounds.height - mousePosRelativeToCanvas.y) / cellSize.y,
    );
  });

  const loop = () => {
    draw(gridSize, cellPosition);
    requestAnimationFrame(loop);
  };

  loop();
};
