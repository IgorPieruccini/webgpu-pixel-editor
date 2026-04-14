import { API } from "../../../src/lib";

export const ColorPicker = () => {
  const brush = API.brush();

  return (
    <input
      class="tool-color-picker"
      type="color"
      name="color"
      value={brush().getSelectedColor("string")}
      onInput={(e) => {
        brush().setSelectedColor(e.target.value);
      }}
    />
  );
};
