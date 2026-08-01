import { type ColorResult, SketchPicker } from "solid-color";
import { createMemo } from "solid-js";
import { numberToRGBA } from "../../pixelPainter/utils";
import { API } from "../../projectConfig/projectConfigProvider";
import styles from "./ColorPicker.module.css";

export const ColorPicker = () => {
	const brush = API.brush();
	const onChange = (color: ColorResult) => {
		brush().setColor(color.hex);
	};

	const selectedColor = createMemo(() => {
		const color = brush().getSelectedColor();
		const rgba = numberToRGBA(color);
		return rgba;
	});

	return (
		<div class={`${styles.container} tool-input`}>
			<SketchPicker
				defaultColor={"#000000"}
				color={selectedColor()}
				presetColors={[]}
				onChange={onChange}
			/>
		</div>
	);
};
