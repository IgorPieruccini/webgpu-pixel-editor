import type { JSX, ParentProps } from "solid-js";
import { mergeProps, splitProps } from "solid-js";
import "./squareButton.css";

type SquareButtonSize = "xs" | "sm" | "md" | "lg";

type SquareButtonProps = ParentProps<
  JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
    size?: SquareButtonSize;
  }
>;

export const SquareButton = (props: SquareButtonProps) => {
  const mergedProps = mergeProps(
    {
      size: "md" as SquareButtonSize,
      type: "button" as const,
    },
    props,
  );
  const [local, rest] = splitProps(mergedProps, ["children", "class", "size"]);

  return (
    <button
      class={`square-button square-button-${local.size}${local.class ? ` ${local.class}` : ""}`}
      {...rest}
    >
      {local.children}
    </button>
  );
};
