import { createSignal } from "solid-js";
import { HiSolidXMark } from "solid-icons/hi";
import { API } from "../../../projectConfig/projectConfigProvider";
import { useMenu } from "../menuProvider";
import { SquareButton } from "../../shared/squareButton";
import styles from "./ExportImagePanel.module.css";

const MIN_MULTIPLIER = 1;
const MAX_MULTIPLIER = 10;

export const ExportImagePanel = () => {
  const [multiplier, setMultiplier] = createSignal(MIN_MULTIPLIER);
  const menu = useMenu();
  const exportHandler = API.export();

  const clampMultiplier = (value: number) => {
    if (Number.isNaN(value)) {
      return MIN_MULTIPLIER;
    }

    return Math.min(MAX_MULTIPLIER, Math.max(MIN_MULTIPLIER, value));
  };

  const onMultiplierInput = (
    event: InputEvent & { currentTarget: HTMLInputElement; target: Element },
  ) => {
    const nextValue = clampMultiplier(parseInt(event.currentTarget.value, 10));
    event.currentTarget.value = nextValue.toString();
    setMultiplier(nextValue);
  };

  const onMultiplierFocusOut = (
    event: FocusEvent & { currentTarget: HTMLInputElement; target: Element },
  ) => {
    const nextValue = clampMultiplier(parseInt(event.currentTarget.value, 10));
    event.currentTarget.value = nextValue.toString();
    setMultiplier(nextValue);
  };

  const onDownload = async () => {
    await exportHandler().image(multiplier());
    menu.openOption(-1);
  };

  return (
    <div class={styles.panel}>
      <div class={styles.topSection}>
        <span class={styles.panelTitle}>Export PNG</span>
        <SquareButton
          type="button"
          size="sm"
          aria-label="Close export png panel"
          onClick={() => menu.openOption(-1)}
        >
          <HiSolidXMark />
        </SquareButton>
      </div>
      <div class={styles.field}>
        <label for="export-multiplier-input">Multiplier</label>
        <input
          class={styles.numberInput}
          id="export-multiplier-input"
          type="number"
          min={MIN_MULTIPLIER}
          max={MAX_MULTIPLIER}
          value={multiplier()}
          onInput={onMultiplierInput}
          onFocusOut={onMultiplierFocusOut}
        />
        <p class={styles.helperText}>
          Multiplier increases the original size of exported image by{" "}
          {multiplier()}
        </p>
      </div>
      <button type="button" onClick={() => void onDownload()}>
        Download
      </button>
    </div>
  );
};
