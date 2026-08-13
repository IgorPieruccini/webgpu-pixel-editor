import { createSignal } from "solid-js";
import { storageLocal } from "../../storageLocal";
import type {
	WorkerRequest,
	WorkerResponse,
} from "../workers/calculateColorPaletteWorker";
import type { LayerHandler } from "./layerHandler";

export type ColorPaletteHandler = ReturnType<typeof createColorPaletteHandler>;

const DEFAULT_PALETTE: string[] = [
	"#D17428FF",
	"#28D1D1FF",
	"#3F5A8AFF",
	"#AD1D41FF",
];

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

	const loadColorPalette = (colorPalette?: string[]) => {
		const colors =
			colorPalette ?? storageLocal.colorPalette.get() ?? DEFAULT_PALETTE;
		setColorPalette(colors);
		storageLocal.colorPalette.set(colors);
	};

	const addColor = (color: string) => {
		const colorPalette = getColorPalette();
		const alreadyInColorPalette = colorPalette.find(
			(c) => c.toUpperCase() === color.toUpperCase(),
		);
		if (alreadyInColorPalette) {
			return;
		}

		const colors = [...colorPalette, color];
		setColorPalette(colors);
		storageLocal.colorPalette.set(colors);
	};

	const removeColor = (deleteColor: string) => {
		const colors = getColorPalette();
		const newColors = colors.filter((color) => color !== deleteColor);
		loadColorPalette(newColors);
	};

	const sortColorPalette = (dragged: string, dropped: string) => {
		const colors = [...getColorPalette()];
		let draggedIndex = 0;
		let droppedIndex = 0;

		for (let i = 0; i < colors.length; i++) {
			const color = colors[i];
			if (color === dragged) {
				draggedIndex = i;
			}
			if (color === dropped) {
				droppedIndex = i;
			}
		}

		const draggedLayer = colors.splice(draggedIndex, 1);
		const first = colors.slice(0, droppedIndex);
		const second = colors.slice(droppedIndex, colors.length);
		const newColors = [...first, ...draggedLayer, ...second];

		loadColorPalette(newColors);
	};

	return {
		calculateColorPalette,
		isLoadingColors: getIsLoading(),
		getColors,
		loadColorPalette,
		getColorPalette,
		addColor,
		removeColor,
		sortColorPalette,
	};
};
