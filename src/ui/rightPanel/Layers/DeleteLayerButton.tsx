import { AiOutlineDelete } from "solid-icons/ai";
import { useProjectConfig } from "../../../projectConfig/projectConfigProvider";

type DeleteLayerButtonProps = {
  layerId: string;
};

export const DeleteLayerButton = ({ layerId }: DeleteLayerButtonProps) => {
  const projectConfig = useProjectConfig();

  const onDelete = (e: MouseEvent) => {
    e.stopPropagation();
    projectConfig.pixel().layer.remove(layerId);
  };

  return (
    <button class="layer-delete-btn" onClick={onDelete}>
      <AiOutlineDelete />
    </button>
  );
};
