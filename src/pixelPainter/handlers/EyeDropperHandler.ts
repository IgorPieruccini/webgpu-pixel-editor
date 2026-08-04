import { getPixelAtLocal } from "../tiledLayer";
import type { RGBA, Vec2 } from "../types";
import { alphaComposite, rgbaToHex } from "../utils";
import type { BrushHandler } from "./brushHandler";
import type { LayerHandler } from "./layerHandler";
import type { ProjectConfigHandler } from "./projectConfigHandler";
import type { UniformBufferHandler } from "./uniformBuffersHandler";

export const createEyeDropperHandler = (
	layerHandler: LayerHandler,
	brushHandler: BrushHandler,
	uniformBufferHandler: UniformBufferHandler,
	projectConfigHandler: ProjectConfigHandler,
) => {
	const eyeDropAtCell = (pos: Vec2) => {
		const gridSize = projectConfigHandler.getSize();

		if (pos.x < 0 || pos.x >= gridSize.x || pos.y < 0 || pos.y >= gridSize.y) {
			return;
		}

		let currentColor: RGBA = { r: 0, g: 0, b: 0, a: 0 };

		for (const layer of layerHandler.getList()) {
			if (!layer.display) {
				continue;
			}

			const buffer = layerHandler.getBufferById(layer.id);
			if (!buffer) {
				continue;
			}

			const pixel = getPixelAtLocal(
				buffer,
				pos.x - layer.offset.x,
				pos.y - layer.offset.y,
			);
			const alpha = (pixel.a / 255) * Math.max(0, Math.min(1, layer.opacity));

			if (alpha <= 0) {
				continue;
			}

			const sourceColor: RGBA = {
				r: pixel.r,
				g: pixel.g,
				b: pixel.b,
				a: alpha,
			};

			currentColor =
				currentColor.a === 0
					? sourceColor
					: alphaComposite(sourceColor, currentColor);
		}

		const hex = rgbaToHex(currentColor);
		brushHandler.setColor(hex);
		uniformBufferHandler.updateSelectedColor(brushHandler.getSelectedColor());
	};

	return {
		eyeDropAtCell,
	};
};
