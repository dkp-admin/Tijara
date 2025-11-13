import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function SvgComponent(props: SvgProps) {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      //@ts-ignore
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        opacity={0.4}
        d="M8 14.666A6.667 6.667 0 108 1.333a6.667 6.667 0 000 13.333z"
        fill="#006C35"
        {...props}
      />
      <Path
        d="M8 9.166c.273 0 .5-.226.5-.5V5.333c0-.273-.227-.5-.5-.5s-.5.227-.5.5v3.333c0 .274.227.5.5.5zM8.613 10.413a.77.77 0 00-.14-.22.771.771 0 00-.22-.14.667.667 0 00-.506 0 .771.771 0 00-.22.14.77.77 0 00-.14.22.664.664 0 00-.054.253c0 .087.02.174.054.254.033.086.08.153.14.22.066.06.14.106.22.14.08.033.166.053.253.053s.173-.02.253-.053a.769.769 0 00.22-.14.688.688 0 00.14-.22.664.664 0 00.054-.254.664.664 0 00-.054-.253z"
        fill="#006C35"
        {...props}
      />
    </Svg>
  );
}

export default SvgComponent;
