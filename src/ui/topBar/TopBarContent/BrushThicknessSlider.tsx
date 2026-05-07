import { API } from "../../../projectConfig/projectConfigProvider";
import styles from "./BrushThicknessSlider.module.css";

export const BrushThicknessSlider = () => {
  const brush = API.brush();

  const onBrushChangeThickness = (e: InputEvent) => {
    if (e.target) {
      // @ts-expect-error - Figure out the correct type
      brush().setThickness(e.target.valueAsNumber);
    }
  };

  return (
    <div class={`${styles.container} tool-input`}>
      <label for="layer-thickness-input">Thickness</label>
      <input
        class={styles.input}
        type="range"
        min={1}
        max={100}
        value={brush().getThickness()}
        onInput={onBrushChangeThickness}
      />
      <p class={styles.value}>{brush().getThickness()}</p>
    </div>
  );
};
