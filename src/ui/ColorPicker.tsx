import { useProject } from "../project/projectContext";

export const ColorPicker = () => {
  const project = useProject();

  return (
    <input
      type="color"
      name="color"
      value={project?.().getCurrentColor()}
      onInput={(e) => {
        project?.().setBrushColor(e.target.value);
      }}
    />
  );
};
