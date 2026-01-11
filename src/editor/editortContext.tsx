import { createContext, useContext, type Accessor } from "solid-js";

import { INITIAL_PIXEL_PAINTER } from "./constant";
import type { EditorType } from "./editor";

export const editorInitialValue: EditorType = {
  activeTool: () => 0,
  setActiveTool: () => {},
  createNewPainter: async () => INITIAL_PIXEL_PAINTER,
};

export const editorContext = createContext<Accessor<EditorType>>();

export function useEditor() {
  const context = useContext(editorContext);

  return context;
}
