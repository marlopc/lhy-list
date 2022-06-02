import React from "react";

function Close({ title, size = 48 }: { title: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={size}
      width={size}
      viewBox="0 0 48 48"
    >
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M12.45 37.65 10.35 35.55 21.9 24 10.35 12.45 12.45 10.35 24 21.9 35.55 10.35 37.65 12.45 26.1 24 37.65 35.55 35.55 37.65 24 26.1Z"
      />
    </svg>
  );
}

export default Close;
