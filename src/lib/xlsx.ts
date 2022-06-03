import fs from "fs";
import * as xlsx from "xlsx";
import { nanoid } from "nanoid";
import os from "os";
import path from "path";

export type Attributes = { [x: string]: any };

export type RowWithId<R> = R & { id: string };

export type Row = { [x: string]: any };

export type SheetMethods<R> = {
  add: (
    newEntry: Omit<R, "id">,
    check?: { fn: (row: R) => boolean; message: string }
  ) => R;
  search: (query: string, field: string) => RowWithId<R>[];
  delete: (id: string) => RowWithId<R>;
  update: (
    id: string,
    defaults: Omit<R, "id">,
    check?: { fn: (row: R) => boolean; message: string }
  ) => RowWithId<R>;
};

export type SheetValues<R> = {
  keys: string[];
  name: string;
  rows: RowWithId<R>[];
  attributes: Attributes;
};

export type SheetObject<R> = SheetMethods<R> & SheetValues<R>;

export default class OneDriveXlsxFileEditor<R extends Row> {
  constructor(filename: string, sheet?: { name: string; keys: string[] }) {
    filename = filename.trim();

    this.filename = this._hasExt(filename) ? filename : `${filename}.xlsx`;

    this.filepath = this._withOneDrivePath(this.filename);

    if (!fs.existsSync(this.filepath)) {
      const workbook = xlsx.utils.book_new();

      const worksheet = xlsx.utils.aoa_to_sheet([["id", ...sheet.keys]]);

      xlsx.utils.book_append_sheet(workbook, worksheet, sheet.name);

      const data = xlsx.write(workbook, { type: "buffer" });

      fs.writeFileSync(this.filepath, data);

      this.isNew = true;
    }

    const file = fs.readFileSync(this.filepath);

    this.file = xlsx.read(file);
  }

  private readonly _currentUser = os.userInfo().username;
  private readonly _oneDrivePath =
    process.env.ONEDRIVE_FOLDER ?? `C:\\Users\\${this._currentUser}\\OneDrive`;

  private _hasExt(filename: string) {
    filename = filename.trim();
    return /.xlsx$/i.test(filename);
  }

  private _withOneDrivePath(filename: string) {
    return `${this._oneDrivePath}${path.sep}${filename}`;
  }

  private _getAddMethod(sheet: SheetValues<R>) {
    return (
      newEntry: R,
      check?: { fn: (row: R) => boolean; message: string }
    ) => {
      if (check) {
        for (const row of sheet.rows) {
          if (check.fn(row)) {
            throw new Error(check.message);
          }
        }
      }

      const row: RowWithId<R> = {
        id: nanoid(),
        ...newEntry,
      };

      sheet.rows.push(row);

      this._tryWrite(sheet);

      return row;
    };
  }

  private _getDeleteMethod(sheet: SheetValues<R>) {
    return (id: string) => {
      let deletedRow: RowWithId<R> = null;

      for (let i = 0; i < sheet.rows.length; i++) {
        if (sheet.rows[i].id === id) {
          deletedRow = sheet.rows.splice(i, 1)[0];
          break;
        }
      }

      if (deletedRow) {
        this._tryWrite(sheet);
      }

      return deletedRow;
    };
  }

  private _getSearchMethod(sheet: SheetValues<R>) {
    return (name: string, field: string) => {
      const regex = new RegExp(name, "i");
      const results = sheet.rows.filter((row) => {
        if (Object.prototype.hasOwnProperty.call(row, field)) {
          return regex.test(row[field]);
        }
      });

      return results;
    };
  }

  private _getUpdateMethod(sheet: SheetValues<R>) {
    return (
      id: string,
      defaults: R,
      check?: { fn: (row: R) => boolean; message: string }
    ) => {
      let rowIndex: number = null;

      for (const row in sheet.rows) {
        if (Object.prototype.hasOwnProperty.call(sheet.rows, Number(row))) {
          const index = Number(row);

          if (check) {
            if (check.fn(sheet.rows[index])) {
              throw new Error(check.message);
            }
          }

          if (sheet.rows[index].id === id) {
            rowIndex = index;
          }
        }
      }

      if (rowIndex === null) return;

      sheet.rows[rowIndex] = {
        ...sheet.rows[rowIndex],
        ...defaults,
        id: sheet.rows[rowIndex].id,
      };

      this._tryWrite(sheet);

      return sheet.rows[rowIndex];
    };
  }

  private _parseSheet(name: string): SheetObject<R> {
    const sheet = this.file.Sheets[name];

    if (!sheet) {
      throw new Error(`La tabla ${name} no existe.`);
    }

    const keys: string[] = [];
    const rows: RowWithId<Row>[] = [];
    const attributes: Attributes = {};

    for (const entry in sheet) {
      if (Object.prototype.hasOwnProperty.call(sheet, entry)) {
        if (entry[0] === "!") {
          attributes[entry] = sheet[entry];
          continue;
        }

        if (entry.substring(1) === "1") {
          keys.push(sheet[entry].w);
          continue;
        }

        if (entry[0] === "A") {
          rows.push({ id: sheet[entry].w });
          continue;
        }

        const lastAddedRow = rows[rows.length - 1];
        const entryKey = keys[Object.keys(lastAddedRow).length];

        lastAddedRow[entryKey] = sheet[entry].v;
      }
    }

    const values: SheetValues<R> = {
      keys,
      name,
      attributes,
      rows: rows as RowWithId<R>[],
    };

    return {
      ...values,
      add: this._getAddMethod(values),
      delete: this._getDeleteMethod(values),
      search: this._getSearchMethod(values),
      update: this._getUpdateMethod(values),
    };
  }

  private _tryWrite(
    sheet?: Omit<SheetObject<R>, keyof SheetMethods<R>>,
    opts?: xlsx.WritingOptions
  ) {
    try {
      if (sheet) {
        const newSheet = sheet.rows.length
          ? xlsx.utils.json_to_sheet(sheet.rows)
          : xlsx.utils.aoa_to_sheet([sheet.keys]);

        this.file.Sheets[sheet.name] = newSheet;
      }

      const data = xlsx.write(this.file, { ...opts, type: "buffer" });

      fs.writeFileSync(this.filepath, data);
    } catch (err) {
      return err as Error;
    }
  }

  public readonly isNew: boolean = false;
  public readonly filepath: string;
  public file: xlsx.WorkBook;
  public sheets: SheetObject<R>[] = [];
  public filename: string;

  public addSheet(name: string, keys: string[]): Error | null {
    if (Object.prototype.hasOwnProperty.call(this.file.Sheets, name)) {
      throw new Error("Sheet already in book");
    }

    const worksheet = xlsx.utils.aoa_to_sheet([keys]);

    xlsx.utils.book_append_sheet(this.file, worksheet, name);

    return this._tryWrite();
  }

  public getSheet(name: string) {
    return this._parseSheet(name);
  }
}
