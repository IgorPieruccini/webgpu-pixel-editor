import type { Vec2 } from "../pixelPainter/types";
import { generateUUID } from "../utils";

type WheelType = {
	deltaMode: number;
	delta: Vec2;
};

type TickEvents = {
	onMouseDown: boolean;
	onMouseUp: boolean;
	onMouseMove: boolean;
	onKeyDown: boolean;
	onKeyUp: boolean;
	onWheel: boolean;
};

export type EditorEventType = {
	mouse: {
		position: Vec2;
		movement: Vec2;
		isLeftButtonDown: boolean;
		isRightButtonDown: boolean;
	};
	keyboard: {
		isPressingKey: (key: string) => boolean;
		isPressingCtrl: boolean;
		isPressingShift: boolean;
	};
	wheel: WheelType;
};

export type EditorEventMethod = (e: EditorEventType) => void;

export const INITIAL_TICK_EVENTS: TickEvents = {
	onMouseDown: false,
	onMouseUp: false,
	onMouseMove: false,
	onKeyDown: false,
	onKeyUp: false,
	onWheel: false,
};

export const createEventHandler = (canvas: HTMLCanvasElement) => {
	const mousePosition: Vec2 = { x: 0, y: 0 };
	const mouseMovement: Vec2 = { x: 0, y: 0 };
	let isPressingMouseLeft: boolean = false;
	let isPressingMouseRight: boolean = false;
	let isPressingCtrl: boolean = false;
	let isPressingShift: boolean = false;
	const keysDown: Set<string> = new Set();
	const wheel: WheelType = {
		deltaMode: 0,
		delta: { x: 0, y: 0 },
	};

	let tickEvents: TickEvents = { ...INITIAL_TICK_EVENTS };

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
	};

	const onMouseUp = (e: MouseEvent) => {
		e.preventDefault();
		updateMouseData(e);
		if (isPressingMouseLeft && e.button === 0) {
			isPressingMouseLeft = false;
		}

		if (isPressingMouseRight && e.button === 1) {
			isPressingMouseRight = false;
		}

		tickEvents.onMouseUp = true;
	};

	const onMouseDown = (e: MouseEvent) => {
		e.preventDefault();
		updateMouseData(e);
		isPressingMouseLeft = e.button === 0;
		isPressingMouseRight = e.button === 1;
		tickEvents.onMouseDown = true;
	};

	const onMouseMove = (e: MouseEvent) => {
		e.preventDefault();
		updateMouseData(e);
		tickEvents.onMouseMove = true;
	};

	const onWheel = (e: WheelEvent) => {
		e.preventDefault();
		wheel.deltaMode = e.deltaMode;
		wheel.delta = { x: e.deltaX, y: e.deltaY };
		tickEvents.onWheel = true;
	};

	const onKeyDown = (e: KeyboardEvent) => {
		isPressingCtrl = e.ctrlKey || e.metaKey;
		keysDown.add(e.code);
		isPressingShift = e.code === "ShiftLeft" || e.code === "ShiftRight";
		tickEvents.onKeyDown = true;
	};

	const onKeyUp = (e: KeyboardEvent) => {
		if (keysDown.has(e.code)) {
			keysDown.delete(e.code);
		}

		if (isPressingCtrl) {
			isPressingCtrl = e.ctrlKey || e.metaKey;
		}

		if (isPressingShift) {
			isPressingShift = e.code === "ShiftLeft" || e.code === "ShiftRight";
		}

		tickEvents.onKeyUp = true;
	};

	const isPressingKey = (e: string) => {
		return keysDown.has(e);
	};

	const tick = () => {
		const event: EditorEventType = {
			mouse: {
				position: mousePosition,
				movement: mouseMovement,
				isLeftButtonDown: isPressingMouseLeft,
				isRightButtonDown: isPressingMouseRight,
			},
			keyboard: {
				isPressingCtrl,
				isPressingKey,
				isPressingShift,
			},
			wheel: {
				deltaMode: wheel.deltaMode,
				delta: wheel.delta,
			},
		};

		if (tickEvents.onMouseDown) {
			mouseDownSubscriptions.forEach((f) => f(event));
		}

		if (tickEvents.onMouseUp) {
			mouseUpSubscriptions.forEach((f) => f(event));
		}

		if (tickEvents.onMouseMove) {
			mouseMoveSubscriptions.forEach((f) => f(event));
		}

		if (tickEvents.onKeyDown) {
			keyDownSubscriptions.forEach((f) => f(event));
		}

		if (tickEvents.onKeyUp) {
			keyUpSubscriptions.forEach((f) => f(event));
		}

		if (tickEvents.onWheel) {
			mouseWheelSubscriptions.forEach((f) => f(event));
		}

		tickEvents = { ...INITIAL_TICK_EVENTS };
	};

	const startListening = () => {
		canvas.addEventListener("mousedown", onMouseDown);
		canvas.addEventListener("mouseup", onMouseUp);
		canvas.addEventListener("mousemove", onMouseMove);
		canvas.addEventListener("wheel", onWheel);
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
	};

	const stopListening = () => {
		canvas.removeEventListener("mousedown", onMouseDown);
		canvas.removeEventListener("mouseup", onMouseUp);
		canvas.removeEventListener("mousemove", onMouseMove);
		canvas.removeEventListener("wheel", onWheel);
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
