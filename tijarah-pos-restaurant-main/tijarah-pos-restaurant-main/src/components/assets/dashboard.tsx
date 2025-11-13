import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgComponent = (props: SvgProps) => (
  <Svg
    width={30}
    height={30}
    fill="none"
    //@ts-ignore
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M27.5 27.5h-25a.944.944 0 0 1-.938-.938c0-.512.425-.937.938-.937h25c.512 0 .938.425.938.938a.944.944 0 0 1-.938.937Z"
      fill="#151B33"
    />
    <Path
      d="M12.188 5v22.5h5.624V5c0-1.375-.562-2.5-2.25-2.5h-1.124c-1.688 0-2.25 1.125-2.25 2.5Z"
      fill="#151B33"
    />
    <Path
      opacity={0.4}
      d="M3.75 12.5v15h5v-15c0-1.375-.5-2.5-2-2.5h-1c-1.5 0-2 1.125-2 2.5ZM21.25 18.75v8.75h5v-8.75c0-1.375-.5-2.5-2-2.5h-1c-1.5 0-2 1.125-2 2.5Z"
      fill="#272727"
    />
  </Svg>
);

export default SvgComponent;
