type ARGB = { a: number; r: number; g: number; b: number };
/** Expected format: #AARRGGBB */
type HEX = string;
type Color = number | HEX | ARGB;

/** ---- START OF CONVERSION METHODS ---- */

const ARGBToNumber = (argb: ARGB): number => {
	const { a, r, g, b } = argb;

	const _a = (a & 0xff) << 24;
	const _r = (r & 0xff) << 16;
	const _g = (g & 0xff) << 8;
	const _b = b & 0xff;

	return (_a | _r | _g | _b) >>> 0;
};

const numberToARGB = (value: number): ARGB => {
	const a = (value >>> 24) & 0xff;
	const r = (value >>> 16) & 0xff;
	const g = (value >>> 8) & 0xff;
	const b = value & 0xff;

	return { a, r, g, b };
};

const hexToNumber = (hex: HEX): number => {
	if (!hex.startsWith("#")) {
		throw new Error("Invalid HEX format. Expected format: #AARRGGBB");
	}

	return parseInt(hex.slice(1), 16) >>> 0;
};

const numberToHex = (value: number): HEX => {
	return `#${value.toString(16).toUpperCase()}`;
};

/** ____ END OF CONVERSION METHODS ____ */

export const createColor = (color: Color) => {
	// The color is saved only in number format
	let colorValue: number = 0xff00000000;

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
		return numberToARGB(colorValue);
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
			hexToNumber(color);
			return;
		}

		colorValue = ARGBToNumber(color);
	};

	/** ----- END OF THE EXPOSED METHODS ----- */

	// Set the initial color value based on the provided color
	setColor(color);

	return {
		setColor,
		getColor,
		getARGB,
		getHex,
	};
};
