import "./App.css";
import { init } from "./pixelPainter";
import { onMount } from "solid-js";

function App() {
  onMount(() => {
    init();
  });

  return (
    <div id="editor">
      <canvas id="main-canvas" width={1280} height={1280} />
      <input
        type="color"
        name="color"
        onInput={(e) => {
          //@ts-expect-error - type missing
          window.editor.setBrushColor(e.target.value);
        }}
        onCueChange={(color) => {
          console.log("color", color);
        }}
      />
    </div>
  );
}

export default App;
