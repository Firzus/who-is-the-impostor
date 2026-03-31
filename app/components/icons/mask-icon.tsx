import type { SVGProps } from "react";

export function MaskIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Feather plume / ornament on top */}
      <path
        d="M16 3c-.5 2-1.8 3.5-3.5 4.5M16 3c.5 2 1.8 3.5 3.5 4.5M16 3c0 1.5-.3 3.2-1 4.8M16 3c0 1.5.3 3.2 1 4.8"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
        opacity={0.5}
      />
      {/* Mask body */}
      <path
        d="M4 15.5C4 11.5 7 8 16 8s12 3.5 12 7.5c0 3-2.2 5.5-5.5 5.5-2 0-3.5-.8-4.8-2.2-.7-.7-1.2-1.3-1.7-1.3s-1 .6-1.7 1.3C13 20.2 11.5 21 9.5 21 6.2 21 4 18.5 4 15.5Z"
        stroke="currentColor"
        strokeWidth={1.5}
        fill="currentColor"
        fillOpacity={0.08}
      />
      {/* Left eye cutout */}
      <path
        d="M8.5 14c0-1.4 1-2.5 2.5-2.5s2.5 1.1 2.5 2.5-1 2.5-2.5 2.5S8.5 15.4 8.5 14Z"
        stroke="currentColor"
        strokeWidth={1.3}
      />
      {/* Right eye cutout */}
      <path
        d="M18.5 14c0-1.4 1-2.5 2.5-2.5s2.5 1.1 2.5 2.5-1 2.5-2.5 2.5-2.5-1.1-2.5-2.5Z"
        stroke="currentColor"
        strokeWidth={1.3}
      />
      {/* Nose bridge arch */}
      <path
        d="M13.5 14.5c.8-1 1.5-1.5 2.5-1.5s1.7.5 2.5 1.5"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
        opacity={0.6}
      />
      {/* Brow decorative swirl – left */}
      <path
        d="M7 11c1.2-1.5 3-2.5 5-2.8"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
        opacity={0.4}
      />
      {/* Brow decorative swirl – right */}
      <path
        d="M25 11c-1.2-1.5-3-2.5-5-2.8"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
        opacity={0.4}
      />
      {/* Cheek ornament – left */}
      <path
        d="M6.5 17c.5.8 1.5 1.5 2.8 1.8"
        stroke="currentColor"
        strokeWidth={0.8}
        strokeLinecap="round"
        opacity={0.3}
      />
      {/* Cheek ornament – right */}
      <path
        d="M25.5 17c-.5.8-1.5 1.5-2.8 1.8"
        stroke="currentColor"
        strokeWidth={0.8}
        strokeLinecap="round"
        opacity={0.3}
      />
      {/* Stick / handle */}
      <path
        d="M26 19l3.5 6.5"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.7}
      />
      {/* Handle end ornament */}
      <circle
        cx="29.8"
        cy="26"
        r="1"
        fill="currentColor"
        fillOpacity={0.5}
      />
    </svg>
  );
}
