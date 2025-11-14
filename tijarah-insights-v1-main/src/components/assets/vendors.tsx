import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function SvgComponent(props: SvgProps) {
  return (
    <Svg
      width={26}
      height={24}
      viewBox="0 0 26 24"
      fill="none"
      //@ts-ignore
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M13.497 22h-9.01c-1.241 0-2.258-.93-2.258-2.07V5.09c0-2.62 2.087-3.81 4.644-2.64l4.752 2.18c1.027.47 1.872 1.72 1.872 2.78V22zM23.631 15.06v3.78c0 2.16-1.07 3.16-3.381 3.16h-6.753V10.42l.503.1 4.816 1.01 2.172.45c1.413.29 2.568.97 2.632 2.89.011.06.011.12.011.19z"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        opacity={0.4}
        d="M6.007 9H9.72M6.007 13H9.72"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.816 11.53v3.22c0 1.24-1.081 2.25-2.408 2.25S14 15.99 14 14.75v-4.23l4.816 1.01zM23.62 14.87c-.064 1.18-1.113 2.13-2.397 2.13-1.326 0-2.407-1.01-2.407-2.25v-3.22l2.172.45c1.413.29 2.568.97 2.632 2.89z"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
