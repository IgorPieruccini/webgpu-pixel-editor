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

declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}
