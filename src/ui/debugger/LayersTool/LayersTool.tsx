import {
  API,
  useProjectConfig,
} from "../../../projectConfig/projectConfigProvider";
import { serialization } from "../../../serialization";
import "./LayersTool.css";

export const LayersTool = () => {
  const layers = API.layers();
  const project = useProjectConfig();

  const onDownload = (layerId: string) => {
    const buffer = layers().getBufferById(layerId);
    if (!buffer) return;
    const serializedLayerBuffer = serialization.layer.serialize(
      buffer,
      project.getProjectGridSize(),
    );

    // Stringify the serialized layer buffer
    const jsonString = JSON.stringify(serializedLayerBuffer);
    const name =
      layers()
        .getList()
        .find((layer) => layer.id === layerId)?.name || "layer";

    // Create a blob and download it as "layer.px"
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `{${name}-${layerId}.px`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const onUpload = (layerId: string) => {
    // Create a file input element
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".px";

    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Check if the file has .px extension
      if (!file.name.endsWith(".px")) {
        alert("Please select a .px file");
        return;
      }

      // Read the file content
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const layerData: number[] = JSON.parse(content);

          const buffer = serialization.layer.deserialize(layerData);

          console.log(buffer);

          // TODO: Apply the loaded data to the layer with layerId
        } catch (error) {
          console.error("Error parsing .px file:", error);
          alert("Invalid .px file format");
        }
      };

      reader.readAsText(file);
    };

    // Trigger the file dialog
    input.click();
  };

  return (
    <div id="layers-tool">
      <h3>Layers tool</h3>
      <div class="list">
        {layers()
          .getList()
          .map((layer) => {
            return (
              <div class="layer-node">
                <span>{layer.name}</span>
                <div class="layer-node">
                  <button onClick={() => onDownload(layer.id)}>download</button>
                  <button onClick={() => onUpload(layer.id)}>upload</button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
