import type { ProductRow } from "../types";

export type LabeledRow = {
  filename: string;
  value: ProductRow;
};

export type DeleteStorage = LabeledRow[];

const storageName = "deleted-rows";

function getStorage() {
  let storage = window.localStorage.getItem(storageName);

  try {
    storage = JSON.parse(storage);
  } catch {
    return [] as DeleteStorage;
  }

  return (Array.isArray(storage) ? storage : []) as DeleteStorage;
}

function saveStorage(storage: DeleteStorage) {
  window.localStorage.setItem(storageName, JSON.stringify(storage));
}

function push(row: ProductRow, filename: string) {
  const storage = getStorage();

  storage.push({ filename, value: row });

  saveStorage(storage);
}

function recover(id: string) {
  const storage = getStorage();

  const [row, filteredStorage] = storage.reduce<
    [Omit<ProductRow, "id"> | null, LabeledRow[]]
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

  saveStorage(filteredStorage);

  return row;
}

function clear(filename?: string) {
  let newStorage: LabeledRow[] = [];

  if (filename) {
    const prevStorage = getStorage();

    newStorage = prevStorage.filter((row) => row.filename !== filename);
  }

  saveStorage(newStorage);
}

function read(filename: string) {
  const storage = getStorage();

  return storage.filter((entry) => entry.filename === filename);
}

export { clear, read, recover, push };
