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

const Draw = (app: Application, size: PointData) => {
  const graphic = new Graphics();

  app.canvas.addEventListener("mousedown", (e) => {
    const positionX = Math.floor(e.clientX / DEFAULT_PIXEL_SIZE);
    const positionY = Math.floor(e.clientY / DEFAULT_PIXEL_SIZE);

    const gridPositionX = positionX * DEFAULT_PIXEL_SIZE;
    const gridPositionY = positionY * DEFAULT_PIXEL_SIZE;

    graphic
      .rect(
        gridPositionX,
        gridPositionY,
        DEFAULT_PIXEL_SIZE,
        DEFAULT_PIXEL_SIZE,
      )
      .fill(COLORS.HALF_TRANSPARENT);
  });

  const grid = () => {
    if (_graphicGrid.size !== 0) {
      return;
    }

    for (let x = 0; x < size.x; x++) {
      for (let y = 0; y < size.y; y++) {
        const _x = x * DEFAULT_PIXEL_SIZE;
        const _y = y * DEFAULT_PIXEL_SIZE;
        graphic
          .rect(_x, _y, DEFAULT_PIXEL_SIZE, DEFAULT_PIXEL_SIZE)
          .fill(COLORS.TRANSPARENT)
          .stroke({ width: 1, color: COLORS.HALF_TRANSPARENT });

        app.stage.addChild(graphic);
      }
    }
  };

  return {
    grid,
  };
};

export const GridManager = (size: PointData) => {
  // if (_pixelGrid.size === 0) {
  //   _pixelGrid = createGrid(size);
  // }

  return {
    // ...Pixel(size.x),
    draw: (app: Application) => Draw(app, size),
  };
};
