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
        d="M18.313 20.5h-10.7c-3.211 0-5.351-1.5-5.351-5v-7c0-3.5 2.14-5 5.35-5h10.701c3.21 0 5.35 1.5 5.35 5v7c0 3.5-2.14 5-5.35 5z"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.963 15c1.773 0 3.21-1.343 3.21-3s-1.437-3-3.21-3-3.21 1.343-3.21 3 1.437 3 3.21 3z"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        opacity={0.4}
        d="M6.007 9.5v5M19.918 9.5v5"
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
