import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function SvgComponent(props: SvgProps) {
  return (
    <Svg
      width={props.width || 60}
      height={props.height || 60}
      viewBox="0 0 60 60"
      fill="none"
      //@ts-ignore
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M45 31.875H15A1.889 1.889 0 0113.125 30c0-1.025.85-1.875 1.875-1.875h30c1.025 0 1.875.85 1.875 1.875s-.85 1.875-1.875 1.875z"
        fill={props.color || "#272727"}
      />
      <Path
        d="M30 46.375A1.389 1.389 0 0128.625 45V15c0-.749.626-1.375 1.375-1.375s1.375.626 1.375 1.375v30c0 .749-.626 1.375-1.375 1.375z"
        fill={props.color || "#272727"}
        stroke={props.color || "#272727"}
      />
    </Svg>
  );
}

export default SvgComponent;
