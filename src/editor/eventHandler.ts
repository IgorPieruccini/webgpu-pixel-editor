import type { Vec2 } from "../pixelPainter/types";
import { generateUUID } from "../utils";

type WheelType = {
	deltaMode: number;
	delta?: Vec2;
};

export type EditorEventType = {
	mouse: {
		position: Vec2;
		movement: Vec2;
		isLeftButtonDown: boolean;
	};
	keyboard: {
		isPressingKey: (key: string) => true;
		isPressingCtrl: boolean;
	};
	wheel: WheelType;
};

export type EditorEventMethod = (e: EditorEventType) => void;

export const createEventHandler = () => {
	const mousePosition: Vec2 = { x: 0, y: 0 };
	const mouseMovement: Vec2 = { x: 0, y: 0 };
	let isPressingMouseLeft: boolean = false;
	let isPressingMouseRight: boolean = false;
	let isPressingCtrl: boolean = false;
	const keysDown: Set<string> = new Set();
	const wheel: WheelType = {
		deltaMode: 0,
	};

	const mouseDownSubscriptions: Map<string, EditorEventMethod> = new Map();

	const subscribeToMouseDown = (f: EditorEventMethod) => {
		const key = generateUUID();
		mouseDownSubscriptions.set(key, f);
		return () => {
			mouseDownSubscriptions.delete(key);
		};
	};

	const mouseUpSubscriptions: Map<string, EditorEventMethod> = new Map();

	const subscribeToMouseUp = (f: EditorEventMethod) => {
		const key = generateUUID();
		mouseUpSubscriptions.set(key, f);
		return () => {
			mouseUpSubscriptions.delete(key);
		};
	};

	const mouseMoveSubscriptions: Map<string, EditorEventMethod> = new Map();

	const subscribeToMouseMove = (f: EditorEventMethod) => {
		const key = generateUUID();
		mouseMoveSubscriptions.set(key, f);
		return () => {
			mouseMoveSubscriptions.delete(key);
		};
	};

	const mouseWheelSubscriptions: Map<string, EditorEventMethod> = new Map();

	const subscribeToMouseWheel = (f: EditorEventMethod) => {
		const key = generateUUID();
		mouseWheelSubscriptions.set(key, f);
		return () => {
			mouseWheelSubscriptions.delete(key);
		};
	};

	const keyDownSubscriptions: Map<string, EditorEventMethod> = new Map();

	const subscribeToKeyDown = (f: EditorEventMethod) => {
		const key = generateUUID();
		keyDownSubscriptions.set(key, f);
		return () => {
			keyDownSubscriptions.delete(key);
		};
	};

	const keyUpSubscriptions: Map<string, EditorEventMethod> = new Map();

	const subscribeToKeyUp = (f: EditorEventMethod) => {
		const key = generateUUID();
		keyUpSubscriptions.set(key, f);
		return () => {
			keyUpSubscriptions.delete(key);
		};
	};

	const updateMouseData = (e: MouseEvent) => {
		mousePosition.x = e.clientX;
		mousePosition.y = e.clientY;
		mouseMovement.x = e.movementX;
		mouseMovement.y = e.movementY;
		isPressingMouseLeft = e.button === 0;
		isPressingMouseRight = e.button === 1;
	};

	const onMouseUp = (e: MouseEvent) => {
		updateMouseData(e);
	};

	const onMouseDown = (e: MouseEvent) => {
		updateMouseData(e);
	};

	const onMouseMove = (e: MouseEvent) => {
		updateMouseData(e);
	};

	const onWheel = (e: WheelEvent) => {
		e.preventDefault();
		wheel.deltaMode = e.deltaMode;
		wheel.delta = { x: e.deltaX, y: e.deltaY };
	};

	const onKeyDown = (e: KeyboardEvent) => {
		isPressingCtrl = e.ctrlKey || e.metaKey;
		keysDown.add(e.code);
	};

	const onKeyUp = (e: KeyboardEvent) => {
		if (keysDown.has(e.code)) {
			keysDown.delete(e.code);
		}

		if (isPressingCtrl) {
			isPressingCtrl = e.ctrlKey || e.metaKey;
		}
	};

	const tick = () => {};

	const startListening = () => {
		window.addEventListener("mousedown", onMouseDown);
		window.addEventListener("mouseup", onMouseUp);
		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("wheel", onWheel);
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
	};

	const stopListening = () => {
		window.removeEventListener("mousedown", onMouseDown);
		window.removeEventListener("mouseup", onMouseUp);
		window.removeEventListener("mousemove", onMouseMove);
		window.removeEventListener("wheel", onWheel);
		window.removeEventListener("keydown", onKeyDown);
		window.removeEventListener("keyup", onKeyUp);
	};

	return {
		tick,
		startListening,
		stopListening,
		subscribe: {
			mouseDown: subscribeToMouseDown,
			mouseUp: subscribeToMouseUp,
			mouseMove: subscribeToMouseMove,
			mouseWheel: subscribeToMouseWheel,
			keyDown: subscribeToKeyDown,
			keyUp: subscribeToKeyUp,
		},
	};
};
