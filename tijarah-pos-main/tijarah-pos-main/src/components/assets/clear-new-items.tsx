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
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M11.159 14.467l-2.292-2.292M11.133 12.2L8.84 14.49" />
      </G>
      <Path
        opacity={0.4}
        d="M7.342 1.667L4.325 4.69M12.658 1.667l3.017 3.024"
        stroke="#0E7440"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M1.667 6.542c0-1.542.825-1.667 1.85-1.667h12.966c1.025 0 1.85.125 1.85 1.667 0 1.791-.825 1.666-1.85 1.666H3.517c-1.025 0-1.85.125-1.85-1.666z"
        stroke="#0E7440"
        strokeWidth={1.5}
      />
      <Path
        d="M2.917 8.334l1.175 7.2c.266 1.616.908 2.8 3.291 2.8h5.025c2.592 0 2.975-1.134 3.275-2.7l1.4-7.3"
        stroke="#0E7440"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default SvgComponent;
