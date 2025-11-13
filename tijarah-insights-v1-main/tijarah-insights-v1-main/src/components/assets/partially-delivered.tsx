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
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M3.514 7.44l9.448 5.11 9.385-5.08M12.963 21.61v-9.07" />
      </G>
      <Path
        d="M10.747 2.48L5.033 5.44C3.738 6.11 2.68 7.79 2.68 9.17v5.65c0 1.38 1.06 3.06 2.354 3.73l5.714 2.97c1.22.63 3.221.63 4.441 0l5.715-2.97c1.294-.67 2.354-2.35 2.354-3.73V9.17c0-1.38-1.06-3.06-2.354-3.73l-5.715-2.97c-1.23-.63-3.22-.63-4.44.01z"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
