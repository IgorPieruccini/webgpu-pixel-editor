import "@kittl/ui/Menu";
import "@kittl/ui/MenuItem";
import "@kittl/ui/Icons/menu";
import { createSignal } from "solid-js";
import { DEFAULT_GRID_SIZE } from "../../../src/constants";
import type { ProjectType } from "../../../src/editor/types";
import { useProjectConfig } from "../../../src/projectConfig/projectConfigProvider";
import { storageLocal } from "../../../src/storageLocal";
import "./menu.css";

export const Menu = () => {
  const [projects, setProjects] = createSignal<ProjectType[]>([]);
  const projectConfig = useProjectConfig();

  const loadProjects = () => {
    setProjects(storageLocal.getProjects());
  };

  const createProjectName = () => {
    const existingProjects = storageLocal.getProjects();
    const existingNames = new Set(
      existingProjects.map((project) => project.name),
    );
    const baseName = "new-project";

    if (!existingNames.has(baseName)) {
      return baseName;
    }

    let suffix = 1;
    while (existingNames.has(`${baseName}-${suffix}`)) {
      suffix += 1;
    }

    return `${baseName}-${suffix}`;
  };

  const onOpenProject = (project: ProjectType) => {
    projectConfig.createNewProject(project);
  };

  const onCreateProject = () => {
    projectConfig.createNewProject({
      name: createProjectName(),
      gridSize: DEFAULT_GRID_SIZE,
    });
  };

  return (
    <div id="menu">
      <kittl-menu placement="bottom-start" onClick={loadProjects}>
        <kittl-button slot="trigger" size="s" variant="primary">
          <kittl-icon-menu />
        </kittl-button>

        <div class="menu-section-title">My projects</div>
        {projects().length === 0 ? (
          <kittl-menu-item disabled>No saved projects</kittl-menu-item>
        ) : (
          projects().map((project) => (
            <kittl-menu-item onClick={() => onOpenProject(project)}>
              {project.name}
            </kittl-menu-item>
          ))
        )}

        <div class="menu-divider" />
        <div class="menu-section-title">Actions</div>
        <kittl-menu-item onClick={onCreateProject}>New project</kittl-menu-item>
      </kittl-menu>
    </div>
  );
};
