import {
  children,
  createContext,
  onMount,
  useContext,
  type Accessor,
  type JSX,
} from "solid-js";
import type { CreateKittlAPIType } from "./KittlAPI";
import { createKittlConfigController } from "./createKittlConfigController";
import { API, useProject, type Layer } from "../../../src/lib";
import "@kittl/ui/Icons/download";
import "@kittl/ui/Icons/uploads";
import "./kittl.css";
import { generateUUID } from "../../../src/utils";

const initialKittlAPI: CreateKittlAPIType = {
  uploadImage: async () => {
    console.warn("Can't upload, kittlAPI is not ready");
    throw new Error("kittlAPI is not ready");
  },
  addImageToCanvas: async () => {
    console.warn("Can't add to canvas, kittlAPI is not ready");
  },
  importActiveSegment: async () => {
    throw new Error("kittlAPI is not ready");
  },
};

type KittlContextType = {
  api: Accessor<CreateKittlAPIType | null>;
  isReady: Accessor<boolean>;
};

const KittleContext = createContext<KittlContextType>({
  api: () => initialKittlAPI,
  isReady: () => false,
});

type KittlContextProviderProps = {
  children?: JSX.Element;
};

export const KittlContextProvider = ({
  children: providerChildren,
}: KittlContextProviderProps) => {
  const project = useProject();
  const controller = createKittlConfigController({
    readImage: (blob) => project.pixel().imageImporter.readImage(blob),
  });
  const resolvedChildren = children(() => providerChildren);
  const exportApi = API.export();

  const addToCanvas = async () => {
    const blob = await exportApi().getBlob();

    const api = controller.api();

    if (!api) {
      throw new Error("Kittl api not available");
    }

    const response = await api.uploadImage(blob);

    if (response.isOk) {
      const objectName = response.result[0].objectName;
      await api.addImageToCanvas(objectName, project.getProjectGridSize());
    }

    if (response.error) {
      console.error(response.error);
    }
  };

  const importFromKittl = async () => {
    const api = controller.api();

    if (!api) {
      throw new Error("Kittl api not available");
    }

    const { data, error } = await api.importActiveSegment();
    if (data) {
      const { buffer, width, height, name } = data;

      const id = generateUUID();

      const layer: Layer = {
        id,
        name: "imported Image",
        display: true,
        opacity: 1,
      };

      project.createNewProject({
        name,
        gridSize: { x: width, y: height },
        layers: [layer],
        buffers: {
          [id]: buffer,
        },
      });
    } else {
      throw error;
    }
  };

  onMount(() => {
    controller.mount();
  });

  return (
    <div id="kittl">
      <KittleContext.Provider
        value={{
          api: controller.api,
          isReady: controller.isReady,
        }}
      >
        <kittl-button
          class="icon-button"
          variant="primary"
          size="xs"
          disabled={!controller.isReady()}
          onClick={addToCanvas}
        >
          <kittl-icon-download />
        </kittl-button>

        <kittl-button
          class="icon-button"
          variant="primary"
          size="xs"
          disabled={!controller.isReady()}
          onClick={importFromKittl}
        >
          <kittl-icon-uploads />
        </kittl-button>
        {resolvedChildren()}
      </KittleContext.Provider>
    </div>
  );
};

export const useKittl = () => {
  return useContext(KittleContext);
};
