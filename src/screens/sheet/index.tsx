import React from "react";
import { useFile } from "../../contexts/file";
import Form from "./form";
import Settings from "./settings";
import Table from "./table";
import { BackArrowIcon, SettingsIcon, AddIcon } from "../../components/icons";
import * as keepOpenStorage from "../../lib/keepOpenStorage";

export type SheetScreen = "list" | "form" | "settings";

function Sheet() {
  const { unloadFile } = useFile();

  const [screen, setScreen] = React.useState<SheetScreen>("list");
  const [editingId, setEditingId] = React.useState<string | null>(null);

  function handleBack() {
    if (screen !== "list") {
      setEditingId(null);
      setScreen("list");
    } else {
      keepOpenStorage.clear();
      unloadFile();
    }
  }

  function editRow(id: string) {
    setEditingId(id);
    setScreen("form");
  }

  function getMainScreen() {
    switch (screen) {
      case "form": {
        return <Form closeForm={handleBack} rowId={editingId} />;
      }
      case "settings": {
        return <Settings />;
      }
      default: {
        return <Table editRow={editRow} />;
      }
    }
  }

  return (
    <div className="table-page">
      <div className="table-side">
        <button onClick={handleBack} className="table-side-button">
          <BackArrowIcon title="Atrás" size={28} />
        </button>
      </div>
      {getMainScreen()}
      <div className="table-side">
        {screen === "list" && (
          <>
            <button
              className="table-side-button"
              onClick={() => setScreen("settings")}
            >
              <SettingsIcon title="Opciones" size={26} />
            </button>
            <button
              className="table-side-button button-add"
              type="button"
              onClick={() => setScreen("form")}
            >
              <AddIcon title="Agregar" size={30} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Sheet;
