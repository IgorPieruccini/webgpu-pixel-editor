import { createSignal } from "solid-js";
import styles from "./DevTool.module.css";
import { LayersTool } from "./LayersTool/LayersTool";
import { ProjectTool } from "./LayersTool/ProjectTool";

export const DevTool = () => {
	const [getShow, setShow] = createSignal(false);

	return (
		<div
			class={styles.devTool}
			classList={{
				[styles.show]: getShow(),
				[styles.hide]: !getShow(),
			}}
		>
			{getShow() && (
				<>
					<div class={styles.header}>
						<span>Dev tools</span>
						<button onClick={() => setShow(false)}>close</button>
					</div>
					<div class={styles.content}>
						<ProjectTool />
						<LayersTool />
					</div>
				</>
			)}

			{!getShow() && (
				<>
					<button onClick={() => setShow(true)}>Dev Tools</button>
				</>
			)}
		</div>
	);
};
