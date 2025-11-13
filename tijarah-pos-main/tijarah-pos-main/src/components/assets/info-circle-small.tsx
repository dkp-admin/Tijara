import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function SvgComponent(props: SvgProps) {
  return (
    <Svg
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      //@ts-ignore
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        opacity={0.4}
        d="M7 12.834A5.833 5.833 0 107 1.167a5.833 5.833 0 000 11.667z"
        fill="#006C35"
      />
      <Path
        d="M7 8.021a.44.44 0 00.438-.437V4.667A.44.44 0 007 4.229a.44.44 0 00-.438.438v2.917c0 .239.199.437.438.437zM7.537 9.112a.674.674 0 00-.123-.193.674.674 0 00-.192-.122.583.583 0 00-.444 0 .674.674 0 00-.192.122.674.674 0 00-.123.193.58.58 0 00-.046.221.58.58 0 00.046.222c.03.076.07.134.123.193a.674.674 0 00.192.122.58.58 0 00.222.047.58.58 0 00.222-.047c.07-.03.134-.07.192-.122a.602.602 0 00.123-.193.58.58 0 00.046-.222.58.58 0 00-.046-.221z"
        fill="#006C35"
      />
    </Svg>
  );
}

export default SvgComponent;
