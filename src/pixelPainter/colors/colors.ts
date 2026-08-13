type RGBA = { a: number; r: number; g: number; b: number };
/** Expected format: #AARRGGBB */
type HEX = string;
type Color = number | HEX | RGBA;

/** ---- START OF CONVERSION METHODS ---- */
const RGBAToNumber = (argb: RGBA): number => {
	const { a, r, g, b } = argb;

	const _r = (r & 0xff) << 24;
	const _g = (g & 0xff) << 16;
	const _b = (b & 0xff) << 8;
	const _a = a & 0xff;

	return (_r | _g | _b | _a) >>> 0;
};

const numberToRGBA = (value: number): RGBA => {
	const r = (value >>> 24) & 0xff;
	const g = (value >>> 16) & 0xff;
	const b = (value >>> 8) & 0xff;
	const a = value & 0xff;

	return { a, r, g, b };
};

const hexToNumber = (hex: HEX): number => {
	if (!hex.startsWith("#")) {
		throw new Error("Invalid HEX format. Expected format: #AARRGGBB");
	}

	return parseInt(hex.slice(1), 16) >>> 0;
};

const numberToHex = (value: number): HEX => {
	return `#${value.toString(16).padStart(8, "0").toUpperCase()}`;
};

/** ____ END OF CONVERSION METHODS ____ */

export const createColor = (color: Color) => {
	// The color is saved only in number format
	let colorValue: number = 0x000000ff;

	/** ----- START OF THE EXPOSED METHODS ----- */

	/**
	 * Return the color in the default format (number)
	 */
	const getColor = () => {
		return colorValue;
	};

	/**
	 * Get the color in ARGB format
	 */
	const getARGB = () => {
		return numberToRGBA(colorValue);
	};

	/**
	 * Get the color in HEX format
	 */
	const getHex = () => {
		return numberToHex(colorValue);
	};

	/**
	 * Set the color in any of the supported formats (number, HEX, ARGB)
	 */
	const setColor = (color: Color) => {
		if (typeof color === "number") {
			colorValue = color;
			return;
		}

		if (typeof color === "string") {
			colorValue = hexToNumber(color);
			return;
		}

		colorValue = RGBAToNumber(color);
	};

	const alphaComposite = (dst: RGBA) => {
		const src = getARGB();
		const srcA = src.a / 255;
		const dstA = dst.a / 255;

		if (srcA === 0) {
			return { ...dst };
		}

		if (srcA === 1) {
			return { ...src };
		}

		const outA = srcA + dstA * (1 - srcA);

		if (outA === 0) {
			return { r: 0, g: 0, b: 0, a: 0 };
		}

		const outR = (src.r * srcA + dst.r * dstA * (1 - srcA)) / outA;
		const outG = (src.g * srcA + dst.g * dstA * (1 - srcA)) / outA;
		const outB = (src.b * srcA + dst.b * dstA * (1 - srcA)) / outA;

		return { r: outR, g: outG, b: outB, a: outA * 255 };
	};

	/** ----- END OF THE EXPOSED METHODS ----- */

	// Set the initial color value based on the provided color
	setColor(color);

	return {
		setColor,
		getColor,
		getARGB,
		getHex,
		alphaComposite,
	};
};
