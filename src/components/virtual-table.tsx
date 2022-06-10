import React from "react";
import type { ProductRow } from "../types";
import { useFile } from "../contexts/file";
import { useVirtual } from "react-virtual";
import { toast, CheckmarkIcon, Toast } from "react-hot-toast";
import storage from "../lib/storage";
import { priceToString } from "../lib/utils";

function VirtualTable({
  editRow,
  rows,
}: {
  editRow: (id: string) => void;
  rows: ProductRow[];
}) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const { filename, refetchFile } = useFile();

  const virtualizer = useVirtual({
    size: rows.length,
    estimateSize: React.useCallback(() => 100, []),
    parentRef,
  });

  async function handleDelete(id: string) {
    const deleted = await window.api["row:delete"](id);

    if (deleted instanceof Error) {
      toast.error(deleted.message);
    } else {
      storage.trash.push(deleted, filename);

      const handleUndo = async function handleUndo(t: Toast) {
        const recovered = storage.trash.restore(deleted.id);

        toast.dismiss(t.id);

        await window.api["row:add"](recovered);

        refetchFile();
      };

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
            <button onClick={() => handleUndo(t)} className="toast-undo-button">
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

    refetchFile();
  }

  function handleClick(e: React.MouseEvent<HTMLUListElement>) {
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
      editRow(row);
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
            style={{
              height: `${row.size}px`,
              transform: `translateY(${row.start}px)`,
            }}
          >
            <div className="table-listitem-inner">
              <div className="table-listitem-values">
                <p>{rows[row.index].nombre}</p>
                <b>$ {priceToString(rows[row.index].precio)}</b>
                <small>
                  Última actualización: {rows[row.index].modificado}
                </small>
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
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default VirtualTable;
