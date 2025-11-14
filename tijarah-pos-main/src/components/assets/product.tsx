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
      <Rect width={40} height={40} rx={8} fill="#006C35" fillOpacity={0.1} />
      <Path
        d="M30 14v2.42C30 18 29 19 27.42 19H24v-6.99c0-1.11.91-2.02 2.02-2.01 1.09.01 2.09.45 2.81 1.17C29.55 11.9 30 12.9 30 14z"
        fill="#006C35"
      />
      <Path
        opacity={0.4}
        d="M10 15v14c0 .83.94 1.3 1.6.8l1.71-1.28c.4-.3.96-.26 1.32.1l1.66 1.67c.39.39 1.03.39 1.42 0l1.68-1.68c.35-.35.91-.39 1.3-.09l1.71 1.28c.66.49 1.6.02 1.6-.8V12c0-1.1.9-2 2-2H14c-3 0-4 1.79-4 4v1z"
        fill="#006C35"
      />
      <Path
        d="M20 20.26h-3c-.41 0-.75.34-.75.75s.34.75.75.75h3c.41 0 .75-.34.75-.75s-.34-.75-.75-.75zM17 17.76h3c.41 0 .75-.34.75-.75s-.34-.75-.75-.75h-3c-.41 0-.75.34-.75.75s.34.75.75.75zM13.97 16.01c-.56 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zM13.97 20.01c-.56 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"
        fill="#006C35"
      />
    </Svg>
  );
}

export default SvgComponent;
