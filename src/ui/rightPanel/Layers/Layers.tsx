import { useProjectConfig } from "../../../projectConfig/projectConfigProvider";
import { AiOutlinePlus } from "solid-icons/ai";
import "./Layer.css";
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
  const projectConfig = useProjectConfig();

  const onAddLayer = () => {
    projectConfig.pixel().addLayer();
  };

  const getLayerIds = () => {
    return projectConfig
      .pixel()
      .getLayers()
      .map((layer) => layer.id);
  };

  const onDragEnd = (event: DragEvent) => {
    if (event.droppable) {
      projectConfig
        .pixel()
        .sortLayers(event.draggable.id as string, event.droppable.id as string);
    }
  };

  return (
    <div id="layers">
      <DragDropProvider onDragEnd={onDragEnd} collisionDetector={closestCenter}>
        <DragDropSensors />
        <div id="layer-slider">
          <SortableProvider ids={getLayerIds()}>
            <For each={projectConfig.pixel().getLayers()}>
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
