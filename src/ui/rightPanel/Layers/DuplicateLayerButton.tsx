import { BiRegularDuplicate } from "solid-icons/bi";
import { API } from "../../../projectConfig/projectConfigProvider";

interface DuplicateLayerButtonProps {
  layerId: string;
}

export const DuplicateLayerButton = ({
  layerId,
}: DuplicateLayerButtonProps) => {
  const layers = API.layers();

  const onDuplicate = (e: MouseEvent) => {
    layers().duplicate(layerId);
    e.stopPropagation();
  };

  return (
    <button class="layer-btn-icon" onClick={onDuplicate}>
      <BiRegularDuplicate />
    </button>
  );
};
