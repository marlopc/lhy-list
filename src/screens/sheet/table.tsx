import React from "react";
import { useFile } from "../../contexts/file";
import useFilteredSheet from "../../hooks/useFilteredSheet";
import { CloseIcon } from "../../components/icons";
import VirtualTable from "../../components/virtual-table";

function Table({ editRow }: { editRow: (id: string) => void }) {
  const { sheet } = useFile();

  const { clearInput, filtered, handleInput, search } = useFilteredSheet(sheet);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.code === "Escape") {
      clearInput();

      e.preventDefault();
    }
  }

  return (
    <div className="table-content">
      <header className="table-header">
        <input
          type="text"
          value={search}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Buscar"
          className="table-header-search"
          disabled={!sheet.length}
        />
        <button
          className={`table-header-clear ${search ? "show-clear" : ""}`}
          onClick={clearInput}
        >
          <CloseIcon title="Limpiar búsqueda" size={24} />
        </button>
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
