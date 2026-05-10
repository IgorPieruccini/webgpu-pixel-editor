import type { ACTIVATE_TOOL } from "./constant";

export type ToolType = keyof typeof ACTIVATE_TOOL;

export type ProjectType = { name: string; gridSize: Vec2 };
