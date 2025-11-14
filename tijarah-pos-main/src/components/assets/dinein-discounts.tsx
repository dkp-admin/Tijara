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
        d="M3.325 12.217L2.058 10.95a1.338 1.338 0 010-1.883L3.325 7.8c.217-.217.392-.642.392-.942V5.067c0-.734.6-1.334 1.333-1.334h1.792c.3 0 .725-.175.941-.391L9.05 2.075a1.338 1.338 0 011.883 0L12.2 3.342c.217.216.642.391.942.391h1.791c.734 0 1.334.6 1.334 1.334v1.791c0 .3.175.725.391.942l1.267 1.267a1.338 1.338 0 010 1.883l-1.267 1.267c-.216.216-.391.641-.391.941v1.792c0 .733-.6 1.333-1.334 1.333h-1.791c-.3 0-.725.175-.942.392l-1.267 1.267a1.338 1.338 0 01-1.883 0l-1.267-1.267a1.537 1.537 0 00-.941-.392H5.05c-.733 0-1.333-.6-1.333-1.333v-1.792c0-.308-.175-.733-.392-.941z"
        stroke="#0E7440"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        opacity={0.4}
        d="M7.5 12.5l5-5"
        stroke="#0E7440"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        opacity={0.4}
        d="M12.079 12.083h.007M7.912 7.917h.008"
        stroke="#0E7440"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
