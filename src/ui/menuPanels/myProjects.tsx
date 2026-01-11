import { AiFillCloseSquare } from "solid-icons/ai";
import { createSignal, onMount } from "solid-js";
import { useMenu } from "../tools/menuProvider";
import { useProjectConfig } from "../../projectConfig/projectConfigProvider";
import type { ProjectType } from "../../editor/types";

export const MyProjects = () => {
  const [projects, setProjects] = createSignal<ProjectType[]>([]);
  const projectConfig = useProjectConfig();

  const menu = useMenu();

  onMount(() => {
    const projectsString = window.localStorage.getItem("projects");
    if (projectsString) {
      const projects = JSON.parse(projectsString);
      setProjects(projects);
    }
  });

  const onOpenProject = (project: ProjectType) => {
    projectConfig.createNewProject(project);
  };

  return (
    <div class="menu-panel">
      <div id="top-section">
        <AiFillCloseSquare onClick={() => menu.openOption(-1)} />
      </div>
      <label for="project-name-input">Projects:</label>
      <div id="new-projects-list">
        {projects().map((project) => {
          return (
            <button onClick={() => onOpenProject(project)}>
              {project.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
