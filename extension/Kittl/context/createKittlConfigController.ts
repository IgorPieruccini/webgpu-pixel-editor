import { createSignal } from "solid-js";
import { kittl } from "@kittl/sdk";
import { createKittlAPI, type CreateKittlAPIType } from "./KittlAPI";

export const createKittlConfigController = () => {
  const [getApi, setApi] = createSignal<CreateKittlAPIType | null>(null);
  const [isReady, setIsReady] = createSignal(false);

  const mount = () => {
    kittl.onReady(() => {
      setApi(createKittlAPI());
      setIsReady(true);
    });
  };

  return {
    api: getApi,
    isReady,
    mount,
  };
};
