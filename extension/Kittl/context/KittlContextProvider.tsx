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
import { API, useProject } from "../../../src/lib";

const initialKittlAPI: CreateKittlAPIType = {
  uploadImage: async () => {
    console.warn("Can't upload, kittlAPI is not ready");
    throw new Error("kittlAPI is not ready");
  },
  addImageToCanvas: async () => {
    console.warn("Can't add to canvas, kittlAPI is not ready");
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
  const controller = createKittlConfigController();
  const resolvedChildren = children(() => providerChildren);
  const exportApi = API.export();
  const project = useProject();

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

  onMount(() => {
    controller.mount();
  });

  return (
    <KittleContext.Provider
      value={{
        api: controller.api,
        isReady: controller.isReady,
      }}
    >
      <p>{controller.isReady() ? "isReady" : "notReady"}</p>
      <kittl-button
        class="icon-button"
        variant="ghost"
        size="xs"
        disabled={!controller.isReady()}
        onClick={addToCanvas}
      >
        {controller.isReady() ? "is ready" : "not ready"}
        <kittl-icon-duplicate class="icon" />
      </kittl-button>
      {resolvedChildren()}
    </KittleContext.Provider>
  );
};

export const useKittl = () => {
  return useContext(KittleContext);
};
