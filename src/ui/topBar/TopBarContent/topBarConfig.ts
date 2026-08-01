import { ACTIVATE_TOOL, type ActiveToolType } from "../../../editor/constant";

type TopBarConfigType = {
	thickness: Array<number>;
	opacity: Array<number>;
};

export const TOP_BAR_CONFIG: TopBarConfigType = {
	thickness: [ACTIVATE_TOOL.LINE, ACTIVATE_TOOL.PAINT, ACTIVATE_TOOL.DELETE],
	opacity: [
		ACTIVATE_TOOL.LINE,
		ACTIVATE_TOOL.PAINT,
		ACTIVATE_TOOL.PAINT_SELECTION,
		ACTIVATE_TOOL.BUCKET_PAINT,
	],
};
