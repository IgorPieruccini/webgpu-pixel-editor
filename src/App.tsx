import "./App.css";
import { ProjectProvider } from "./project/projectContext";
import { ColorPicker } from "./ui/ColorPicker";
import { Menu } from "./ui/menu";
import { Tools } from "./ui/tools";

function App() {
  return (
    <div id="editor">
      <ProjectProvider>
        <Menu />
        <div class="row">
          <Tools />
          <canvas id="main-canvas" width={1280} height={1280} />
          <ColorPicker />
        </div>
      </ProjectProvider>
    </div>
  );
}

export default App;
