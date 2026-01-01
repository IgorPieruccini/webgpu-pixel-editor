import { createContext, useContext, type Accessor } from "solid-js";

import type { EditorContextType } from "./types";
import { INITIAL_PIXEL_PAINTER } from "./constant";

export const editorInitialValue: EditorContextType = {
  activeTool: () => 0,
  setActiveTool: () => {},
  createNewPainter: async () => INITIAL_PIXEL_PAINTER,
};

export const editorContext = createContext<Accessor<EditorContextType>>();

export function useEditor() {
  const context = useContext(editorContext);

  return context;
}
