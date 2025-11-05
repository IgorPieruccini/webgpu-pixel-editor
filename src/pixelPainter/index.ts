import { pixelPainter } from "./pixelPainter";

const ZOOM_SENSITIVITY = 1.02;

export const init = async () => {
  const gridSize: number = 8;
  const cellPosition = { x: 0, y: 0 };
  const pan = { x: 0, y: 0 };
  let zoom = 1;
  let pressingSpace = false;
  const mousePosRelativeToCanvas = { x: 0, y: 0 };

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
    mousePosRelativeToCanvas.x = e.clientX - viewport.left - pan.x;
    mousePosRelativeToCanvas.y = e.clientY - viewport.top + pan.y;

    cellPosition.x = Math.floor(mousePosRelativeToCanvas.x / cellSize.x);
    cellPosition.y = Math.floor(mousePosRelativeToCanvas.y / cellSize.y);

    if (pressingSpace) {
      pan.x += e.movementX;
      pan.y -= e.movementY;
    }
  });

  window.addEventListener("mousedown", () => {
    paintPixel(cellPosition);
  });

  window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !pressingSpace) {
      pressingSpace = true;
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
      pressingSpace = false;
    }
  });

  const wheelHandler = (e: WheelEvent) => {
    e.preventDefault();
    // const worldX = (e.offsetX - pan.x) / zoom;
    // const worldY = (e.offsetY - pan.y) / zoom;

    if (e.deltaY > 0) {
      zoom /= ZOOM_SENSITIVITY;
    } else {
      zoom *= ZOOM_SENSITIVITY;
    }

    // pan.x = e.offsetX - worldX * zoom;
    // pan.y = e.offsetY - worldY * zoom;
  };

  window.addEventListener("wheel", wheelHandler, { passive: false });

  const loop = () => {
    drawFrame(cellPosition, pan, zoom);
    requestAnimationFrame(loop);
  };

  loop();
};
