import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgComponent = (props: SvgProps) => (
  <Svg
    width={16}
    height={16}
    fill="none"
    //@ts-ignore
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Path
      d="M6.383 12.877a6.363 6.363 0 0 0 3.71-1.195l3.935 3.934a.947.947 0 0 0 .681.274c.54 0 .921-.415.921-.946a.9.9 0 0 0-.265-.664l-3.91-3.918a6.358 6.358 0 0 0 1.312-3.868C12.767 2.982 9.895.11 6.383.11 2.88.11 0 2.974 0 6.494c0 3.51 2.872 6.383 6.383 6.383Zm0-1.378c-2.739 0-5.005-2.266-5.005-5.005 0-2.74 2.266-5.006 5.005-5.006 2.74 0 5.006 2.266 5.006 5.006 0 2.739-2.266 5.005-5.006 5.005Z"
      fill={props?.color}
      fillOpacity={0.6}
    />
  </Svg>
);

export default SvgComponent;
