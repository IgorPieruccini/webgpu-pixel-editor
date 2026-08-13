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
