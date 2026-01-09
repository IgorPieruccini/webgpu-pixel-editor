import { AiOutlineDelete } from "solid-icons/ai";
import { API } from "../../../projectConfig/projectConfigProvider";

type DeleteLayerButtonProps = {
  layerId: string;
};

export const DeleteLayerButton = ({ layerId }: DeleteLayerButtonProps) => {
  const layersAPI = API.layers();

  const onDelete = (e: MouseEvent) => {
    e.stopPropagation();
    layersAPI().remove(layerId);
  };

  return (
    <button class="layer-btn-icon" onClick={onDelete}>
      <AiOutlineDelete />
    </button>
  );
};
