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
        d="M14.825 8.725v6.1a3.508 3.508 0 01-3.508 3.509H5.175a3.514 3.514 0 01-3.508-3.509v-6.1a3.508 3.508 0 013.508-3.508h6.142a3.514 3.514 0 013.508 3.508z"
        stroke="#0E7440"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        opacity={0.34}
        d="M4.583 3.333V1.875M7.917 3.333V1.875M11.25 3.333V1.875"
        stroke="#0E7440"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.333 10.967a3.514 3.514 0 01-3.508 3.508V7.46a3.508 3.508 0 013.508 3.508z"
        stroke="#0E7440"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        opacity={0.34}
        d="M1.667 10h12.925"
        stroke="#0E7440"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
