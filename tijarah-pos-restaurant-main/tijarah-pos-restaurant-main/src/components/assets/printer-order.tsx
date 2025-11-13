import * as React from "react";
import Svg, { Rect, Path, SvgProps } from "react-native-svg";

function SvgComponent(props: SvgProps | any) {
  return (
    <Svg
      width={40}
      height={40}
      viewBox="0 0 40 40"
      fill="none"
      //@ts-ignore
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Rect
        x={40}
        y={40}
        width={40}
        height={40}
        rx={8}
        transform="rotate(-180 40 40)"
        fill={props.rectColor || props.color || "#006C35"}
        fillOpacity={0.2}
      />
      <Path
        d="M25 23.75v5a3.745 3.745 0 01-3.75 3.75h-2.5A3.745 3.745 0 0115 28.75v-5h10zM13.75 13.75v-2.5A3.745 3.745 0 0117.5 7.5h5a3.745 3.745 0 013.75 3.75v2.5h-12.5z"
        fill={props.color || "#0E7440"}
      />
      <Path
        opacity={0.4}
        d="M27.5 13.75h-15c-2.5 0-3.75 1.25-3.75 3.75v6.25c0 2.5 1.25 3.75 3.75 3.75H15v-3.75h10v3.75h2.5c2.5 0 3.75-1.25 3.75-3.75V17.5c0-2.5-1.25-3.75-3.75-3.75zm-10 5.938h-3.75a.944.944 0 01-.938-.938c0-.512.426-.938.938-.938h3.75c.512 0 .938.425.938.938a.944.944 0 01-.938.938z"
        fill={props.color || "#0E7440"}
      />
      <Path
        d="M18.438 18.75a.944.944 0 01-.938.938h-3.75a.944.944 0 01-.938-.938c0-.512.426-.938.938-.938h3.75c.512 0 .938.425.938.938zM26.25 24.688h-12.5a.944.944 0 01-.938-.938c0-.512.426-.938.938-.938h12.5c.512 0 .938.425.938.938a.944.944 0 01-.938.938z"
        fill={props.color || "#0E7440"}
      />
    </Svg>
  );
}

export default SvgComponent;
