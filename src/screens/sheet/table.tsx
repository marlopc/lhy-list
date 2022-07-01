import React from "react";
import { useFile } from "../../contexts/file";
import useFilteredSheet from "../../hooks/use-filtered-sheet";
import { CloseIcon } from "../../components/icons";
import VirtualTable from "../../components/virtual-table";

function Table({ editRow }: { editRow: (id: string) => void }) {
  const { sheet } = useFile();

  const {
    clearInput,
    filtered,
    handleInput,
    search,
    categories,
    activeCategory,
    setActiveCategory,
  } = useFilteredSheet(sheet);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.code === "Escape") {
      clearInput();

      e.preventDefault();
    }
  }

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setActiveCategory(e.target.value);
  }

  return (
    <div className="table-content">
      <header className="table-header">
        <div className="table-header-search">
          <input
            type="text"
            value={search}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Buscar"
            className="table-header-input"
            disabled={!sheet.length}
          />
          <button
            className={`table-header-clear ${search ? "show-clear" : ""}`}
            onClick={clearInput}
          >
            <CloseIcon title="Limpiar búsqueda" size={24} />
          </button>
        </div>
        <select value={activeCategory} onChange={handleSelectChange}>
          <option value="all">Todos</option>
          {categories.map((category) => (
            <option value={category} key={category}>
              {category}
            </option>
          ))}
        </select>
      </header>
      <div className="table-body">
        {filtered.length ? (
          <VirtualTable rows={filtered} editRow={editRow} />
        ) : (
          <b>{sheet.length ? "Sin resultados" : "Tabla vacía"}</b>
        )}
      </div>
    </div>
  );
}

export default Table;
