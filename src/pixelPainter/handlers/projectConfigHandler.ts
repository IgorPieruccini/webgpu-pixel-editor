import { createSignal } from "solid-js";
import type { Vec2 } from "../types";

export type ProjectConfigHandler = Awaited<
	ReturnType<typeof createProjectConfigHandler>
>;

export const createProjectConfigHandler = (gridSize: Vec2) => {
	const [getSize, setSize] = createSignal<Vec2>(gridSize);

	return {
		getSize,
		setSize,
	};
};
