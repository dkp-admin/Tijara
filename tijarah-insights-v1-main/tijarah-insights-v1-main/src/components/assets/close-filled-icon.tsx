import * as React from "react";
import { useColorScheme } from "react-native";
import Svg, { G, Rect, Path, Defs } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */

export default function CloseFilled(props: any) {
  const scheme = useColorScheme();

  return (
    <Svg
      width={30}
      height={31}
      viewBox="0 0 30 31"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G>
        <Rect
          y={0.35498}
          width={29.3806}
          height={30}
          rx={14.6903}
          fill={scheme == "dark" ? "#15141F" : "#FFFFFF"}
          opacity={0.1}
        />
        <Path
          d="M9.841 19.536a.872.872 0 00.007 1.187c.323.324.864.318 1.162.013l3.68-3.758 3.674 3.751a.823.823 0 001.163-.006.866.866 0 00.006-1.187l-3.674-3.751 3.674-3.758a.86.86 0 00-.006-1.187.823.823 0 00-1.163-.007l-3.674 3.752-3.68-3.752a.823.823 0 00-1.162.007c-.317.324-.311.882-.007 1.187l3.674 3.758-3.674 3.751z"
          fill={scheme == "dark" ? "#3C3C43" : "#CCCACF"}
          fillOpacity={0.8}
        />
      </G>
      <Defs></Defs>
    </Svg>
  );
}
