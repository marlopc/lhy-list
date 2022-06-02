import React from "react";

function Add({ title, size = 48 }: { title: string; size?: number }) {
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
        d="M22.5 38V25.5H10V22.5H22.5V10H25.5V22.5H38V25.5H25.5V38Z"
      />
    </svg>
  );
}

export default Add;
