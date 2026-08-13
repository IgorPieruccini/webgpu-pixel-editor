import {
	closestCenter,
	createSortable,
	DragDropProvider,
	DragDropSensors,
	type DragEvent,
	SortableProvider,
	useDragDropContext,
} from "@thisbeyond/solid-dnd";
import { AiOutlineDelete, AiOutlinePlus } from "solid-icons/ai";
import { createMemo, For } from "solid-js";
import { API } from "../../../lib";
import { createColor } from "../../../pixelPainter/colors/colors";
import { SquareButton } from "../../shared/squareButton";
import styles from "./colorPalette.module.css";

const Color = ({ color }: { color: string }) => {
	const sortable = createSortable(color);
	const dropDownContext = useDragDropContext()!;
	const state = dropDownContext[0];

	const brush = API.brush();
	const colorPalette = API.colorPalette();

	const onRemoveColor = () => {
		colorPalette().removeColor(color);
	};

	const onColorClick = () => {
		brush().setColor(color);
	};

	const isActive = createMemo(() => {
		const selectedColor = brush().getSelectedColor();
		const colorCreator = createColor(selectedColor);
		return colorCreator.getHex() === color.toUpperCase();
	});

	return (
		<div
			use:sortable
			classList={{
				[styles.dragging]: sortable.isActiveDraggable,
				"transition-transform": !!state.active.draggable,
			}}
		>
			<SquareButton
				onClick={isActive() ? onRemoveColor : onColorClick}
				class={styles.colorButton}
				classList={{
					[styles.colorButtonActive]: isActive(),
				}}
			>
				<span style={{ "background-color": color }}>
					{isActive() ? <AiOutlineDelete /> : null}
				</span>
			</SquareButton>
		</div>
	);
};

export const ColorPalette = () => {
	const colorPalette = API.colorPalette();
	const brush = API.brush();

	const onAddColor = () => {
		const color = brush().getSelectedColor();
		const colorCreator = createColor(color);
		colorPalette().addColor(colorCreator.getHex());
	};

	const onDragEnd = (event: DragEvent) => {
		if (event.droppable) {
			colorPalette().sortColorPalette(
				event.draggable.id as string,
				event.droppable.id as string,
			);
		}
	};

	const colors = createMemo(() => colorPalette().getColorPalette());

	return (
		<div class={styles.colorPalette}>
			<p>Color Palette</p>
			<DragDropProvider onDragEnd={onDragEnd} collisionDetector={closestCenter}>
				<DragDropSensors />
				<div class={styles.colorPaletteContainer}>
					<SortableProvider ids={colors()}>
						<For each={colors()}>
							{(color) => <Color color={color}></Color>}
						</For>
					</SortableProvider>
					<SquareButton onClick={onAddColor}>
						<AiOutlinePlus />
					</SquareButton>
				</div>
			</DragDropProvider>
		</div>
	);
};
