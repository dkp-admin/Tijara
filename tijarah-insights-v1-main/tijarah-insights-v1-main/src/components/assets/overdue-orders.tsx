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
        <Path d="M3.514 7.44l9.449 5.11 9.384-5.08M12.963 21.61v-9.07" />
        <Path d="M23.246 9.17v5.66c0 .05 0 .09-.01.14a4.37 4.37 0 00-2.783-.97c-1.006 0-1.936.33-2.675.88-.984.73-1.605 1.86-1.605 3.12 0 .75.225 1.46.62 2.06.097.16.215.31.343.45l-1.958 1.01c-1.22.64-3.21.64-4.43 0l-5.715-2.96c-1.294-.67-2.354-2.35-2.354-3.73V9.17c0-1.38 1.06-3.06 2.354-3.73l5.715-2.96c1.22-.64 3.21-.64 4.43 0l5.714 2.96c1.295.67 2.354 2.35 2.354 3.73z" />
      </G>
      <Path
        d="M24.733 18c0 1.2-.567 2.27-1.455 3-.76.62-1.744 1-2.825 1-2.365 0-4.28-1.79-4.28-4 0-1.26.62-2.39 1.605-3.12.738-.55 1.67-.88 2.675-.88 2.365 0 4.28 1.79 4.28 4z"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.72 16.75v1.5l-1.337.75"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
