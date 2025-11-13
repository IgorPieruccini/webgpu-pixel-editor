import {
  createContext,
  useContext,
  type JSX,
  createSignal,
  type Accessor,
} from "solid-js";

type MenuContextType = {
  openedOption: Accessor<number>;
  openOption: (_opt: number) => void;
};

const initialValue: MenuContextType = {
  openedOption: () => -1,
  openOption: (opt: number) => {
    console.warn("OpenOption not implemented");
  },
};

const MenuContext = createContext<MenuContextType>(initialValue);

export type MenuProviderProps = {
  children?: JSX.Element;
};

export const MenuProvider = (props: MenuProviderProps) => {
  const [openedOption, openOption] = createSignal(-1);

  return (
    <MenuContext.Provider
      value={{
        openedOption: openedOption,
        openOption,
      }}
    >
      {props.children}
    </MenuContext.Provider>
  );
};

export function useMenu() {
  const context = useContext(MenuContext);

  return context;
}
