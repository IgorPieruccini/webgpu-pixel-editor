import { createSignal } from "solid-js";
import type {
	WorkerRequest,
	WorkerResponse,
} from "../workers/calculateColorPaletteWorker";
import type { LayerHandler } from "./layerHandler";

export type ColorPaletteHandler = ReturnType<typeof createColorPaletteHandler>;

export const createColorPaletteHandler = (layerHandler: LayerHandler) => {
	const [getIsLoading, setIsLoading] = createSignal(false);
	const [getColors, setColors] = createSignal<string[]>([]);

	const worker = new Worker(
		new URL("../workers/calculateColorPaletteWorker.ts", import.meta.url),
		{
			type: "module",
		},
	);

	const calculateColorPalette = () => {
		setIsLoading(true);
		const workerBuffers = Array.from(layerHandler.buffers.values()).flatMap(
			(buffer) =>
				Array.from(buffer.tiles.values()).map((tile) => new Uint8Array(tile)),
		);

		const message: WorkerRequest = {
			buffers: workerBuffers,
		};

		worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
			const { colors } = event.data;
			setColors(colors);
			setIsLoading(false);
		};

		worker.postMessage(
			message,
			workerBuffers.map((buffer) => buffer.buffer),
		);
	};

	const loadColorPalette = () => {};

	const addColor = () => {};

	const removeColor = () => {};

	return {
		calculateColorPalette,
		isLoadingColors: getIsLoading(),
		getColors,
		loadColorPalette,
		addColor,
		removeColor,
	};
};
