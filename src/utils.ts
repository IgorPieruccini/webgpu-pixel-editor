import type { Vec2 } from "./pixelPainter/types";

export const generateUUID = () => {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0,
			v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

export const calculateZoomFromGridAndCanvasSize = (
	gridSize: Vec2,
	canvasSize: Vec2,
) => {
	const canvasAspectRatio = canvasSize.x / canvasSize.y;
	const gridAspectRatio = gridSize.x / gridSize.y;

	return Math.min(canvasAspectRatio, gridAspectRatio);
};

export const downloadFile = <T>(data: T, name: string, format: string) => {
	// Stringify the serialized layer buffer
	const jsonString = JSON.stringify(data);

	// Create a blob and download it as "layer.px"
	const blob = new Blob([jsonString], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `${name}.${format}`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};

export const importFile = (cb: (content: string) => void) => {
	// Create a file input element
	const input = document.createElement("input");
	input.type = "file";
	input.accept = ".px";

	input.onchange = (event) => {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (!file) return;

		// Check if the file has .px extension
		if (!file.name.endsWith(".px")) {
			alert("Please select a .px file");
			return;
		}

		// Read the file content
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const content = e.target?.result as string;
				cb(content);
			} catch (error) {
				console.error("Error parsing .px file:", error);
				alert("Invalid .px file format");
			}
		};

		reader.readAsText(file);
	};

	// Trigger the file dialog
	input.click();
};

export function debounce<T extends (...args: any[]) => void>(
	fn: T,
	delay: number,
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout>;

	return (...args) => {
		clearTimeout(timeout);

		timeout = setTimeout(() => {
			fn(...args);
		}, delay);
	};
}
