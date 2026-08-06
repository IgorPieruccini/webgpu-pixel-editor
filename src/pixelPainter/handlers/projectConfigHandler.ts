import { createSignal } from "solid-js";
import { storageLocal } from "../../storageLocal";
import type { Vec2 } from "../types";

export type ProjectConfigHandler = Awaited<
	ReturnType<typeof createProjectConfigHandler>
>;

export const createProjectConfigHandler = (
	gridSize: Vec2,
	projectName: string,
) => {
	const [getSize, setSize] = createSignal<Vec2>(gridSize);
	const [getProjectName, setProjectName] = createSignal<string>(projectName);

	const currentProject = { name: projectName, gridSize };
	storageLocal.setActiveProject(currentProject);

	const updatedProjects = storageLocal.getProjects().map((project) => {
		if (project.name === projectName) {
			return currentProject;
		}
		return project;
	});

	storageLocal.setProjects(updatedProjects);

	return {
		getSize,
		setSize,
		getProjectName,
		setProjectName,
	};
};
