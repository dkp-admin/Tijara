import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function SvgComponent(props: SvgProps) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      //@ts-ignore
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        opacity={0.4}
        d="M6.041 5.833h7.917V4.167c0-1.667-.625-2.5-2.5-2.5H8.54c-1.875 0-2.5.833-2.5 2.5v1.666z"
        stroke={props.color || "#006C35"}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.808 12.5h2.525v3.333c0 1.667-.833 2.5-2.5 2.5H9.166c-1.408 0-2.225-.591-2.441-1.783M5 15c-1.667 0-2.5-.833-2.5-2.5V8.333c0-1.666.833-2.5 2.5-2.5h8.825"
        stroke={props.color || "#006C35"}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16.642 6.267c.575.4.859 1.091.859 2.066V12.5c0 1.667-.834 2.5-2.5 2.5h-1.667v-2.5h-2.5M14.166 12.5h-1.008"
        stroke={props.color || "#006C35"}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        opacity={0.4}
        d="M5.834 9.167h1.667"
        stroke={props.color || "#006C35"}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.333 1.667L1.666 18.333"
        stroke={props.color || "#006C35"}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
