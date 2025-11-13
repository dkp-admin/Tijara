import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgComponent = (props: SvgProps) => (
  <Svg
    width={props.width || 30}
    height={props.height || 30}
    viewBox="0 0 30 30"
    fill="none"
    //@ts-ignore
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      opacity={0.4}
      d="M15 27.5c6.904 0 12.5-5.596 12.5-12.5S21.904 2.5 15 2.5 2.5 8.096 2.5 15 8.096 27.5 15 27.5Z"
      fill={props.color || "#151B33"}
    />
    <Path
      d="M13.225 19.475c-.25 0-.487-.1-.662-.275l-3.538-3.537a.943.943 0 0 1 0-1.325.943.943 0 0 1 1.325 0l2.875 2.874 6.425-6.425a.943.943 0 0 1 1.325 0 .943.943 0 0 1 0 1.325L13.887 19.2a.937.937 0 0 1-.662.275Z"
      fill={props.color || "#151B33"}
    />
  </Svg>
);

export default SvgComponent;
