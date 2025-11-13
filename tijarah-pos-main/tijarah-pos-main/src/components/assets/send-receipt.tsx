import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function SvgComponent(props: SvgProps) {
  return (
    <Svg
      width={40}
      height={40}
      viewBox="0 0 40 40"
      fill="none"
      //@ts-ignore
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M28.333 34.167H11.666c-5 0-8.333-2.5-8.333-8.334V14.167c0-5.834 3.333-8.334 8.333-8.334h16.667c5 0 8.333 2.5 8.333 8.334v11.666c0 5.834-3.333 8.334-8.333 8.334z"
        stroke={props.color || "#006C35"}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        opacity={0.4}
        d="M28.334 15l-5.217 4.167c-1.717 1.366-4.533 1.366-6.25 0L11.667 15"
        stroke={props.color || "#006C35"}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
