import React from "react";
import { useStore } from "./contexts/store";
import FileSelection from "./screens/file-selection";
import Table from "./screens/table";
import { Toaster } from "react-hot-toast";

function App() {
  const { screen } = useStore();

  function getScreen() {
    switch (screen) {
      case "table": {
        return <Table />;
      }

      case "files": {
        return <FileSelection />;
      }

      default: {
        return null;
      }
    }
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <main>{getScreen()}</main>
    </>
  );
}

export default App;
