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
					.map((color) => (
						<SquareButton
							onClick={() => onColorClick(color)}
							class={styles.colorButton}
							classList={{
								[styles.colorButtonActive]: isSameAsActiveColor(color),
							}}
						>
							<span style={{ "background-color": color }} />
						</SquareButton>
					))}
				<SquareButton onClick={onAddColor}>+</SquareButton>
			</div>
		</div>
	);
};
