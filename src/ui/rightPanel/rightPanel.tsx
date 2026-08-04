import { RiArrowsExpandDiagonalSFill } from "solid-icons/ri";
import { useProjectConfig } from "../../projectConfig/projectConfigProvider";
import { useMenu } from "../menuPanels/menuProvider";
import { SquareButton } from "../shared/squareButton";
import { OPENED_OPTIONS } from "../topBar/constants";
import { LayerOpacity } from "./LayerOpacity/LayerOpacity";
import { Layers } from "./Layers/Layers";
import styles from "./RightPanel.module.css";

export const RightPanel = () => {
	const projectConfig = useProjectConfig();
	const menu = useMenu();

	if (!projectConfig.projectName()) {
		return null;
	}

	const openResizePanel = () => {
		console.log("jey");
		menu.openOption(OPENED_OPTIONS.RESIZE);
	};

	return (
		<div class={styles.rightPanel}>
			<div class={styles.projectTitle}>
				<span>{projectConfig.projectName()}</span>
				<span class={styles.meta}>
					<span class={styles.resize}>
						{`${projectConfig.getProjectGridSize().x} x ${projectConfig.getProjectGridSize().y}`}
						<SquareButton size="sm" onClick={openResizePanel}>
							<RiArrowsExpandDiagonalSFill />
						</SquareButton>
					</span>
				</span>
			</div>
			<hr />
			<Layers />
			<hr />
			<div class={styles.layerPreview}>
				<p>Layer preview</p>
				<canvas
					id={"preview-canvas"}
					class={styles.previewCanvas}
					width={250}
					height={250}
				/>
			</div>
			<hr />
			<LayerOpacity />
		</div>
	);
};
