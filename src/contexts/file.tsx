import React from "react";
import { toast } from "react-hot-toast";
import type { ProductRow } from "../types";

export type FileState = {
  filename: string | null;
  sheet: ProductRow[] | null;
};

export interface FileInterface extends FileState {
  unloadFile: () => void;
  loadFile: (filename: string) => void;
  refetchFile: () => void;
}

const initialState: FileState = {
  filename: null,
  sheet: null,
};

const defaultContext: FileInterface = {
  ...initialState,
  unloadFile: () => {},
  loadFile: () => {},
  refetchFile: () => {},
};

const fileContext = React.createContext<FileInterface>(defaultContext);

function fileReducer(
  state: FileState = initialState,
  action: { type: string; payload?: any }
) {
  switch (action.type) {
    case "SET_FILENAME": {
      return {
        ...state,
        filename: action.payload,
      };
    }

    case "LOAD_FILE": {
      return {
        ...state,
        sheet: action.payload,
      };
    }

    case "UNLOAD_FILE": {
      return initialState;
    }

    default: {
      return state;
    }
  }
}

function FileProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(fileReducer, initialState);

  const unloadFile = React.useCallback(function unloadFile() {
    dispatch({ type: "UNLOAD_FILE" });
  }, []);

  const loadFile = React.useCallback(function loadFile(filename: string) {
    dispatch({ type: "SET_FILENAME", payload: filename });
  }, []);

  const fetchFile = React.useCallback(
    async function fetchFile() {
      const file = await window.api["sheet:load"](state.filename);

      if (file instanceof Error) {
        unloadFile();

        return false;
      }

      dispatch({ type: "LOAD_FILE", payload: file });

      return true;
    },
    [state.filename, unloadFile]
  );

  React.useEffect(() => {
    async function loadAndNotify() {
      const isLoaded = await fetchFile();

      if (isLoaded) {
        toast.success(`Archivo cargado: ${state.filename}`, {
          position: "bottom-left",
        });
      } else {
        toast.error(`No se ha podido cargar el archivo.`);
      }
    }

    if (state.filename) {
      loadAndNotify();
    }
  }, [state.filename, fetchFile]);

  return (
    <fileContext.Provider
      value={{ ...state, unloadFile, loadFile, refetchFile: fetchFile }}
    >
      {children}
    </fileContext.Provider>
  );
}

function useFile() {
  return React.useContext(fileContext);
}

export { FileProvider, useFile };
