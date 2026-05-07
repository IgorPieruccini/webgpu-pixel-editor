import "./slider.css";
export interface SliderProps {
  key: string;
  label: string;
  onChange: (e: InputEvent) => void;
  onFinish?: (e: Event) => void;
  value: number;
  min?: number;
  max?: number;
  valueText?: string;
}

export const Slider = (props: SliderProps) => {
  return (
    <div class="slider">
      <label for={`${props.key}-slider`}>{props.label}</label>
      <div class="slider-container">
        <input
          id={`${props.key}-slider`}
          type="range"
          min={props.min ?? 0}
          max={props.max ?? 100}
          value={props.value}
          onInput={props.onChange}
          onChange={props.onFinish}
        />
        <p>{props.valueText ?? `${Math.floor(props.value)}%`}</p>
      </div>
    </div>
  );
};
