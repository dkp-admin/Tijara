import * as React from "react";
import Svg, { Path, G, SvgProps } from "react-native-svg";

function SvgComponent(props: SvgProps | any) {
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
        d="M18.333 5v2.016c0 1.317-.833 2.15-2.15 2.15h-2.85V3.341c0-.925.759-1.675 1.684-1.675a3.35 3.35 0 012.341.976c.6.608.975 1.441.975 2.358z"
        stroke="#0E7440"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M1.667 5.833V17.5A.83.83 0 003 18.166L4.425 17.1a.84.84 0 011.1.083l1.383 1.392a.84.84 0 001.184 0l1.4-1.4a.826.826 0 011.083-.075L12 18.166a.835.835 0 001.333-.666V3.333c0-.917.75-1.667 1.667-1.667H5C2.5 1.667 1.667 3.159 1.667 5v.833z"
        stroke="#0E7440"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {props.isCustom && (
        <G
          opacity={0.4}
          stroke="#0E7440"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d="M5.208 8.333h4.584M7.5 10.625V6.042" />
        </G>
      )}
    </Svg>
  );
}

export default SvgComponent;
