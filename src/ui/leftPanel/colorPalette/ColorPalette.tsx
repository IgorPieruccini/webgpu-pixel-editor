import {
	closestCenter,
	DragDropProvider,
	DragDropSensors,
	type DragEvent,
	SortableProvider,
} from "@thisbeyond/solid-dnd";
import { AiOutlineDelete, AiOutlinePlus } from "solid-icons/ai";
import { createMemo, For } from "solid-js";
import { API } from "../../../lib";
import { hexToNumber, numberToHex } from "../../../pixelPainter/utils";
import { SquareButton } from "../../shared/squareButton";
import styles from "./colorPalette.module.css";

const Color = ({ color }: { color: string }) => {
	const brush = API.brush();
	const colorPalette = API.colorPalette();

	const onRemoveColor = () => {
		colorPalette().removeColor(color);
	};

	const onColorClick = () => {
		brush().setColor(hexToNumber(color));
	};

	const isActive = createMemo(() => {
		const selectedColor = brush().getSelectedColor();
		return selectedColor === hexToNumber(color);
	});

	return (
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
	);
};

export const ColorPalette = () => {
	const colorPalette = API.colorPalette();
	const brush = API.brush();

	const onAddColor = () => {
		const color = brush().getSelectedColor();
		colorPalette().addColor(numberToHex(color));
	};

	const onDragEnd = (event: DragEvent) => {
		if (event.droppable) {
			console.log(event);
		}
	};

	const colors = createMemo(() => colorPalette().getColorPalette());

	return (
		<div class={styles.colorPalette}>
			<p>Color Palette</p>
			<div class={styles.colorPaletteContainer}>
				<DragDropProvider
					onDragEnd={onDragEnd}
					collisionDetector={closestCenter}
				>
					<DragDropSensors />
					<SortableProvider ids={colors()}>
						<For each={colors()}>
							{(color) => <Color color={color}></Color>}
						</For>
					</SortableProvider>
				</DragDropProvider>

				<SquareButton onClick={onAddColor}>
					<AiOutlinePlus />
				</SquareButton>
			</div>
		</div>
	);
};
