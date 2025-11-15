import "./App.css";
import { ProjectConfigProvider } from "./projectConfig/projectConfigProvider";
import { MenuPanels } from "./ui/menuPanels";
import { RightPanel } from "./ui/rightPanel/rightPanel";
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
            <RightPanel />
            <MenuPanels />
          </div>
        </ProjectConfigProvider>
      </MenuProvider>
    </div>
  );
}

export default App;
