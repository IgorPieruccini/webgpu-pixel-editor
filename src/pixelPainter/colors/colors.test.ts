import { describe, expect, it } from "vitest";
import { createColor } from "./colors";

const testCases = {
	hexToNumber: [
		{ value: "#FFFFFFFF", expected: 0xffffffff },
		{ value: "#FF0000FF", expected: 0xff0000ff },
		{ value: "#00FF00FF", expected: 0x00ff00ff },
		{ value: "#0000FFFF", expected: 0x0000ffff },
		{ value: "#FFFFFF00", expected: 0xffffff00 },
		{ value: "#FF000000", expected: 0xff000000 },
		{ value: "#00000000", expected: 0x00000000 },
		{ value: "#00000080", expected: 0x00000080 },
	],
	rgbToNumber: [
		{ value: { r: 255, g: 255, b: 255, a: 1 }, expected: 0xffffffff },
		{ value: { r: 255, g: 0, b: 0, a: 1 }, expected: 0xff0000ff },
		{ value: { r: 0, g: 255, b: 0, a: 1 }, expected: 0x00ff00ff },
		{ value: { r: 0, g: 0, b: 255, a: 1 }, expected: 0x0000ffff },
		{ value: { r: 255, g: 255, b: 255, a: 0 }, expected: 0xffffff00 },
		{ value: { r: 255, g: 0, b: 0, a: 0 }, expected: 0xff000000 },
		{ value: { r: 0, g: 0, b: 0, a: 0 }, expected: 0x00000000 },
	],
};

const color = createColor("#FFFFFFFF");

describe("Colors", () => {
	it("hexToNumber", () => {
		testCases.hexToNumber.forEach((testCase) => {
			color.setColor(testCase.value);
			expect(color.getColor()).toBe(testCase.expected);
			expect(color.getHex()).toBe(testCase.value);
		});
	});

	it("RGBA to number", () => {
		testCases.rgbToNumber.forEach((testCase) => {
			color.setColor(testCase.value);
			expect(color.getColor()).toBe(testCase.expected);
			expect(color.getARGB()).toEqual(testCase.value);
		});
	});
});
