import { API } from "../projectConfig/projectConfigProvider";

export const ColorPicker = () => {
  const brush = API.brush();

  return (
    <input
      type="color"
      name="color"
      value={brush().getSelectedColor("string")}
      onInput={(e) => {
        brush().setSelectedColor(e.target.value);
      }}
    />
  );
};
