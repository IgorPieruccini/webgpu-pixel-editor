import { describe, expect, it } from "vitest";
import { MockLocalStorate } from "../../test/utils";
import { createProjectConfigHandler } from "../projectConfigHandler";
import { createLinePaintHandler } from "./linePaintHanlder";

MockLocalStorate();

describe("Line", () => {
	it("getPixelsToPaint", () => {
		const projectConfigHandler = createProjectConfigHandler(
			{ x: 10, y: 10 },
			"test",
		);
		const uniformBufferHandler = {
			setLineStartPosition: () => {},
			resetStartLinePosition: () => {},
			getStartLinePosition: () => ({ x: 0, y: 0 }),
		} as never;
		const layerHandler = {
			saveCurrentBuffer: () => {},
		} as never;
		const brushHandler = {
			getThickness: () => 1,
			paint: () => true,
			clearCurrentPaintedPixels: () => {},
		} as never;

		const lineHandler = createLinePaintHandler(
			projectConfigHandler,
			uniformBufferHandler,
			layerHandler,
			brushHandler,
		);

		const line = lineHandler.getPixelToPaint({
			a: {
				x: 0,
				y: 0,
			},
			b: {
				x: 8,
				y: 2,
			},
		});

		console.log(line);

		expect(line).not.toBeUndefined();
	});
});
