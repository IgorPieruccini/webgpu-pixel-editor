import { AiOutlineExport } from "solid-icons/ai";
import { FiMenu } from "solid-icons/fi";
import { useEditor } from "../../../editor/editortContext";
import { MenuOptions } from "../../menuPanels/menu/menuOptions";
import { useMenu } from "../../menuPanels/menuProvider";
import { AnchoredPopover } from "../../shared/anchoredPopover";
import { SquareButton } from "../../shared/squareButton";
import { OPENED_OPTIONS } from "../constants";
import { BrushOpacitySlider } from "./BrushOpacitySlider";
import { BrushThicknessSlider } from "./BrushThicknessSlider";
import styles from "./ToolSettings.module.css";
import { TOP_BAR_CONFIG } from "./topBarConfig";

export const ToolSettings = () => {
	const project = useEditor();
	const menu = useMenu();

	const showThickness = (): boolean => {
		const activeTool = project?.().getActiveTool();

		return (
			typeof TOP_BAR_CONFIG.thickness.find((tool) => activeTool === tool) ===
			"number"
		);
	};

	const showOpacity = (): boolean => {
		const activeTool = project().getActiveTool();
		return (
			typeof TOP_BAR_CONFIG.opacity.find((tool) => activeTool === tool) ===
			"number"
		);
	};

	const onExport = () => {
		menu.openOption(OPENED_OPTIONS.EXPORT_PNG);
	};

	return (
		<div class={styles.toolSettings}>
			<div class={styles.menuSection}>
				<AnchoredPopover
					side="bottom"
					trigger={({ toggle }) => (
						<SquareButton size="sm" onClick={toggle}>
							<FiMenu />
						</SquareButton>
					)}
				>
					<MenuOptions />
				</AnchoredPopover>
			</div>

			{showThickness() && (
				<>
					<div class="separator separator-vertical" aria-hidden="true" />
					<BrushThicknessSlider />
				</>
			)}

			{showOpacity() && (
				<>
					<div class="separator separator-vertical" aria-hidden="true" />
					<BrushOpacitySlider />
				</>
			)}

			<div class="separator separator-vertical" aria-hidden="true" />
			<div class={styles.generalSection}>
				<SquareButton onClick={onExport} size="sm">
					<AiOutlineExport />
				</SquareButton>
			</div>
		</div>
	);
};
