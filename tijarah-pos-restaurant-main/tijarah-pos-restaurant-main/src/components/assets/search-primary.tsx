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
      d="M13.75 25C19.963 25 25 19.963 25 13.75S19.963 2.5 13.75 2.5 2.5 7.537 2.5 13.75 7.537 25 13.75 25Z"
      stroke={props.color || "#006C35"}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      opacity={0.4}
      d="M23.662 25.862c.663 2 2.175 2.2 3.338.45 1.062-1.6.362-2.913-1.563-2.913-1.425-.012-2.225 1.1-1.775 2.463Z"
      stroke={props.color || "#006C35"}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SvgComponent;
