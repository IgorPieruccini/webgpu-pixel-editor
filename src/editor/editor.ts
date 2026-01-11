import { pixelPainter } from "../pixelPainter/pixelPainter";
import { DEFAULT_GRID_SIZE, ZOOM_SENSITIVITY } from "../constants";
import { ACTIVATE_TOOL, INITIAL_PIXEL_PAINTER } from "./constant";
import { createSignal } from "solid-js";
import type { PixelPainterMethods } from "../pixelPainter/types";
import type { Vec2 } from "./types";

export type EditorType = Awaited<ReturnType<typeof initializeEditor>>;

export const initializeEditor = async () => {
  const cellPosition = { x: 0, y: 0 };
  const pan = { x: 0, y: 0 };
  let zoom = 1;
  let pressingSpace = false;
  let isLeftMouseDown = false;
  let selectedCells = { x: -1, y: -1, z: -1, w: -1 };

  let pixel: PixelPainterMethods = INITIAL_PIXEL_PAINTER;
  let gridSize: Vec2 = DEFAULT_GRID_SIZE;

  const [activeTool, _setActiveTool] = createSignal(ACTIVATE_TOOL.PAINT);

  const setActiveTool = (activeTool: number) => {
    _setActiveTool(activeTool);

    // When using paint selection tool (or perhaps other tools that will be implemented), these tools might not need
    // custom brush thickness, so it's set to 1.
    if (activeTool === ACTIVATE_TOOL.PAINT_SELECTION) {
      pixel.brush.setDefaultThickness(1);
    }

    // And here we make sure the tools that needs the custom thickness are used by setting the default to null
    if (activeTool !== ACTIVATE_TOOL.PAINT_SELECTION) {
      pixel.brush.setDefaultThickness(null);
    }
  };

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

  const createNewPainter = async (
    name: string,
    grid: Vec2,
  ): Promise<PixelPainterMethods> => {
    gridSize = grid;

    pixel = await pixelPainter(name, gridSize, {
      x: viewport.width,
      y: viewport.height,
    });

    return pixel;
  };

  canvas.addEventListener("mousemove", (e) => {
    let aspectRatio = viewport.width / viewport.height;

    const cell = pickCell(
      { x: e.clientX, y: e.clientY },
      { x: canvas.offsetLeft, y: canvas.offsetTop },
    );

    cellPosition.x = cell.x;
    cellPosition.y = cell.y;

    if (pressingSpace) {
      pan.x += e.movementX * aspectRatio;
      pan.y -= e.movementY;
    }

    if (isLeftMouseDown && !pressingSpace) {
      if (activeTool() === ACTIVATE_TOOL.PAINT) {
        pixel.brush.paint(cellPosition);
      }

      if (activeTool() === ACTIVATE_TOOL.DELETE) {
        pixel.brush.erase(cellPosition);
      }
    }

    if (activeTool() === ACTIVATE_TOOL.PAINT_SELECTION && isLeftMouseDown) {
      selectedCells.z = cell.x;
      selectedCells.w = cell.y;
    }
  });

  canvas.addEventListener("mousedown", (e) => {
    if (activeTool() === ACTIVATE_TOOL.PAINT) {
      pixel.brush.paint(cellPosition);
    }

    if (activeTool() === ACTIVATE_TOOL.DELETE) {
      pixel.brush.erase(cellPosition);
    }

    isLeftMouseDown = true;

    if (activeTool() === ACTIVATE_TOOL.PAINT_SELECTION) {
      const cell = pickCell(
        { x: e.clientX, y: e.clientY },
        { x: canvas.offsetLeft, y: canvas.offsetTop },
      );

      selectedCells.x = cell.x;
      selectedCells.y = cell.y;
      selectedCells.z = cell.x;
      selectedCells.w = cell.y;
    }
  });

  canvas.addEventListener("mouseup", () => {
    isLeftMouseDown = false;

    if (activeTool() === ACTIVATE_TOOL.PAINT_SELECTION) {
      const selection = {
        x: Math.min(selectedCells.x, selectedCells.z),
        y: Math.min(selectedCells.y, selectedCells.w),
        z: Math.max(selectedCells.x, selectedCells.z),
        w: Math.max(selectedCells.y, selectedCells.w),
      };
      for (let x = selection.x; x <= selection.z; x++) {
        for (let y = selection.y; y <= selection.w; y++) {
          pixel.brush.paint({
            x: x,
            y: y,
          });
        }
      }

      selectedCells = {
        x: -1,
        y: -1,
        z: -1,
        w: -1,
      };
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !pressingSpace) {
      pressingSpace = true;
    }
  });

  window.addEventListener("keypress", (e) => {
    if (e.code === "KeyP") {
      const color = pixel.brush.getColor(cellPosition);
      pixel.brush.setColor(color);
    }
    if (e.code === "KeyR") {
      setActiveTool(
        activeTool() === ACTIVATE_TOOL.PAINT
          ? ACTIVATE_TOOL.PAINT_SELECTION
          : ACTIVATE_TOOL.PAINT,
      );

      selectedCells = { x: -1, y: -1, z: -1, w: -1 };
    }

    if (e.code === "KeyL") {
      pixel.layer.add();
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
      pressingSpace = false;
    }
  });

  function pickCell(
    mouse: { x: number; y: number },
    canvasOffset: { x: number; y: number },
  ) {
    const aspectRatio = viewport.width / viewport.height;
    const gap = (-viewport.width * aspectRatio) / 2 + viewport.width / 2;

    // 1. screen → clip space (-1..1)
    const mx =
      (((mouse.x - canvasOffset.x) * aspectRatio - pan.x + gap) /
        viewport.width) *
        2 -
      1;

    const my = ((mouse.y - canvasOffset.y + pan.y) / viewport.height) * -2 + 1; // y flips because screen origin is top-left

    // 2. clip space → world space (undo shader transform)
    const worldX = mx / zoom;
    const worldY = my / zoom;

    // 3. world space (-1..1) → normalized 0..1 → grid index
    const cellX = Math.floor((worldX + 1) * 0.5 * gridSize.x);
    const cellY = Math.floor((worldY + 1) * 0.5 * gridSize.x);

    return { x: cellX, y: gridSize.x - 1 - cellY };
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
    pixel?.render(cellPosition, pan, zoom, selectedCells);
    requestAnimationFrame(loop);
  };

  loop();

  return {
    createNewPainter,
    activeTool,
    setActiveTool,
  };
};
