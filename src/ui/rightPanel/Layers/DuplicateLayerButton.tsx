import { BiRegularDuplicate } from "solid-icons/bi";
import { API } from "../../../projectConfig/projectConfigProvider";
import { SquareButton } from "../../shared/squareButton";

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
    <SquareButton class="layer-btn-icon" size="xs" onClick={onDuplicate}>
      <BiRegularDuplicate />
    </SquareButton>
  );
};
