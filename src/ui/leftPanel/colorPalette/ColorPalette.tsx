import { SquareButton } from "../../shared/squareButton";
import styles from "./colorPalette.module.css";

type ColorButtonType = {
	color: string;
};

const ColorButton = ({ color }: ColorButtonType) => {
	return (
		<SquareButton class={styles.colorButton}>
			<span style={{ "background-color": color }} />
		</SquareButton>
	);
};

export const ColorPalette = () => {
	const colors = ["#D17428", "#A0A9B9", "#895FCE"];

	return (
		<div class={styles.colorPalette}>
			<p>Color Palette</p>
			<div class={styles.colorPaletteContainer}>
				{colors.map((color) => (
					<ColorButton color={color} />
				))}
			</div>
		</div>
	);
};
