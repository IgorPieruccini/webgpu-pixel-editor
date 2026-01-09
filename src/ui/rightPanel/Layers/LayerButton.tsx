import { createSortable, useDragDropContext } from "@thisbeyond/solid-dnd";
import type { Layer } from "../../../pixelPainter/types";
import { DeleteLayerButton } from "./DeleteLayerButton";
import { LayerTitle } from "./LayerTitle";
import { DisplayLayerToggle } from "./DisplayLayerToggle";
import { DuplicateLayerButton } from "./DuplicateLayerButton";
import { API } from "../../../projectConfig/projectConfigProvider";

type LayerButtonProps = {
  layer: Layer;
};

export const LayerButton = ({ layer }: LayerButtonProps) => {
  const sortable = createSortable(layer.id);
  const dropDownContext = useDragDropContext()!;
  const layersAPI = API.layers();

  const state = dropDownContext[0];

  const onSelectLayer = (layerId: string) => {
    layersAPI().select(layerId);
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
          "active-layer": layersAPI().getActive().id === layer.id,
        }}
        onClick={() => onSelectLayer(layer.id)}
      >
        <LayerTitle layerName={layer.name} />

        <div class="layer-opt-btn">
          <DuplicateLayerButton />
          <DisplayLayerToggle layer={layer} />
          <DeleteLayerButton layerId={layer.id} />
        </div>
      </button>
    </div>
  );
};
