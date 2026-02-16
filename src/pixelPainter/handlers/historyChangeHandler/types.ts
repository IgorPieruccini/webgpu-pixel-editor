import type { Vec2 } from "../../../editor/types";
import type * as jsondiffpatch from "jsondiffpatch";

export type LayerDiff = {
  id: string;
  binary: Uint8Array<ArrayBuffer>;
  bounds: { tl: Vec2; br: Vec2 };
};

export type Diff = {
  index: number;
  type: "diff";
  diff: jsondiffpatch.Delta;
  layerDiff: LayerDiff | null;
};

export type SerializedProjectSnapshot = {
  index: number;
  type: "snapshot";
  diff: jsondiffpatch.Delta;
  buffers: Map<string, Uint8Array<ArrayBuffer>>;
  layerDiff: LayerDiff | null;
};

export type HistoryDiffItem = Array<Diff | SerializedProjectSnapshot>;
