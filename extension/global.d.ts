import type { JSX } from "solid-js";

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      "kittl-button": JSX.HTMLAttributes<HTMLElement> & {
        size?: "xs" | "s" | "m" | "l";
        variant?: "ghost" | "secondary" | "primary";
        disabled?: boolean;
        type?: "button" | "submit" | "reset";
      };
      "kittl-icon-plus": JSX.HTMLAttributes<HTMLElement>;
      "kittl-icon-circle-x": JSX.HTMLAttributes<HTMLElement>;
      "kittl-icon-duplicate": JSX.HTMLAttributes<HTMLElement>;
      "kittl-icon-eye-opened": JSX.HTMLAttributes<HTMLElement>;
      "kittl-icon-eye-closed": JSX.HTMLAttributes<HTMLElement>;
      "kittl-icon-trash": JSX.HTMLAttributes<HTMLElement>;
      "kittl-icon-pencil": JSX.HTMLAttributes<HTMLElement>;
      "kittl-icon-ratio-one-by-one": JSX.HTMLAttributes<HTMLElement>;
      "kittl-icon-eraser": JSX.HTMLAttributes<HTMLElement>;
      "kittl-icon-sliders": JSX.HTMLAttributes<HTMLElement>;
    }
  }
}
