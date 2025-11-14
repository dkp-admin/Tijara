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
        d="M12.984 10a2.98 2.98 0 01-2.983 2.983A2.98 2.98 0 017.018 10 2.98 2.98 0 0110 7.017 2.98 2.98 0 0112.984 10z"
        stroke={props.color || "#006C35"}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 16.892c2.941 0 5.683-1.734 7.591-4.734.75-1.175.75-3.15 0-4.325-1.908-3-4.65-4.733-7.591-4.733-2.942 0-5.683 1.733-7.592 4.733-.75 1.175-.75 3.15 0 4.325 1.909 3 4.65 4.734 7.592 4.734z"
        stroke={props.color || "#006C35"}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
