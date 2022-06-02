import React from "react";

function BackArrow({ title, size = 48 }: { title: string; size?: number }) {
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
        d="M24 40 8 24 24 8 26.1 10.1 13.7 22.5H40V25.5H13.7L26.1 37.9Z"
      />
    </svg>
  );
}

export default BackArrow;
