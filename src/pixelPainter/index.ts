import { pixelPainter } from "./pixelPainter";

const ZOOM_SENSITIVITY = 1.02;

export const init = async () => {
  const gridSize: number = 8;
  const cellPosition = { x: 0, y: 0 };
  const pan = { x: 0, y: 0 };
  let zoom = 1;
  let pressingSpace = false;

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

  window.addEventListener("mousemove", (e) => {
    const cell = pickCell(
      { x: e.clientX, y: e.clientY },
      { x: viewport.width, y: viewport.height },
      zoom,
      pan,
      gridSize,
    );

    cellPosition.x = cell.x;
    cellPosition.y = cell.y;

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

  function pickCell(
    mouse: { x: number; y: number },
    screenSize: { x: number; y: number },
    scale: number,
    offset: { x: number; y: number },
    gridSize: number,
  ) {
    // 1. screen → clip space (-1..1)
    const mx = ((mouse.x - offset.x) / screenSize.x) * 2 - 1;
    const my = ((mouse.y + offset.y) / screenSize.y) * -2 + 1; // y flips because screen origin is top-left

    // 2. clip space → world space (undo shader transform)
    const worldX = mx / scale;
    const worldY = my / scale;

    // 3. world space (-1..1) → normalized 0..1 → grid index
    const cellX = Math.floor((worldX + 1) * 0.5 * gridSize);
    const cellY = Math.floor((worldY + 1) * 0.5 * gridSize);

    return { x: cellX, y: gridSize - 1 - cellY };
  }

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
