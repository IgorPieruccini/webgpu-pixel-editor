import { HiSolidXMark } from "solid-icons/hi";
import { createSignal } from "solid-js";
import { API } from "../../projectConfig/projectConfigProvider";
import { useMenu } from "../menuPanels/menuProvider";
import { SquareButton } from "../shared/squareButton";
import styles from "./ResizePanel.module.css";

export const ResizePanel = () => {
	const menu = useMenu();
	const projectConfig = API.projectConfig();
	const gridSize = projectConfig().getSize();
	const [getWidth, setWidth] = createSignal(gridSize.x);
	const [getHeight, setHeight] = createSignal(gridSize.y);

	const closePanel = () => {
		projectConfig().setSize({ x: getWidth(), y: getHeight() });
		menu.openOption(-1);
	};

	return (
		<div class={styles.panel}>
			<div class={styles.topSection}>
				<span class={styles.panelTitle}>Resize</span>
				<SquareButton
					type="button"
					size="sm"
					aria-label="Close resize panel"
					onClick={closePanel}
				>
					<HiSolidXMark />
				</SquareButton>
			</div>
			<div class={styles.sizeFields}>
				<label>
					Width
					<input
						id="resize-width-input"
						type="number"
						min="1"
						value={getWidth()}
						onInput={(event) => setWidth(event.currentTarget.valueAsNumber)}
					/>
				</label>
				<label>
					Height
					<input
						id="resize-height-input"
						type="number"
						min="1"
						value={getHeight()}
						onInput={(event) => setHeight(event.currentTarget.valueAsNumber)}
					/>
				</label>
			</div>
			<button type="button" onClick={closePanel}>
				done
			</button>
		</div>
	);
};
