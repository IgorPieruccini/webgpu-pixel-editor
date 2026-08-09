import { useEditor } from "../editor/editortContext";

export const createActiveObjectGuard = () => {
	const project = useEditor();

	const isActiveTool = (activeTool: number) => {
		return project().getActiveTool() === activeTool;
	};

	return {
		isActiveTool,
	};
};
