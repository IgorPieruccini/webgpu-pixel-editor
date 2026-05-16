export type ActiveToolType = keyof typeof ACTIVATE_TOOL;
export type ActiveToolValue = (typeof ACTIVATE_TOOL)[ActiveToolType];

export const ACTIVATE_TOOL = {
  PAINT: 0,
  PAINT_SELECTION: 1,
  DELETE: 2,
  LINE: 3,
  BUCKET_PAINT: 4,
  EYE_DROPPER: 5,
};
