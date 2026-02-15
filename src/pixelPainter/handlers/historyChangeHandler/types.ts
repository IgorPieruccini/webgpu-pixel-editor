import type { Vec2 } from "../../../editor/types";
import type { SerializedProject } from "../../../serialization/project";
import type * as jsondiffpatch from "jsondiffpatch";

export type LayerDiff = {
  id: string;
  binary: Uint8Array<ArrayBuffer>;
  bounds: { tl: Vec2; br: Vec2 };
};

type Diff = {
  type: "diff";
  diff: jsondiffpatch.Delta;
  layerDiff: LayerDiff | null;
};

type SerializedProjectSnapshot = {
  type: "snapshot";
  project: SerializedProject;
  buffers: Map<string, Uint8Array<ArrayBuffer>>;
  layerDiff: LayerDiff | null;
};

export type HistoryDiffItem = Array<Diff | SerializedProjectSnapshot>;
