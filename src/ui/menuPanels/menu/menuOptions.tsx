import { useProjectConfig } from "../../../projectConfig/projectConfigProvider";
import {
	createProjectFromImage,
	loadProject,
	saveProject,
} from "../../../projectConfig/projectUtils";
import { OPENED_OPTIONS } from "../../topBar/constants";
import { useMenu } from "../menuProvider";
import styles from "./MenuOptions.module.css";

export const MenuOptions = () => {
	const menu = useMenu();

	const project = useProjectConfig();

	const onSaveProject = () => {
		saveProject(project);
	};

	const onLoadProject = () => {
		loadProject(project);
	};

	const onCreatingProjectFromImage = () => {
		createProjectFromImage(project);
	};

	return (
		<div class={styles.menuOptions}>
			<button
				onClick={() => {
					menu.openOption(OPENED_OPTIONS.NEW_PROJECT);
				}}
			>
				New project
			</button>
			<button onClick={() => menu.openOption(OPENED_OPTIONS.MY_PROJECTS)}>
				My projects
			</button>
			<button onClick={onLoadProject}>Load Project from file</button>
			<button onClick={onSaveProject}>Save Project Locally</button>
			<button onClick={onCreatingProjectFromImage}>
				Create Project from Image
			</button>
		</div>
	);
};
