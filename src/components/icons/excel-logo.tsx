import React from "react";

function ExcelLogo({ size = 30 }: { size?: number }) {
  return (
    <span
      className="excel-logo"
      role="img"
      style={{ height: `${size}px`, width: `${size}px`, display: "block" }}
    />
  );
}

export default ExcelLogo;
