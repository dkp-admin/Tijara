import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgComponent = (props: SvgProps) => (
  <Svg
    width={props.width || 15}
    height={9}
    viewBox="0 0 15 9"
    fill="none"
    //@ts-ignore
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M7.205 8.118a.743.743 0 0 0 .548-.24l6.441-6.575a.772.772 0 0 0 .216-.548.743.743 0 0 0-.755-.755.788.788 0 0 0-.54.216l-5.91 6.043L1.295.216A.773.773 0 0 0 .755 0 .743.743 0 0 0 0 .755c0 .216.075.399.224.548l6.433 6.574c.158.158.34.241.548.241Z"
      fill={props.color || "#3C3C43"}
      fillOpacity={props.opacity || 0.3}
    />
  </Svg>
);

export default SvgComponent;
