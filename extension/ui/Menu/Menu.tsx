import "@kittl/ui/Card";
import "@kittl/ui/Input";
import "@kittl/ui/Menu";
import "@kittl/ui/MenuItem";
import "@kittl/ui/Icons/menu";
import { createMemo, createSignal } from "solid-js";
import {
  DEFAULT_GRID_SIZE,
  FILE_FORMAT,
  MAX_GRID_SIZE,
  MIN_GRID_SIZE,
} from "../../../src/constants";
import type { ProjectType } from "../../../src/editor/types";
import {
  API,
  useProject,
  useProjectConfig,
} from "../../../src/projectConfig/projectConfigProvider";
import { storageLocal } from "../../../src/storageLocal";
import "./menu.css";
import { serialization } from "../../../src/serialization";

export const Menu = () => {
  const [projects, setProjects] = createSignal<ProjectType[]>([]);
  const [isCreatePanelOpen, setIsCreatePanelOpen] = createSignal(false);
  const [projectName, setProjectName] = createSignal("new-project");
  const [projectWidth, setProjectWidth] = createSignal(
    String(DEFAULT_GRID_SIZE.x),
  );
  const [projectHeight, setProjectHeight] = createSignal(
    String(DEFAULT_GRID_SIZE.y),
  );
  const projectConfig = useProjectConfig();
  const project = useProject();

  const activeProject = createMemo(() => {
    return project.getActiveProject();
  }, false);

  const layerAPI = API.layers();

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

  const openCreateProjectPanel = () => {
    setProjectName(createProjectName());
    setProjectWidth(String(DEFAULT_GRID_SIZE.x));
    setProjectHeight(String(DEFAULT_GRID_SIZE.y));
    setIsCreatePanelOpen(true);
  };

  const closeCreateProjectPanel = () => {
    setIsCreatePanelOpen(false);
  };

  const parseGridSize = (value: string) => {
    const parsed = Number.parseInt(value, 10);

    if (Number.isNaN(parsed)) {
      return MIN_GRID_SIZE;
    }

    return Math.min(Math.max(parsed, MIN_GRID_SIZE), MAX_GRID_SIZE);
  };

  const onCreateProject = () => {
    projectConfig.createNewProject({
      name: projectName().trim() || createProjectName(),
      gridSize: {
        x: parseGridSize(projectWidth()),
        y: parseGridSize(projectHeight()),
      },
    });
    closeCreateProjectPanel();
  };

  const exportProject = () => {
    const serializeProject = serialization.project.serialize(
      project.projectName(),
      project.getProjectGridSize(),
      layerAPI().getList(),
      layerAPI().buffers,
    );
    serialization.project.saveProject(serializeProject);
  };

  const importProject = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = FILE_FORMAT;

    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const loadedProject = await serialization.project.loadProject(file);

      project.createNewProject(loadedProject);
    };

    // Trigger the file dialog
    input.click();
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
        <kittl-menu-item onClick={openCreateProjectPanel}>
          New project
        </kittl-menu-item>
        <kittl-menu-item
          disabled={activeProject() === null}
          onClick={exportProject}
        >
          Export project
        </kittl-menu-item>
        <kittl-menu-item onClick={importProject}>
          Import project
        </kittl-menu-item>
      </kittl-menu>

      {isCreatePanelOpen() && (
        <div class="create-project-panel">
          <kittl-card bordered>
            <div class="create-project-card-content">
              <div class="create-project-header">
                <span class="create-project-title">New project</span>
              </div>

              <kittl-input
                label="Project name"
                value={projectName()}
                onInput={(event) => {
                  const target = event.currentTarget as HTMLElement & {
                    value: string;
                  };
                  setProjectName(target.value);
                }}
              />

              <div class="create-project-size-row">
                <kittl-input
                  label="Width"
                  value={projectWidth()}
                  onInput={(event) => {
                    const target = event.currentTarget as HTMLElement & {
                      value: string;
                    };
                    setProjectWidth(target.value);
                  }}
                />

                <kittl-input
                  label="Height"
                  value={projectHeight()}
                  onInput={(event) => {
                    const target = event.currentTarget as HTMLElement & {
                      value: string;
                    };
                    setProjectHeight(target.value);
                  }}
                />
              </div>

              <div class="create-project-actions">
                <kittl-button variant="ghost" onClick={closeCreateProjectPanel}>
                  Close
                </kittl-button>
                <kittl-button variant="primary" onClick={onCreateProject}>
                  Create
                </kittl-button>
              </div>
            </div>
          </kittl-card>
        </div>
      )}
    </div>
  );
};
