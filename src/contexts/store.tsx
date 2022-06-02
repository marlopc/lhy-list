import React from "react";
import { toast } from "react-hot-toast";
import { RowWithId } from "../lib/xlsx";
import type { ProductRow } from "../types";

export type Screens = "files" | "table";
export type StoreState = {
  screen: Screens;
  file: string | null;
  editing: string | boolean;
  sheet: RowWithId<ProductRow>[];
};

export interface Store extends StoreState {
  selectFile: (filename: string) => void;
  setEdition: (editing: string | boolean) => void;
  loadSheetFile: () => Promise<void>;
  reset: () => void;
}

const initialStore: Store = {
  screen: "files",
  file: null,
  sheet: [],
  selectFile: () => {},
  setEdition: () => {},
  loadSheetFile: async () => {},
  reset: () => {},
  editing: null,
};

const storeContext = React.createContext<Store>(initialStore);

function storeReducer(
  state: StoreState = initialStore,
  action: { type: string; payload?: any }
) {
  switch (action.type) {
    case "RESET": {
      return initialStore;
    }
    case "LOAD_SHEET": {
      return {
        ...state,
        sheet: action.payload,
      };
    }
    case "PICK_FILE": {
      return {
        ...state,
        screen: "table" as const,
        file: String(action.payload),
      };
    }
    case "EDIT_SHEET": {
      return {
        ...state,
        editing: action.payload,
      };
    }
    default: {
      return state;
    }
  }
}

function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(storeReducer, initialStore);

  function reset() {
    dispatch({ type: "RESET" });
  }

  function selectFile(filename: string) {
    dispatch({ type: "PICK_FILE", payload: filename });
  }

  function setEdition(id?: string) {
    dispatch({ type: "EDIT_SHEET", payload: id ?? null });
  }

  const loadSheetFile = React.useCallback(async () => {
    let sheet: RowWithId<ProductRow>[] = [];

    if (state.file) {
      const load = await window.api["sheet:load"](state.file);

      if (load instanceof Error) {
        toast.error(load.message);
        reset();
      } else {
        sheet = load;
      }
    }

    dispatch({ type: "LOAD_SHEET", payload: sheet });
  }, [state.file]);

  React.useEffect(() => {
    if (state.file && !state.editing) {
      loadSheetFile();
    }
  }, [state.file, state.editing]);

  return (
    <storeContext.Provider
      value={{ ...state, selectFile, setEdition, loadSheetFile, reset }}
    >
      {children}
    </storeContext.Provider>
  );
}

function useStore() {
  return React.useContext(storeContext);
}

export { StoreProvider, useStore };
