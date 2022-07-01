import React from "react";
import { useFile } from "../../contexts/file";
import { toast } from "react-hot-toast";
import useFilteredSheet from "../../hooks/use-filtered-sheet";

function Form({ closeForm, rowId }: { closeForm: () => void; rowId?: string }) {
  const { sheet, refetchFile } = useFile();
  const { categories } = useFilteredSheet(sheet);

  const initialValues = React.useMemo(
    () => rowId && sheet.find((row) => row.id === rowId),
    [rowId, sheet]
  );

  const isUpdate = !!initialValues?.id;

  const [form, setForm] = React.useState<{
    nombre: string;
    categoria: string;
    precio: string;
  }>({
    nombre: initialValues?.nombre ?? "",
    categoria: initialValues?.categoria ?? "",
    precio: initialValues?.precio.toString() ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.nombre.trim() || !form.categoria.trim() || !form.precio) {
      return;
    }

    const values = {
      nombre: form.nombre.trim(),
      categoria: form.categoria.trim(),
      precio: Number(form.precio),
      modificado: new Date().toLocaleString(),
    };

    let success = false;

    if (isUpdate) {
      const response = await window.api["row:update"](initialValues.id, values);

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
      refetchFile();

      closeForm();
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value && !/^\d+\.?\d{0,2}$/.test(e.target.value)) {
      return;
    }

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setForm({
      ...form,
      categoria: e.target.value,
    });
  }

  const title = isUpdate ? (
    <>
      Editando <b>{initialValues.nombre}</b>
    </>
  ) : (
    "Nuevo Producto"
  );

  return (
    <div className="page">
      <header className="page-header">
        <p>{title}</p>
      </header>
      <form onSubmit={handleSubmit} className="page-body">
        <div className="form-input">
          <label htmlFor="nombre">Nombre</label>
          <input
            type="text"
            name="nombre"
            onChange={handleChange}
            value={form.nombre}
            placeholder="Ej: Acrílico azul"
          />
        </div>
        <div className="form-input-category">
          <div className="form-input">
            <label htmlFor="categoria">Categoría</label>
            <input
              type="text"
              name="categoria"
              onChange={handleChange}
              value={form.categoria}
              placeholder="Ej: Pinturas"
            />
          </div>
          <select onChange={handleCategoryChange} value={form.categoria}>
            <option
              value={categories.includes(form.categoria) ? "" : form.categoria}
            >
              Nuevo
            </option>
            {categories.map((category) => (
              <option value={category} key={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="form-input">
          <label htmlFor="precio">Precio</label>
          <input
            type="text"
            name="precio"
            onChange={handlePriceChange}
            value={form.precio}
            placeholder="Ej: ($)250"
          />
        </div>
        <button type="submit">{initialValues ? "Actualizar" : "Crear"}</button>
      </form>
    </div>
  );
}

export default Form;
