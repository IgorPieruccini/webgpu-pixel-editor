import { createSignal } from "solid-js";
import type { Layer, Layers } from "../types";
import { generateUUID } from "../../utils";
import { localDataBase } from "../../storage";

export const createLayerHandler = async (
  projectName: string,
  gridSize: number,
) => {
  let stringLayers = window.localStorage.getItem(`${projectName}-layers`);
  if (!stringLayers) {
    const layer: Layers = [
      { id: generateUUID(), name: "Layer", display: true, opacity: 1 },
    ];
    stringLayers = JSON.stringify(layer);
    window.localStorage.setItem(`${projectName}-layers`, stringLayers);
  }

  const [get, set] = createSignal<Layers>(JSON.parse(stringLayers));

  const firstLayer = get().at(0);
  if (!firstLayer) {
    throw new Error(
      "Pixel Painter must be initialized at least with one layer",
    );
  }

  const [getActive, setActive] = createSignal<Layer>(firstLayer);

  const buffers: Map<string, Uint32Array<ArrayBuffer>> = new Map();
  const db = await localDataBase(projectName);

  for (const layer of get()) {
    try {
      const layerBuffer = await db.load(layer.id);
      if (layerBuffer) {
        buffers.set(layer.id, layerBuffer);
      } else {
        buffers.set(layer.id, new Uint32Array(gridSize * gridSize));
      }
    } catch {
      buffers.set(layer.id, new Uint32Array(gridSize * gridSize));
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

  const addLayer = () => {
    const layers = get();

    const layer: Layer = {
      id: generateUUID(),
      name: `Layer`,
      display: true,
      opacity: 1,
    };

    const _layers: Layers = [...layers, layer];
    set(_layers);

    window.localStorage.setItem(
      `${projectName}-layers`,
      JSON.stringify(_layers),
    );

    setActive(layer);

    const newBuffer = new Uint32Array(gridSize * gridSize);

    buffers.set(layer.id, newBuffer);
    setCurrentBuffer(newBuffer);
  };

  const removeLayer = (id: string) => {
    const _layers = [...get()];

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
    set(_layers);
    buffers.delete(id);

    window.localStorage.setItem(
      `${projectName}-layers`,
      JSON.stringify(_layers),
    );
  };

  const sortLayers = (dragged: string, dropped: string) => {
    const _layers = [...get()];

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

    set(newLayers);

    window.localStorage.setItem(
      `${projectName}-layers`,
      JSON.stringify(newLayers),
    );
  };

  const renameLayer = (name: string) => {
    const _layers = get().map((layer: Layer) => {
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

    set(_layers);
  };

  const toggleLayerDisplay = (id: string) => {
    const _layers = [...get()];

    const newLayers = _layers.map((layer) => {
      if (layer.id === id) {
        return {
          ...layer,
          display: !layer.display,
        };
      }
      return layer;
    });

    set(newLayers);

    window.localStorage.setItem(
      `${projectName}-layers`,
      JSON.stringify(newLayers),
    );
  };

  const selectLayer = (layerId: string) => {
    const layer = get().find((layer) => layer.id === layerId);
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

  const setLayerOpacity = (layerId: string, opacity: number) => {
    const _layers = [...get()];

    const newLayers = _layers.map((layer) => {
      if (layer.id === layerId) {
        return {
          ...layer,
          opacity,
        };
      }
      return layer;
    });

    set(newLayers);

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

  return {
    // methods exposed to the editor (ui)
    publicMethods: {
      addLayer,
      removeLayer,
      sortLayers,
      renameLayer,
      toggleLayerDisplay,
      selectLayer,
      setLayerOpacity,
      getLayers: get,
      getActiveLayer: getActive,
    },

    // methods used within pixelPainter
    saveCurrentBuffer,
    setActive,
    getCurrentBuffer,
    setCurrentBuffer,
    buffers,
  };
};
