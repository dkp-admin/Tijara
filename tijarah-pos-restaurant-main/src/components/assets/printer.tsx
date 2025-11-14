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
        d="M6.042 5.833h7.916V4.167c0-1.667-.625-2.5-2.5-2.5H8.542c-1.875 0-2.5.833-2.5 2.5v1.666z"
        stroke={props.color || "#006C35"}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.333 12.5v3.333c0 1.667-.833 2.5-2.5 2.5H9.167c-1.667 0-2.5-.833-2.5-2.5V12.5h6.666z"
        stroke={props.color || "#006C35"}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17.5 8.333V12.5c0 1.667-.833 2.5-2.5 2.5h-1.667v-2.5H6.667V15H5c-1.667 0-2.5-.833-2.5-2.5V8.333c0-1.666.833-2.5 2.5-2.5h10c1.667 0 2.5.834 2.5 2.5zM14.167 12.5H5.833"
        stroke={props.color || "#006C35"}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        opacity={0.4}
        d="M5.833 9.167h2.5"
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
