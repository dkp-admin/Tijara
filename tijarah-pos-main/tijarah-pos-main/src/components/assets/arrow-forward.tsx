import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function SvgComponent(props: SvgProps) {
  return (
    <Svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      //@ts-ignore
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M9 3L7.942 4.058l4.185 4.192H3v1.5h9.127l-4.185 4.193L9 15l6-6-6-6z"
        fill={props.color || "#006C35"}
      />
    </Svg>
  );
}

export default SvgComponent;
