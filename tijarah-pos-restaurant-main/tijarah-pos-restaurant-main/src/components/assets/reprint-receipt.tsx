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
        opacity={0.4}
        d="M12.083 11.667h15.833V8.333c0-3.333-1.25-5-5-5h-5.833c-3.75 0-5 1.667-5 5v3.334z"
        stroke={props.color || "#006C35"}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M26.666 25v6.667c0 3.333-1.666 5-5 5h-3.333c-3.333 0-5-1.667-5-5V25h13.333z"
        stroke={props.color || "#006C35"}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M35 16.667V25c0 3.333-1.667 5-5 5h-3.333v-5H13.333v5H10c-3.333 0-5-1.667-5-5v-8.333c0-3.334 1.667-5 5-5h20c3.333 0 5 1.666 5 5zM28.334 25H11.667"
        stroke={props.color || "#006C35"}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        opacity={0.4}
        d="M11.667 18.333h5"
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
