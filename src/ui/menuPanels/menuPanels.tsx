import { NewProjectPanel } from "./newProjectPanel";

import "./menuPanels.css";
import { UseMenu } from "../tools/menuProvider";
import { OPENED_OPTIONS } from "../tools/constants";

export const MenuPanels = () => {
  const menu = UseMenu();

  menu().openedOption();
  return (
    <>
      {menu().openedOption() === -1 ? null : (
        <div id="menu-panels">
          {menu().openedOption() === OPENED_OPTIONS.NEW_PROJECT && (
            <NewProjectPanel />
          )}
        </div>
      )}
    </>
  );
};
