import { API } from "../../../projectConfig/projectConfigProvider";
import styles from "./ProjectTool.module.css";

export const ProjectTool = () => {
	const projectConfig = API.projectConfig();

	return (
		<div class={`${styles.projectTool} ${styles.tool}`}>
			<h3>Project Tool</h3>
			<div class={styles.projectToolButtons}>
				<span>
					<strong>Project ID:</strong>
					{projectConfig().getId()}
				</span>
			</div>
		</div>
	);
};
