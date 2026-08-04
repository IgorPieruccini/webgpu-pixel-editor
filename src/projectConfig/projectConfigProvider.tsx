import { createContext, type JSX, onMount, useContext } from "solid-js";
import { editorContext } from "../editor/editortContext";
import { INITIAL_PIXEL_PAINTER } from "../pixelPainter/constants";
import { storageDB } from "../storageDB";
import { storageLocal } from "../storageLocal";
import { useMenu } from "../ui/menuPanels/menuProvider";
import { createProjectConfigController } from "./createProjectConfigController";
import type { ProjectConfigContextType, ProjectConfigStorage } from "./types";

const notImplemented = () => {
	console.warn("not implemented");
};

const initialProjectConfig: ProjectConfigContextType = {
	pixel: () => INITIAL_PIXEL_PAINTER,
	projectName: () => "new-project",
	createNewProject: notImplemented,
	deleteProject: async () => undefined,
	getActiveProject: () => null,
	getProjects: () => [],
};

const ProjectConfigContext = createContext(initialProjectConfig);

type ProjectConfigProviderProps = {
	children?: JSX.Element;
	canvas?: HTMLCanvasElement;
	canvasId?: string;
	storage?: ProjectConfigStorage;
	autoLoadActiveProject?: boolean;
	onProjectOpened?: () => void;
};

export const ProjectConfigProvider = (props: ProjectConfigProviderProps) => {
	const menu = useMenu();
	const controller = createProjectConfigController({
		canvas: props.canvas,
		canvasId: props.canvasId,
		storage: props.storage ?? storageLocal,
		storageDB,
		autoLoadActiveProject: props.autoLoadActiveProject ?? true,
		onProjectOpened: () => {
			props.onProjectOpened?.();
			menu.openOption(-1);
		},
	});

	onMount(() => {
		void controller.mount();
	});

	return (
		<ProjectConfigContext.Provider
			value={{
				pixel: controller.pixel,
				projectName: controller.projectName,
				createNewProject: controller.createNewProject,
				deleteProject: controller.deleteProject,
				getActiveProject: controller.getActiveProject,
				getProjects: controller.getProjects,
			}}
		>
			<editorContext.Provider value={controller.project}>
				{props.children}
			</editorContext.Provider>
		</ProjectConfigContext.Provider>
	);
};

export const useProjectConfig = () => {
	const context = useContext(ProjectConfigContext);
	return context;
};

const getLayers = () => {
	const context = useContext(ProjectConfigContext);
	return () => context.pixel().layer;
};

const getBrush = () => {
	const context = useContext(ProjectConfigContext);
	return () => context.pixel().brush;
};

const getExport = () => {
	const context = useContext(ProjectConfigContext);
	return () => context.pixel().export;
};

const getColorPalette = () => {
	const context = useContext(ProjectConfigContext);
	return () => context.pixel().colorPalette;
};

const getTool = () => {
	const context = useContext(ProjectConfigContext);
	return () => context.pixel().tool;
};

const getProjectConfig = () => {
	const context = useContext(ProjectConfigContext);
	return () => context.pixel().projectConfig;
};

export const API = {
	layers: getLayers,
	brush: getBrush,
	export: getExport,
	colorPalette: getColorPalette,
	tool: getTool,
	projectConfig: getProjectConfig,
};
