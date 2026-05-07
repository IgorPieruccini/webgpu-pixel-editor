import { NewProjectPanel } from "./newProjectPanel";

import styles from "./MenuPanels.module.css";
import { useMenu } from "../menuProvider";
import { OPENED_OPTIONS } from "../../topBar/constants";
import { MyProjects } from "./myProjectsPanel";
import { ExportImagePanel } from "./exportImagePanel";

export const MenuPanels = () => {
  const menu = useMenu();

  return (
    <>
      {menu.openedOption() === -1 ? null : (
        <div class={styles.menuPanels}>
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
