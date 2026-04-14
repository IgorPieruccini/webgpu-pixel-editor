import "../src/App.css";
import { ProjectConfigProvider } from "../src/projectConfig/projectConfigProvider";

function AppExtention() {
  return (
    <div>
      <ProjectConfigProvider>
        <div>
          <canvas id="main-canvas" width={572} height={572} />
          <canvas id="preview-canvas" width={300} height={300} />
        </div>
      </ProjectConfigProvider>
    </div>
  );
}

export default AppExtention;
