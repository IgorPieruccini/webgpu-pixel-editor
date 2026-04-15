import { API, useProject } from "../../../src/lib";

export const ActiveLayer = () => {
  API.layers();
  const project = useProject();
  const layers = API.layers();

  const updateLayerOpacity = (e: InputEvent) => {
    const target = e.target as HTMLInputElement | null;
    if (!target) {
      return;
    }

    const currentLayer = layers().getActive();
    layers().setOpacity(currentLayer.id, target.valueAsNumber / 100);
  };

  return (
    <div id="layer-info">
      <div
        class="opacity-slide"
        classList={{
          "preview-canvas-hidden": project.getActiveProject() === null,
        }}
      >
        <label>Layer opacity:</label>
        <input
          class="layer-opacity-input"
          type="range"
          min={1}
          max={100}
          value={layers().getActive().opacity * 100}
          onInput={updateLayerOpacity}
        />
      </div>

      <canvas
        id="preview-canvas"
        width={250}
        height={250}
        classList={{
          // this is a very bad hack, needs ot be fixed
          // when all projects are deleted the preview canvas renders with the last render buffer,
          "preview-canvas-hidden": project.getActiveProject() === null,
        }}
      />
    </div>
  );
};
