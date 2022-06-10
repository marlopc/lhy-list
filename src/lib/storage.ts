import type { ProductRow } from "../types";

export type LabeledRow = {
  filename: string;
  value: ProductRow;
};

export type RowsMemo = LabeledRow[];

class TrashStorage {
  readonly key = "trash-storage";

  private _getStorage(): RowsMemo {
    let storage = window.localStorage.getItem(this.key);

    try {
      storage = JSON.parse(storage);
    } catch {
      return [];
    }

    return Array.isArray(storage) ? storage : [];
  }

  private _saveStorage(storage: RowsMemo) {
    window.localStorage.setItem(this.key, JSON.stringify(storage));
  }

  push(row: ProductRow, filename: string) {
    const storage = this._getStorage();

    storage.push({ filename, value: row });

    this._saveStorage(storage);
  }

  restore(id: string) {
    const storage = this._getStorage();

    const [row, filteredStorage] = storage.reduce<
      [Omit<ProductRow, "id"> | null, RowsMemo]
    >(
      (acc, row) => {
        if (row.value.id === id) {
          delete row.value.id;
          acc[0] = row.value;
        } else {
          acc[1].push(row);
        }

        return acc;
      },
      [null, []]
    );

    this._saveStorage(filteredStorage);

    return row;
  }

  clear(filename?: string) {
    let newStorage: LabeledRow[] = [];

    if (filename) {
      const prevStorage = this._getStorage();

      newStorage = prevStorage.filter((row) => row.filename !== filename);
    }

    this._saveStorage(newStorage);
  }

  list(filename: string) {
    const storage = this._getStorage();

    return storage.filter((entry) => entry.filename === filename);
  }
}

class SessionStorage {
  readonly key = "session-storage";

  get() {
    return localStorage.getItem(this.key);
  }

  set(filename: string) {
    return localStorage.setItem(this.key, filename);
  }

  clear() {
    localStorage.removeItem(this.key);
  }

  matches(filename: string) {
    return this.get() === filename;
  }
}

const storage = {
  trash: new TrashStorage(),
  session: new SessionStorage(),
};

export default storage;
