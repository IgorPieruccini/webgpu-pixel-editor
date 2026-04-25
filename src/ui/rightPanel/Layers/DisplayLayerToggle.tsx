import { BiRegularShow, BiRegularHide } from "solid-icons/bi";
import type { Layer } from "../../../pixelPainter/types";
import { API } from "../../../projectConfig/projectConfigProvider";

type DisplayLayerToggleProps = {
  layer: Layer;
};

export const DisplayLayerToggle = ({ layer }: DisplayLayerToggleProps) => {
  const layersAPI = API.layers();

  const onToggleDisplay = (e: MouseEvent) => {
    e.stopPropagation();
    layersAPI().toggleDisplay(layer.id);
  };

  return (
    <button class="layer-btn-icon" onClick={onToggleDisplay}>
      {layer.display ? (
        <BiRegularShow size={16} />
      ) : (
        <BiRegularHide size={16} />
      )}
    </button>
  );
};
