import { RiArrowsExpandDiagonalSFill } from "solid-icons/ri";
import { createMemo } from "solid-js";
import { API } from "../../projectConfig/projectConfigProvider";
import { useMenu } from "../menuPanels/menuProvider";
import { RenamebleTitle } from "../shared/RenamebleTitle";
import { SquareButton } from "../shared/squareButton";
import { OPENED_OPTIONS } from "../topBar/constants";
import { LayerOpacity } from "./LayerOpacity/LayerOpacity";
import { Layers } from "./Layers/Layers";
import styles from "./RightPanel.module.css";

export const RightPanel = () => {
	const projectConfig = API.projectConfig();
	const menu = useMenu();

	const size = createMemo(() => {
		return projectConfig().getSize();
	});

	const openResizePanel = () => {
		menu.openOption(OPENED_OPTIONS.RESIZE);
	};

	const onTitleEdited = (title: string) => {
		projectConfig().setProjectName(title);
	};

	return (
		<div class={styles.rightPanel}>
			<div class={styles.projectTitle}>
				<RenamebleTitle
					title={projectConfig().getProjectName()}
					onEdited={onTitleEdited}
				/>
				<span class={styles.meta}>
					<span class={styles.resize}>
						{`${size().x} x ${size().y}`}
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
