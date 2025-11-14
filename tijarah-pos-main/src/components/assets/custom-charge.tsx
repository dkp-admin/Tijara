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
        d="M27.5 7.5v3.025c0 1.975-1.25 3.225-3.225 3.225H20V5.012A2.523 2.523 0 0122.525 2.5a5.025 5.025 0 013.513 1.462A5.031 5.031 0 0127.5 7.5z"
        fill="#555"
      />
      <Path
        opacity={0.4}
        d="M2.5 8.75v17.5c0 1.038 1.175 1.625 2 1l2.138-1.6a1.26 1.26 0 011.65.125l2.075 2.088a1.26 1.26 0 001.774 0l2.1-2.1a1.24 1.24 0 011.626-.113L18 27.25c.825.613 2 .025 2-1V5c0-1.375 1.125-2.5 2.5-2.5h-15c-3.75 0-5 2.237-5 5v1.25z"
        fill="#555"
      />
      <Path
        d="M14.688 11.563h-2.5v-2.5a.944.944 0 00-.938-.938.944.944 0 00-.938.938v2.5h-2.5a.944.944 0 00-.937.937c0 .512.425.938.938.938h2.5v2.5c0 .512.425.937.937.937a.944.944 0 00.938-.938v-2.5h2.5a.944.944 0 00.937-.937.944.944 0 00-.938-.938z"
        fill="#555"
      />
    </Svg>
  );
}

export default SvgComponent;
