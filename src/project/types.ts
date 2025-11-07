import type { Accessor } from "solid-js";

export type ProjectType = {
  setBrushColor: (_color: number | string) => void;
};

export type ProjectContextType = {
  setBrushColor: Accessor<(_color: number | string) => void>;
};
