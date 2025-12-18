import { useProjectConfig } from "../../../projectConfig/projectConfigProvider";
import { LayerTitle } from "./LayerTitle";

export const Layers = () => {
  const projectConfig = useProjectConfig();

  const onSelectLayer = (layerId: string) => {
    projectConfig.pixel().selectLayer(layerId);
  };

  return (
    <div id="layers">
      {projectConfig
        .pixel()
        .getLayers()
        .map((layer) => {
          return (
            <button
              class={
                projectConfig.pixel().getActiveLayer() === layer.id
                  ? "active-layer"
                  : ""
              }
              onClick={() => onSelectLayer(layer.id)}
            >
              <LayerTitle layerName={layer.name} />
            </button>
          );
        })}
    </div>
  );
};
