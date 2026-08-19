import type { ProjectType } from "./editor/types";
import type { Layer, Layers } from "./pixelPainter/types";
import { generateUUID } from "./utils";

const normalizeLayer = (layer: Layer | Omit<Layer, "offset">): Layer => {
	return {
		...layer,
		offset: "offset" in layer ? layer.offset : { x: 0, y: 0 },
	};
};

const getLayers = (id: string) => {
	return window.localStorage.getItem(`${id}-layers`);
};

const saveLayers = (id: string, layers: string | Layers) => {
	if (typeof layers !== "string") {
		layers = JSON.stringify(layers);
	}
	window.localStorage.setItem(`${id}-layers`, layers);
};

const createLayers = (id: string): Layers => {
	let stringLayers = getLayers(id);
	if (!stringLayers) {
		const layer: Layers = [
			{
				id: generateUUID(),
				name: "Layer",
				display: true,
				opacity: 1,
				offset: { x: 0, y: 0 },
			},
		];
		stringLayers = JSON.stringify(layer);
		saveLayers(id, stringLayers);
	}

	return JSON.parse(stringLayers).map(normalizeLayer);
};

const setActiveProject = (project: ProjectType) => {
	window.localStorage.setItem("active_project", JSON.stringify(project));
};

const clearActiveProject = () => {
	window.localStorage.removeItem("active_project");
};

const getActiveProject = (): ProjectType | null => {
	const stringProject = window.localStorage.getItem("active_project");
	return stringProject ? JSON.parse(stringProject) : null;
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
		(_project) => _project.id === project.id,
	);

	if (!projectAlreadyExist) {
		setProjects([...projects, project]);
	}
};

const deleteProject = (id: string) => {
	const projects = getProjects().filter((project) => project.id !== id);
	setProjects(projects);
	window.localStorage.removeItem(`${id}-layers`);

	const activeProject = getActiveProject();
	if (!activeProject) {
		return;
	}

	if (activeProject.id === id) {
		clearActiveProject();
	}
};

const setProjectColorPalette = (colors: Array<string>) => {
	const project = getActiveProject();

	if (!project) {
		throw new Error("Active project not defined");
	}

	const key = `${project.id}-color-palette`;

	const stringfiedColors = JSON.stringify(colors);

	window.localStorage.setItem(key, stringfiedColors);
};

const getProjectColorPalette = (): Array<string> | null => {
	const project = getActiveProject();
	if (!project) {
		throw new Error("Active project not defined");
	}

	const key = `${project.id}-color-palette`;

	const stringfiedColors = window.localStorage.getItem(key);
	if (!stringfiedColors) {
		return null;
	}

	const colors = JSON.parse(stringfiedColors);

	return colors;
};

export const storageLocal = {
	getLayers,
	saveLayers,
	createLayers,
	setActiveProject,
	clearActiveProject,
	getActiveProject,
	getProjects,
	setProjects,
	addProject,
	deleteProject,
	colorPalette: {
		set: setProjectColorPalette,
		get: getProjectColorPalette,
	},
};
