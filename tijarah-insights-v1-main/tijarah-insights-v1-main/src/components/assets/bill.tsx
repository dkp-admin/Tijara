import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function SvgComponent(props: SvgProps) {
  return (
    <Svg
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      //@ts-ignore
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        opacity={0.4}
        d="M2.14 1.458v6.983c0 .571.27 1.114.73 1.458l3.04 2.275c.647.484 1.54.484 2.187 0L11.136 9.9c.46-.344.729-.887.729-1.458V1.458H2.141z"
        fill="#0E7440"
      />
      <Path
        d="M12.833 1.896H1.167a.44.44 0 01-.438-.438.44.44 0 01.438-.437h11.666a.44.44 0 01.438.437.44.44 0 01-.438.438zM9.333 5.104H4.667a.44.44 0 01-.438-.437.44.44 0 01.438-.438h4.666a.44.44 0 01.438.438.44.44 0 01-.438.437zM9.333 8.02H4.667a.44.44 0 01-.438-.437.44.44 0 01.438-.437h4.666a.44.44 0 01.438.437.44.44 0 01-.438.438z"
        fill="#0E7440"
      />
    </Svg>
  );
}

export default SvgComponent;
