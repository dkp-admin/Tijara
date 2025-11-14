import * as React from "react";
import Svg, { Path, G, SvgProps } from "react-native-svg";

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
        d="M3.514 7.44l9.449 5.11 9.384-5.08M12.963 21.61v-9.07"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M23.246 12.83V9.17c0-1.38-1.06-3.06-2.354-3.73l-5.714-2.96c-1.22-.64-3.21-.64-4.43 0L5.033 5.44C3.738 6.11 2.68 7.79 2.68 9.17v5.66c0 1.38 1.06 3.06 2.354 3.73l5.715 2.96c.61.32 1.412.48 2.215.48.802 0 1.605-.16 2.215-.48"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <G
        opacity={0.4}
        stroke="#151B33"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M20.667 21.4c1.891 0 3.424-1.433 3.424-3.2 0-1.767-1.533-3.2-3.424-3.2s-3.424 1.433-3.424 3.2c0 1.767 1.533 3.2 3.424 3.2zM24.733 22l-1.07-1" />
      </G>
    </Svg>
  );
}

export default SvgComponent;
