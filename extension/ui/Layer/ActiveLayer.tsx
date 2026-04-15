import { API, useProject } from "../../../src/lib";

export const ActiveLayer = () => {
  API.layers();
  const project = useProject();

  return (
    <div id="layer-info">
      <canvas
        id="preview-canvas"
        width={300}
        height={300}
        classList={{
          // this is a very bad hack, needs ot be fixed
          // when all projects are deleted the preview canvas renders with the last render buffer,
          "preview-canvas-hidden": project.getActiveProject() === null,
        }}
      />
    </div>
  );
};
