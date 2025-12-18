import { createSignal } from "solid-js";

type LayerTitleProps = {
  layerName: string;
};

export const LayerTitle = ({ layerName }: LayerTitleProps) => {
  const [name, setName] = createSignal<string>(layerName);
  const [isEditing, setIsEditing] = createSignal<boolean>(false);

  const onTypeName = (e: { target: HTMLInputElement }) => {
    setName(e.target.value);
  };

  const onStartEditing = (e: MouseEvent) => {
    e.preventDefault();
    setIsEditing(true);
    registerListeners();
  };

  const autoFocus = (el: HTMLInputElement) => {
    queueMicrotask(() => {
      el.focus();
    });
  };

  const onEnterPress = (e: KeyboardEvent) => {
    if (e.key == "Enter") {
      setIsEditing(false);
      window.removeEventListener("keydown", onEnterPress);
    }
  };

  const registerListeners = () => {
    window.addEventListener("keydown", onEnterPress);
  };

  return (
    <>
      {isEditing() ? (
        <input
          ref={autoFocus}
          type="text"
          value={name()}
          onInput={onTypeName}
          onBlur={() => setIsEditing(false)}
        />
      ) : (
        <span onDblClick={onStartEditing}>{name() + "test"}</span>
      )}
    </>
  );
};
