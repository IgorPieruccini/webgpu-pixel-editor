import { createVertexBuffer } from "../createBufferLayout";
import { createPipeline, createTexturePipeline } from "../createPipeline";
import { material } from "../material";
import type { BindPixelTexture } from "../material/pixel";
import type { TileKey } from "../tiledLayer";
import { webGPUSetup } from "../webGPUSetup";
import type { LayerHandler } from "./layerHandler";
import type { UniformBufferHandler } from "./uniformBuffersHandler";

export type RenderHandler = Awaited<ReturnType<typeof createRenderHandler>>;

export const createRenderHandler = async (
	layerHandler: LayerHandler,
	uniformBufferHandler: UniformBufferHandler,
	canvas?: HTMLCanvasElement,
	initialRenderUI = true,
) => {
	let renderUI: boolean = initialRenderUI;

	const setRenderUI = (value: boolean) => {
		renderUI = value;
	};

	const pixelBindTextureMap = new Map<string, Map<TileKey, BindPixelTexture>>();

	const { device, canvasFormat, context } = await webGPUSetup(
		canvas ?? "main-canvas",
	);

	const { vertexBuffer, vertexBufferLayout } = createVertexBuffer(device);

	const uiPipeline = createPipeline(
		device,
		"ui",
		vertexBufferLayout,
		canvasFormat,
	);

	const pixelPipeline = createTexturePipeline(device, "pixel");
	const alphaPipeline = createTexturePipeline(device, "alpha");

	const GPUBindAlpha = material.alpha(device, alphaPipeline);

	const GPUBindUi = material.ui(device, uiPipeline, "UI");

	const syncLayerTileTextures = (layerId: string) => {
		const buffer = layerHandler.getBufferById(layerId);
		if (!buffer) {
			throw new Error(`Layer buffer with id ${layerId} not found`);
		}

		let layerTextures = pixelBindTextureMap.get(layerId);
		if (!layerTextures) {
			layerTextures = new Map<TileKey, BindPixelTexture>();
			pixelBindTextureMap.set(layerId, layerTextures);
		}

		const currentKeys = new Set(buffer.tiles.keys());
		for (const key of layerTextures.keys()) {
			if (!currentKeys.has(key)) {
				layerTextures.delete(key);
			}
		}

		for (const [key, tile] of buffer.tiles) {
			let bindTexture = layerTextures.get(key);
			if (!bindTexture) {
				bindTexture = material.pixel(device, pixelPipeline, buffer.tileSize);
				layerTextures.set(key, bindTexture);
			}

			bindTexture.writeTexture(tile);
		}
	};

	const addLayerTexture = (layerId: string) => {
		if (!pixelBindTextureMap.has(layerId)) {
			pixelBindTextureMap.set(layerId, new Map());
		}
	};

	const removeLayerTexture = (layerId: string) => {
		pixelBindTextureMap.delete(layerId);
	};

	const draw = () => {
		if (layerHandler.buffers.size === 0) {
			return;
		}

		// Provides an interface for recording GPU commands.
		const encoder = device.createCommandEncoder({
			label: "Encoder",
		});

		//Render passes are when all drawing operations in WebGPU happen.
		const pass = encoder.beginRenderPass({
			colorAttachments: [
				{
					view: context.getCurrentTexture().createView(),
					loadOp: "clear",
					storeOp: "store",
					clearValue: renderUI
						? { r: 0.08, g: 0.08, b: 0.08, a: 0 }
						: { r: 0, g: 0, b: 0, a: 0 },
				},
			],
		});

		// DRAW ALPHA LAYER
		if (renderUI) {
			pass.setPipeline(alphaPipeline);
			GPUBindAlpha.writeAlphaUniforms(uniformBufferHandler.commonUniforms);
			pass.setBindGroup(0, GPUBindAlpha.bindGroup);
			pass.draw(6);
		}

		// DRAW PIXEL LAYERS
		pass.setPipeline(pixelPipeline);

		for (const layer of layerHandler.getList()) {
			const buffer = layerHandler.getBufferById(layer.id);
			if (!buffer) {
				throw new Error(`Layer buffer with id ${layer.id} not found`);
			}

			const layerTextures = pixelBindTextureMap.get(layer.id);
			if (!layerTextures) {
				throw new Error(`Layer texture with id ${layer.id} not found`);
			}

			if (!layer.display) {
				continue;
			}

			if (layerHandler.isLayerDirty(layer.id)) {
				syncLayerTileTextures(layer.id);
				layerHandler.makeLayerClean(layer.id);
			}

			for (const [key, layerTexture] of layerTextures) {
				const [tileX, tileY] = key.split(",").map(Number);
				layerTexture.writeUniforms(
					uniformBufferHandler.commonUniforms,
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
				pass.setBindGroup(0, layerTexture.bindGroup);
				pass.draw(6);
			}
		}

		// DRAW UI
		if (renderUI) {
			pass.setPipeline(uiPipeline);
			pass.setVertexBuffer(0, vertexBuffer);
			pass.setBindGroup(0, GPUBindUi.bindGroup);
			GPUBindUi.writeBuffer(
				uniformBufferHandler.commonUniforms,
				uniformBufferHandler.uiUniforms,
			);
			pass.draw(6);
		}

		pass.end();
		const commandBuffer = encoder.finish();
		device.queue.submit([commandBuffer]);
	};

	return {
		draw,
		addLayerTexture,
		removeLayerTexture,
		setRenderUI,
	};
};
