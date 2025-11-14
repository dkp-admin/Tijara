import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

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
      <Path
        d="M26.187 27.955L12.045 13.813a1.26 1.26 0 010-1.768 1.259 1.259 0 011.768 0l14.142 14.142a1.259 1.259 0 010 1.768 1.26 1.26 0 01-1.768 0z"
        fill="#272727"
      />
      <Path
        d="M12.045 27.955a1.259 1.259 0 010-1.768l14.142-14.142a1.259 1.259 0 011.768 0 1.26 1.26 0 010 1.768L13.813 27.955a1.26 1.26 0 01-1.768 0z"
        fill="#272727"
      />
    </Svg>
  );
}

export default SvgComponent;
