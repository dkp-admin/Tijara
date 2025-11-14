import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

const SvgComponent = (props: SvgProps) => (
  <Svg
    width={props.width || 14}
    height={props.height || 14}
    fill="none"
    //@ts-ignore
    xmlns="http://www.w3.org/2000/svg"
  >
    <Path
      opacity={0.4}
      d="M7 12.834A5.833 5.833 0 1 0 7 1.167a5.833 5.833 0 0 0 0 11.667Z"
      fill={props.color || "#0E7440"}
    />
    <Path
      d="M7 8.021a.44.44 0 0 0 .438-.437V4.667A.44.44 0 0 0 7 4.229a.44.44 0 0 0-.438.438v2.917c0 .239.199.437.438.437ZM7.537 9.112a.673.673 0 0 0-.123-.193.674.674 0 0 0-.192-.122.583.583 0 0 0-.444 0 .674.674 0 0 0-.192.122.674.674 0 0 0-.123.193.58.58 0 0 0-.046.221.58.58 0 0 0 .046.222c.03.076.07.134.123.193a.673.673 0 0 0 .192.122.58.58 0 0 0 .222.047.58.58 0 0 0 .222-.047c.07-.03.134-.07.192-.122a.602.602 0 0 0 .123-.193.58.58 0 0 0 .046-.222.58.58 0 0 0-.046-.221Z"
      fill={props.color || "#0E7440"}
    />
  </Svg>
);

export default SvgComponent;
