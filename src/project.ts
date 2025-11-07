import { pixelPainter } from "./pixelPainter/pixelPainter";
import { ZOOM_SENSITIVITY } from "./constants";

export const initializeProject = async () => {
  const gridSize: number = 32;
  const cellPosition = { x: 0, y: 0 };
  const pan = { x: 0, y: 0 };
  let zoom = 1;
  let pressingSpace = false;

  const canvas = document.getElementById("main-canvas");
  if (!canvas) {
    throw new Error("Canvas element not found");
  }

  const viewport = {
    left: canvas.offsetLeft,
    top: canvas.offsetTop,
    width: canvas.clientWidth,
    height: canvas.clientHeight,
  };

  const { drawFrame, paintPixel, setBrushColor, getColorFrom } =
    await pixelPainter(gridSize, {
      x: viewport.width,
      y: viewport.height,
    });

  //@ts-expect-error - TODO: add type for it
  window.editor.setBrushColor = setBrushColor;

  canvas.addEventListener("mousemove", (e) => {
    let aspectRatio = viewport.width / viewport.height;

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
      pan.x += e.movementX * aspectRatio;
      pan.y -= e.movementY;
    }
  });

  canvas.addEventListener("mousedown", () => {
    paintPixel(cellPosition);
  });

  window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !pressingSpace) {
      pressingSpace = true;
    }
  });

  window.addEventListener("keypress", (e) => {
    if (e.code === "KeyP") {
      const color = getColorFrom(cellPosition);
      setBrushColor(color);
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
    const aspectRatio = screenSize.x / screenSize.y;
    const gap = (-screenSize.x * aspectRatio) / 2 + screenSize.x / 2;

    // 1. screen → clip space (-1..1)
    const mx =
      ((mouse.x * aspectRatio - offset.x + gap) / screenSize.x) * 2 - 1;
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
    const mouseX = e.clientX - viewport.left - viewport.width / 2;
    const mouseY = -(e.clientY - viewport.top - viewport.height / 2);
    const oldZoom = zoom;

    if (e.deltaY > 0) {
      zoom /= ZOOM_SENSITIVITY;
    } else {
      zoom *= ZOOM_SENSITIVITY;
    }

    const zoomFactor = zoom / oldZoom;

    // Adjust pan so zoom centers on mouse
    pan.x = (pan.x - mouseX) * zoomFactor + mouseX;
    pan.y = (pan.y - mouseY) * zoomFactor + mouseY;
  };

  canvas.addEventListener("wheel", wheelHandler, { passive: false });

  const loop = () => {
    drawFrame(cellPosition, pan, zoom);
    requestAnimationFrame(loop);
  };

  loop();
};
