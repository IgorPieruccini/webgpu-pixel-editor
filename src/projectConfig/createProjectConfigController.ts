import { createSignal } from "solid-js";
import { INITIAL_EDITOR } from "../editor/constant";
import { type EditorType, initializeEditor } from "../editor/editor";
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

	const createOrOpenProject = ({
		id,
		name,
		gridSize,
		layers,
		buffers,
		colorPalette,
	}: ProjectType & Partial<LoadedProject>): void => {
		project()
			.createNewPainter(id, name, gridSize)
			.then((value) => {
				setPixel(value);
				options.onProjectOpened?.();

				setActiveProject({ id, name, gridSize });
				options.storage?.addProject({ id, name, gridSize });
				setProjects(options.storage?.getProjects() ?? []);
				value.colorPalette.loadColorPalette(colorPalette);

				if (layers && buffers) value.layer.load(layers, buffers);
			});
	};

	const deleteProject = async (id: string) => {
		options.storage?.deleteProject(id);
		const nextProjects = options.storage?.getProjects() ?? [];
		const storedActiveProject = options.storage?.getActiveProject() ?? null;

		const nextProject = storedActiveProject ?? nextProjects[0] ?? null;

		setProjects(nextProjects);
		setActiveProject(nextProject);

		if (nextProject) {
			createOrOpenProject(nextProject);
		}

		// TODO: WHEN THE LAST PROJECT IS DELETED WE SHOW THE EMPTY STATE
		// WE DON'T HAVE THAT YET

		await options.storageDB?.delete(id);
	};

	const mount = async () => {
		const projectConfig = pixel().projectConfig;

		const result = await initializeEditor();
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

		if (
			!storedActiveProject.name ||
			!storedActiveProject.gridSize ||
			!storedActiveProject.id
		) {
			throw new Error(
				"Could not initialize project, data is corrupt, please open project manually",
			);
		}

		projectConfig.setProjectName(storedActiveProject.name);
		projectConfig.setId(storedActiveProject.id);
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
		createNewProject: createOrOpenProject,
		deleteProject,
		project,
		getActiveProject,
		getProjects,
		mount,
	};
};
