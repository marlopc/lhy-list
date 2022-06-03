import Fuse from "fuse.js";
import React from "react";
import type { ProductRow } from "../types";

const options = {
  keys: ["nombre"],
};

function useFiltered(sheet: ProductRow[]) {
  const [filtered, setFiltered] = React.useState<ProductRow[]>([]);
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    setSearch(value);
  }

  function clearInput() {
    setSearch("");
  }

  React.useEffect(() => {
    const previous = search;

    const timeout = setTimeout(() => {
      if (previous !== search) return;

      setDebounced(previous);
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [search, sheet]);

  React.useEffect(() => {
    if (!debounced) return;

    const fuse = new Fuse(sheet, options);

    const results = fuse.search(debounced);

    setFiltered(results.map(({ item }) => item));
  }, [debounced]);

  return {
    search,
    handleInput,
    clearInput,
    filtered: debounced ? filtered : sheet,
  };
}

export default useFiltered;
