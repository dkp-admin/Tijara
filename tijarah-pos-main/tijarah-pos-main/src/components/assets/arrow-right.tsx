import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgComponent = (props: SvgProps) => (
  <Svg
    width={30}
    height={30}
    fill="none"
    //@ts-ignore
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M25 15H5m20 0-7.5-7.5M25 15l-7.5 7.5"
      stroke="#fff"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SvgComponent;
