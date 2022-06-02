import React, { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { SheetValues } from "../lib/xlsx";
import { useStore } from "../contexts/store";
import type { ProductRow } from "../types";
import { toast } from "react-hot-toast";
import BackArrow from "../components/icons/back-arrow";
import Settings from "../components/icons/settings";
import Add from "../components/icons/add";
import Close from "../components/icons/close";
import VirtualTable from "../components/virtual-table";

type ProductRows = SheetValues<ProductRow>["rows"];

function useFiltered(sheet: ProductRows) {
  const [filtered, setFiltered] = React.useState<ProductRows>([]);
  const [search, setSearch] = React.useState("");

  function handleInput(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    setSearch(value);
  }

  function clearInput() {
    setSearch("");
  }

  React.useEffect(() => {
    const previous = search;

    const timeout = setTimeout(() => {
      if (previous === search) {
        const regex = new RegExp(previous, "i");

        setFiltered(sheet.filter((row) => regex.test(row.nombre)));
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [search, sheet]);

  return {
    search,
    handleInput,
    clearInput,
    filtered: search ? filtered : sheet,
  };
}

function Form() {
  const { sheet, editing, setEdition, loadSheetFile } = useStore();

  const { nombre, precio, id } = sheet.find((row) => row.id === editing) ?? {};

  const [form, setForm] = React.useState<{ nombre: string; precio: string }>({
    nombre: nombre ?? "",
    precio: precio?.toString() ?? "",
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const isUpdate = !!id;

    if (!form.nombre.trim() || !form.precio) {
      return;
    }

    const values = {
      nombre: form.nombre.trim(),
      precio: Number(form.precio),
      fecha: new Date().toLocaleDateString(),
    };

    let success = false;

    if (isUpdate) {
      const response = await window.api["row:update"](id, values);

      if (response instanceof Error) {
        toast.error(response.message);
      } else {
        toast.success("Producto actualizado");
        success = true;
      }
    } else {
      const response = await window.api["row:add"](values);

      if (response instanceof Error) {
        toast.error(response.message);
      } else {
        toast.success("Producto creado");
        success = true;
      }
    }

    if (success) {
      setEdition(false);
      await loadSheetFile();
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handlePriceChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.value && !/^\d+\.?\d{0,2}$/.test(e.target.value)) {
      return;
    }

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  return (
    <div className="table-form">
      <header className="table-form-header">
        <p>
          {id ? (
            <>
              Editando <b>{nombre}</b>
            </>
          ) : (
            <>Nuevo producto</>
          )}
        </p>
      </header>
      <form onSubmit={handleSubmit} className="table-form-form">
        <div className="table-form-input">
          <label htmlFor="nombre">Nombre</label>
          <input
            type="text"
            name="nombre"
            onChange={handleChange}
            value={form.nombre}
            placeholder="Ej: Acrílico azul"
          />
        </div>
        <div className="table-form-input">
          <label htmlFor="precio">Precio</label>
          <input
            type="text"
            name="precio"
            onChange={handlePriceChange}
            value={form.precio}
            placeholder="Ej: ($)250"
          />
        </div>
        <button type="submit">{id ? "Actualizar" : "Crear"}</button>
      </form>
    </div>
  );
}

function Table() {
  const { sheet, editing, setEdition, reset, file } = useStore();

  const { clearInput, handleInput, filtered, search } = useFiltered(sheet);

  function handleBack() {
    if (!editing) {
      reset();
    } else {
      setEdition(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.code === "Escape") {
      clearInput();

      e.preventDefault();
    }
  }

  React.useEffect(() => {
    toast.success(`Archivo cargado: ${file}`, {
      position: "bottom-center",
    });
  }, []);

  return (
    <div className="table-page">
      <div className="table-side">
        <button onClick={handleBack} className="table-side-button">
          <BackArrow title="Atrás" size={28} />
        </button>
      </div>
      {editing ? (
        <Form />
      ) : (
        <div className="table-content">
          <header className="table-header">
            <input
              type="text"
              value={search}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Buscar"
              className="table-header-search"
            />
            <button
              className={`table-header-clear ${search ? "show-clear" : ""}`}
              onClick={clearInput}
            >
              <Close title="Limpiar búsqueda" size={24} />
            </button>
          </header>
          <div className="table-body">
            {filtered.length ? (
              <VirtualTable rows={filtered} />
            ) : (
              <b>{sheet.length ? "Sin resultados" : "Tabla vacía"}</b>
            )}
          </div>
        </div>
      )}
      <div className="table-side">
        <button className="table-side-button">
          <Settings title="Opciones" size={26} />
        </button>
        {!editing && (
          <button
            className="table-side-button button-add"
            type="button"
            onClick={() => setEdition(true)}
          >
            <Add title="Agregar" size={30} />
          </button>
        )}
      </div>
    </div>
  );
}

export default Table;
