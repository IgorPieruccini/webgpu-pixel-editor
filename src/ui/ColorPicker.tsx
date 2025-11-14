import { useProjectConfig } from "../projectConfig/projectConfigProvider";

export const ColorPicker = () => {
  const project = useProjectConfig();

  return (
    <input
      type="color"
      name="color"
      value={project.pixel().getCurrentColor()}
      onInput={(e) => {
        project.pixel().setBrushColor(e.target.value);
      }}
    />
  );
};
