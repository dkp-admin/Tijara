import React from "react";
import { Path, Svg, SvgProps } from "react-native-svg";

const TablesIcon = (props: SvgProps) => {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      //@ts-ignore
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        opacity="1"
        d="M21 12H12V3H15.024C19.9452 3 21 4.05476 21 8.976V12Z"
        fill="#272727"
      />
      <Path
        opacity="1"
        d="M3 15.024V12H12V21H8.976C4.05476 21 3 19.9452 3 15.024Z"
        fill="#272727"
      />
      <Path
        d="M3 8.976C3 4.05476 4.05476 3 8.976 3H15.024C19.9452 3 21 4.05476 21 8.976V15.024C21 19.9452 19.9452 21 15.024 21H8.976C4.05476 21 3 19.9452 3 15.024V8.976Z"
        stroke="#272727"
        stroke-width="5"
      />
      <Path
        d="M12 3V21"
        stroke="#272727"
        stroke-width="5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M21 12L3 12"
        stroke="#272727"
        stroke-width="5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
};

export default TablesIcon;
