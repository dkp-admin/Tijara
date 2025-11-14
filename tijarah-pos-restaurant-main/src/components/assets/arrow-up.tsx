import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function SvgComponent(props: SvgProps) {
  return (
    <Svg
      width={16}
      height={10}
      viewBox="0 0 16 10"
      fill="none"
      //@ts-ignore
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M8.026.986c-.34 0-.623.124-.889.39L.887 7.768a1.052 1.052 0 00-.316.78c0 .622.49 1.129 1.113 1.129.307 0 .59-.133.813-.357l5.52-5.678 5.537 5.678c.224.224.498.357.813.357.623 0 1.12-.507 1.12-1.13a1.06 1.06 0 00-.323-.78l-6.25-6.391c-.266-.274-.548-.39-.888-.39z"
        fill={props.color || "#006C35"}
      />
    </Svg>
  );
}

export default SvgComponent;
