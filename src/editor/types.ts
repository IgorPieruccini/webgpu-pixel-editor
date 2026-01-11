import type { ACTIVATE_TOOL } from "./constant";

export type ToolType = keyof typeof ACTIVATE_TOOL;

export type Vec2 = { x: number; y: number };
export type Vec4 = { x: number; y: number; z: number; w: number };

export type ProjectType = { name: string; gridSize: Vec2 };
