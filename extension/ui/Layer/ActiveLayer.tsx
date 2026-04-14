import { API } from "../../../src/lib";
import "@kittl/ui";

export const ActiveLayer = () => {
  API.layers();

  return (
    <div id="layer-info">
      <canvas id="preview-canvas" width={300} height={300} />
    </div>
  );
};
