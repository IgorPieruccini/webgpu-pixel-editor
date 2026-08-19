import { createSignal } from "solid-js";
import { storageLocal } from "../../storageLocal";
import type { Vec2 } from "../types";

export type ProjectConfigHandler = Awaited<
	ReturnType<typeof createProjectConfigHandler>
>;

export const createProjectConfigHandler = (
	id: string,
	gridSize: Vec2,
	projectName: string,
) => {
	const [getId, setId] = createSignal<string>(id);
	const [getSize, setSize] = createSignal<Vec2>(gridSize);
	const [getProjectName, setProjectName] = createSignal<string>(projectName);

	const currentProject = { id, name: projectName, gridSize };
	storageLocal.setActiveProject(currentProject);

	const updatedProjects = storageLocal.getProjects().map((project) => {
		if (project.id === id) {
			return currentProject;
		}
		return project;
	});

	storageLocal.setProjects(updatedProjects);

	return {
		getId,
		setId,
		getSize,
		setSize,
		getProjectName,
		setProjectName,
	};
};
