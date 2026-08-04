import { calculateZoomFromGridAndCanvasSize } from "../../utils";
import type { LayerHandler } from "./layerHandler";
import type { ProjectConfigHandler } from "./projectConfigHandler";
import { createRenderHandler } from "./renderHandler";
import { createUniformBufferHandler } from "./uniformBuffersHandler";

export const createExportHandler = (
	projectName: string,
	projectConfigHandler: ProjectConfigHandler,
	layerHandler: LayerHandler,
) => {
	const renderToCanvas = async (multiplier: number) => {
		const gridSize = projectConfigHandler.getSize();

		const canvasSize = {
			x: gridSize.x * multiplier,
			y: gridSize.y * multiplier,
		};

		// Create the canvas and set to the scaled export size.
		const canvas = document.createElement("canvas");
		canvas.width = canvasSize.x;
		canvas.height = canvasSize.y;

		const uniformBufferHandler = createUniformBufferHandler(
			canvasSize,
			projectConfigHandler,
		);

		const renderHandler = await createRenderHandler(
			layerHandler,
			uniformBufferHandler,
			canvas,
			false, // don't render UI
		);

		for (const layer of layerHandler.getList()) {
			renderHandler.addLayerTexture(layer.id);
			layerHandler.makeLayerDirty(layer.id);
		}

		uniformBufferHandler.updateZoom(
			calculateZoomFromGridAndCanvasSize(gridSize, canvasSize),
		);
		uniformBufferHandler.updateCanvasSize(canvasSize);

		renderHandler.draw();

		return canvas;
	};

	const getBlob = async (multiplier: number): Promise<Blob> => {
		const canvas = await renderToCanvas(multiplier);
		await new Promise<void>((resolve) => {
			requestAnimationFrame(() => resolve());
		});

		return new Promise((resolve, reject) => {
			canvas.toBlob((blob) => {
				if (!blob) {
					reject(new Error("Something went wrong while exporting image"));
					return;
				}

				resolve(blob);
			}, "image/png");
		});
	};

	const exportImage = async (multiplier: number) => {
		const blob = await getBlob(multiplier);
		const url = URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = url;
		link.download = `${projectName}.png`;
		link.click();

		URL.revokeObjectURL(url);
	};

	return { exportImage, getBlob };
};
