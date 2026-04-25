import { createSignal, onMount } from "solid-js";
import { useMenu } from "../tools/menuProvider";
import { useProjectConfig } from "../../projectConfig/projectConfigProvider";
import type { ProjectType } from "../../editor/types";
import { storageLocal } from "../../storageLocal";
import { AiOutlineDelete } from "solid-icons/ai";
import { HiSolidXMark } from "solid-icons/hi";

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
        <span class="panel-title">Projects</span>
        <button
          class="panel-close-btn"
          type="button"
          aria-label="Close projects panel"
          onClick={() => menu.openOption(-1)}
        >
          <HiSolidXMark />
        </button>
      </div>
      <div id="new-projects-list">
        <div id="content">
          {projects().map((project) => {
            return (
              <div class="button-project">
                <button onClick={() => void onOpenProject(project)}>
                  {project.name}
                </button>{" "}
                <button onClick={() => void onDeleteProject(project)}>
                  <AiOutlineDelete />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
