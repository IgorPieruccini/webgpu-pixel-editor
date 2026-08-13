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
		{ value: { r: 255, g: 255, b: 255, a: 255 }, expected: 0xffffffff },
		{ value: { r: 255, g: 0, b: 0, a: 255 }, expected: 0xff0000ff },
		{ value: { r: 0, g: 255, b: 0, a: 255 }, expected: 0x00ff00ff },
		{ value: { r: 0, g: 0, b: 255, a: 255 }, expected: 0x0000ffff },
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

describe("alphaComposite", () => {
	it("keeps the destination when the source is transparent", () => {
		const color = createColor("#FF0000FF");
		expect(color.alphaComposite({ r: 10, g: 20, b: 30, a: 0 })).toEqual({
			r: 255,
			g: 0,
			b: 0,
			a: 255,
		});
	});

	it("keeps the source when it is opaque", () => {
		const color = createColor("#FF000000");
		expect(color.alphaComposite({ r: 10, g: 20, b: 30, a: 255 })).toEqual({
			r: 10,
			g: 20,
			b: 30,
			a: 255,
		});
	});

	it("compose colors with alpha", () => {
		const color = createColor("#FF000070");

		const result = color.alphaComposite({ r: 0, g: 255, b: 0, a: 120 });

		expect(result.r).toBeCloseTo(159.29);
		expect(result.g).toBeCloseTo(95.71);
		expect(result.b).toBeCloseTo(0);
		expect(result.a).toBeCloseTo(179.29);
	});
});
