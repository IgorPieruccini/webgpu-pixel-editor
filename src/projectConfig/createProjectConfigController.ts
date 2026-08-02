import { createSignal } from "solid-js";
import { DEFAULT_GRID_SIZE } from "../constants";
import { INITIAL_EDITOR } from "../editor/constant";
import {
	type EditorType,
	type InitializeEditorOptions,
	initializeEditor,
} from "../editor/editor";
import type { ProjectType } from "../editor/types";
import { INITIAL_PIXEL_PAINTER } from "../pixelPainter/constants";
import type { PixelPainterMethods } from "../pixelPainter/types";
import type { LoadedProject } from "../serialization/project";
import type {
	CreateProjectConfigControllerOptions,
	ProjectConfigController,
} from "./types";

export const createProjectConfigController = (
	options: CreateProjectConfigControllerOptions = {},
): ProjectConfigController => {
	const [projectName, setProjectName] = createSignal(
		options.initialProjectName ?? "new-project",
	);
	const [getProjectGridSize, setProjectGridSize] = createSignal(
		options.initialGridSize ?? DEFAULT_GRID_SIZE,
	);
	const [activeProject, setActiveProject] = createSignal<ProjectType | null>(
		options.storage?.getActiveProject() ?? null,
	);
	const [projects, setProjects] = createSignal<ProjectType[]>(
		options.storage?.getProjects() ?? [],
	);
	const [project, setProject] = createSignal<EditorType>(INITIAL_EDITOR);
	const [pixel, setPixel] = createSignal<PixelPainterMethods>(
		INITIAL_PIXEL_PAINTER,
	);

	const initializeEditorOptions: InitializeEditorOptions = {
		canvas: options.canvas,
		canvasId: options.canvasId,
	};

	const createOrOpenProject = ({
		name,
		gridSize,
		layers,
		buffers,
	}: ProjectType & Partial<LoadedProject>): void => {
		project()
			.createNewPainter(name, gridSize)
			.then((value) => {
				setPixel(value);
				options.onProjectOpened?.();

				setProjectName(name);
				setProjectGridSize(gridSize);
				options.storage?.setActiveProject({ name, gridSize });
				options.storage?.addProject({ name, gridSize });
				setActiveProject({ name, gridSize });
				setProjects(options.storage?.getProjects() ?? []);
				value.colorPalette.loadColorPalette();

				if (layers && buffers) value.layer.load(layers, buffers);
			});
	};

	const deleteProject = async (projectName: string) => {
		options.storage?.deleteProject(projectName);
		const nextProjects = options.storage?.getProjects() ?? [];
		const storedActiveProject = options.storage?.getActiveProject() ?? null;

		const nextProject = storedActiveProject ?? nextProjects[0] ?? null;

		setProjects(nextProjects);
		setActiveProject(nextProject);

		if (nextProject) {
			createOrOpenProject(nextProject);
		} else {
			setProjectName(options.initialProjectName ?? "new-project");
			setProjectGridSize(options.initialGridSize ?? DEFAULT_GRID_SIZE);
		}

		await options.storageDB?.delete(projectName);
	};

	const mount = async () => {
		const result = await initializeEditor(initializeEditorOptions);
		setProject(result);
		setActiveProject(options.storage?.getActiveProject() ?? null);
		setProjects(options.storage?.getProjects() ?? []);

		if (!options.autoLoadActiveProject || !options.storage) {
			return;
		}

		const storedActiveProject = options.storage.getActiveProject();
		if (!storedActiveProject) {
			return;
		}

		if (!storedActiveProject.name || !storedActiveProject.gridSize) {
			throw new Error(
				"Could not initialize project, data is corrupt, please open project manually",
			);
		}

		setProjectName(storedActiveProject.name);
		createOrOpenProject(storedActiveProject);
	};

	const getActiveProject = (): ProjectType | null => {
		return activeProject();
	};

	const getProjects = () => {
		return projects();
	};

	return {
		pixel,
		projectName,
		setProjectName,
		setProjectGridSize,
		getProjectGridSize,
		createNewProject: createOrOpenProject,
		deleteProject,
		project,
		getActiveProject,
		getProjects,
		mount,
	};
};
