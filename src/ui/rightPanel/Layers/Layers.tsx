import { useProjectConfig } from "../../../projectConfig/projectConfigProvider";

export const Layers = () => {
  const projectConfig = useProjectConfig();

  return (
    <div id="layers">
      {projectConfig
        .pixel()
        .getLayers()
        .map((layer) => {
          return (
            <div>
              <p>{layer.name}</p>
            </div>
          );
        })}
    </div>
  );
};
