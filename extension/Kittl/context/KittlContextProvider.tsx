import {
  children,
  createContext,
  createMemo,
  createSignal,
  onMount,
  Show,
  useContext,
  type Accessor,
  type JSX,
} from "solid-js";
import type { CreateKittlAPIType } from "./KittlAPI";
import { createKittlConfigController } from "./createKittlConfigController";
import { API, useProject, type Layer } from "../../../src/lib";
import "@kittl/ui/Menu";
import "@kittl/ui/Icons/download";
import "@kittl/ui/Icons/uploads";
import "./kittl.css";
import { generateUUID } from "../../../src/utils";
import {
  showErrorToast,
  showSuccessfulToast,
  toastError,
} from "../../ui/toast/errorToast";

const initialKittlAPI: CreateKittlAPIType = {
  uploadImage: async () => {
    throw toastError(new Error("kittlAPI is not ready"));
  },
  addImageToCanvas: async () => {
    showErrorToast(new Error("kittlAPI is not ready"));
  },
  importActiveSegment: async () => {
    throw toastError(new Error("kittlAPI is not ready"));
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
  const controller = createKittlConfigController();
  const resolvedChildren = children(() => providerChildren);
  const exportApi = API.export();
  const projects = useProject();
  const [exportMultiplier, setExportMultiplier] = createSignal("1");
  const showEmptyProject = createMemo(() => {
    return projects.getProjects().length === 0;
  });

  const addToCanvas = async () => {
    const parsedMultiplier = Number.parseInt(exportMultiplier(), 10);
    const multiplier = Math.min(Math.max(parsedMultiplier || 1, 1), 10);
    const blob = await exportApi().getBlob(multiplier);

    const api = controller.api();

    if (!api) {
      throw toastError(new Error("Kittl api not available"));
    }

    const response = await api.uploadImage(blob);

    if (response.isOk) {
      const objectName = response.result[0].objectName;
      const projectSize = project.getProjectGridSize();

      const size = {
        x: projectSize.x * multiplier,
        y: projectSize.y * multiplier,
      };

      await api.addImageToCanvas(objectName, size);
      showSuccessfulToast("The image has been exported to canvas");
    }

    if (response.error) {
      showErrorToast(response.error, "Failed to upload image to Kittl");
      console.error(response.error);
    }
  };

  const importFromKittl = async () => {
    const api = controller.api();

    if (!api) {
      throw toastError(new Error("Kittl api not available"));
    }

    const { data, error } = await api.importActiveSegment();
    if (data) {
      const { buffer, width, height, name } = data;

      const savedProjects = projects.getProjects();
      const projectExist = savedProjects.find(
        (project) => project.name === name,
      );

      const id = generateUUID();

      const layer: Layer = {
        id,
        name: "imported Image",
        display: true,
        opacity: 1,
      };

      const projectMeta = projectExist
        ? undefined
        : {
            layers: [layer],
            buffers: {
              [id]: buffer,
            },
          };

      project.createNewProject({
        name,
        gridSize: { x: width, y: height },
        ...(projectMeta ? { ...projectMeta } : {}),
      });

      showSuccessfulToast("New project created from selected elements");
    } else {
      throw toastError(error, "Failed to import active Kittl segment");
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
        <Show when={!showEmptyProject()}>
          <kittl-menu placement="bottom-end">
            <kittl-button
              class="icon-button"
              slot="trigger"
              variant="primary"
              size="s"
              disabled={!controller.isReady()}
            >
              <kittl-icon-download />
            </kittl-button>

            <div class="kittl-export-menu">
              <label class="kittl-export-field">
                <span>Multiplier</span>
                <input
                  class="kittl-export-input"
                  type="number"
                  min="1"
                  max="10"
                  value={exportMultiplier()}
                  onInput={(event) => {
                    setExportMultiplier(event.currentTarget.value);
                  }}
                />
              </label>

              <kittl-button variant="primary" size="s" onClick={addToCanvas}>
                Add to canvas
              </kittl-button>
            </div>
          </kittl-menu>
        </Show>

        <kittl-button
          class="icon-button"
          variant="primary"
          size="s"
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
