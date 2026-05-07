import { API } from "../../../projectConfig/projectConfigProvider";
import styles from "./BrushOpacitySlider.module.css";

export const BrushOpacitySlider = () => {
  const brush = API.brush();

  const onBrushChangeOpacity = (e: InputEvent) => {
    if (e.target) {
      // @ts-expect-error - Figure out the correct type
      brush().setOpacity(e.target.valueAsNumber);
    }
  };

  return (
    <div class={`${styles.container} tool-input`}>
      <label for="layer-opacity-input">Opacity</label>
      <input
        class={styles.input}
        type="range"
        min={0}
        max={100}
        value={brush().getOpacity()}
        onInput={onBrushChangeOpacity}
      />
      <p class={styles.value}>{Math.floor(brush().getOpacity())}%</p>
    </div>
  );
};
