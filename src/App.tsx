import "./App.css";
import { ProjectConfigProvider } from "./projectConfig/projectConfigProvider";
import { ColorPicker } from "./ui/ColorPicker";
import { MenuPanels } from "./ui/menuPanels";
import { Tools } from "./ui/tools";
import { MenuProvider } from "./ui/tools/menuProvider";

function App() {
  return (
    <div id="editor">
      <MenuProvider>
        <ProjectConfigProvider>
          <div class="row">
            <Tools />
            <canvas id="main-canvas" width={1280} height={1280} />
            <ColorPicker />
            <MenuPanels />
          </div>
        </ProjectConfigProvider>
      </MenuProvider>
    </div>
  );
}

export default App;
