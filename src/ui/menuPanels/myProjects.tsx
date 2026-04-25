import { AiFillCloseSquare } from "solid-icons/ai";
import { createSignal, onMount } from "solid-js";
import { useMenu } from "../tools/menuProvider";
import { useProjectConfig } from "../../projectConfig/projectConfigProvider";
import type { ProjectType } from "../../editor/types";
import { storageLocal } from "../../storageLocal";
import { IoTrashBinOutline } from "solid-icons/io";

export const MyProjects = () => {
  const [projects, setProjects] = createSignal<ProjectType[]>([]);
  const projectConfig = useProjectConfig();

  const menu = useMenu();

  onMount(() => {
    const projects = storageLocal.getProjects();
    setProjects(projects);
  });

  const onOpenProject = (project: ProjectType) => {
    projectConfig.createNewProject(project);
  };

  const onDeleteProject = (project: ProjectType) => {
    projectConfig.deleteProject(project.name);
  };

  return (
    <div class="menu-panel">
      <div id="top-section">
        <AiFillCloseSquare onClick={() => menu.openOption(-1)} />
      </div>
      <label for="project-name-input">Projects:</label>
      <div id="new-projects-list">
        <div id="content">
          {projects().map((project) => {
            return (
              <div class="button-project">
                <button onClick={() => void onOpenProject(project)}>
                  {project.name}
                </button>{" "}
                <button onClick={() => void onDeleteProject(project)}>
                  <IoTrashBinOutline />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
