import "./App.css";
import { ProjectConfigProvider } from "./projectConfig/projectConfigProvider";
import { DevTool } from "./ui/debugger/DevTool";
import { MenuPanels } from "./ui/menuPanels";
import { RightPanel } from "./ui/rightPanel/rightPanel";
import { Tools, ToolSettings } from "./ui/tools";
import { MenuProvider } from "./ui/tools/menuProvider";

function App() {
  // Check if debug=1 parameter is in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const isDebugMode = urlParams.get("debug") === "1";

  return (
    <div id="editor">
      <MenuProvider>
        <ProjectConfigProvider>
          <ToolSettings />
          <div class="row">
            <Tools />
            <canvas id="main-canvas" width={1280} height={1280} />
            <RightPanel />
            <MenuPanels />
          </div>
          {isDebugMode && <DevTool />}
        </ProjectConfigProvider>
      </MenuProvider>
    </div>
  );
}

export default App;
