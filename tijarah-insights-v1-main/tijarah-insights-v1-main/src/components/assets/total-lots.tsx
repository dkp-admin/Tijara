import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

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
        d="M23.588 6.76l-3.606 13.53C19.726 21.3 18.762 22 17.65 22H3.589c-1.616 0-2.772-1.48-2.29-2.93L5.804 5.55c.31-.94 1.241-1.59 2.29-1.59h13.162c1.016 0 1.862.58 2.215 1.38.203.43.246.92.117 1.42z"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeMiterlimit={10}
      />
      <Path
        opacity={0.4}
        d="M17.243 22h5.115c1.38 0 2.461-1.09 2.365-2.38L23.663 6"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.48 6.38l1.113-4.32M17.65 6.39l1.006-4.34"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        opacity={0.4}
        d="M8.361 12h8.56M7.291 16h8.56"
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
