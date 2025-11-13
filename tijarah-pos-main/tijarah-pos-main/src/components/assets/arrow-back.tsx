import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgComponent = (props: SvgProps) => (
  <Svg
    width={40}
    height={40}
    fill="none"
    //@ts-ignore
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M15.95 31.367c-.317 0-.633-.117-.883-.367L4.95 20.884a1.257 1.257 0 0 1 0-1.767L15.067 9a1.257 1.257 0 0 1 1.766 0 1.257 1.257 0 0 1 0 1.767L7.6 20l9.233 9.233a1.257 1.257 0 0 1 0 1.767c-.233.25-.566.367-.883.367Z"
      fill="#272727"
    />
    <Path
      d="M34.167 21.25H6.117A1.26 1.26 0 0 1 4.867 20c0-.683.566-1.25 1.25-1.25h28.05c.683 0 1.25.567 1.25 1.25a1.26 1.26 0 0 1-1.25 1.25Z"
      fill="#272727"
    />
  </Svg>
);

export default SvgComponent;
