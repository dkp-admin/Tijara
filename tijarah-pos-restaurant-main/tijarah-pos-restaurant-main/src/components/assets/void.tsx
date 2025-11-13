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
        d="M10 18.333c4.6 0 8.333-3.733 8.333-8.333S14.6 1.667 10 1.667A8.336 8.336 0 001.667 10c0 4.6 3.733 8.333 8.333 8.333z"
        stroke="#0E7440"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        opacity={0.34}
        d="M15.75 4.167L4.083 15.832"
        stroke="#0E7440"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
