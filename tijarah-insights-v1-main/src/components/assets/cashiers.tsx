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
        opacity={0.4}
        d="M13.134 10.87a2.082 2.082 0 00-.353 0c-2.547-.08-4.57-2.03-4.57-4.43 0-2.45 2.12-4.44 4.752-4.44 2.621 0 4.75 1.99 4.75 4.44-.01 2.4-2.032 4.35-4.58 4.43z"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7.783 14.56c-2.59 1.62-2.59 4.26 0 5.87 2.943 1.84 7.77 1.84 10.712 0 2.59-1.62 2.59-4.26 0-5.87-2.932-1.83-7.758-1.83-10.712 0z"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
