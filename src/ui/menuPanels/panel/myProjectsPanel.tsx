import { createSignal, onMount } from "solid-js";
import { useMenu } from "../menuProvider";
import { useProjectConfig } from "../../../projectConfig/projectConfigProvider";
import type { ProjectType } from "../../../editor/types";
import { storageLocal } from "../../../storageLocal";
import { AiOutlineDelete } from "solid-icons/ai";
import { HiSolidXMark } from "solid-icons/hi";
import { SquareButton } from "../../shared/squareButton";
import styles from "./MyProjectsPanel.module.css";

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
    <div class={styles.panel}>
      <div class={styles.topSection}>
        <span class={styles.panelTitle}>Projects</span>
        <SquareButton
          type="button"
          size="sm"
          aria-label="Close projects panel"
          onClick={() => menu.openOption(-1)}
        >
          <HiSolidXMark />
        </SquareButton>
      </div>
      <div class={styles.projectsList}>
        <div class={styles.content}>
          {projects().map((project) => {
            return (
              <div class={styles.projectRow}>
                <button onClick={() => void onOpenProject(project)}>
                  {project.name}
                </button>{" "}
                <SquareButton
                  size="sm"
                  onClick={() => void onDeleteProject(project)}
                >
                  <AiOutlineDelete />
                </SquareButton>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
