import React from "react";
import { toast } from "react-hot-toast";
import { useFile } from "../../contexts/file";
import storage from "../../lib/storage";

const { trash, session } = storage;

function Settings() {
  const { filename, refetchFile } = useFile();

  const [deletedFiles, setDeletedFiles] = React.useState(trash.list(filename));
  const [isCurrentSession, setIsCurrentSession] = React.useState(
    session.matches(filename)
  );

  async function handleRestore(id: string) {
    const values = trash.restore(id);

    const response = await window.api["row:add"](values);

    if (response instanceof Error) {
      toast.error(`Error al recuperar: ${response.message}`);

      trash.push({ id, ...values }, filename);
    } else {
      toast.success("Producto recuperado", {
        position: "bottom-left",
      });

      refetchFile();
    }

    setDeletedFiles(trash.list(filename));
  }

  function handleClearTrash() {
    trash.clear(filename);

    setDeletedFiles(trash.list(filename));
  }

  function handleToggleSession(e: React.ChangeEvent<HTMLInputElement>) {
    setIsCurrentSession(e.target.checked);

    if (e.target.checked) {
      session.set(filename);
    } else {
      session.clear();
    }
  }

  async function handleDownloadBackup() {
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
          <input
            type="checkbox"
            checked={isCurrentSession}
            onChange={handleToggleSession}
          />
        </div>
      </div>
      <div className="page-body settings-check">
        <div>
          <b>Guardar copia de seguridad</b>
          <p>Descarga una copia de seguridad de este archivo.</p>
        </div>
        <div>
          <button onClick={handleDownloadBackup}>Guardar</button>
        </div>
      </div>
      <div className="page-body settings-recover">
        <div>
          <b>Recuperar eliminados</b>
          <button onClick={handleClearTrash}>Olvidar todos</button>
        </div>
        <div>
          {deletedFiles.length ? (
            <ul>
              {deletedFiles.map((row) => (
                <li key={row.value.id}>
                  <button onClick={() => handleRestore(row.value.id)}>
                    <b>{row.value.nombre}</b>
                    <p>$ {row.value.precio}</p>
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
