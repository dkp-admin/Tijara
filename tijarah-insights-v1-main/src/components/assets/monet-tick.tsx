import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function SvgComponent(props: SvgProps) {
  return (
    <Svg
      width={26}
      height={24}
      viewBox="0 0 26 24"
      fill="none"
      //@ts-ignore
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        opacity={0.4}
        d="M12.963 14.5c1.477 0 2.675-1.12 2.675-2.5s-1.198-2.5-2.675-2.5c-1.478 0-2.676 1.12-2.676 2.5s1.198 2.5 2.676 2.5zM19.918 9.5v5"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.752 18c0 .75-.224 1.46-.62 2.06C8.393 21.22 7.034 22 5.472 22c-1.562 0-2.921-.78-3.66-1.94-.396-.6-.62-1.31-.62-2.06 0-2.21 1.915-4 4.28-4s4.28 1.79 4.28 4z"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3.803 18l1.059.99 2.28-1.97"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.262 15.3V9c0-3.5 2.14-5 5.35-5h10.701c3.21 0 5.35 1.5 5.35 5v6c0 3.5-2.14 5-5.35 5H9.217"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
