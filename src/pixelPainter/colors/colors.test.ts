import { describe, expect, it } from "vitest";
import { createColor } from "./colors";

const testCases = {
	hexToNumber: [
		{ value: "#FFFFFFFF", expected: 0xffffffff },
		{ value: "#FFFF0000", expected: 0xffff0000 },
		{ value: "#FF00FF00", expected: 0xff00ff00 },
		{ value: "#FF0000FF", expected: 0xff0000ff },
	],
	rgbToNumber: [
		{ value: { r: 255, g: 255, b: 255, a: 1 }, expected: 0xffffffff },
		{ value: { r: 255, g: 0, b: 0, a: 1 }, expected: 0xffff0000 },
		{ value: { r: 0, g: 255, b: 0, a: 1 }, expected: 0xff00ff00 },
		{ value: { r: 0, g: 0, b: 255, a: 1 }, expected: 0xff0000ff },
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

	it("ARGB to number", () => {
		testCases.rgbToNumber.forEach((testCase) => {
			color.setColor(testCase.value);
			expect(color.getColor()).toBe(testCase.expected);
			expect(color.getARGB()).toEqual(testCase.value);
		});
	});
});
