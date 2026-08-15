import { createSignal } from "solid-js";
import { INITIAL_PIXEL_PAINTER } from "../pixelPainter/constants";
import { pixelPainter } from "../pixelPainter/pixelPainter";
import type { PixelPainterMethods, Vec2 } from "../pixelPainter/types";
import { calculateZoomFromGridAndCanvasSize } from "../utils";
import { ACTIVATE_TOOL } from "./constant";
import { createEditorEvents } from "./createEditorEvents";
import { createEventHandler } from "./eventHandler";

export type EditorType = Awaited<ReturnType<typeof initializeEditor>>;

export const initializeEditor = async () => {
	let pixel: PixelPainterMethods = INITIAL_PIXEL_PAINTER;

	const [getActiveTool, _setActiveTool] = createSignal(ACTIVATE_TOOL.PAINT);

	const setActiveTool = (activeTool: number) => {
		_setActiveTool(activeTool);

		pixel.tool.set(activeTool);

		// When using paint selection tool (or perhaps other tools that will be implemented), these tools might not need
		// custom brush thickness, so it's set to 1.
		if (activeTool === ACTIVATE_TOOL.PAINT_SELECTION) {
			pixel.render.setSelectionTool(true);
		}

		// And here we make sure the tools that needs the custom thickness are used by setting the default to null
		if (activeTool !== ACTIVATE_TOOL.PAINT_SELECTION) {
			pixel.render.setSelectionTool(false);
		}
	};

	const canvas = document.getElementById("main-canvas");

	if (!(canvas instanceof HTMLCanvasElement)) {
		throw new Error("Canvas element not found");
	}

	const createNewPainter = async (
		name: string,
		initialGridSize: Vec2,
	): Promise<PixelPainterMethods> => {
		const zoom = calculateZoomFromGridAndCanvasSize(initialGridSize, {
			x: canvas.clientWidth,
			y: canvas.clientHeight,
		});

		pixel = await pixelPainter(
			name,
			initialGridSize,
			{
				x: canvas.clientWidth,
				y: canvas.clientHeight,
			},
			canvas,
		);

		pixel.render.setZoom(zoom - zoom * 0.3);
		createEventListeners();

		return pixel;
	};

	const eventHandler = createEventHandler(canvas);

	const createEventListeners = () => {
		// Stop listening and unsubscribe all events before creating new ones to avoid duplicate event handling
		eventHandler.stopListening();
		eventHandler.unsubscribeAll();

		const events = createEditorEvents({ pixel, canvas, getActiveTool });
		eventHandler.subscribe.mouseMove(events.onMouseMove);
		eventHandler.subscribe.mouseDown(events.onMouseDown);
		eventHandler.subscribe.mouseUp(events.onMouseUp);
		eventHandler.subscribe.keyDown(events.onKeyDown);
		eventHandler.subscribe.keyUp(events.onKeyUp);
		eventHandler.subscribe.mouseWheel(events.onWheel);
		eventHandler.startListening();
	};

	const loop = () => {
		pixel?.render.draw();
		eventHandler.tick();
		requestAnimationFrame(loop);
	};

	loop();

	return {
		createNewPainter,
		getActiveTool,
		setActiveTool,
		canvas,
	};
};
