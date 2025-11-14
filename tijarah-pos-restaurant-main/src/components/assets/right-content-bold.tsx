import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgComponent = (props: SvgProps) => (
  <Svg
    width={10}
    height={16}
    fill="none"
    //@ts-ignore
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M9.288 8.005c0-.34-.124-.622-.39-.888L2.506.867a1.052 1.052 0 0 0-.78-.316c-.622 0-1.129.49-1.129 1.113 0 .307.133.589.357.813l5.678 5.52-5.678 5.537a1.133 1.133 0 0 0-.357.813c0 .623.507 1.12 1.13 1.12.306 0 .564-.107.78-.323l6.391-6.25c.274-.266.39-.548.39-.889Z"
      fill="#555"
    />
  </Svg>
);

export default SvgComponent;
