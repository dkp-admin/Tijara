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
        d="M5.472 22c2.364 0 4.28-1.79 4.28-4s-1.916-4-4.28-4c-2.364 0-4.28 1.79-4.28 4s1.916 4 4.28 4z"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.74 16.75v.93a.98.98 0 01-.525.86l-.813.46"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.262 15.2V9c0-3.5 2.14-5 5.35-5h10.701c3.21 0 5.35 1.5 5.35 5v6c0 3.5-2.14 5-5.35 5H9.217"
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
