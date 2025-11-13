import * as React from "react";
import Svg, { Circle, Path, SvgProps } from "react-native-svg";

const SvgComponent = (props: SvgProps) => (
  <Svg
    width={props.width || 40}
    height={props.height || 40}
    fill="none"
    //@ts-ignore
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Circle cx={20} cy={20} r={20} fill={"#52525C"} />
    <Path
      d="M25 10H15c-2.76 0-5 2.23-5 4.98v6.98c0 2.75 2.24 4.98 5 4.98h1.5c.27 0 .63.18.8.4l1.5 1.99c.66.88 1.74.88 2.4 0l1.5-1.99c.19-.25.49-.4.8-.4H25c2.76 0 5-2.23 5-4.98v-6.98c0-2.75-2.24-4.98-5-4.98Zm-1.34 12.53c-.15.15-.34.22-.53.22s-.38-.07-.53-.22l-.74-.74c-.58.38-1.28.61-2.03.61-2.04 0-3.7-1.66-3.7-3.7s1.65-3.7 3.7-3.7a3.698 3.698 0 0 1 3.09 5.73l.74.74c.29.29.29.77 0 1.06Z"
      fill="#fff"
    />
  </Svg>
);

export default SvgComponent;
