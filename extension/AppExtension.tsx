import "@kittl/ui/Styles";
import "@kittl/ui/Toast";
import "./app.css";
import { createMemo, Show } from "solid-js";
import {
  ProjectConfigProvider,
  useProject,
} from "../src/projectConfig/projectConfigProvider";
import { MenuProvider } from "../src/ui/tools/menuProvider";
import { Layers } from "./ui/Layer/Layers";
import { ActiveLayer } from "./ui/Layer/ActiveLayer";
import { Tools } from "./ui/Tools/Tools";
import { KittlContextProvider } from "./Kittl/context/KittlContextProvider";
import { Menu } from "./ui/Menu/Menu";
import { EmptyProject } from "./ui/EmptyProject/EmptyProject";

const ExtensionContent = () => {
  const projects = useProject();
  const showEmptyProject = createMemo(() => {
    return projects.getProjects().length === 0;
  });

  return (
    <div id="editor" data-theme="dark">
      <div id="menu">
        <Menu />
        <KittlContextProvider />
      </div>
      <Show when={showEmptyProject()}>
        <EmptyProject />
      </Show>
      <canvas id="main-canvas" width={1024} height={1024} />
      <div id="bottom-container">
        <Tools />
        <Layers />
        <ActiveLayer />
      </div>
      <kittl-toast id="extension-error-toast" duration={4000} />
    </div>
  );
};

function AppExtention() {
  return (
    <MenuProvider>
      <ProjectConfigProvider>
        <ExtensionContent />
      </ProjectConfigProvider>
    </MenuProvider>
  );
}

export default AppExtention;
