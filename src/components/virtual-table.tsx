import React, { MouseEvent } from "react";
import type { ProductRow } from "../types";
import { useStore } from "../contexts/store";
import { useVirtual } from "react-virtual";
import { toast, CheckmarkIcon } from "react-hot-toast";

function VirtualTable({ rows }: { rows: ProductRow[] }) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const { setEdition, loadSheetFile } = useStore();

  const virtualizer = useVirtual({
    size: rows.length,
    parentRef,
    estimateSize: React.useCallback(() => 80, []),
    overscan: 5,
  });

  async function handleDelete(id: string) {
    const deleted = await window.api["row:delete"](id);

    if (deleted instanceof Error) {
      toast.error(deleted.message);
    } else {
      delete deleted.id;

      window.localStorage.setItem("last-deleted", JSON.stringify(deleted));

      toast(
        (t) => (
          <span className="toast-undo">
            <div className="toast-left">
              <div className="toast-message">
                <CheckmarkIcon />
                <p>Producto eliminado</p>
              </div>
              <div className="toast-name">
                <b>{deleted.nombre}</b>
              </div>
            </div>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await window.api["row:add"](deleted);
                loadSheetFile();
              }}
              className="toast-undo-button"
            >
              Revertir
            </button>
          </span>
        ),
        {
          style: {
            padding: 0,
          },
        }
      );
    }

    await loadSheetFile();
  }

  function handleClick(e: MouseEvent<HTMLUListElement>) {
    const { tagName } = e.target as HTMLElement;

    if (tagName !== "BUTTON") {
      return;
    }

    const { name } = e.target as HTMLButtonElement;

    const { dataset } = (e.target as HTMLButtonElement).closest("li");

    const { row } = dataset;

    if (name === "delete") {
      handleDelete(row);
    } else if (name === "edit") {
      setEdition(row);
    } else {
      return;
    }
  }

  return (
    <div ref={parentRef} className="table-list-parent">
      <ul
        className="table-list"
        style={{ height: `${virtualizer.totalSize}px` }}
        onClick={handleClick}
      >
        {virtualizer.virtualItems.map((row) => (
          <li
            key={row.index}
            ref={row.measureRef}
            className="table-listitem"
            data-row={rows[row.index].id}
          >
            <div className="table-listitem-values">
              <p>{rows[row.index].nombre}</p>
              <b>$ {rows[row.index].precio}</b>
            </div>
            <div className="table-listitem-actions">
              <button
                name="delete"
                type="button"
                className="table-listitem-action"
              >
                Eliminar
              </button>
              <button
                name="edit"
                type="button"
                className="table-listitem-action"
              >
                Editar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default VirtualTable;
