import { createSignal } from "solid-js";
import type { Layer, Layers } from "../types";
import { generateUUID } from "../../utils";
import { localDataBase } from "../../storage";
import type { Vec2 } from "../../editor/types";
import { serialization } from "../../serialization";

export type LayerHandler = Awaited<ReturnType<typeof createLayerHandler>>;

export const createLayerHandler = async (
  projectName: string,
  gridSize: Vec2,
) => {
  let stringLayers = window.localStorage.getItem(`${projectName}-layers`);
  if (!stringLayers) {
    const layer: Layers = [
      { id: generateUUID(), name: "Layer", display: true, opacity: 1 },
    ];
    stringLayers = JSON.stringify(layer);
    window.localStorage.setItem(`${projectName}-layers`, stringLayers);
  }

  const [getList, setList] = createSignal<Layers>(JSON.parse(stringLayers));

  const firstLayer = getList().at(0);
  if (!firstLayer) {
    throw new Error(
      "Pixel Painter must be initialized at least with one layer",
    );
  }

  const [getActive, setActive] = createSignal<Layer>(firstLayer);

  const buffers: Map<string, Uint32Array<ArrayBuffer>> = new Map();
  const db = await localDataBase(projectName);

  for (const layer of getList()) {
    try {
      const layerBuffer = await db.load(layer.id);
      if (layerBuffer) {
        buffers.set(layer.id, layerBuffer);
      } else {
        buffers.set(layer.id, new Uint32Array(gridSize.x * gridSize.y));
      }
    } catch {
      buffers.set(layer.id, new Uint32Array(gridSize.x * gridSize.y));
    }
  }

  const firstBuffer = buffers.get(firstLayer.id);
  if (!firstBuffer) {
    throw new Error(
      "Something went wrong accessing the buffer from first layer",
    );
  }

  const [getCurrentBuffer, setCurrentBuffer] =
    createSignal<Uint32Array<ArrayBuffer>>(firstBuffer);

  const add = () => {
    const layers = getList();

    const layer: Layer = {
      id: generateUUID(),
      name: `Layer`,
      display: true,
      opacity: 1,
    };

    const _layers: Layers = [...layers, layer];
    setList(_layers);

    window.localStorage.setItem(
      `${projectName}-layers`,
      JSON.stringify(_layers),
    );

    setActive(layer);

    const newBuffer = new Uint32Array(gridSize.x * gridSize.y);

    buffers.set(layer.id, newBuffer);
    setCurrentBuffer(newBuffer);
  };

  const remove = (id: string) => {
    const _layers = [...getList()];

    if (_layers.length === 1) {
      // At least one layer per project needs to exist
      return;
    }

    const index = _layers.findIndex((layer) => layer.id === id);
    const newActiveLayerIndex = index >= 1 ? index - 1 : index + 1;
    const newActiveLayer = _layers[newActiveLayerIndex];

    // re-assign current layer id
    if (getActive().id === id) {
      setActive(newActiveLayer);
      const newBuffer = buffers.get(newActiveLayer.id);
      if (!newBuffer) {
        throw new Error(
          `layer buffer with id ${newActiveLayer} could not be found`,
        );
      }
      setCurrentBuffer(newBuffer);
    }

    _layers.splice(index, 1);
    setList(_layers);
    buffers.delete(id);

    window.localStorage.setItem(
      `${projectName}-layers`,
      JSON.stringify(_layers),
    );
  };

  const sort = (dragged: string, dropped: string) => {
    const _layers = [...getList()];

    let draggedIndex = 0;
    let droppedIndex = 0;

    for (let i = 0; i < _layers.length; i++) {
      const layer = _layers[i];
      if (layer.id === dragged) {
        draggedIndex = i;
      }
      if (layer.id == dropped) {
        droppedIndex = i;
      }
    }

    const draggedLayer = _layers.splice(draggedIndex, 1);

    const first = _layers.slice(0, droppedIndex);
    const second = _layers.slice(droppedIndex, _layers.length);
    const newLayers = [...first, ...draggedLayer, ...second];

    setList(newLayers);

    window.localStorage.setItem(
      `${projectName}-layers`,
      JSON.stringify(newLayers),
    );
  };

  const rename = (name: string) => {
    const _layers = getList().map((layer: Layer) => {
      if (layer.id === getActive().id) {
        return {
          ...layer,
          name,
        };
      }

      return layer;
    });

    window.localStorage.setItem(
      `${projectName}-layers`,
      JSON.stringify(_layers),
    );

    setList(_layers);
  };

  const toggleDisplay = (id: string) => {
    const _layers = [...getList()];

    const newLayers = _layers.map((layer) => {
      if (layer.id === id) {
        return {
          ...layer,
          display: !layer.display,
        };
      }
      return layer;
    });

    setList(newLayers);

    window.localStorage.setItem(
      `${projectName}-layers`,
      JSON.stringify(newLayers),
    );
  };

  const select = (layerId: string) => {
    const layer = getList().find((layer) => layer.id === layerId);
    if (!layer) {
      throw new Error(`Could not find current layer bt id ${layerId}`);
    }

    setActive(layer);

    const buffer = buffers.get(layerId);
    if (!buffer) {
      throw new Error(`Could not find buffer corresponded to id: ${layerId}`);
    }

    setCurrentBuffer(buffer);
  };

  const setOpacity = (layerId: string, opacity: number) => {
    const _layers = [...getList()];

    const newLayers = _layers.map((layer) => {
      if (layer.id === layerId) {
        return {
          ...layer,
          opacity,
        };
      }
      return layer;
    });

    setList(newLayers);

    window.localStorage.setItem(
      `${projectName}-layers`,
      JSON.stringify(newLayers),
    );

    if (layerId === getActive().id) {
      setActive({
        ...getActive(),
        opacity,
      });
    }
  };

  const saveCurrentBuffer = () => {
    db.save(getCurrentBuffer(), getActive().id);
  };

  const duplicate = (layerId: string) => {
    const layers = getList();
    const targetLayerIndex = layers.findIndex((layer) => layer.id === layerId);
    const targetLayer = layers[targetLayerIndex];

    if (!targetLayer) {
      throw new Error(`Could not find layer with id ${layerId} to duplicate`);
    }

    const newLayer: Layer = {
      ...targetLayer,
      id: generateUUID(),
      name: `${targetLayer.name} (copy)`,
    };

    const targetBuffer = buffers.get(targetLayer.id);

    if (!targetBuffer) {
      throw new Error(
        `Could not find layer buffer linked to id ${layerId} to duplicate`,
      );
    }

    const newBuffer: Uint32Array<ArrayBuffer> = new Uint32Array([
      ...targetBuffer,
    ]);

    buffers.set(newLayer.id, newBuffer);
    db.save(newBuffer, newLayer.id);

    const first = layers.slice(0, targetLayerIndex);
    const second = layers.slice(targetLayerIndex, layers.length);
    const newLayers = [...first, newLayer, ...second];

    setList(newLayers);
    sort(newLayer.id, targetLayer.id);

    window.localStorage.setItem(
      `${projectName}-layers`,
      JSON.stringify(newLayers),
    );

    setActive(newLayer);
    setCurrentBuffer(newBuffer);
  };

  const getBufferById = (layerId: string): Uint32Array | undefined => {
    return buffers.get(layerId);
  };

  const setLayerBuffer = (
    layerId: string,
    buffer: Uint32Array<ArrayBuffer>,
  ) => {
    buffers.set(layerId, buffer);
  };

  const load = (layers: Layers, buffers: Record<string, number[]>) => {
    setList(layers);

    for (const [id, buffer] of Object.entries(buffers)) {
      const deserializedBuffer = serialization.layer.deserialize(buffer);
      setLayerBuffer(id, deserializedBuffer);
    }
  };

  return {
    add,
    remove,
    duplicate,
    sort,
    rename,
    toggleDisplay,
    select,
    setOpacity,
    getList,
    getActive,
    saveCurrentBuffer,
    getCurrentBuffer,
    buffers,
    getBufferById,
    setLayerBuffer,
    load,
  };
};
