import { useProject } from "../project/projectContext";

export const ColorPicker = () => {
  const project = useProject();

  return (
    <input
      type="color"
      name="color"
      onInput={(e) => {
        project?.().setBrushColor(e.target.value);
      }}
    />
  );
};
