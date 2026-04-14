import { API } from "../../../src/lib";
import {
  closestCenter,
  DragDropProvider,
  DragDropSensors,
  SortableProvider,
  type DragEvent,
} from "@thisbeyond/solid-dnd";
import { For } from "solid-js";
import { LayerButton } from "./LayerButton";
import "./layer.css";

export const Layers = () => {
  const layersAPI = API.layers();

  // const onAddLayer = () => {
  //   layersAPI().add();
  // };

  const getLayerIds = () => {
    return layersAPI()
      .getList()
      .map((layer) => layer.id);
  };

  const onDragEnd = (event: DragEvent) => {
    if (event.droppable) {
      layersAPI().sort(
        event.draggable.id as string,
        event.droppable.id as string,
      );
    }
  };

  return (
    <div id="layers">
      <DragDropProvider onDragEnd={onDragEnd} collisionDetector={closestCenter}>
        <DragDropSensors />
        <div id="layer-slider">
          <SortableProvider ids={getLayerIds()}>
            <For each={layersAPI().getList()}>
              {(layer) => <LayerButton layer={layer}></LayerButton>}
            </For>
          </SortableProvider>
        </div>
      </DragDropProvider>
    </div>
  );
};
