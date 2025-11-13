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
        d="M3.995 8.49C6.103-.17 19.833-.16 21.93 8.5c1.23 5.08-2.151 9.38-5.115 12.04-2.151 1.94-5.554 1.94-7.715 0-2.954-2.66-6.335-6.97-5.105-12.05z"
        stroke="#151B33"
        strokeWidth={1.5}
      />
      <Path
        opacity={0.4}
        d="M10.02 11.5l1.605 1.5 4.28-4"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
