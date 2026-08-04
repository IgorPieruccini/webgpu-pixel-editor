import { ResizePanel } from "../../rightPanel/resizePanel";
import { OPENED_OPTIONS } from "../../topBar/constants";
import { useMenu } from "../menuProvider";
import { ExportImagePanel } from "./exportImagePanel";
import styles from "./MenuPanels.module.css";
import { MyProjects } from "./myProjectsPanel";
import { NewProjectPanel } from "./newProjectPanel";

export const MenuPanels = () => {
	const menu = useMenu();

	return (
		<>
			{menu.openedOption() === -1 ? null : (
				<div class={styles.menuPanels}>
					{menu.openedOption() === OPENED_OPTIONS.NEW_PROJECT && (
						<NewProjectPanel />
					)}
					{menu.openedOption() === OPENED_OPTIONS.MY_PROJECTS && <MyProjects />}
					{menu.openedOption() === OPENED_OPTIONS.EXPORT_PNG && (
						<ExportImagePanel />
					)}
					{menu.openedOption() === OPENED_OPTIONS.RESIZE && <ResizePanel />}
				</div>
			)}
		</>
	);
};
