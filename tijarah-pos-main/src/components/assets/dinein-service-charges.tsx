import * as React from "react";
import Svg, { G, Path, SvgProps } from "react-native-svg";

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
      <G
        opacity={0.4}
        stroke="#0E7440"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M7.227 11.942c0 1.075.825 1.941 1.85 1.941h2.091c.892 0 1.617-.758 1.617-1.691 0-1.017-.442-1.375-1.1-1.609L8.327 9.417c-.659-.234-1.1-.592-1.1-1.609 0-.933.725-1.691 1.616-1.691h2.092c1.025 0 1.85.866 1.85 1.941M10 5v10" />
      </G>
      <Path
        d="M12.5 18.333h-5c-4.167 0-5.833-1.666-5.833-5.833v-5c0-4.167 1.666-5.833 5.833-5.833h5c4.167 0 5.833 1.666 5.833 5.833v5c0 4.166-1.666 5.833-5.833 5.833z"
        stroke="#0E7440"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
