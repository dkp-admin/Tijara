import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function SvgComponent(props: SvgProps) {
  return (
    <Svg
      width={30}
      height={31}
      viewBox="0 0 30 31"
      fill="none"
      //@ts-ignore
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M3.75 9.25h22.5M3.75 15.5h22.5M3.75 21.75h22.5"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default SvgComponent;
