import { AiOutlineDownload, AiOutlinePlus } from "solid-icons/ai";
import {
  API,
  useProjectConfig,
} from "../../../projectConfig/projectConfigProvider";
import { serialization } from "../../../serialization";
import "./LayersTool.css";
import { FiFilePlus } from 'solid-icons/fi'
import { downloadFile, importFile } from "../../../utils";

export const LayersTool = () => {
  const layers = API.layers();
  const project = useProjectConfig();

  const onDownload = (layerId: string) => {
    const buffer = layers().getBufferById(layerId);
    if (!buffer) return;
    const serializedLayerBuffer = serialization.layer.serialize(
      buffer,
      project.getProjectGridSize(),
    );

    const name =
      layers()
        .getList()
        .find((layer) => layer.id === layerId)?.name || "layer";

    downloadFile(serializedLayerBuffer, name, "px");
  };

  const onImportFile = (layerId: string) => {
    importFile((content: string) => {
      const layerData: number[] = JSON.parse(content);
      const buffer = serialization.layer.deserialize(layerData);
      layers().setLayerBuffer(layerId, buffer);
    });
  };

  return (
    <div id="layers-tool" class="tool">
      <div id="layer-tool-title">
        <h3>Layers tool</h3>
        <button>
          <AiOutlinePlus />
        </button>
      </div>
      <div class="list">
        {layers()
          .getList()
          .map((layer) => {
            return (
              <div class="layer-node">
                <span>{layer.name}</span>
                <div class="layer-node">
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
