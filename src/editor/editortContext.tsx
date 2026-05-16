import { createContext, useContext, type Accessor } from "solid-js";

import type { EditorType } from "./editor";
import { INITIAL_EDITOR } from "./constant";

export const editorContext = createContext<Accessor<EditorType>>(
  () => INITIAL_EDITOR,
);

export function useEditor() {
  const context = useContext(editorContext);

  return context;
}
