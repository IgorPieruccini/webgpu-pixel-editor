import "@kittl/ui/Styles";
import "./app.css";
import { ProjectConfigProvider } from "../src/projectConfig/projectConfigProvider";
import { MenuProvider } from "../src/ui/tools/menuProvider";
import { Layers } from "./ui/Layer/Layers";
import { ActiveLayer } from "./ui/Layer/ActiveLayer";

function AppExtention() {
  return (
    <MenuProvider>
      <ProjectConfigProvider>
        <div id="editor">
          <canvas id="main-canvas" width={1024} height={1024} />
          <div id="layer-container">
            <Layers />
            <ActiveLayer />
          </div>
        </div>
      </ProjectConfigProvider>
    </MenuProvider>
  );
}

export default AppExtention;
