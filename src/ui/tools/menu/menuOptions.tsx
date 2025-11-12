import { OPENED_OPTIONS } from "../constants";
import { UseMenu } from "../menuProvider";
import "./menu.css";

export const MenuOptions = () => {
  const menu = UseMenu();
  return (
    <div id="menu-options">
      <button
        onClick={() => {
          menu.openOption(OPENED_OPTIONS.NEW_PROJECT);
        }}
      >
        New project
      </button>
      <button onClick={() => menu.openOption(OPENED_OPTIONS.MY_PROJECTS)}>
        My projects
      </button>
    </div>
  );
};
