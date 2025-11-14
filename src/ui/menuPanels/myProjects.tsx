import { AiFillCloseSquare } from "solid-icons/ai";
import { createSignal, onMount } from "solid-js";
import { useMenu } from "../tools/menuProvider";
import { useProjectConfig } from "../../projectConfig/projectConfigProvider";

export const MyProjects = () => {
  const [projects, setProjects] = createSignal<string[]>([]);
  const projectConfig = useProjectConfig();

  const menu = useMenu();

  onMount(() => {
    const projectsString = window.localStorage.getItem("projects");
    if (projectsString) {
      const projects = JSON.parse(projectsString);
      setProjects(projects);
    }
  });

  const onOpenProject = (projectName: string) => {
    projectConfig.createNewProject(projectName);
  };

  return (
    <div class="menu-panel">
      <div id="top-section">
        <AiFillCloseSquare onClick={() => menu.openOption(-1)} />
      </div>
      <label for="project-name-input">Projects:</label>
      <div id="new-projects-list">
        {projects().map((projectName) => {
          return (
            <button onClick={() => onOpenProject(projectName)}>
              {projectName}
            </button>
          );
        })}
      </div>
    </div>
  );
};
