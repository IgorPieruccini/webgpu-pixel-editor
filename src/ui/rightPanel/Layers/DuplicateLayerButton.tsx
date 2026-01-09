import { BiRegularDuplicate } from "solid-icons/bi";

export const DuplicateLayerButton = () => {
  const onDuplicate = () => {};

  return (
    <button class="layer-btn-icon" onClick={onDuplicate}>
      <BiRegularDuplicate />
    </button>
  );
};
