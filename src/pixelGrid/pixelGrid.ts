import { type Application, type PointData, Graphics } from "pixi.js";
import type { PixelGrid } from "./type";
import { COLORS, DEFAULT_PIXEL_SIZE } from "../constants";

let _pixelGrid = new Map<number, string>();
let _graphicGrid = new Map<number, Graphics>();

/**
 * Create a grid of colors for the given size
 * @param size
 * @returns PixelGrid a map of number and color values
 */
const createGrid = (size: PointData): PixelGrid => {
  const grid: PixelGrid = new Map<number, string>();

  for (let x = 0; x < size.x; x++) {
    for (let y = 0; y < size.y; y++) {
      const key = x + y * size.x;
      grid.set(key, COLORS.TRANSPARENT);
    }
  }

  return grid;
};

/**
 * Pixel is a set of methods for manipulating a grid of colors
 * @param sizeX
 * @returns
 */
const Pixel = (sizeX: number) => {
  /**
   * Return the grid key based on the pixel position
   * @param pos Pixel position
   * @param sizeX the X size of the grid
   * @returns Return a number representing the key in the grid
   */
  const getKey = (pos: PointData): number => {
    const key = pos.x + pos.y * sizeX;
    return key;
  };

  /**
   * Get the pixel position from the key
   * @param key of the pixel
   * @returns PointData representing the pixel position
   */
  const getPositionFromKey = (key: number) => {
    const x = key % sizeX;
    const y = Math.floor(key / sizeX);

    return { x, y };
  };

  /**
   * Set the color of a pixel in the grid
   * @param pos Pixel position
   * @param value Color value
   * @returns void
   */
  const setPixel = (pos: PointData, value: string): void => {
    const key = getKey(pos);
    _pixelGrid.set(key, value);
  };

  /**
   * Get the color of a pixel in the grid
   * @param pos Pixel position
   * @returns Color value
   */
  const getPixel = (pos: PointData): string | undefined => {
    const key = getKey(pos);
    return _pixelGrid.get(key);
  };

  return {
    setPixel,
    getPixel,
    getPositionFromKey,
  };
};

const Draw = (app: Application, sizeX: number) => {
  const pixel = Pixel(sizeX);

  const grid = () => {
    if (_graphicGrid.size !== 0) {
      return;
    }

    _pixelGrid.forEach((value, key) => {
      const gridPosition = pixel.getPositionFromKey(key);
      const canvasPosition = {
        x: gridPosition.x * DEFAULT_PIXEL_SIZE,
        y: gridPosition.y * DEFAULT_PIXEL_SIZE,
      };

      const graphic = new Graphics()
        .rect(
          canvasPosition.x,
          canvasPosition.y,
          DEFAULT_PIXEL_SIZE,
          DEFAULT_PIXEL_SIZE,
        )
        .fill(value)
        .stroke({ width: 1, color: COLORS.HALF_TRANSPARENT });

      graphic.eventMode = "static";

      graphic.on("mousedown", () => {
        graphic.fill("purple");
      });

      app.stage.addChild(graphic);

      _graphicGrid.set(key, graphic);
    });
  };

  return {
    grid,
  };
};

export const GridManager = (size: PointData) => {
  if (_pixelGrid.size === 0) {
    _pixelGrid = createGrid(size);
  }

  return {
    ...Pixel(size.x),
    draw: (app: Application) => Draw(app, size.x),
  };
};
