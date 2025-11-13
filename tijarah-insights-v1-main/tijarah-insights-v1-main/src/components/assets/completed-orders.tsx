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
        d="M24.733 17.91c.022.75-.192 1.46-.577 2.07-.214.36-.503.69-.824.96-.739.64-1.713 1.03-2.793 1.06-1.563.03-2.943-.72-3.703-1.87a3.713 3.713 0 01-.663-2.05c-.032-1.26.567-2.4 1.53-3.15a4.492 4.492 0 012.654-.93c2.365-.05 4.323 1.7 4.377 3.91z"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.784 18.03l1.08.96 2.237-2.02"
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
        <Path d="M3.514 7.44l9.449 5.11 9.384-5.08M12.963 21.61v-9.07" />
        <Path d="M23.246 9.17v5.66c0 .05 0 .09-.01.14a4.37 4.37 0 00-2.783-.97c-1.006 0-1.936.33-2.675.88-.984.73-1.605 1.86-1.605 3.12 0 .75.225 1.46.62 2.06.097.16.215.31.343.45l-1.958 1.01c-1.22.64-3.21.64-4.43 0l-5.715-2.96c-1.294-.67-2.354-2.35-2.354-3.73V9.17c0-1.38 1.06-3.06 2.354-3.73l5.715-2.96c1.22-.64 3.21-.64 4.43 0l5.714 2.96c1.295.67 2.354 2.35 2.354 3.73z" />
      </G>
    </Svg>
  );
}

export default SvgComponent;
