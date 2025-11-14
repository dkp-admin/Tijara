import * as React from "react";
import Svg, { Rect, Path, SvgProps } from "react-native-svg";

function SvgComponent(props: SvgProps) {
  return (
    <Svg
      width={40}
      height={40}
      viewBox="0 0 40 40"
      fill="none"
      //@ts-ignore
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Rect
        x={40}
        y={40}
        width={40}
        height={40}
        rx={8}
        transform="rotate(-180 40 40)"
        fill={props.color || "#006C35"}
        fillOpacity={0.2}
      />
      <Path
        opacity={0.4}
        d="M13.887 12.45l11.276-3.762C30.225 7 32.974 9.761 31.3 14.825L27.538 26.1c-2.526 7.587-6.675 7.587-9.2 0l-1.113-3.35-3.35-1.113c-7.575-2.512-7.575-6.65.012-9.187z"
        fill={props.color || "#0E7440"}
      />
      <Path
        d="M20.15 19.538l4.763-4.776-4.763 4.776zM20.15 20.475a.927.927 0 01-.662-.275.943.943 0 010-1.325l4.75-4.775a.943.943 0 011.325 0 .943.943 0 010 1.325l-4.75 4.775a.982.982 0 01-.663.275z"
        fill={props.color || "#0E7440"}
      />
    </Svg>
  );
}

export default SvgComponent;
