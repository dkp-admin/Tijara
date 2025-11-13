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
      d="M15 28.438C7.588 28.438 1.562 22.413 1.562 15 1.563 7.588 7.588 1.562 15 1.562c7.413 0 13.438 6.026 13.438 13.438 0 7.413-6.025 13.438-13.438 13.438Zm0-25C8.625 3.438 3.437 8.625 3.437 15c0 6.375 5.188 11.563 11.563 11.563 6.375 0 11.563-5.188 11.563-11.563 0-6.375-5.188-11.563-11.563-11.563Z"
      fill={props.color || "#151B33"}
    />
  </Svg>
);

export default SvgComponent;
