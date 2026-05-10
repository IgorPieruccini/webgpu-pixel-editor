import { numberToRGBA } from ".././utils";
import type { Vec2 } from "../types";

export type UniformBufferHandler = ReturnType<
  typeof createUniformBufferHandler
>;

export const createUniformBufferHandler = (
  canvasSize: Vec2,
  gridSize: Vec2,
) => {
  let selectionToolEnabled = false;

  const commonUniforms = new Float32Array([
    0, // pan.x
    0, // pan.y
    canvasSize.x, // canvasSize.x
    canvasSize.y, // canvasSize.y
    gridSize.x, // gridSize.x
    gridSize.y, // gridSize.y
    1, // zoom
  ]);

  const layerUniforms = new Float32Array([
    1, // opacity
  ]);

  const uiUniforms = new Float32Array([
    0, // cellPos.x -- 0
    0, // cellPos.y -- 1
    -1, // selectedCells.x -- 2
    -1, // selectedCells.y -- 3
    0, // selectedCells.w -- 4
    0, // selectedCells.h -- 5
    1, // brushThickness -- 6
    0, // padding -- 7
    0, // selectedColor.r -- 8
    0, // selectedColor.g -- 9
    0, // selectedColor.b -- 10
    1, // selectedColor.a -- 11
    -1, // startLineX -- 12
    -1, // startLineY -- 13
    0, // selected tool -- 14
    0, // padding -- 15
  ]);

  const updatePan = (pan: Vec2) => {
    commonUniforms[0] = pan.x;
    commonUniforms[1] = pan.y;
  };

  const updateZoom = (zoom: number) => {
    commonUniforms[6] = zoom;
  };

  const updateCanvasSize = (canvasSize: Vec2) => {
    commonUniforms[2] = canvasSize.x;
    commonUniforms[3] = canvasSize.y;
  };

  const updateOpacity = (opacity: number) => {
    layerUniforms[0] = opacity;
  };

  const updateCellPos = (cellPos: Vec2) => {
    uiUniforms[0] = cellPos.x;
    uiUniforms[1] = cellPos.y;
  };
  const updateSelectedCellsPosition = (vec: Vec2) => {
    uiUniforms[2] = vec.x;
    uiUniforms[3] = vec.y;
  };

  const updateSelectedCellsSize = (vec: Vec2) => {
    uiUniforms[4] = vec.x;
    uiUniforms[5] = vec.y;
  };

  const updateBrushThickness = (thickness: number) => {
    uiUniforms[6] = thickness;
  };

  const setSelectionTool = (value: boolean) => {
    selectionToolEnabled = value;
  };

  const updateSelectedColor = (color: number | string) => {
    const normalizedColor =
      typeof color === "string" ? parseInt(color.replace("#", ""), 16) : color;
    const rgba = numberToRGBA(normalizedColor);
    uiUniforms[8] = rgba.r / 255;
    uiUniforms[9] = rgba.g / 255;
    uiUniforms[10] = rgba.b / 255;
  };

  const updateBrushOpacity = (opacity: number) => {
    uiUniforms[11] = opacity / 100;
  };

  const setLineStartPosition = (cell: Vec2) => {
    uiUniforms[12] = cell.x;
    uiUniforms[13] = cell.y;
  };

  const resetStartLinePosition = () => {
    uiUniforms[12] = -1;
    uiUniforms[13] = -1;
  };

  const getStartLinePosition = (): Vec2 => {
    return { x: uiUniforms[12], y: uiUniforms[13] };
  };

  const setActiveTool = (tool: number) => {
    uiUniforms[14] = tool;
  };

  const getActiveTool = () => {
    return uiUniforms[14];
  };

  return {
    commonUniforms,
    layerUniforms,
    uiUniforms,
    zoom: () => commonUniforms[6],
    cellPosition: () => ({ x: uiUniforms[0], y: uiUniforms[1] }),
    pan: () => ({ x: commonUniforms[0], y: commonUniforms[1] }),
    selectedCellsRect: () => ({
      x: uiUniforms[2],
      y: uiUniforms[3],
      w: uiUniforms[4],
      h: uiUniforms[5],
    }),
    brushThickness: () => uiUniforms[6],

    // Actions
    updatePan,
    updateZoom,
    updateCanvasSize,
    updateOpacity,
    updateCellPos,
    updateSelectedCellsSize,
    updateSelectedCellsPosition,
    updateBrushThickness,
    setSelectionTool,
    updateSelectedColor,
    updateBrushOpacity,
    isSelectionToolEnabled: () => selectionToolEnabled,
    setLineStartPosition,
    resetStartLinePosition,
    getStartLinePosition,
    setActiveTool,
    getActiveTool,
  };
};
