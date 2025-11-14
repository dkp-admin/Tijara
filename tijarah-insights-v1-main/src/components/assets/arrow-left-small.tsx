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
      <G clipPath="url(#clip0_8094_37664)">
        <Path
          d="M8.121 9l3.713-3.712-1.061-1.061L6 9l4.773 4.773 1.06-1.06L8.122 9z"
          fill="#0E7440"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_8094_37664">
          <Path
            fill="#fff"
            transform="matrix(0 -1 -1 0 18 18)"
            d="M0 0H18V18H0z"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
