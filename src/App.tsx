import "./App.css";
import { init } from "./pixelPainter";
import { onMount } from "solid-js";

function App() {
  onMount(() => {
    init();
  });

  return (
    <div>
      {/*<input type="color" name="color" />
      <button>test</button>*/}
      <canvas id="main-canvas" width={800} height={800} />
    </div>
  );
}

export default App;
