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
        d="M15.574 19.05l1.626 1.52 3.253-3.04M13.134 10.87a2.082 2.082 0 00-.353 0c-2.547-.08-4.57-2.03-4.57-4.43-.01-2.45 2.12-4.44 4.74-4.44 2.623 0 4.752 1.99 4.752 4.44 0 2.4-2.033 4.35-4.57 4.43z"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.952 21.81c-1.948 0-3.885-.46-5.361-1.38-2.59-1.62-2.59-4.26 0-5.87 2.942-1.84 7.769-1.84 10.711 0"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
