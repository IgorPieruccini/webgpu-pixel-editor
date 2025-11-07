import type { Accessor } from "solid-js";

export type ProjectType = {
  setBrushColor: (_color: string) => void;
  getCurrentColor: Accessor<string>;
};
