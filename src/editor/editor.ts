import { pixelPainter } from "../pixelPainter/pixelPainter";
import {
  DEFAULT_GRID_SIZE,
  ZOOM_SENSITIVITY,
  BYTES_PER_PIXEL,
} from "../constants";
import { ACTIVATE_TOOL, INITIAL_PIXEL_PAINTER } from "./constant";
import { createSignal } from "solid-js";
import type { PixelPainterMethods } from "../pixelPainter/types";
import type { Vec2 } from "./types";
import { calculateZoomFromGridAndCanvasSize } from "../utils";

export type EditorType = Awaited<ReturnType<typeof initializeEditor>>;

export type InitializeEditorOptions = {
  canvas?: HTMLCanvasElement;
  canvasId?: string;
};

export const initializeEditor = async (
  options: InitializeEditorOptions = {},
) => {
  const normalizeWheelDelta = (event: WheelEvent) => {
    const LINE_HEIGHT = 16;
    const PAGE_HEIGHT = window.innerHeight;

    switch (event.deltaMode) {
      case WheelEvent.DOM_DELTA_LINE:
        return event.deltaY * LINE_HEIGHT;
      case WheelEvent.DOM_DELTA_PAGE:
        return event.deltaY * PAGE_HEIGHT;
      default:
        return event.deltaY;
    }
  };

  let pressingSpace = false;
  let isLeftMouseDown = false;

  let pixel: PixelPainterMethods = INITIAL_PIXEL_PAINTER;
  let gridSize: Vec2 = DEFAULT_GRID_SIZE;

  const [activeTool, _setActiveTool] = createSignal(ACTIVATE_TOOL.PAINT);

  const setActiveTool = (activeTool: number) => {
    _setActiveTool(activeTool);

    // When using paint selection tool (or perhaps other tools that will be implemented), these tools might not need
    // custom brush thickness, so it's set to 1.
    if (activeTool === ACTIVATE_TOOL.PAINT_SELECTION) {
      pixel.render.setSelectionTool(true);
    }

    // And here we make sure the tools that needs the custom thickness are used by setting the default to null
    if (activeTool !== ACTIVATE_TOOL.PAINT_SELECTION) {
      pixel.render.setSelectionTool(false);
    }
  };

  const canvas =
    options.canvas ??
    document.getElementById(options.canvasId ?? "main-canvas");

  if (!(canvas instanceof HTMLCanvasElement)) {
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

    const zoom = calculateZoomFromGridAndCanvasSize(gridSize, {
      x: viewport.width,
      y: viewport.height,
    });

    pixel = await pixelPainter(
      name,
      gridSize,
      {
        x: viewport.width,
        y: viewport.height,
      },
      canvas,
    );

    pixel.render.setZoom(zoom - zoom * 0.3);

    return pixel;
  };

  canvas.addEventListener("mousemove", (e) => {
    let aspectRatio = viewport.width / viewport.height;
    const gridRatio = gridSize.x / gridSize.y;

    const cell = pickCell(
      { x: e.clientX, y: e.clientY },
      { x: canvas.offsetLeft, y: canvas.offsetTop },
    );

    pixel.render.setCellPos({ x: cell.x, y: cell.y });

    if (pressingSpace) {
      const pan = pixel.render.getPan();
      pixel.render.setPan({
        x: pan.x + e.movementX * aspectRatio,
        y: pan.y - e.movementY / gridRatio,
      });
      pan.x += e.movementX * aspectRatio;
    }

    if (isLeftMouseDown && !pressingSpace) {
      if (activeTool() === ACTIVATE_TOOL.PAINT) {
        pixel.brush.paint({
          x: cell.x * BYTES_PER_PIXEL,
          y: cell.y * BYTES_PER_PIXEL,
        });
      }

      if (activeTool() === ACTIVATE_TOOL.DELETE) {
        pixel.brush.erase({
          x: cell.x * BYTES_PER_PIXEL,
          y: cell.y * BYTES_PER_PIXEL,
        });
      }
    }

    if (activeTool() === ACTIVATE_TOOL.PAINT_SELECTION && isLeftMouseDown) {
      pixel.render.setSelectedCellsSize({ x: cell.x, y: cell.y });
    }
  });

  canvas.addEventListener("mousedown", (e) => {
    const cell = pickCell(
      { x: e.clientX, y: e.clientY },
      { x: canvas.offsetLeft, y: canvas.offsetTop },
    );

    if (activeTool() === ACTIVATE_TOOL.PAINT) {
      pixel.brush.paint({
        x: cell.x * BYTES_PER_PIXEL,
        y: cell.y * BYTES_PER_PIXEL,
      });
    }

    if (activeTool() === ACTIVATE_TOOL.DELETE) {
      pixel.brush.erase({
        x: cell.x * BYTES_PER_PIXEL,
        y: cell.y * BYTES_PER_PIXEL,
      });
    }

    isLeftMouseDown = true;

    if (activeTool() === ACTIVATE_TOOL.LINE) {
      pixel.line.setLineStartPosition(cell);
    }

    if (activeTool() === ACTIVATE_TOOL.PAINT_SELECTION) {
      const cell = pickCell(
        { x: e.clientX, y: e.clientY },
        { x: canvas.offsetLeft, y: canvas.offsetTop },
      );

      pixel.render.setSelectedCellsPosition({ x: cell.x, y: cell.y });
      pixel.render.setSelectedCellsSize({ x: cell.x, y: cell.y });
    }
  });

  canvas.addEventListener("mouseup", (e) => {
    isLeftMouseDown = false;

    if (activeTool() === ACTIVATE_TOOL.LINE) {
      const cell = pickCell(
        { x: e.clientX, y: e.clientY },
        { x: canvas.offsetLeft, y: canvas.offsetTop },
      );

      pixel.line.draw(cell);
      pixel.line.resetLineStartPosition();
    }

    if (activeTool() === ACTIVATE_TOOL.PAINT_SELECTION) {
      const selectedCells = pixel.render.getSelectedCellsRect();
      const selection = {
        x: Math.min(selectedCells.x, selectedCells.w),
        y: Math.min(selectedCells.y, selectedCells.h),
        w: Math.max(selectedCells.x, selectedCells.w),
        h: Math.max(selectedCells.y, selectedCells.h),
      };
      for (let x = selection.x; x <= selection.w; x++) {
        for (let y = selection.y; y <= selection.h; y++) {
          pixel.brush.paint(
            {
              x: x * BYTES_PER_PIXEL,
              y: y * BYTES_PER_PIXEL,
            },
            1,
          );
        }
      }

      pixel.render.setSelectedCellsSize({ x: -1, y: -1 });
      pixel.render.setSelectedCellsPosition({ x: -1, y: -1 });
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !pressingSpace) {
      pressingSpace = true;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault();
      pixel.history.undo();
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "Z") {
      e.preventDefault();
      pixel.history.redo();
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
      pressingSpace = false;
      pixel.render.setSelectedCellsSize({ x: -1, y: -1 });
      pixel.render.setSelectedCellsPosition({ x: -1, y: -1 });
    }
  });

  function pickCell(
    mouse: { x: number; y: number },
    canvasOffset: { x: number; y: number },
  ) {
    const zoom = pixel.render.getZoom();
    const pan = pixel.render.getPan();
    const aspectRatio = viewport.width / viewport.height;
    const gridRatio = gridSize.x / gridSize.y;
    const gap = (-viewport.width * aspectRatio) / 2 + viewport.width / 2;

    // 1. screen → clip space (-1..1)
    const mx =
      (((mouse.x - canvasOffset.x) * aspectRatio - pan.x + gap) /
        viewport.width) *
        2 -
      1;

    const my =
      ((mouse.y - canvasOffset.y + pan.y * gridRatio) / viewport.height) * -2 +
      1; // y flips because screen origin is top-left

    // 2. clip space → world space (undo shader transform)
    const worldX = mx / zoom;
    const worldY = (my / zoom) * gridRatio;

    // 3. world space (-1..1) → normalized 0..1 → grid index
    const cellX = Math.floor((worldX + 1) * 0.5 * gridSize.x);
    const cellY = Math.floor((worldY + 1) * 0.5 * gridSize.y);

    return { x: cellX, y: gridSize.y - 1 - cellY };
  }

  const wheelHandler = (e: WheelEvent) => {
    e.preventDefault();
    const aspectRatio = viewport.width / viewport.height;
    const pan = pixel.render.getPan();
    const oldZoom = pixel.render.getZoom();
    const mouseX = e.clientX - viewport.left - viewport.width / 2;
    const mouseY = -(e.clientY - viewport.top - viewport.height / 2);
    const delta = normalizeWheelDelta(e);
    const zoomFactor = Math.exp(-delta * ZOOM_SENSITIVITY);
    const newZoom = oldZoom * zoomFactor;

    pixel.render.setZoom(newZoom);

    // Adjust pan so zoom centers on mouse
    const gridRatio = gridSize.x / gridSize.y;
    pixel.render.setPan({
      x: (pan.x - mouseX * aspectRatio) * zoomFactor + mouseX * aspectRatio,
      y: (pan.y - mouseY / gridRatio) * zoomFactor + mouseY / gridRatio,
    });
  };

  canvas.addEventListener("wheel", wheelHandler, { passive: false });

  const loop = () => {
    pixel?.render.draw();
    requestAnimationFrame(loop);
  };

  loop();

  return {
    createNewPainter,
    activeTool,
    setActiveTool,
  };
};
