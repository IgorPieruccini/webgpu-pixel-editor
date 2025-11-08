import { pixelPainter } from "../pixelPainter/pixelPainter";
import { ZOOM_SENSITIVITY } from "../constants";

export const initializeProject = async () => {
  const gridSize: number = 32;
  const cellPosition = { x: 0, y: 0 };
  const pan = { x: 0, y: 0 };
  let zoom = 1;
  let pressingSpace = false;
  let isLeftMouseDown = false;
  let selectedCells = { x: -1, y: -1, z: -1, w: -1 };
  let paintBoxOn = false;

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

  const {
    drawFrame,
    paintPixel,
    setBrushColor,
    getColorFrom,
    getCurrentColor,
  } = await pixelPainter(gridSize, {
    x: viewport.width,
    y: viewport.height,
  });

  canvas.addEventListener("mousemove", (e) => {
    let aspectRatio = viewport.width / viewport.height;

    const cell = pickCell({ x: e.clientX, y: e.clientY });

    cellPosition.x = cell.x;
    cellPosition.y = cell.y;

    if (pressingSpace) {
      pan.x += e.movementX * aspectRatio;
      pan.y -= e.movementY;
    }

    if (isLeftMouseDown && !pressingSpace && !paintBoxOn) {
      paintPixel(cellPosition);
    }

    if (paintBoxOn && isLeftMouseDown) {
      selectedCells.z = cell.x;
      selectedCells.w = cell.y;
    }
  });

  canvas.addEventListener("mousedown", (e) => {
    if (!paintBoxOn) {
      paintPixel(cellPosition);
    }

    isLeftMouseDown = true;

    if (paintBoxOn) {
      const cell = pickCell({ x: e.clientX, y: e.clientY });
      selectedCells.x = cell.x;
      selectedCells.y = cell.y;
    }
  });

  canvas.addEventListener("mouseup", () => {
    isLeftMouseDown = false;
    const selection = {
      x: Math.min(selectedCells.x, selectedCells.z),
      y: Math.min(selectedCells.y, selectedCells.w),
      z: Math.max(selectedCells.x, selectedCells.z),
      w: Math.max(selectedCells.y, selectedCells.w),
    };
    if (paintBoxOn) {
      for (let x = selection.x; x <= selection.z; x++) {
        for (let y = selection.y; y <= selection.w; y++) {
          paintPixel({
            x: x,
            y: y,
          });
        }
      }
    }
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
    if (e.code === "KeyR") {
      paintBoxOn = !paintBoxOn;
      selectedCells = { x: -1, y: -1, z: -1, w: -1 };
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
      pressingSpace = false;
    }
  });

  function pickCell(mouse: { x: number; y: number }) {
    const aspectRatio = viewport.width / viewport.height;
    const gap = (-viewport.width * aspectRatio) / 2 + viewport.width / 2;

    // 1. screen → clip space (-1..1)
    const mx = ((mouse.x * aspectRatio - pan.x + gap) / viewport.width) * 2 - 1;
    const my = ((mouse.y + pan.y) / viewport.height) * -2 + 1; // y flips because screen origin is top-left

    // 2. clip space → world space (undo shader transform)
    const worldX = mx / zoom;
    const worldY = my / zoom;

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
    drawFrame(cellPosition, pan, zoom, selectedCells);
    requestAnimationFrame(loop);
  };

  loop();

  return {
    setBrushColor,
    getCurrentColor,
  };
};
