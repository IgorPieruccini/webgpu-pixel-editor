import type { Accessor } from "solid-js";
import { BYTES_PER_PIXEL, ZOOM_SENSITIVITY } from "../constants";
import type { EditorEventType } from "../pixelPainter/handlers/eventHandler";
import type { PixelPainterMethods, Vec2 } from "../pixelPainter/types";
import { ACTIVATE_TOOL } from "./constant";

const normalizeWheelDelta = (event: EditorEventType["wheel"]) => {
	const LINE_HEIGHT = 16;
	const PAGE_HEIGHT = window.innerHeight;

	switch (event.deltaMode) {
		case WheelEvent.DOM_DELTA_LINE:
			return event.delta.x * LINE_HEIGHT;
		case WheelEvent.DOM_DELTA_PAGE:
			return event.delta.y * PAGE_HEIGHT;
		default:
			return event.delta.y;
	}
};

type CreateEditorEventsProps = {
	pixel: PixelPainterMethods;
	canvas: HTMLCanvasElement;
	getActiveTool: Accessor<number>;
};

export const createEditorEvents = ({
	pixel,
	canvas,
	getActiveTool,
}: CreateEditorEventsProps) => {
	const viewport = {
		left: canvas.offsetLeft,
		top: canvas.offsetTop,
		width: canvas.clientWidth,
		height: canvas.clientHeight,
	};

	let lastMoveLayerCell: Vec2 | null = null;

	function pickCell(
		mouse: { x: number; y: number },
		canvasOffset: { x: number; y: number },
	) {
		const zoom = pixel.render.getZoom();
		const pan = pixel.render.getPan();
		const gridSize = pixel.projectConfig.getSize();
		const aspectRatio = viewport.width / viewport.height;
		const gridRatio = gridSize.x / gridSize.y;
		const gap = (-viewport.width * aspectRatio) / 2 + viewport.width / 2;

		// 1. Screen → clip space (-1…1)
		const mx =
			(((mouse.x - canvasOffset.x) * aspectRatio - pan.x + gap) /
				viewport.width) *
				2 -
			1;

		const my =
			((mouse.y - canvasOffset.y + pan.y * gridRatio) / viewport.height) * -2 +
			1; // Y flips because screen origin is top-left

		// 2. Clip space → world space (undo shader transform)
		const worldX = mx / zoom;
		const worldY = (my / zoom) * gridRatio;

		// 3. World space (-1…1) → normalized 0…1 → grid index
		const cellX = Math.floor((worldX + 1) * 0.5 * gridSize.x);
		const cellY = Math.floor((worldY + 1) * 0.5 * gridSize.y);

		return { x: cellX, y: gridSize.y - 1 - cellY };
	}

	const onMouseMove = (e: EditorEventType) => {
		const aspectRatio = viewport.width / viewport.height;

		const gridSize = pixel.projectConfig.getSize();
		const gridRatio = gridSize.x / gridSize.y;

		const cell = pickCell(
			{ x: e.mouse.position.x, y: e.mouse.position.y },
			{ x: canvas.offsetLeft, y: canvas.offsetTop },
		);

		pixel.render.setCellPos({ x: cell.x, y: cell.y });

		const isPressingSpace = e.keyboard.isPressingKey("Space");

		if (isPressingSpace) {
			const pan = pixel.render.getPan();
			pixel.render.setPan({
				x: pan.x + e.mouse.movement.x * aspectRatio,
				y: pan.y - e.mouse.movement.y / gridRatio,
			});
			pan.x += e.mouse.movement.x * aspectRatio;
		}

		if (e.mouse.isLeftButtonDown && !isPressingSpace) {
			if (getActiveTool() === ACTIVATE_TOOL.PAINT) {
				pixel.brush.paint({
					x: cell.x * BYTES_PER_PIXEL,
					y: cell.y * BYTES_PER_PIXEL,
				});
			}

			if (getActiveTool() === ACTIVATE_TOOL.DELETE) {
				pixel.brush.erase({
					x: cell.x * BYTES_PER_PIXEL,
					y: cell.y * BYTES_PER_PIXEL,
				});
			}

			if (
				getActiveTool() === ACTIVATE_TOOL.MOVE_LAYER &&
				lastMoveLayerCell !== null
			) {
				const delta = {
					x: cell.x - lastMoveLayerCell.x,
					y: cell.y - lastMoveLayerCell.y,
				};

				if (delta.x !== 0 || delta.y !== 0) {
					pixel.layer.move(pixel.layer.getActive().id, delta);
					lastMoveLayerCell = cell;
				}
			}
		}

		if (
			getActiveTool() === ACTIVATE_TOOL.PAINT_SELECTION &&
			e.mouse.isLeftButtonDown
		) {
			pixel.render.setSelectedCellsSize({ x: cell.x, y: cell.y });
		}
	};

	const onMouseDown = (e: EditorEventType) => {
		const currentTool = getActiveTool();

		const cell = pickCell(
			{ x: e.mouse.position.x, y: e.mouse.position.y },
			{ x: canvas.offsetLeft, y: canvas.offsetTop },
		);

		if (currentTool === ACTIVATE_TOOL.PAINT) {
			pixel.brush.paint({
				x: cell.x * BYTES_PER_PIXEL,
				y: cell.y * BYTES_PER_PIXEL,
			});
		}

		if (currentTool === ACTIVATE_TOOL.DELETE) {
			pixel.brush.erase({
				x: cell.x * BYTES_PER_PIXEL,
				y: cell.y * BYTES_PER_PIXEL,
			});
		}

		if (currentTool === ACTIVATE_TOOL.LINE) {
			pixel.line.setLineStartPosition(cell);
		}

		if (currentTool === ACTIVATE_TOOL.PAINT_SELECTION) {
			const cell = pickCell(
				{ x: e.mouse.position.x, y: e.mouse.position.y },
				{ x: canvas.offsetLeft, y: canvas.offsetTop },
			);

			pixel.render.setSelectedCellsPosition({ x: cell.x, y: cell.y });
			pixel.render.setSelectedCellsSize({ x: cell.x, y: cell.y });
		}

		if (currentTool === ACTIVATE_TOOL.BUCKET_PAINT) {
			pixel.bucketPaint.paint(cell);
		}

		if (getActiveTool() === ACTIVATE_TOOL.EYE_DROPPER) {
			pixel.eyeDropper.eyeDropAtCell(cell);
		}

		if (currentTool === ACTIVATE_TOOL.MOVE_LAYER) {
			lastMoveLayerCell = cell;
		}
	};

	const onMouseUp = (e: EditorEventType) => {
		lastMoveLayerCell = null;

		if (getActiveTool() === ACTIVATE_TOOL.LINE) {
			const cell = pickCell(
				{ x: e.mouse.position.x, y: e.mouse.position.y },
				{ x: canvas.offsetLeft, y: canvas.offsetTop },
			);

			pixel.line.draw(cell);
			pixel.line.resetLineStartPosition();
		}

		if (getActiveTool() === ACTIVATE_TOOL.PAINT_SELECTION) {
			const selectedCells = pixel.render.getSelectedCellsRect();
			const selection = {
				x: Math.min(selectedCells.x, selectedCells.w),
				y: Math.min(selectedCells.y, selectedCells.h),
				w: Math.max(selectedCells.x, selectedCells.w),
				h: Math.max(selectedCells.y, selectedCells.h),
			};
			for (let x = selection.x; x <= selection.w; x++) {
				for (let y = selection.y; y <= selection.h; y++) {
					pixel.brush.paint(
						{
							x: x * BYTES_PER_PIXEL,
							y: y * BYTES_PER_PIXEL,
						},
						1,
					);
				}
			}

			pixel.render.setSelectedCellsSize({ x: -1, y: -1 });
			pixel.render.setSelectedCellsPosition({ x: -1, y: -1 });
		}
	};

	const onKeyDown = (e: EditorEventType) => {
		if (e.keyboard.isPressingCtrl && e.keyboard.isPressingKey("KeyZ")) {
			pixel.history.undo();
		}

		if (
			e.keyboard.isPressingCtrl &&
			e.keyboard.isPressingShift &&
			e.keyboard.isPressingKey("KeyZ")
		) {
			pixel.history.redo();
		}
	};

	const onKeyUp = (e: EditorEventType) => {
		if (e.keyboard.isPressingKey("Space")) {
			pixel.render.setSelectedCellsSize({ x: -1, y: -1 });
			pixel.render.setSelectedCellsPosition({ x: -1, y: -1 });
		}
	};

	const onWheel = (e: EditorEventType) => {
		const aspectRatio = viewport.width / viewport.height;
		const pan = pixel.render.getPan();
		const oldZoom = pixel.render.getZoom();
		const gridSize = pixel.projectConfig.getSize();
		const mouseX = e.mouse.position.x - viewport.left - viewport.width / 2;
		const mouseY = -(e.mouse.position.y - viewport.top - viewport.height / 2);
		const delta = normalizeWheelDelta(e.wheel);
		const zoomFactor = Math.exp(-delta * ZOOM_SENSITIVITY);
		const newZoom = oldZoom * zoomFactor;

		pixel.render.setZoom(newZoom);

		// Adjust pan so zoom centers on mouse
		const gridRatio = gridSize.x / gridSize.y;
		pixel.render.setPan({
			x: (pan.x - mouseX * aspectRatio) * zoomFactor + mouseX * aspectRatio,
			y: (pan.y - mouseY / gridRatio) * zoomFactor + mouseY / gridRatio,
		});
	};

	return {
		onMouseMove,
		onMouseDown,
		onMouseUp,
		onKeyDown,
		onKeyUp,
		onWheel,
	};
};
