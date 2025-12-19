import type { JSX } from "solid-js";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      sortable: boolean;
    }
  }
}

declare module "*.wgsl" {
  const shader: string;
  export default shader;
}
