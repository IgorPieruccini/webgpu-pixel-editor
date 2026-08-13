import { createMemo } from "solid-js";
import { API } from "../../../projectConfig/projectConfigProvider";
import { Slider } from "../../shared/slider";

export const BrushOpacitySlider = () => {
	const brush = API.brush();

	const onBrushChangeOpacity = (e: InputEvent) => {
		if (e.target) {
			// @ts-expect-error - Figure out the correct type
			const alpha = Math.round((e.target.valueAsNumber / 100) * 255);
			brush().setOpacity(alpha);
		}
	};

	const alphaValue = createMemo(() => {
		const opacity = brush().getOpacity();
		return Math.round((opacity / 255) * 100);
	});

	return (
		<Slider
			key="brush-opacity"
			label="Opacity"
			min={0}
			max={100}
			value={alphaValue()}
			valueText={`${alphaValue()}%`}
			onChange={onBrushChangeOpacity}
		/>
	);
};
