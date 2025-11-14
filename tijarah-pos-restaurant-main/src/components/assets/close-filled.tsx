import * as React from "react";
import Svg, { SvgProps, G, Circle, Path, Defs } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */

const SvgComponent = (props: SvgProps) => (
  <Svg
    width={32}
    height={32}
    fill="none"
    //@ts-ignore
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <G filter="url(#a)">
      <Circle cx={16} cy={16} r={16} fill="#4B4B4B" fillOpacity={0.4} />
    </G>
    <Path
      d="M11.806 20.194 16 16m4.194-4.194L16 16m0 0-4.194-4.194M16 16l4.194 4.194"
      stroke="#fff"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Defs></Defs>
  </Svg>
);

export default SvgComponent;
