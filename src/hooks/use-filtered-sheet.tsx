import Fuse from "fuse.js";
import React from "react";
import type { ProductRow } from "../types";

const options = {
  keys: ["nombre"],
};

function filterSheetByCategory(sheet: ProductRow[], category: string) {
  if (!category || category === "all") {
    return sheet.sort((a, b) => {
      const categoryResult = a.categoria.localeCompare(b.categoria, "es");

      if (categoryResult) {
        return categoryResult;
      }

      const nameResult = a.nombre.localeCompare(b.nombre, "es");

      if (nameResult) {
        return nameResult;
      }

      return 0;
    });
  }

  return sheet.filter((row) => {
    return category === "all" || row.categoria === category;
  });
}

function useFiltered(sheet: ProductRow[]) {
  const [filtered, setFiltered] = React.useState<ProductRow[]>([]);
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState("all");

  const categories = React.useMemo(() => {
    return sheet.reduce(
      (acc, row) =>
        acc.includes(row.categoria) ? acc : [...acc, row.categoria],
      []
    );
  }, [sheet]);

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

    let initialSheet;

    if (activeCategory) {
      initialSheet = filterSheetByCategory(sheet, activeCategory);
    }

    const fuse = new Fuse(initialSheet, options);

    const results = fuse.search(debounced);

    setFiltered(results.map(({ item }) => item));
  }, [debounced, activeCategory, sheet]);

  return {
    search,
    handleInput,
    clearInput,
    filtered: debounced
      ? filtered
      : filterSheetByCategory(sheet, activeCategory),
    categories,
    activeCategory,
    setActiveCategory,
  };
}

export default useFiltered;
