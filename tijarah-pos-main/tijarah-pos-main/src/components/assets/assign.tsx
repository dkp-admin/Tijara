import * as React from "react";
import Svg, { G, Path, SvgProps } from "react-native-svg";

function SvgComponent(props: SvgProps) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      //@ts-ignore
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G
        opacity={0.4}
        stroke="#0E7440"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M15.417 16.25h-3.334M13.75 17.917v-3.334" />
      </G>
      <Path
        opacity={0.4}
        d="M10.133 9.058a1.515 1.515 0 00-.275 0A3.683 3.683 0 016.3 5.367a3.69 3.69 0 013.692-3.7c2.041 0 3.7 1.658 3.7 3.7 0 2-1.584 3.625-3.559 3.691z"
        stroke="#0E7440"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.992 18.175c-1.517 0-3.025-.383-4.175-1.15-2.017-1.35-2.017-3.55 0-4.892 2.291-1.533 6.05-1.533 8.341 0"
        stroke="#0E7440"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
