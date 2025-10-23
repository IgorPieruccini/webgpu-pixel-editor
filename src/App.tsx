import "./App.css";
import { initializeCanvas } from "./canvas";
import { onMount } from "solid-js";

function App() {
  onMount(() => {
    initializeCanvas();
  });

  return (
    <>
      <div id="canvas"></div>
    </>
  );
}

export default App;
