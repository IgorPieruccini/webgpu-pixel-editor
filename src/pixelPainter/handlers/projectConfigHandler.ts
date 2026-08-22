import { createSignal } from "solid-js";
import { storageLocal } from "../../storageLocal";
import type { Vec2 } from "../types";

export type ProjectConfigHandler = Awaited<
	ReturnType<typeof createProjectConfigHandler>
>;

type UpdateConfigType = {
	id?: string;
	gridSize?: Vec2;
	name?: string;
};

export const createProjectConfigHandler = (
	id: string,
	gridSize: Vec2,
	projectName: string,
) => {
	const [getId, setId] = createSignal<string>(id);
	const [getSize, setSize] = createSignal<Vec2>(gridSize);
	const [getProjectName, setProjectName] = createSignal<string>(projectName);

	const updateProjectConfig = ({
		id = getId(),
		name = getProjectName(),
		gridSize = getSize(),
	}: UpdateConfigType) => {
		const currentProject = { id, name, gridSize };

		storageLocal.setActiveProject(currentProject);
		const updatedProjects = storageLocal.getProjects().map((project) => {
			if (project.id === id) {
				return currentProject;
			}
			return project;
		});

		storageLocal.setProjects(updatedProjects);
	};

	const setName = (name: string) => {
		updateProjectConfig({ name });
		setProjectName(name);
	};

	updateProjectConfig({ id, name: projectName, gridSize });

	return {
		getId,
		setId,
		getSize,
		setSize,
		getProjectName,
		setProjectName: setName,
	};
};
