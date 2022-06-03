import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { IpcMain } from "electron";
import type { ProductRow } from "../types";
import XlsxFileEditor from "./xlsx";
import downloadsDir from "downloads-folder";

let globalFile: XlsxFileEditor<ProductRow> = null;

function withHandlers(main: IpcMain) {
  main.handle("onedrive:read", async () => {
    try {
      const files = await fs.readdir(process.env.OneDrive);

      const xlsxFiles = files.reduce((acc, file) => {
        return file.endsWith(".xlsx")
          ? [...acc, file.replace(".xlsx", "")]
          : acc;
      }, []);

      return xlsxFiles;
    } catch {
      return new Error("No se pudo leer OneDrive");
    }
  });

  main.handle("sheet:backup", async () => {
    if (!globalFile) return;

    function generateDest(number?: number) {
      const filePrefix = `copia${number ?? ""}-`;

      return path.join(downloadsDir(), `${filePrefix}${globalFile.filename}`);
    }

    try {
      let dest: string;
      let prefix: number = null;

      do {
        dest = generateDest(prefix);
        prefix++;
      } while (existsSync(dest));

      await fs.copyFile(globalFile.filepath, dest);
    } catch {
      return new Error("Error copiando el archivo");
    }
  });

  main.handle("sheet:load", (_, filename: string) => {
    try {
      if (!globalFile || globalFile.filename !== filename) {
        const keys: (keyof ProductRow)[] = ["nombre", "precio", "fecha"];

        globalFile = new XlsxFileEditor<ProductRow>(
          {
            dir: process.env.OneDrive,
            filename,
          },
          {
            name: "Productos",
            keys: keys,
          }
        );
      }
      return globalFile.getSheet("Productos").rows;
    } catch (error) {
      return error;
    }
  });

  main.handle("row:add", (_, row: Omit<ProductRow, "id">) => {
    try {
      const regex = new RegExp(`^${row.nombre}$`, "i");

      const newRow = globalFile.getSheet("Productos").add(row, {
        fn: (row) => regex.test(row.nombre),
        message: "Ya existe un producto con el mismo nombre",
      });

      return newRow;
    } catch (error) {
      return error;
    }
  });

  main.handle(
    "row:update",
    (_, id: string, defaults: Omit<ProductRow, "id">) => {
      try {
        const regex = new RegExp(`^${defaults.nombre}$`, "i");

        const updatedRow = globalFile
          .getSheet("Productos")
          .update(id, defaults, {
            fn: (row) => row.id !== id && regex.test(row.nombre),
            message: "Ya existe un producto con el mismo nombre",
          });

        return updatedRow;
      } catch (error) {
        return error;
      }
    }
  );

  main.handle("row:delete", (_, id: string) => {
    const deletedRow = globalFile.getSheet("Productos").delete(id);

    return deletedRow;
  });
}

export default withHandlers;
