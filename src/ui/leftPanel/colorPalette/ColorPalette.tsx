import { AiOutlineDelete, AiOutlinePlus } from "solid-icons/ai";

import { API } from "../../../lib";
import { hexToNumber, numberToHex } from "../../../pixelPainter/utils";
import { SquareButton } from "../../shared/squareButton";
import styles from "./colorPalette.module.css";

export const ColorPalette = () => {
	const colorPalette = API.colorPalette();
	const brush = API.brush();

	const onAddColor = () => {
		const color = brush().getSelectedColor();
		colorPalette().addColor(numberToHex(color));
	};

	const onRemoveColor = (color: string) => {
		colorPalette().removeColor(color);
	};

	const onColorClick = (color: string) => {
		brush().setColor(hexToNumber(color));
	};

	const isSameAsActiveColor = (color: string) => {
		const selectedColor = brush().getSelectedColor();
		return selectedColor === hexToNumber(color);
	};

	return (
		<div class={styles.colorPalette}>
			<p>Color Palette</p>
			<div class={styles.colorPaletteContainer}>
				{colorPalette()
					.getColorPalette()
					.map((color) => {
						const isActive = isSameAsActiveColor(color);
						return (
							<SquareButton
								onClick={() =>
									isActive ? onRemoveColor(color) : onColorClick(color)
								}
								class={styles.colorButton}
								classList={{
									[styles.colorButtonActive]: isActive,
								}}
							>
								<span style={{ "background-color": color }}>
									{isActive ? <AiOutlineDelete /> : null}
								</span>
							</SquareButton>
						);
					})}
				<SquareButton onClick={onAddColor}>
					<AiOutlinePlus />
				</SquareButton>
			</div>
		</div>
	);
};
