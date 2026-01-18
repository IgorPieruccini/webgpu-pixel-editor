import { createSignal } from "solid-js";
import "./DevTool.css";
import { LayersTool } from "./LayersTool/LayersTool";
import { ProjectTool } from "./LayersTool/ProjectTool";

export const DevTool = () => {
  const [getShow, setShow] = createSignal(false);

  return (
    <div
      id="dev-tool"
      classList={{
        "dev-tool-show": getShow(),
        "dev-tool-hide": !getShow(),
      }}
    >
      {getShow() && (
        <>
          <div id="header">
            <span>Dev tools</span>
            <button onClick={() => setShow(false)}>close</button>
          </div>
          <div id="content">
            <LayersTool />
            <ProjectTool />
          </div>
        </>
      )}

      {!getShow() && (
        <>
          <button onClick={() => setShow(true)}>Dev Tools</button>
        </>
      )}
    </div>
  );
};
