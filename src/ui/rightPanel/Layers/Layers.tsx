import { API } from "../../../projectConfig/projectConfigProvider";
import { AiOutlinePlus } from "solid-icons/ai";
import styles from "./Layers.module.css";
import { For } from "solid-js";
import { LayerButton } from "./LayerButton";
import {
  closestCenter,
  DragDropProvider,
  DragDropSensors,
  SortableProvider,
  type DragEvent,
} from "@thisbeyond/solid-dnd";

export const Layers = () => {
  const layersAPI = API.layers();

  const onAddLayer = () => {
    layersAPI().add();
  };

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
    <div class={styles.layers}>
      <DragDropProvider onDragEnd={onDragEnd} collisionDetector={closestCenter}>
        <DragDropSensors />
        <div class={styles.layerSlider}>
          <SortableProvider ids={getLayerIds()}>
            <For each={layersAPI().getList()}>
              {(layer) => <LayerButton layer={layer}></LayerButton>}
            </For>
          </SortableProvider>
        </div>
      </DragDropProvider>
      <button onClick={onAddLayer}>
        <AiOutlinePlus />
      </button>
    </div>
  );
};
