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
      opacity={0.4}
      d="M22.5 23.575h-.95c-1 0-1.95.387-2.65 1.087l-2.137 2.113a2.528 2.528 0 0 1-3.538 0l-2.137-2.113a3.756 3.756 0 0 0-2.65-1.087H7.5c-2.075 0-3.75-1.662-3.75-3.712V6.225c0-2.05 1.675-3.713 3.75-3.713h15c2.075 0 3.75 1.663 3.75 3.713v13.637c0 2.038-1.675 3.713-3.75 3.713Z"
      fill="#151B33"
    />
    <Path
      d="M15 13.012a2.912 2.912 0 1 0 0-5.824 2.912 2.912 0 0 0 0 5.824ZM18.35 18.825c1.012 0 1.6-1.125 1.037-1.962-.85-1.263-2.5-2.113-4.387-2.113-1.887 0-3.537.85-4.387 2.113-.563.837.024 1.962 1.037 1.962h6.7Z"
      fill="#272727"
    />
  </Svg>
);

export default SvgComponent;
