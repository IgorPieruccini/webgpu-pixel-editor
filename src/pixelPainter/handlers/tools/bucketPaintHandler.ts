import { BYTES_PER_PIXEL } from "../../../constants";
import { createColor } from "../../colors/colors";
import { getPixelAtLocal, setPixelAtLocal } from "../../tiledLayer";
import type { Vec2 } from "../../types";
import type { BrushHandler } from "../brushHandler";
import type { HistoryChangeHandler } from "../historyChangeHandler";
import type { LayerHandler } from "../layerHandler";
import type { ProjectConfigHandler } from "../projectConfigHandler";

export const createBucketPaintHandler = (
	projectConfigHandler: ProjectConfigHandler,
	layerHandler: LayerHandler,
	brushHandler: BrushHandler,
	historyChangeHandler: HistoryChangeHandler,
) => {
	const floodFill = (cell: Vec2) => {
		const gridSize = projectConfigHandler.getSize();
		const currentLayer = layerHandler.getActive();
		const currentBuffer = layerHandler.getBufferById(currentLayer.id);
		if (!currentBuffer) {
			throw new Error(`Buffer for layer ${currentLayer.id} not found`);
		}

		const getIndex = (pos: Vec2) =>
			(pos.y * gridSize.x + pos.x) * BYTES_PER_PIXEL;
		const toLocal = (pos: Vec2) => ({
			x: pos.x - currentLayer.offset.x,
			y: pos.y - currentLayer.offset.y,
		});

		const startLocal = toLocal(cell);
		const target = getPixelAtLocal(currentBuffer, startLocal.x, startLocal.y);
		const targetColor = [target.r, target.g, target.b, target.a];

		const currentColor = brushHandler.getSelectedColor();
		const colorCreator = createColor(currentColor);
		const { r, g, b, a } = colorCreator.getARGB();

		if (
			targetColor[0] === r &&
			targetColor[1] === g &&
			targetColor[2] === b &&
			targetColor[3] === a * 255
		) {
			return;
		}

		const stack: Vec2[] = [cell];
		const paintedPixels = new Set<number>();

		while (stack.length > 0) {
			const cell = stack.pop();
			if (!cell) {
				continue;
			}

			const { x, y } = cell;

			// Check if is outside inside bounds
			if (x < 0 || x >= gridSize.x || y < 0 || y >= gridSize.y) {
				continue;
			}

			const i = getIndex(cell);
			const local = toLocal(cell);
			const pixel = getPixelAtLocal(currentBuffer, local.x, local.y);

			if (
				targetColor[0] !== pixel.r ||
				targetColor[1] !== pixel.g ||
				targetColor[2] !== pixel.b ||
				targetColor[3] !== pixel.a
			) {
				continue;
			}

			setPixelAtLocal(currentBuffer, local.x, local.y, {
				r,
				g,
				b,
				a: a * 255,
			});

			paintedPixels.add(i);

			stack.push({ x: x + 1, y });
			stack.push({ x: x - 1, y });
			stack.push({ x, y: y + 1 });
			stack.push({ x, y: y - 1 });
		}

		layerHandler.makeCurrentLayerDirty();
		layerHandler.saveCurrentBuffer();
		historyChangeHandler.addAction({ paintedPixels });
	};

	return {
		floodFill,
	};
};
