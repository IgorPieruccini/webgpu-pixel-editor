import "./App.css";
import { ProjectProvider } from "./project/projectContext";
import { ColorPicker } from "./ui/ColorPicker";
import { MenuPanels } from "./ui/menuPanels";
import { Tools } from "./ui/tools";
import { MenuProvider } from "./ui/tools/menuProvider";

function App() {
  return (
    <div id="editor">
      <MenuProvider>
        <ProjectProvider>
          <div class="row">
            <Tools />
            <canvas id="main-canvas" width={1280} height={1280} />
            <ColorPicker />
            <MenuPanels />
          </div>
        </ProjectProvider>
      </MenuProvider>
    </div>
  );
}

export default App;
