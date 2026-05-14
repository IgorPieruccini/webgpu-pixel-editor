import { SketchPicker, type ColorResult } from "solid-color";
import styles from "./ColorPicker.module.css";
import { API } from "../../projectConfig/projectConfigProvider";
import { createMemo } from "solid-js";
import { numberToRGBA } from "../../pixelPainter/utils";

export const ColorPicker = () => {
  const brush = API.brush();
  const colorPalette = API.colorPalette();

  const onChange = (color: ColorResult) => {
    brush().setColor(color.hex);
  };

  const selectedColor = createMemo(() => {
    const color = brush().getSelectedColor();
    const rgba = numberToRGBA(color);
    return rgba;
  });

  return (
    <div class={`${styles.container} tool-input`}>
      <SketchPicker
        defaultColor={"#000000"}
        color={selectedColor()}
        presetColors={colorPalette().getColors()}
        onChange={onChange}
      />
    </div>
  );
};
