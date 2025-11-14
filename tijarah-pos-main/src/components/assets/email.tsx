import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function SvgComponent(props: SvgProps) {
  return (
    <Svg
      width={30}
      height={30}
      viewBox="0 0 30 30"
      fill="none"
      //@ts-ignore
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        opacity={0.4}
        d="M21.25 25.625H8.75c-3.75 0-6.25-1.875-6.25-6.25v-8.75c0-4.375 2.5-6.25 6.25-6.25h12.5c3.75 0 6.25 1.875 6.25 6.25v8.75c0 4.375-2.5 6.25-6.25 6.25z"
        fill="#151B33"
      />
      <Path
        d="M15 16.087c-1.05 0-2.113-.325-2.925-.987l-3.912-3.125a.935.935 0 011.162-1.463l3.913 3.125c.95.763 2.562.763 3.512 0l3.913-3.125c.4-.325 1-.262 1.312.15.325.4.262 1-.15 1.313L17.913 15.1c-.8.662-1.863.987-2.913.987z"
        fill="#272727"
      />
    </Svg>
  );
}

export default SvgComponent;
