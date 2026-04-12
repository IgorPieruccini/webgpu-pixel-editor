import { SketchPicker, CompactPicker, type ColorResult } from "solid-color";
import "./colorPicker.css";
import { API } from "../../projectConfig/projectConfigProvider";

export const ColorPicker = () => {
  const brush = API.brush();
  const colorPalette = API.colorPalette();

  const onChange = (color: ColorResult) => {
    brush().setColor(color.hex);
  };

  return (
    <div class="ColorPickerContainer">
      <SketchPicker
        presetColors={colorPalette().getColors()}
        onChange={onChange}
      />
      <CompactPicker
        colors={[]}
        styles={{
          Compact: {
            background: "var(--background)",
          },
        }}
      />
    </div>
  );
};
