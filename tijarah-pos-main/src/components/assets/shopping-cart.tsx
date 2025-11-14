import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function SvgComponent(props: SvgProps) {
  return (
    <Svg
      width={30}
      height={30}
      viewBox="0 0 30 30"
      fill="none"
      //@ts-ignore
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M2.5 2.5h2.175a2.313 2.313 0 012.3 2.5L5.938 17.45a3.494 3.494 0 003.487 3.788h13.313c1.8 0 3.375-1.476 3.512-3.263l.675-9.375c.15-2.075-1.425-3.763-3.512-3.763H7.274"
        stroke="#0E7440"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        opacity={0.4}
        d="M20.313 27.5a1.563 1.563 0 100-3.125 1.563 1.563 0 000 3.125zM10.313 27.5a1.563 1.563 0 100-3.125 1.563 1.563 0 000 3.125zM11.25 10h15"
        stroke="#0E7440"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
