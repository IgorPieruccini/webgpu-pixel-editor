import { createSortable, useDragDropContext } from "@thisbeyond/solid-dnd";
import type { Layer } from "../../../src/pixelPainter/types";
import { API } from "../../../src/projectConfig/projectConfigProvider";
import { LayerTitle } from "./LayerTitle";
import "@kittl/ui/Icons/eyeOpened";
import "@kittl/ui/Icons/trash";
import "@kittl/ui/Icons/duplicate";

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

  const onDuplicate = (e: MouseEvent) => {
    e.stopPropagation();
    layersAPI().duplicate(layer.id);
  };

  const onToggleDisplay = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    layersAPI().toggleDisplay(layer.id);
  };

  const onDelete = (e: MouseEvent) => {
    e.stopPropagation();
    layersAPI().remove(layer.id);
  };

  return (
    <div
      use:sortable
      classList={{
        "opacity-50": sortable.isActiveDraggable,
        "transition-transform": !!state.active.draggable,
      }}
    >
      <kittl-button
        class={"layer-btn"}
        classList={{
          "active-layer": layersAPI().getActive().id === layer.id,
        }}
        onClick={() => onSelectLayer(layer.id)}
      >
        <LayerTitle layerName={layer.name} />

        <div class="layer-opt-btn">
          <kittl-button
            class="icon-button"
            variant="ghost"
            size="xs"
            onClick={onDuplicate}
          >
            <kittl-icon-duplicate class="icon" />
          </kittl-button>
          <kittl-button
            class="icon-button"
            variant="ghost"
            size="xs"
            onClick={onToggleDisplay}
          >
            {layer.display ? (
              <kittl-icon-eye-opened class="icon" />
            ) : (
              <kittl-icon-eye-closed class="icon" />
            )}
          </kittl-button>
          <kittl-button
            class="icon-button"
            variant="ghost"
            size="xs"
            onClick={onDelete}
          >
            <kittl-icon-trash class="icon" />
          </kittl-button>
        </div>
      </kittl-button>
    </div>
  );
};
