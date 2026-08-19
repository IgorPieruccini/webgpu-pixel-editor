import { AiOutlineDownload } from "solid-icons/ai";
import { FiFilePlus } from "solid-icons/fi";
import type { Layer } from "../../../lib";
import { createTiledLayerBufferFromFlat } from "../../../pixelPainter/tiledLayer";
import { parseBlobToUint8Array } from "../../../pixelPainter/utils";
import {
	API,
	useProjectConfig,
} from "../../../projectConfig/projectConfigProvider";
import { serialization } from "../../../serialization";
import { generateUUID } from "../../../utils";
import styles from "./ProjectTool.module.css";

export const ProjectTool = () => {
	const project = useProjectConfig();
	const layerAPI = API.layers();
	const projectConfig = API.projectConfig();
	const colorPalette = API.colorPalette();

	const onDownloadProject = () => {
		const serializeProject = serialization.project.serialize(
			projectConfig().getId(),
			projectConfig().getProjectName(),
			projectConfig().getSize(),
			layerAPI().getList(),
			layerAPI().buffers,
			colorPalette().getColors(),
		);
		serialization.project.saveProject(serializeProject);
	};

	const importProject = () => {
		// Create a file input element
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".pxart";

		input.onchange = async (event) => {
			const file = (event.target as HTMLInputElement).files?.[0];
			if (!file) return;

			const loadedProject = await serialization.project.loadProject(file);

			project.createNewProject(loadedProject);
		};

		// Trigger the file dialog
		input.click();
	};

	const importImageAsProject = () => {
		// Create a file input element
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".png";

		input.onchange = async (event) => {
			const file = (event.target as HTMLInputElement).files?.[0];
			if (!file) return;
			const name = file.name;

			const { buffer, width, height } = await parseBlobToUint8Array(file);

			const layerId = generateUUID();
			const id = generateUUID();

			const layer: Layer = {
				id: layerId,
				name: "imported Image",
				display: true,
				opacity: 1,
				offset: { x: 0, y: 0 },
			};

			project.createNewProject({
				id,
				name,
				gridSize: { x: width, y: height },
				layers: [layer],
				buffers: {
					[layerId]: createTiledLayerBufferFromFlat(buffer, {
						x: width,
						y: height,
					}),
				},
			});
		};

		// Trigger the file dialog
		input.click();
	};

	return (
		<div class={`${styles.projectTool} ${styles.tool}`}>
			<h3>Project Tool</h3>
			<div class={styles.projectToolButtons}>
				<button onClick={onDownloadProject}>
					<AiOutlineDownload />
				</button>
				<button onClick={importProject}>
					<FiFilePlus />
				</button>
				<button onClick={importImageAsProject}>Import image as project</button>
			</div>
		</div>
	);
};
