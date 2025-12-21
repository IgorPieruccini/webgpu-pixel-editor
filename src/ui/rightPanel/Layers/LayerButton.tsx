import { createSortable, useDragDropContext } from "@thisbeyond/solid-dnd";
import type { Layer } from "../../../pixelPainter/types";
import { useProjectConfig } from "../../../projectConfig/projectConfigProvider";
import { DeleteLayerButton } from "./DeleteLayerButton";
import { LayerTitle } from "./LayerTitle";
import { DisplayLayerToggle } from "./DisplayLayerToggle";

type LayerButtonProps = {
  layer: Layer;
};

export const LayerButton = ({ layer }: LayerButtonProps) => {
  const sortable = createSortable(layer.id);
  const dropDownContext = useDragDropContext()!;
  const projectConfig = useProjectConfig();

  const state = dropDownContext[0];

  const onSelectLayer = (layerId: string) => {
    projectConfig.pixel().selectLayer(layerId);
  };

  return (
    <div
      use:sortable
      classList={{
        "opacity-50": sortable.isActiveDraggable,
        "transition-transform": !!state.active.draggable,
      }}
    >
      <button
        class={"layer-btn"}
        classList={{
          "active-layer": projectConfig.pixel().getActiveLayer() === layer.id,
        }}
        onClick={() => onSelectLayer(layer.id)}
      >
        <LayerTitle layerName={layer.name} />

        <div class="layer-opt-btn">
          <DisplayLayerToggle layer={layer} />
          <DeleteLayerButton layerId={layer.id} />
        </div>
      </button>
    </div>
  );
};
