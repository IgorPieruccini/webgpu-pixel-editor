import { API } from "../../../projectConfig/projectConfigProvider";
import { Slider } from "../../shared/slider";

export const LayerOpacity = () => {
	const layersAPI = API.layers();

	const onChangeOpacity = (e: InputEvent) => {
		if (e.target) {
			const activeLayerId = layersAPI().getActive().id;

			//@ts-expect-error - fix input type
			layersAPI().setOpacity(activeLayerId, e.target.valueAsNumber / 100 ?? 1);
		}
	};

	const onFinishChange = (e: Event) => {
		if (e.target) {
			const activeLayerId = layersAPI().getActive().id;
			layersAPI().setOpacity(
				activeLayerId,
				//@ts-expect-error - fix input type
				e.target.valueAsNumber / 100 ?? 1,
				true,
			);
		}
	};

	return (
		<Slider
			key="layer-opacity"
			label="Layer Opacity"
			onChange={onChangeOpacity}
			onFinish={onFinishChange}
			value={layersAPI().getActive().opacity * 100}
		/>
	);
};
