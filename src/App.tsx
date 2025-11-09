import "./App.css";
import { ProjectProvider } from "./project/projectContext";
import { ColorPicker } from "./ui/ColorPicker";
import { Tools } from "./ui/tools";

function App() {
  return (
    <div id="editor">
      <ProjectProvider>
        <Tools />
        <canvas id="main-canvas" width={1280} height={1280} />
        <ColorPicker />
      </ProjectProvider>
    </div>
  );
}

export default App;
