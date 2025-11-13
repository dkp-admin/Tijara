import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgComponent = (props: SvgProps) => (
  <Svg
    width={9}
    height={16}
    fill="none"
    //@ts-ignore
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M9 8a.743.743 0 0 0-.24-.548L2.184 1.011a.772.772 0 0 0-.548-.216.743.743 0 0 0-.755.755c0 .208.083.399.216.54L7.14 8l-6.043 5.91a.773.773 0 0 0-.216.54c0 .431.332.755.755.755a.745.745 0 0 0 .548-.224L8.76 8.548A.756.756 0 0 0 9 8Z"
      fill="#3C3C43"
      fillOpacity={0.3}
    />
  </Svg>
);

export default SvgComponent;
