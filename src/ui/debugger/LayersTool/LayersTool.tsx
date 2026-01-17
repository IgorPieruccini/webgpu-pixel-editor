import { API } from "../../../projectConfig/projectConfigProvider";
import "./LayersTool.css";

export const LayersTool = () => {
  const layers = API.layers();

  return (
    <div id="layers-tool">
      <h3>Layers tool</h3>
      <div class="list">
        {layers()
          .getList()
          .map((layer) => {
            return (
              <div class="layer-node">
                <span>{layer.name}</span>
                <div class="layer-node">
                  <button>download</button>
                  <button>upload</button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
