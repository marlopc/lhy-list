import React from "react";
import { useFile } from "./contexts/file";
import FileSelection from "./screens/file-selection";
import Sheet from "./screens/sheet";
import { Toaster } from "react-hot-toast";

function App() {
  const { sheet } = useFile();

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <main>{sheet ? <Sheet /> : <FileSelection />}</main>
    </>
  );
}

export default App;
