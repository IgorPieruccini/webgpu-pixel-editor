import "./App.css";
import { ProjectProvider } from "./project/projectContext";
import { ColorPicker } from "./ui/ColorPicker";

function App() {
  return (
    <div id="editor">
      <canvas id="main-canvas" width={1280} height={1280} />
      <ProjectProvider>
        <ColorPicker />
      </ProjectProvider>
    </div>
  );
}

export default App;
