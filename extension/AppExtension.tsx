import "@kittl/ui/Styles";
import "./app.css";
import { ProjectConfigProvider } from "../src/projectConfig/projectConfigProvider";
import { MenuProvider } from "../src/ui/tools/menuProvider";
import { Layers } from "./ui/Layer/Layers";
import { ActiveLayer } from "./ui/Layer/ActiveLayer";
import { Tools } from "./ui/Tools/Tools";
import { KittlContextProvider } from "./Kittl/context/KittlContextProvider";
import { Menu } from "./ui/Menu/Menu";

function AppExtention() {
  return (
    <MenuProvider>
      <ProjectConfigProvider>
        <div id="editor" data-theme="dark">
          <div id="menu">
            <Menu />
            <KittlContextProvider />
          </div>
          <canvas id="main-canvas" width={1024} height={1024} />
          <div id="bottom-container">
            <Tools />
            <Layers />
            <ActiveLayer />
          </div>
        </div>
      </ProjectConfigProvider>
    </MenuProvider>
  );
}

export default AppExtention;
