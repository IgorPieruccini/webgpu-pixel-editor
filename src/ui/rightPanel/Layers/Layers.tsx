import { useProjectConfig } from "../../../projectConfig/projectConfigProvider";

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
              <p>{layer.name}</p>
            </button>
          );
        })}
    </div>
  );
};
