import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function SvgComponent(props: SvgProps) {
  return (
    <Svg
      width={props.width || 51}
      height={props.height || 50}
      viewBox="0 0 61 60"
      fill="none"
      //@ts-ignore
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        opacity={0.4}
        d="M30.247 55.025c13.892 0 25.154-11.193 25.154-25s-11.262-25-25.154-25-25.154 11.193-25.154 25 11.262 25 25.154 25z"
        fill="#151B33"
      />
      <Path
        d="M30.247 17.35c-5.207 0-9.433 4.2-9.433 9.375 0 5.075 4 9.2 9.307 9.35h.453c5.081-.175 9.08-4.275 9.106-9.35 0-5.175-4.226-9.375-9.433-9.375zM47.302 48.4a25.178 25.178 0 01-17.055 6.625A25.178 25.178 0 0113.192 48.4c.604-2.275 2.239-4.35 4.629-5.95 6.867-4.55 18.035-4.55 24.852 0 2.415 1.6 4.025 3.675 4.629 5.95z"
        fill="#151B33"
      />
    </Svg>
  );
}

export default SvgComponent;
