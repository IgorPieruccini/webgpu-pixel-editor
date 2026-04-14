import type { JSX } from "solid-js";

type KittlMenuEvent = CustomEvent<void>;

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
      "kittl-icon-download": JSX.HTMLAttributes<HTMLElement>;
      "kittl-icon-menu": JSX.HTMLAttributes<HTMLElement>;
      "kittl-menu": JSX.HTMLAttributes<HTMLElement> & {
        placement?:
          | "top"
          | "top-start"
          | "top-end"
          | "bottom"
          | "bottom-start"
          | "bottom-end"
          | "left"
          | "left-start"
          | "left-end"
          | "right"
          | "right-start"
          | "right-end";
        open?: boolean;
        offset?: number;
        "onmenu-open"?: (event: KittlMenuEvent) => void;
        "onmenu-close"?: (event: KittlMenuEvent) => void;
      };
      "kittl-menu-item": JSX.HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        destructive?: boolean;
        "onmenu-item-select"?: (event: KittlMenuEvent) => void;
      };
      "kittl-card": JSX.HTMLAttributes<HTMLElement> & {
        bordered?: boolean;
        interactive?: boolean;
        active?: boolean;
        disabled?: boolean;
      };
      "kittl-input": JSX.HTMLAttributes<HTMLElement> & {
        size?: "s" | "m" | "l";
        disabled?: boolean;
        placeholder?: string;
        label?: string;
        value?: string;
        name?: string;
        error?: string;
        maxlength?: number;
      };
    }
  }
}
