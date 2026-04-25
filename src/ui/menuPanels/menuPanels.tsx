import { NewProjectPanel } from "./newProjectPanel";

import "./menuPanels.css";
import { useMenu } from "../tools/menuProvider";
import { OPENED_OPTIONS } from "../tools/constants";
import { MyProjects } from "./myProjects";
import { ExportImagePanel } from "./exportImagePanel";

export const MenuPanels = () => {
  const menu = useMenu();

  return (
    <>
      {menu.openedOption() === -1 ? null : (
        <div id="menu-panels">
          {menu.openedOption() === OPENED_OPTIONS.NEW_PROJECT && (
            <NewProjectPanel />
          )}
          {menu.openedOption() === OPENED_OPTIONS.MY_PROJECTS && <MyProjects />}
          {menu.openedOption() === OPENED_OPTIONS.EXPORT_PNG && (
            <ExportImagePanel />
          )}
        </div>
      )}
    </>
  );
};
