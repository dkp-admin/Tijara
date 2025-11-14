import * as React from "react";
import Svg, { G, Path, SvgProps } from "react-native-svg";

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
      <G
        opacity={0.4}
        stroke="#151B33"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M14.45 17.36l-2.942-2.75M14.417 14.64l-2.943 2.75" />
      </G>
      <Path
        opacity={0.4}
        d="M9.549 2L5.675 5.63M16.376 2l3.874 3.63"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.262 7.85c0-1.85 1.059-2 2.375-2h16.65c1.317 0 2.377.15 2.377 2 0 2.15-1.06 2-2.376 2H4.638c-1.317 0-2.376.15-2.376-2z"
        stroke="#151B33"
        strokeWidth={1.5}
      />
      <Path
        d="M3.867 10l1.509 8.64C5.718 20.58 6.542 22 9.602 22h6.453c3.328 0 3.82-1.36 4.206-3.24L22.058 10"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default SvgComponent;
