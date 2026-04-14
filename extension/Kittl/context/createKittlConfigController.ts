import { createSignal } from "solid-js";
import { kittl } from "@kittl/sdk";
import { createKittlAPI, type CreateKittlAPIType } from "./KittlAPI";
import type { PixelPainterMethods } from "../../../src/lib";

type CreateKittlConfigControllerOptions = {
  readImage: PixelPainterMethods["imageImporter"]["readImage"];
};

export const createKittlConfigController = (
  options: CreateKittlConfigControllerOptions,
) => {
  const [getApi, setApi] = createSignal<CreateKittlAPIType | null>(null);
  const [isReady, setIsReady] = createSignal(false);

  const mount = () => {
    kittl.onReady(() => {
      setApi(createKittlAPI(options.readImage));
      setIsReady(true);
    });
  };

  return {
    api: getApi,
    isReady,
    mount,
  };
};
