import { SketchPicker, type ColorResult } from "solid-color";
import styles from "./ColorPicker.module.css";
import { API } from "../../projectConfig/projectConfigProvider";

export const ColorPicker = () => {
  const brush = API.brush();
  const colorPalette = API.colorPalette();

  const onChange = (color: ColorResult) => {
    brush().setColor(color.hex);
  };

  return (
    <div class={`${styles.container} tool-input`}>
      <SketchPicker
        presetColors={colorPalette().getColors()}
        onChange={onChange}
      />
    </div>
  );
};
