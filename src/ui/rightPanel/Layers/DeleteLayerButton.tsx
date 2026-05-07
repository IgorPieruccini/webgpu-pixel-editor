import { AiOutlineDelete } from "solid-icons/ai";
import { API } from "../../../projectConfig/projectConfigProvider";
import { SquareButton } from "../../shared/squareButton";
import styles from "./LayerActionButton.module.css";

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
    <SquareButton class={styles.button} size="xs" onClick={onDelete}>
      <AiOutlineDelete />
    </SquareButton>
  );
};
