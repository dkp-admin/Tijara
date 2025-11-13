import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function SvgComponent(props: SvgProps) {
  return (
    <Svg
      width={36}
      height={36}
      viewBox="0 0 36 36"
      fill="none"
      //@ts-ignore
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        opacity={0.4}
        d="M18 33c8.284 0 15-6.716 15-15 0-8.284-6.716-15-15-15C9.716 3 3 9.716 3 18c0 8.284 6.716 15 15 15z"
        fill={props.color || "#6B7280"}
      />
      <Path
        d="M24 16.875h-4.875V12c0-.615-.51-1.125-1.125-1.125s-1.125.51-1.125 1.125v4.875H12c-.615 0-1.125.51-1.125 1.125s.51 1.125 1.125 1.125h4.875V24c0 .615.51 1.125 1.125 1.125s1.125-.51 1.125-1.125v-4.875H24c.615 0 1.125-.51 1.125-1.125s-.51-1.125-1.125-1.125z"
        fill={props.color || "#6B7280"}
      />
    </Svg>
  );
}

export default SvgComponent;
