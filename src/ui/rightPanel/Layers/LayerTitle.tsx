import { createSignal } from "solid-js";
import { API } from "../../../projectConfig/projectConfigProvider";

type LayerTitleProps = {
  layerName: string;
};

const MAX_LAYER_NAME_LENGTH = 25;

export const LayerTitle = ({ layerName }: LayerTitleProps) => {
  const [getName, setName] = createSignal<string>(layerName);
  const [isEditing, setIsEditing] = createSignal<boolean>(false);
  const layersAPI = API.layers();

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
    layersAPI().rename(getName());
    setIsEditing(false);
  };

  const getShortenName = () => {
    const name = getName();
    if (name.length > MAX_LAYER_NAME_LENGTH) {
      return name.slice(0, MAX_LAYER_NAME_LENGTH - 3) + "...";
    }
    return name;
  };

  return (
    <>
      {isEditing() ? (
        <input
          ref={autoFocus}
          class="layer-title"
          type="text"
          value={getName()}
          onInput={onTypeName}
          onBlur={finishEditing}
        />
      ) : (
        <span class="layer-title" onDblClick={onStartEditing}>
          {getShortenName()}
        </span>
      )}
    </>
  );
};
