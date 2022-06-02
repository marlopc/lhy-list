import { contextBridge, ipcRenderer } from "electron";
import { SheetValues } from "./lib/xlsx";
import type { ProductRow } from "./types";

export interface Api {
  "onedrive:read": () => Promise<string[] | Error>;
  "sheet:load": (
    filename: string
  ) => Promise<SheetValues<ProductRow>["rows"] | Error>;
  "row:add": (row: Omit<ProductRow, "id">) => Promise<ProductRow | Error>;
  "row:update": (
    id: string,
    defaults: Omit<Partial<ProductRow>, "id">
  ) => Promise<ProductRow | Error>;
  "row:delete": (id: string) => Promise<ProductRow | Error>;
}

const api: Api = {
  "onedrive:read": () => ipcRenderer.invoke("onedrive:read"),
  "sheet:load": (filename) => ipcRenderer.invoke("sheet:load", filename),
  "row:add": (row) => ipcRenderer.invoke("row:add", row),
  "row:update": (id, defaults) =>
    ipcRenderer.invoke("row:update", id, defaults),
  "row:delete": (id) => ipcRenderer.invoke("row:delete", id),
};

contextBridge.exposeInMainWorld("api", api);
