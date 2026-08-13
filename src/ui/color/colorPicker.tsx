import { type ColorResult, SketchPicker } from "solid-color";
import { createMemo } from "solid-js";
import { createColor } from "../../pixelPainter/colors/colors";
import { API } from "../../projectConfig/projectConfigProvider";
import styles from "./ColorPicker.module.css";

export const ColorPicker = () => {
	const brush = API.brush();
	const onChange = (color: ColorResult) => {
		const rgba = {
			...color.rgb,
			a: color.rgb.a ? color.rgb.a * 255 : 255,
		};
		brush().setColor(rgba);
	};

	const selectedColor = createMemo(() => {
		const color = brush().getSelectedColor();
		const colorCreator = createColor(color);
		const rgba = colorCreator.getARGB();
		return {
			r: rgba.r,
			g: rgba.g,
			b: rgba.b,
			a: rgba.a / 255,
		};
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
