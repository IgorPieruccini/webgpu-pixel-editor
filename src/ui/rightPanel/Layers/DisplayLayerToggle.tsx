import { BiRegularShow, BiRegularHide } from "solid-icons/bi";
import type { Layer } from "../../../pixelPainter/types";
import { useProjectConfig } from "../../../projectConfig/projectConfigProvider";

type DisplayLayerToggleProps = {
  layer: Layer;
};

export const DisplayLayerToggle = ({ layer }: DisplayLayerToggleProps) => {
  const projectConfig = useProjectConfig();

  const onToggleDisplay = (e: MouseEvent) => {
    e.preventDefault();
    projectConfig.pixel().layer.toggleDisplay(layer.id);
  };

  return (
    <button class="layer-display-toggle" onClick={onToggleDisplay}>
      {layer.display ? (
        <BiRegularShow size={16} />
      ) : (
        <BiRegularHide size={16} />
      )}
    </button>
  );
};
