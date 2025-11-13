import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function SvgComponent(props: SvgProps) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      //@ts-ignore
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M14.167 17.083H5.833c-2.5 0-4.166-1.25-4.166-4.166V7.083c0-2.916 1.666-4.166 4.166-4.166h8.334c2.5 0 4.166 1.25 4.166 4.166v5.834c0 2.916-1.666 4.166-4.166 4.166z"
        stroke="#0E7440"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
        stroke="#0E7440"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        opacity={0.4}
        d="M7.083 5h-1.25c-1.15 0-2.083.933-2.083 2.083v1.25M12.917 5h1.25c1.15 0 2.083.933 2.083 2.083v1.25M7.083 15h-1.25a2.084 2.084 0 01-2.083-2.083v-1.25M12.917 15h1.25c1.15 0 2.083-.933 2.083-2.083v-1.25"
        stroke="#0E7440"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
