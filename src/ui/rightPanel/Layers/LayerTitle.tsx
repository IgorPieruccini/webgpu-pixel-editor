import { createSignal } from "solid-js";
import { useProjectConfig } from "../../../projectConfig/projectConfigProvider";

type LayerTitleProps = {
  layerName: string;
};

export const LayerTitle = ({ layerName }: LayerTitleProps) => {
  const [name, setName] = createSignal<string>(layerName);
  const [isEditing, setIsEditing] = createSignal<boolean>(false);
  const projectSettings = useProjectConfig();

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
      finishEditing();
      window.removeEventListener("keydown", onEnterPress);
    }
  };

  const registerListeners = () => {
    window.addEventListener("keydown", onEnterPress);
  };

  const finishEditing = () => {
    projectSettings.pixel().renameLayer(name());
    setIsEditing(false);
  };

  return (
    <>
      {isEditing() ? (
        <input
          ref={autoFocus}
          type="text"
          value={name()}
          onInput={onTypeName}
          onBlur={finishEditing}
        />
      ) : (
        <span onDblClick={onStartEditing}>{name()}</span>
      )}
    </>
  );
};
