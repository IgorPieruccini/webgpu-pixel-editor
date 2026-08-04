import { LAYER_PREVIEW_SIZE } from "../constants";
import { calculateZoomFromGridAndCanvasSize } from "../utils";
import { createTexturePipeline } from "./createPipeline";
import type { LayerHandler } from "./handlers/layerHandler";
import type { ProjectConfigHandler } from "./handlers/projectConfigHandler";
import { material } from "./material";
import type { TiledLayerBuffer, TileKey } from "./tiledLayer";
import type { Layer } from "./types";
import { webGPUSetup } from "./webGPUSetup";

export type LayerPreviewHandler = Awaited<
	ReturnType<typeof createLayerPreview>
>;

export const createLayerPreview = async (
	layerHandler: LayerHandler,
	projectConfigHandler: ProjectConfigHandler,
) => {
	const gridSize = projectConfigHandler.getSize();
	const zoom = calculateZoomFromGridAndCanvasSize(gridSize, LAYER_PREVIEW_SIZE);

	const { device, context } = await webGPUSetup("preview-canvas");

	const pixelPipeline = createTexturePipeline(device, "pixel");
	const alphaPipeline = createTexturePipeline(device, "alpha");

	const tileTextures = new Map<TileKey, ReturnType<typeof material.pixel>>();
	const GPUBindAlpha = material.alpha(device, alphaPipeline);

	const commonUniformBuffer = new Float32Array([
		0,
		0,
		LAYER_PREVIEW_SIZE.x,
		LAYER_PREVIEW_SIZE.y,
		gridSize.x,
		gridSize.y,
		zoom,
	]);

	const refreshSize = () => {
		const gridSize = projectConfigHandler.getSize();
		const zoom = calculateZoomFromGridAndCanvasSize(
			gridSize,
			LAYER_PREVIEW_SIZE,
		);

		commonUniformBuffer[4] = gridSize.x;
		commonUniformBuffer[5] = gridSize.y;
		commonUniformBuffer[6] = zoom;
	};

	const syncPreviewTiles = (buffer: TiledLayerBuffer) => {
		const activeKeys = new Set(buffer.tiles.keys());
		for (const key of tileTextures.keys()) {
			if (!activeKeys.has(key)) {
				tileTextures.delete(key);
			}
		}

		for (const [key, tile] of buffer.tiles) {
			let tileTexture = tileTextures.get(key);
			if (!tileTexture) {
				tileTexture = material.pixel(device, pixelPipeline, buffer.tileSize);
				tileTextures.set(key, tileTexture);
			}
			tileTexture.writeTexture(tile);
		}
	};

	const drawPreview = (layer: Layer, buffer: TiledLayerBuffer) => {
		// Provides an interface for recording GPU commands.
		const encoder = device.createCommandEncoder({
			label: "preview",
		});

		//Render passes are when all drawing operations in WebGPU happen.
		const pass = encoder.beginRenderPass({
			colorAttachments: [
				{
					view: context.getCurrentTexture().createView(),
					loadOp: "clear",
					storeOp: "store",
					clearValue: { r: 0, g: 0, b: 0, a: 0 },
				},
			],
		});

		// DRAW ALPHA
		pass.setPipeline(alphaPipeline);

		GPUBindAlpha.writeAlphaUniforms(commonUniformBuffer);
		pass.setBindGroup(0, GPUBindAlpha.bindGroup);
		pass.draw(6);

		// DRAW PIXEL LAYER
		pass.setPipeline(pixelPipeline);

		if (layerHandler.isCurrentLayerDirty()) {
			syncPreviewTiles(buffer);
		}

		for (const [key, tileTexture] of tileTextures) {
			const [tileX, tileY] = key.split(",").map(Number);
			tileTexture.writeUniforms(
				commonUniformBuffer,
				new Float32Array([
					layer.opacity,
					layer.offset.x,
					layer.offset.y,
					tileX * buffer.tileSize,
					tileY * buffer.tileSize,
					buffer.tileSize,
					buffer.tileSize,
					0,
				]),
			);

			pass.setBindGroup(0, tileTexture.bindGroup);
			pass.draw(6);
		}
		pass.end();
		const commandBuffer = encoder.finish();
		device.queue.submit([commandBuffer]);
	};

	return {
		drawPreview,
		refreshSize,
	};
};
