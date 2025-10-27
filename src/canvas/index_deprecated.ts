import { Application } from "pixi.js";
import { GridManager } from "../pixelGrid/pixelGrid";

export const initializeCanvas = async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application.
  await app.init({
    background: "#1099bb",
    resizeTo: window,
    preference: "webgl",
  });

  // Find the canvas div and append pixi canvas to it
  const canvasDiv = document.getElementById("canvas");
  canvasDiv?.appendChild(app.canvas);

  start(app);
};

// const createIsometricWireframe = (app: Application, point: PointData) => {
//   const graphic = new Graphics();

//   graphic.strokeStyle = { width: 4, color: "white" };

//   // TOP
//   graphic
//     .moveTo(0.5 * point.x, 0.5 * point.x)
//     .lineTo(0, 0.25 * point.x)
//     .lineTo(0.5 * point.x, 0)
//     .lineTo(point.x, 0.25 * point.x)
//     .lineTo(0.5 * point.x, 0.5 * point.x)
//     .stroke({ width: 2, color: "white" });

//   // RIGHT SIDE
//   graphic
//     .moveTo(0.5 * point.x, 0.5 * point.y)
//     .lineTo(0.5 * point.x, 1 * point.y)
//     .lineTo(1 * point.x, 0.75 * point.y)
//     .lineTo(1 * point.x, 0.25 * point.y)
//     .lineTo(0.5 * point.x, 0.5 * point.y)
//     .stroke({ width: 2, color: "white" });

//   // LEFT SIDE
//   graphic
//     .moveTo(0.5 * point.x, 0.5 * point.y)
//     .lineTo(0.5 * point.x, 1 * point.y)
//     .lineTo(0, 0.75 * point.x)
//     .lineTo(0, 0.25 * point.y)
//     .lineTo(0.5 * point.x, 0.5 * point.y)
//     .stroke({ width: 2, color: "white" });

//   app.stage.addChild(graphic);

//   return graphic;
// };

/**
 * Given a size, find the middle pixel(s) of this size, because pixels are integer and can't have decimals values
 * if the middle of the size is a decimal, then the lowest and highest integer of the half of the size is considering as middle
 * @example
 *
 * if axisSize is equal 32 then return [16]
 * if axisSize is equal 35 then return [17, 18]
 */
// const findMiddlePixels = (size: number): number[] => {
//   const middle = 0.5 * size;

//   // If middle is a decimal, then two rows of pixels are considered as middle
//   if (middle % 0 === 1) {
//     // find the lowest integer axisSize
//     const lowestIntegerX = Math.floor(middle);

//     // find the highest integer axisSize
//     const highestIntegerX = Math.ceil(middle);

//     // add both to pixelMiddleX
//     return [lowestIntegerX, highestIntegerX];
//   }

//   return [middle];
// };

// type PositionRelativeToPixelMiddle = "Lower" | "Equal" | "Higher";

/**
 * Get position relative to the PixelMiddle
 * @param value number representing which row or column of the pixel grid to check
 * @param pixelMiddle the array of pixel that are considered as middle
 * @returns {@link PositionRelativeToPixelMiddle}
 */
// const valueRelativePositionToPixelMiddle = (
//   value: number,
//   pixelMiddle: number[],
// ): PositionRelativeToPixelMiddle => {
//   const isEqual = pixelMiddle.includes(value);

//   if (isEqual) {
//     return "Equal";
//   }

//   if (value < pixelMiddle[0]) {
//     return "Lower";
//   }

//   return "Higher";
// };

// const createPixels = (size: PointData) => {
//   // a map of position and color value
//   const pixelMap = new Map<string, string>();

//   const pixelMiddleX = findMiddlePixels(size.x);
//   const pixelMiddleY = findMiddlePixels(size.y);

//   // Height of the top part of the isometric cube is always the half of the width
//   const height = 0.5 * size.x; // TODO: this can have decimals, and it's not ideal
//   const halfHeight = 0.5 * height;

//   // Iterate trough the grid from top to bottom
//   for (let y = 0; y <= halfHeight; y++) {
//     // For each middle execute the same logic (for now)
//     pixelMiddleX.forEach((middle) => {
//       // go from 0 to the current row of the grid, to set all the horizontal pixels of each row
//       for (let i = 0; i < y + 1; i += 1) {
//         pixelMap.set(`${middle + i}-${y}`, "BLANK");
//         pixelMap.set(`${middle - i}-${y}`, "BLANK");
//       }
//     });
//   }
//   return pixelMap;
// };

// const square = (position: PointData, size: PointData) => {
//   const graphic = new Graphics();
//   graphic.rect(position.x, position.y, size.x, size.y).fill("green");
//   return graphic;
// };

// const iso = createIsometricWireframe(app, { x: 32, y: 32 });
// iso.position.set(10, 10);

// const gra = new Graphics().rect(10, 10, 100, 100).fill("red");
// app.stage.addChild(gra);

// const graphic = square({ x: 100, y: 100 }, { x: 100, y: 100 });
// app.stage.addChild(graphic);
// };

const start = (app: Application) => {
  const gridManager = GridManager({ x: 248, y: 248 });

  gridManager.draw(app).grid();
};
