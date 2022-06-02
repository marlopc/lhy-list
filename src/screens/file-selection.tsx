import React, { FormEvent } from "react";
import { toast } from "react-hot-toast";
import File from "../components/file/file";
import { useStore } from "../contexts/store";

function FileSelection() {
  const [files, setFiles] = React.useState([]);
  const { selectFile } = useStore();

  const getFiles = React.useCallback(async () => {
    const response = await window.api["onedrive:read"]();

    if (response instanceof Error) {
      toast.error(response.message);
      return;
    }

    setFiles(response);

    return response;
  }, []);

  React.useEffect(() => {
    const keepOpenFile = window.localStorage.getItem("keep-open");

    if (keepOpenFile) {
      selectFile(keepOpenFile);
    } else {
      getFiles();
    }
  }, []);

  async function handleSelect(filename: string) {
    const files = await getFiles();

    if (files.indexOf(filename) === -1) {
      return;
    }

    selectFile(filename);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    // @ts-ignore
    const filename = e.target.filename.value;

    selectFile(filename);

    e.preventDefault();
  }

  return (
    <div className="selection-page">
      <div className="selection-container">
        <form onSubmit={handleSubmit} className="selection-new">
          <label htmlFor="filename">Crea un archivo</label>
          <input
            id="filename"
            name="filename"
            type="text"
            placeholder="Nombre ej: Productos"
          />
        </form>
        {files.length > 0 && (
          <div className="selection-pick">
            <p>
              O selecciona uno de tu <b>OneDrive</b>
            </p>
            <ul>
              {files.map((file) => (
                <File
                  key={file}
                  file={file}
                  onClick={() => handleSelect(file)}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileSelection;
