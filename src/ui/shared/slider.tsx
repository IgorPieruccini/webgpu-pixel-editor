import "./slider.css";
export interface SliderProps {
  key: string;
  onChange: (e: InputEvent) => void;
  onFinish: (e: Event) => void;
  value: number;
}

export const Slider = (props: SliderProps) => {
  return (
    <div class="slider">
      <label for={`${props.key}-slider`}>Layer opacity</label>
      <div class="slider-container">
        <input
          id={`${props.key}-slider`}
          type="range"
          min={0}
          max={100}
          value={props.value}
          onInput={props.onChange}
          onChange={props.onFinish}
        />
        <p>{Math.floor(props.value)}%</p>
      </div>
    </div>
  );
};
