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
        opacity={0.4}
        d="M12.963 19c2.364 0 4.28-1.79 4.28-4s-1.916-4-4.28-4c-2.364 0-4.28 1.79-4.28 4s1.916 4 4.28 4z"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        opacity={0.4}
        d="M13.23 13.75v.93c0 .35-.193.68-.524.86l-.813.46"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.752 22h6.42c4.303 0 5.073-1.61 5.298-3.57l.802-6c.29-2.44-.46-4.43-5.03-4.43h-8.56c-4.57 0-5.318 1.99-5.03 4.43l.803 6C4.68 20.39 5.451 22 9.752 22z"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        opacity={0.4}
        d="M8.147 7.67V6.7c0-2.25 1.937-4.46 4.345-4.67 2.868-.26 5.286 1.85 5.286 4.48v1.38"
        stroke="#151B33"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
