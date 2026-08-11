import type { RGBA } from "./types";

export const uintToRGBA = ([r, g, b, a]: Array<number>): RGBA => {
	return { r, g, b, a: a / 255 };
};

export const numberToRGBA = (argb: number): RGBA => {
	const hasAlpha = argb.toString(16).length > 6;

	if (hasAlpha) {
		return {
			// low byte is alpha (0-255) -> normalize to 0-1
			a: (argb & 0xff) / 255,
			// high bytes are R, G, B
			r: (argb >>> 24) & 0xff,
			g: (argb >>> 16) & 0xff,
			b: (argb >>> 8) & 0xff,
		};
	}

	return {
		a: 1,
		r: (argb >>> 16) & 0xff,
		g: (argb >>> 8) & 0xff,
		b: argb & 0xff,
	};
};

export const rgbaToHex = ({ r, g, b, a }: RGBA): string => {
	// Convert RGBA object to RGBA format (0xRRGGBBAA)
	// r, g, b are expected in 0-255 range; a is expected in 0-1 range
	const rByte = Math.round(Math.max(0, Math.min(255, r))) & 0xff;
	const gByte = Math.round(Math.max(0, Math.min(255, g))) & 0xff;
	const bByte = Math.round(Math.max(0, Math.min(255, b))) & 0xff;
	const aByte = Math.round(Math.max(0, Math.min(1, a)) * 255) & 0xff;

	// Compose into #RRGGBBAA as a string so the value cannot become a signed
	// 32-bit decimal number when the red channel is >= 0x80.
	return `#${[rByte, gByte, bByte, aByte]
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("")}`;
};

export const numberToHex = (value: number): string => {
	const unsignedValue = value >>> 0;
	const rgbValue =
		unsignedValue > 0xffffff ? unsignedValue >>> 8 : unsignedValue;

	return `#${rgbValue.toString(16).padStart(6, "0").slice(-6)}`;
};

export const hexToNumber = (hex: string): number => {
	return Number.parseInt(hex.replace(/^#/, ""), 16) >>> 0;
};

export const alphaComposite = (src: RGBA, dst: RGBA) => {
	const outA = src.a + dst.a * (1 - src.a);

	const outR = (src.r * src.a + dst.r * dst.a * (1 - src.a)) / outA;
	const outG = (src.g * src.a + dst.g * dst.a * (1 - src.a)) / outA;
	const outB = (src.b * src.a + dst.b * dst.a * (1 - src.a)) / outA;

	return { r: outR, g: outG, b: outB, a: outA };
};

const decodeImageElement = async (
	blob: Blob,
): Promise<{ image: HTMLImageElement; cleanup: () => void }> => {
	const objectUrl = URL.createObjectURL(blob);
	const image = new Image();
	image.src = objectUrl;

	try {
		await image.decode();
		return {
			image,
			cleanup: () => URL.revokeObjectURL(objectUrl),
		};
	} catch (error) {
		URL.revokeObjectURL(objectUrl);
		throw error;
	}
};

export const parseBlobToUint8Array = async (
	blob: Blob,
): Promise<{
	buffer: Uint8Array<ArrayBuffer>;
	width: number;
	height: number;
}> => {
	const bitmap = await createImageBitmap(blob);

	try {
		let width = bitmap.width;
		let height = bitmap.height;

		if (width <= 0 || height <= 0) {
			const { image, cleanup } = await decodeImageElement(blob);

			try {
				width = image.naturalWidth;
				height = image.naturalHeight;
			} finally {
				cleanup();
			}
		}

		if (width <= 0 || height <= 0) {
			throw new Error("Imported image has invalid dimensions");
		}

		const canvas =
			typeof OffscreenCanvas !== "undefined"
				? new OffscreenCanvas(width, height)
				: Object.assign(document.createElement("canvas"), {
						width,
						height,
					});

		const context = canvas.getContext("2d", {
			willReadFrequently: true,
		});

		if (!context) {
			throw new Error("Could not create 2D canvas context for image import");
		}

		context.drawImage(bitmap, 0, 0);

		const { data } = context.getImageData(0, 0, width, height);
		const buffer = new Uint8Array(data);

		return {
			buffer,
			width,
			height,
		};
	} catch {
		throw new Error("Error on parsing blob");
	} finally {
		bitmap.close();
	}
};
