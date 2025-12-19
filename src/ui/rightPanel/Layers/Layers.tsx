import { useProjectConfig } from "../../../projectConfig/projectConfigProvider";
import { DeleteLayerButton } from "./DeleteLayerButton";
import { LayerTitle } from "./LayerTitle";
import { AiOutlinePlus } from "solid-icons/ai";
import "./Layer.css";

export const Layers = () => {
  const projectConfig = useProjectConfig();

  const onSelectLayer = (layerId: string) => {
    projectConfig.pixel().selectLayer(layerId);
  };

  const onAddLayer = () => {
    projectConfig.pixel().addLayer();
  };

  return (
    <div id="layers">
      {projectConfig
        .pixel()
        .getLayers()
        .map((layer) => {
          return (
            <button
              class={`layer-btn ${
                projectConfig.pixel().getActiveLayer() === layer.id
                  ? "active-layer"
                  : ""
              }`}
              onClick={() => onSelectLayer(layer.id)}
            >
              <LayerTitle layerName={layer.name} />
              <DeleteLayerButton layerId={layer.id} />
            </button>
          );
        })}
      <button onClick={onAddLayer}>
        <AiOutlinePlus />
      </button>
    </div>
  );
};
