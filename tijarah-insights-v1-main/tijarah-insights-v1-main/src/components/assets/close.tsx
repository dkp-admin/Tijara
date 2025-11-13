import * as React from "react";
import Svg, { G, Rect, Path, Defs, SvgProps } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */

function SvgComponent(props: SvgProps) {
  return (
    <Svg
      width={30}
      height={31}
      viewBox="0 0 30 31"
      fill="none"
      //@ts-ignore
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G filter="url(#filter0_b_7897_12004)">
        <Rect
          y={0.355225}
          width={29.3806}
          height={30}
          rx={14.6903}
          fill="#F2F2F7"
        />
        <Path
          d="M9.841 19.536a.872.872 0 00.007 1.187c.323.324.864.318 1.162.013l3.68-3.758 3.674 3.752a.823.823 0 001.163-.007.866.866 0 00.006-1.187l-3.674-3.751 3.674-3.758a.86.86 0 00-.006-1.187.823.823 0 00-1.163-.006l-3.674 3.751-3.68-3.751a.823.823 0 00-1.162.006c-.317.324-.311.882-.007 1.187l3.674 3.758-3.674 3.751z"
          fill="#3C3C43"
          fillOpacity={0.6}
        />
      </G>
      <Defs></Defs>
    </Svg>
  );
}

export default SvgComponent;
