import "./App.css";
import { init } from "./canvas";
import { onMount } from "solid-js";

function App() {
  onMount(() => {
    init();
  });

  return <canvas id="main-canvas" width={800} height={800} />;
}

export default App;
