import type { ProjectType } from "./editor/types";
import type { Layers } from "./pixelPainter/types";
import { generateUUID } from "./utils";

const getLayers = (projectName: string) => {
  return window.localStorage.getItem(`${projectName}-layers`);
};

const saveLayers = (projectName: string, layers: string | Layers) => {
  if (typeof layers !== "string") {
    layers = JSON.stringify(layers);
  }
  window.localStorage.setItem(`${projectName}-layers`, layers);
};

const createLayers = (projectName: string): Layers => {
  let stringLayers = getLayers(projectName);
  if (!stringLayers) {
    const layer: Layers = [
      { id: generateUUID(), name: "Layer", display: true, opacity: 1 },
    ];
    stringLayers = JSON.stringify(layer);
    saveLayers(projectName, stringLayers);
  }

  return JSON.parse(stringLayers);
};

const setActiveProject = (project: ProjectType) => {
  window.localStorage.setItem("active_project", JSON.stringify(project));
};

const getActiveProject = () => {
  return window.localStorage.getItem("active_project");
};

const getProjects = (): ProjectType[] => {
  const projectsString = window.localStorage.getItem("projects") || "[]";
  return JSON.parse(projectsString);
};

const setProjects = (projects: ProjectType[] | string) => {
  if (typeof projects !== "string") {
    projects = JSON.stringify(projects);
  }

  window.localStorage.setItem("projects", projects);
};

const addProject = (project: ProjectType) => {
  const projects = getProjects();
  const projectAlreadyExist = projects.find(
    (_project) => _project.name === project.name,
  );

  if (!projectAlreadyExist) {
    setProjects([...projects, project]);
  }
};

export const storageLocal = {
  getLayers,
  saveLayers,
  createLayers,
  setActiveProject,
  getActiveProject,
  getProjects,
  setProjects,
  addProject,
};
