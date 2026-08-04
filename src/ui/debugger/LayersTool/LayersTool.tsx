import { AiOutlineDownload, AiOutlinePlus } from "solid-icons/ai";
import { FiFilePlus } from "solid-icons/fi";
import { API } from "../../../projectConfig/projectConfigProvider";
import { serialization } from "../../../serialization";
import { downloadFile, importFile } from "../../../utils";
import styles from "./LayersTool.module.css";

export const LayersTool = () => {
	const layers = API.layers();
	const projectConfig = API.projectConfig();

	const onDownload = (layerId: string) => {
		const buffer = layers().getBufferById(layerId);
		if (!buffer) return;
		const serializedLayerBuffer = serialization.layer.serialize(buffer);

		const name =
			layers()
				.getList()
				.find((layer) => layer.id === layerId)?.name || "layer";

		downloadFile(serializedLayerBuffer, name, "px");
	};

	const onImportFile = (layerId: string) => {
		importFile((content: string) => {
			const buffer = serialization.layer.deserialize(
				content,
				projectConfig().getSize(),
			);
			layers().setLayerBuffer(layerId, buffer);
		});
	};

	return (
		<div class={`${styles.layersTool} ${styles.tool}`}>
			<div class={styles.header}>
				<h3>Layers tool</h3>
				<button>
					<AiOutlinePlus />
				</button>
			</div>
			<div class={styles.list}>
				{layers()
					.getList()
					.map((layer) => {
						return (
							<div class={styles.layerNode}>
								<span>{layer.name}</span>
								<div class={styles.layerNode}>
									<button onClick={() => onDownload(layer.id)}>
										<AiOutlineDownload />
									</button>

									<button onClick={() => onImportFile(layer.id)}>
										<FiFilePlus />
									</button>
								</div>
							</div>
						);
					})}
			</div>
		</div>
	);
};
