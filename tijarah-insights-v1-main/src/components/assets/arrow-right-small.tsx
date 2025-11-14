import * as React from "react";
import Svg, { G, Path, Defs, ClipPath, SvgProps } from "react-native-svg";

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
      <G clipPath="url(#clip0_8094_37660)">
        <Path
          d="M9.879 9L6.167 5.288l1.06-1.061L12 9l-4.773 4.773-1.06-1.06L9.879 9z"
          fill="#0E7440"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_8094_37660">
          <Path fill="#fff" transform="rotate(-90 9 9)" d="M0 0H18V18H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
