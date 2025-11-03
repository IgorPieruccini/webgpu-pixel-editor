import "./App.css";
import { init } from "./pixelPainter";
import { onMount } from "solid-js";

function App() {
  onMount(() => {
    init();
  });

  return <canvas id="main-canvas" width={800} height={800} />;
}

export default App;
