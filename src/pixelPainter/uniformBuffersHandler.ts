import type { Vec2 } from "../editor/types";

export type UniformBufferHandler = ReturnType<
  typeof createUniformBufferHandler
>;

export const createUniformBufferHandler = (
  canvasSize: Vec2,
  gridSize: Vec2,
) => {
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
    0, // cellPos.x
    0, // cellPos.y
    0, // selectedCells.x
    0, // selectedCells.y
    0, // selectedCells.w
    0, // selectedCells.h
    1, // brushThickness
    0, // selection tool activated
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
    value == true ? (uiUniforms[7] = 1) : (uiUniforms[7] = 0);
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
    isSelectionToolEnabled: () => (uiUniforms[7] === 1 ? true : false),
  };
};
