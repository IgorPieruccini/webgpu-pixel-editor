import { describe, expect, it } from "vitest";
import { createColor } from "./colors";

const testCases = {
	hexToNumber: [
		{ value: "#FFFFFFFF", expected: 0xffffffff },
		{ value: "#FFFF0000", expected: 0xffff0000 },
		{ value: "#FF00FF00", expected: 0xff00ff00 },
		{ value: "#FF0000FF", expected: 0xff0000ff },
		{ value: "#00FFFFFF", expected: 0x00ffffff },
		{ value: "#00FF0000", expected: 0x00ff0000 },
		{ value: "#00000000", expected: 0x00000000 },
		{ value: "#80000000", expected: 0x80000000 },
		{ value: "#FF123456", expected: 0xff123456 },
		{ value: "#FFABCDEF", expected: 0xffabcdef },
		{ value: "#FF13579B", expected: 0xff13579b },
		{ value: "#8042A1C7", expected: 0x8042a1c7 },
		{ value: "#00123456", expected: 0x00123456 },
	],
	rgbToNumber: [
		{ value: { r: 255, g: 255, b: 255, a: 1 }, expected: 0xffffffff },
		{ value: { r: 255, g: 0, b: 0, a: 1 }, expected: 0xffff0000 },
		{ value: { r: 0, g: 255, b: 0, a: 1 }, expected: 0xff00ff00 },
		{ value: { r: 0, g: 0, b: 255, a: 1 }, expected: 0xff0000ff },
		{ value: { r: 255, g: 255, b: 255, a: 0 }, expected: 0x00ffffff },
		{ value: { r: 255, g: 0, b: 0, a: 0 }, expected: 0x00ff0000 },
		{ value: { r: 0, g: 0, b: 0, a: 0 }, expected: 0x00000000 },
		{ value: { r: 18, g: 52, b: 86, a: 1 }, expected: 0xff123456 },
		{ value: { r: 171, g: 205, b: 239, a: 1 }, expected: 0xffabcdef },
		{ value: { r: 66, g: 161, b: 199, a: 0 }, expected: 0x0042a1c7 },
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
