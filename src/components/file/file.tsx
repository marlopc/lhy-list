import React from "react";
import ExcelLogo from "../icons/excel-logo";
import "./file.css";

function File({ onClick, file }: { onClick: () => void; file: string }) {
  return (
    <li className="file-item">
      <button onClick={onClick}>
        <ExcelLogo size={20} />
        <p>{file}</p>
      </button>
    </li>
  );
}

export default File;
