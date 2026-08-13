import { createSignal } from "solid-js";
import { BYTES_PER_PIXEL } from "../../constants";
import { debounce } from "../../utils";
import { createColor } from "../colors/colors";
import { getPixelAtLocal, setPixelAtLocal } from "../tiledLayer";
import type { RGBA, Vec2 } from "../types";
import {
	alphaComposite,
	hexToNumber,
	numberToHex,
	numberToRGBA,
	rgbaToHex,
} from "../utils";
import type { ColorPaletteHandler } from "./colorPaletteHandler";
import type { HistoryChangeHandler } from "./historyChangeHandler";
import type { LayerHandler } from "./layerHandler";
import type { ProjectConfigHandler } from "./projectConfigHandler";

export type BrushHandler = ReturnType<typeof createBrushHandler>;

export const createBrushHandler = (
	layerHandler: LayerHandler,
	historyChangeHandler: HistoryChangeHandler,
	colorPalette: ColorPaletteHandler,
	projectConfigHandler: ProjectConfigHandler,
) => {
	const currentPaintedPixels = new Set<number>();

	const debounceFinishPainting = debounce(() => {
		if (currentPaintedPixels.size > 0) {
			layerHandler.saveCurrentBuffer();
			historyChangeHandler.addAction({ paintedPixels: currentPaintedPixels });
			colorPalette.calculateColorPalette();
			clearCurrentPaintedPixels();
		}
	}, 100);

	const color = createColor(0x00000000);

	// Default color: magenta RGB (0xff00ff), will be converted to ABGR when set
	const [_getSelectedColor, _setSelectedColor] = createSignal(0x000000);
	const [getOpacity, setOpacity] = createSignal(100);
	const [getThickness, setThickness] = createSignal(1);

	const clearCurrentPaintedPixels = () => {
		currentPaintedPixels.clear();
	};

	const setColor = (_color: number | string | RGBA) => {
		color.setColor(_color);
		_setSelectedColor(color.getColor());
	};

	const getColor = (pos: Vec2, format: "number" | "string" = "number") => {
		const currentLayer = layerHandler.getActive();
		const buffer = layerHandler.getBufferById(currentLayer.id);
		if (!buffer) {
			throw new Error(`Buffer for layer ${currentLayer.id} not found`);
		}

		const color = getPixelAtLocal(
			buffer,
			pos.x - currentLayer.offset.x,
			pos.y - currentLayer.offset.y,
		);

		const packed = (color.r << 24) | (color.g << 16) | (color.b << 8) | color.a;
		if (format === "string") {
			return `#${(packed >>> 8).toString(16).padStart(6, "0")}`;
		}
		return packed >>> 0;
	};

	const composeColors = (worldPos: Vec2) => {
		const gridSize = projectConfigHandler.getSize();
		const currentLayer = layerHandler.getActive();
		const currentBuffer = layerHandler.getBufferById(currentLayer.id);
		if (!currentBuffer) {
			throw new Error(`Buffer for layer ${currentLayer.id} not found`);
		}

		const localX = worldPos.x - currentLayer.offset.x;
		const localY = worldPos.y - currentLayer.offset.y;
		const destColor = getPixelAtLocal(currentBuffer, localX, localY);

		const destRGBA = {
			r: destColor.r,
			g: destColor.g,
			b: destColor.b,
			a: destColor.a / 255,
		};

		const sourceRGBA = numberToRGBA(_getSelectedColor());
		sourceRGBA.a = getOpacity() / 100;

		const blendedRGBA = alphaComposite(sourceRGBA, destRGBA);

		const rgba = hexToNumber(rgbaToHex(blendedRGBA));

		const r = (rgba >>> 24) & 0xff;
		const g = (rgba >>> 16) & 0xff;
		const b = (rgba >>> 8) & 0xff;
		const a = rgba & 0xff;

		setPixelAtLocal(currentBuffer, localX, localY, { r, g, b, a });
		currentPaintedPixels.add(
			(worldPos.y * gridSize.x + worldPos.x) * BYTES_PER_PIXEL,
		);
	};

	const paint = (
		cellPos: { x: number; y: number },
		defaultThickness?: number,
		forcePaint = false,
	): boolean => {
		const gridSize = projectConfigHandler.getSize();
		// We use this variable to check if we applied paint in at least one pixel,
		// so we can decide whether to add the paint action to the history or not
		let hasAppliedPaint = false;
		const thickness = defaultThickness ?? getThickness();

		for (let y = -thickness; y <= thickness; y++) {
			for (let x = -thickness; x <= thickness; x++) {
				const _x = cellPos.x + x * BYTES_PER_PIXEL;
				const _y = cellPos.y + y * BYTES_PER_PIXEL;
				const cellX = _x / BYTES_PER_PIXEL;
				const cellY = _y / BYTES_PER_PIXEL;

				if (
					cellX < 0 ||
					cellX >= gridSize.x ||
					cellY < 0 ||
					cellY >= gridSize.y
				) {
					continue;
				}

				const pixelIndex = (cellY * gridSize.x + cellX) * BYTES_PER_PIXEL;
				if (!forcePaint && currentPaintedPixels.has(pixelIndex)) {
					continue;
				}

				const distance = Math.hypot(x, y);
				if (distance < thickness) {
					composeColors({ x: cellX, y: cellY });
					hasAppliedPaint = true;
				}
			}
		}

		layerHandler.makeCurrentLayerDirty();

		// This is adding an action while the user in painting but stop dragged for more than 100 milliseconds
		// but is still holding the right mouse button to painting, might not be so efficient,
		// but I'm leaving this for now, because it seems to help while painting.
		debounceFinishPainting();
		return hasAppliedPaint;
	};

	const erase = (cellPos: { x: number; y: number }) => {
		const gridSize = projectConfigHandler.getSize();
		const thickness = getThickness();

		for (let y = -thickness; y <= thickness; y++) {
			for (let x = -thickness; x <= thickness; x++) {
				const _x = cellPos.x + x * BYTES_PER_PIXEL;
				const _y = cellPos.y + y * BYTES_PER_PIXEL;
				const cellX = _x / BYTES_PER_PIXEL;
				const cellY = _y / BYTES_PER_PIXEL;

				if (
					cellX < 0 ||
					cellX >= gridSize.x ||
					cellY < 0 ||
					cellY >= gridSize.y
				) {
					continue;
				}

				const index = (cellY * gridSize.x + cellX) * BYTES_PER_PIXEL;
				if (currentPaintedPixels.has(index)) {
					continue;
				}

				const distance = Math.hypot(x, y);
				if (distance < thickness) {
					const currentLayer = layerHandler.getActive();
					const currentBuffer = layerHandler.getBufferById(currentLayer.id);
					if (!currentBuffer) {
						throw new Error(`Buffer for layer ${currentLayer.id} not found`);
					}

					const localX = cellX - currentLayer.offset.x;
					const localY = cellY - currentLayer.offset.y;
					const destColor = getPixelAtLocal(currentBuffer, localX, localY);

					const destRGBA = {
						r: destColor.r,
						g: destColor.g,
						b: destColor.b,
						a: destColor.a / 255,
					};

					if (destRGBA.a === 0) {
						continue;
					}

					const opacity = destRGBA.a - Math.fround(getOpacity() / 100);
					const resultRGBA = { ...destRGBA, a: opacity >= 0 ? opacity : 0 };

					if (resultRGBA.a === 0) {
						setPixelAtLocal(currentBuffer, localX, localY, {
							r: 0,
							g: 0,
							b: 0,
							a: 0,
						});
						currentPaintedPixels.add(index);
						continue;
					}

					const blendedHex = hexToNumber(rgbaToHex(resultRGBA));
					setPixelAtLocal(currentBuffer, localX, localY, {
						r: (blendedHex >>> 24) & 0xff,
						g: (blendedHex >>> 16) & 0xff,
						b: (blendedHex >>> 8) & 0xff,
						a: blendedHex & 0xff,
					});
					currentPaintedPixels.add(index);
				}
			}
		}
		layerHandler.makeCurrentLayerDirty();
		clearCurrentPaintedPixels();
	};

	function getSelectedColor(): number;
	function getSelectedColor(format: "number"): number;
	function getSelectedColor(format: "string"): string;
	function getSelectedColor(format: "number" | "string" = "number") {
		if (format === "string") {
			const color = _getSelectedColor();
			return color > 0xffffff
				? rgbaToHex(numberToRGBA(color))
				: numberToHex(color);
		}

		return _getSelectedColor();
	}

	return {
		setColor,
		getColor,
		paint,
		erase,
		getOpacity,
		setOpacity,
		getSelectedColor,
		getThickness,
		setThickness,
		clearCurrentPaintedPixels,
	};
};
