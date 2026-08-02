import { createSignal } from "solid-js";
import { storageLocal } from "../../storageLocal";
import type {
	WorkerRequest,
	WorkerResponse,
} from "../workers/calculateColorPaletteWorker";
import type { LayerHandler } from "./layerHandler";

export type ColorPaletteHandler = ReturnType<typeof createColorPaletteHandler>;

const DEFAULT_PALETTE: string[] = ["#D17428", "#28D1D1", "#3F5A8A", "#AD1D41"];

export const createColorPaletteHandler = (layerHandler: LayerHandler) => {
	const [getIsLoading, setIsLoading] = createSignal(false);
	const [getColors, setColors] = createSignal<string[]>([]);
	const [getColorPalette, setColorPalette] = createSignal<string[]>([]);

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

	const loadColorPalette = () => {
		const colorsFromLocal = storageLocal.colorPalette.get();
		setColorPalette(colorsFromLocal ?? DEFAULT_PALETTE);
	};

	const addColor = (color: string) => {
		const colors = setColorPalette((prev) => [...prev, color]);
		storageLocal.colorPalette.set(colors);
	};

	const removeColor = (deleteColor: string) => {
		const colors = getColorPalette();
		const newColors = colors.filter((color) => color !== deleteColor);
		setColorPalette(newColors);
		storageLocal.colorPalette.set(newColors);
	};

	loadColorPalette();

	return {
		calculateColorPalette,
		isLoadingColors: getIsLoading(),
		getColors,
		loadColorPalette,
		getColorPalette,
		addColor,
		removeColor,
	};
};
