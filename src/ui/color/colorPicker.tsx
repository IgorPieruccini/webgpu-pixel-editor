import { SketchPicker, type ColorResult } from "solid-color";
import "./colorPicker.css";
import { API } from "../../projectConfig/projectConfigProvider";

export const ColorPicker = () => {
  const brush = API.brush();
  const colorPalette = API.colorPalette();

  const onChange = (color: ColorResult) => {
    brush().setColor(color.hex);
  };

  return (
    <div class="ColorPickerContainer tool-input">
      <SketchPicker
        presetColors={colorPalette().getColors()}
        onChange={onChange}
      />
    </div>
  );
};
