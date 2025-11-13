import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function SvgComponent(props: SvgProps) {
  return (
    <Svg
      width={24}
      height={25}
      viewBox="0 0 24 25"
      fill="none"
      //@ts-ignore
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M12 23.25c-5.93 0-10.75-4.82-10.75-10.75S6.07 1.75 12 1.75 22.75 6.57 22.75 12.5 17.93 23.25 12 23.25zm0-20c-5.1 0-9.25 4.15-9.25 9.25S6.9 21.75 12 21.75s9.25-4.15 9.25-9.25S17.1 3.25 12 3.25z"
        fill="#006C35"
      />
      <Path d="M12 18.5a6 6 0 100-12 6 6 0 000 12z" fill="#006C35" />
      <Path
        opacity={0.4}
        d="M12 22.5c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10z"
        fill="#006C35"
      />
    </Svg>
  );
}

export default SvgComponent;
