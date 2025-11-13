import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgComponent = (props: SvgProps) => (
  <Svg
    width={20}
    height={20}
    fill="none"
    //@ts-ignore
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M13.129 12.863c0-.168-.07-.3-.16-.484l-2.387-4.93c-.168-.347-.344-.476-.582-.476s-.414.129-.586.476l-2.383 4.93c-.09.187-.16.32-.16.484 0 .317.238.535.621.535l5.016-.003c.379 0 .62-.22.62-.532Z"
      fill={props.color}
    />
  </Svg>
);

export default SvgComponent;
