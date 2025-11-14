import * as React from "react";
import Svg, { Ellipse, Path, SvgProps } from "react-native-svg";

function SvgComponent(props: SvgProps) {
  return (
    <Svg
      width={14}
      height={18}
      viewBox="0 0 14 18"
      fill="none"
      //@ts-ignore
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Ellipse cx={7.07001} cy={6.49902} rx={6.90357} ry={6.5} fill="#006C35" />
      <Ellipse cx={7.07003} cy={6.49902} rx={3.71731} ry={3.5} fill="#fff" />
      <Path
        d="M4.215 9.999l4.103 1.035-1.924 6.762-1.777-1.484-2.327.448L4.215 10z"
        fill="#006C35"
      />
      <Path
        d="M10.642 9.999L6.54 11.034l1.924 6.762 1.777-1.484 2.326.448L10.642 10z"
        fill="#006C35"
      />
    </Svg>
  );
}

export default SvgComponent;
