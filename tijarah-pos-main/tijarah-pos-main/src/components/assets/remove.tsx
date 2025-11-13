import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function SvgComponent(props: SvgProps) {
  return (
    <Svg
      width={props.width || 36}
      height={props.width || 36}
      viewBox="0 0 36 36"
      fill="none"
      //@ts-ignore
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        opacity={0.4}
        d="M18 33c8.284 0 15-6.716 15-15 0-8.284-6.716-15-15-15C9.716 3 3 9.716 3 18c0 8.284 6.716 15 15 15z"
        fill="#F44837"
      />
      <Path
        d="M19.59 18l3.45-3.45a1.132 1.132 0 000-1.59 1.132 1.132 0 00-1.59 0L18 16.41l-3.45-3.45a1.132 1.132 0 00-1.59 0 1.132 1.132 0 000 1.59L16.41 18l-3.45 3.45a1.132 1.132 0 000 1.59c.225.225.51.33.795.33.285 0 .57-.105.795-.33L18 19.59l3.45 3.45c.225.225.51.33.795.33.285 0 .57-.105.795-.33a1.132 1.132 0 000-1.59L19.59 18z"
        fill="#F44837"
      />
    </Svg>
  );
}

export default SvgComponent;
