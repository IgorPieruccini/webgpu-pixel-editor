import type { JSX } from "solid-js";
import { Show, createSignal, onCleanup, onMount } from "solid-js";
import "./anchoredPopover.css";

type AnchoredPopoverSide = "top" | "right" | "bottom" | "left";

type AnchoredPopoverProps = {
  side?: AnchoredPopoverSide;
  class?: string;
  panelClass?: string;
  trigger: (props: {
    isOpen: boolean;
    toggle: () => void;
    close: () => void;
    open: () => void;
  }) => JSX.Element;
  children: JSX.Element;
};

export const AnchoredPopover = (props: AnchoredPopoverProps) => {
  const side = props.side ?? "bottom";
  const [isOpen, setIsOpen] = createSignal(false);
  let containerRef: HTMLDivElement | undefined;

  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);
  const toggle = () => setIsOpen((value) => !value);

  onMount(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef?.contains(event.target as Node)) {
        close();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    onCleanup(() => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    });
  });

  return (
    <div
      ref={containerRef}
      class={`anchored-popover${props.class ? ` ${props.class}` : ""}`}
    >
      <div class="anchored-popover-trigger">
        {props.trigger({
          isOpen: isOpen(),
          toggle,
          close,
          open,
        })}
      </div>
      <Show when={isOpen()}>
        <div
          class={`anchored-popover-panel anchored-popover-${side}${props.panelClass ? ` ${props.panelClass}` : ""}`}
        >
          {props.children}
        </div>
      </Show>
    </div>
  );
};
