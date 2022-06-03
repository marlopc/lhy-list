import React from "react";
import { toast } from "react-hot-toast";
import { useFile } from "../../contexts/file";
import * as deleteStorage from "../../lib/deleteStorage";
import * as keepOpenStorage from "../../lib/keepOpenStorage";

function withOneDrive(filename: string) {
  return `file:///${window.api["onedrive:dir"]}/${filename}.xlsx`;
}

function Settings() {
  const { filename, refetchFile } = useFile();

  const [recover, setRecover] = React.useState(deleteStorage.read(filename));
  const [keepOpen, setKeepOpen] = React.useState(
    keepOpenStorage.matches(filename)
  );

  async function handleRecover(id: string) {
    const values = deleteStorage.recover(id);

    const response = await window.api["row:add"](values);

    if (response instanceof Error) {
      toast.error(`Error al recuperar: ${response.message}`);

      deleteStorage.push({ id, ...values }, filename);
    } else {
      toast.success("Producto recuperado", {
        position: "bottom-left",
      });

      refetchFile();
    }

    setRecover(deleteStorage.read(filename));
  }

  function handleClearDeletedStorage() {
    deleteStorage.clear(filename);

    setRecover(deleteStorage.read(filename));
  }

  function handleKeepOpen(e: React.ChangeEvent<HTMLInputElement>) {
    setKeepOpen(e.target.checked);

    if (e.target.checked) {
      keepOpenStorage.set(filename);
    } else {
      keepOpenStorage.clear();
    }
  }

  async function handleSaveBackup() {
    const response = await window.api["sheet:backup"]();

    if (response instanceof Error) {
      toast.error(response.message);
    } else {
      toast.success("Archivo guardado en Descargas");
    }
  }

  React.useEffect(() => {
    toast.dismiss();
  }, []);

  return (
    <div className="page">
      <header className="page-header">
        <p>Opciones</p>
      </header>
      <div className="page-body settings-check">
        <div>
          <b>Recordar este archivo</b>
          <p>
            Al entrar a la aplicación no se requerirá que seleccione un archivo.
          </p>
        </div>
        <div>
          <input type="checkbox" checked={keepOpen} onChange={handleKeepOpen} />
        </div>
      </div>
      <div className="page-body settings-check">
        <div>
          <b>Guardar copia de seguridad</b>
          <p>Descarga una copia de seguridad de este archivo.</p>
        </div>
        <div>
          <button onClick={handleSaveBackup}>Guardar</button>
        </div>
      </div>
      <div className="page-body settings-recover">
        <div>
          <b>Recuperar eliminados</b>
          <button onClick={handleClearDeletedStorage}>Olvidar todos</button>
        </div>
        <div>
          {recover.length ? (
            <ul>
              {recover.map((row) => (
                <li key={row.value.id}>
                  <button onClick={() => handleRecover(row.value.id)}>
                    <b>{row.value.nombre}</b>
                    <p>{row.value.precio}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>Sin productos para recuperar</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
