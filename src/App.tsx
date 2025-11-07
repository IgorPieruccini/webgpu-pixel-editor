import "./App.css";
import { onMount } from "solid-js";
import { initializeProject } from "./project";

function App() {
  onMount(() => {
    initializeProject();
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
