import * as React from "react"
import { View } from "react-native"
import Svg, { 
  Rect, 
  G, 
  Circle, 
  Path, 
  Defs, 
  ClipPath 
} from "react-native-svg"

const SvgComponent = ({ width = "100%", height = "100%", ...props }) => (
  <View style={{ aspectRatio: 370/300 }}>
    <Svg
      width={width}
      height={height}
      viewBox="0 0 370 300"
      fill="none"
      {...props}
    >
      <Rect
        width={235}
        height={280}
        x={69}
        y={76}
        fill="#fff"
        stroke="#191D31"
        strokeWidth={6}
        rx={25}
      />
      <G>
        <Rect width={120} height={28} x={83} y={248} fill="#fff" rx={10} />
      </G>
      <G>
        <Rect width={207} height={28} x={83} y={302} fill="#fff" rx={10} />
      </G>
      <G>
        <Rect width={83} height={28} x={207} y={248} fill="#fff" rx={10} />
      </G>
      <Rect width={14} height={14} x={90} y={309} fill="#EEF1F8" rx={5} />
      <Rect width={14} height={14} x={90} y={255} fill="#EEF1F8" rx={5} />
      <Rect width={14} height={14} x={214} y={255} fill="#EEF1F8" rx={5} />
      <Rect width={64} height={10} x={83} y={232} fill="#E7EAF1" rx={5} />
      <Rect width={112} height={16} x={131} y={196} fill="#B1B8C8" rx={8} />
      <Rect width={64} height={10} x={83} y={286} fill="#E7EAF1" rx={5} />
      <Rect width={47} height={10} x={207} y={232} fill="#E7EAF1" rx={5} />
      <Circle cx={187} cy={146} r={35} fill="#EEF1F8" />
      <Path
        fill="#191D31"
        d="M182.413 134.453v19.107c-.453.013-.906.12-1.24.32l-3.133 1.787c-2.187 1.253-3.987.213-3.987-2.32v-12.974c0-.84.6-1.88 1.347-2.306l5.773-3.307c.334-.187.787-.293 1.24-.307Z"
        opacity={0.4}
      />
      <Path
        fill="#191D31"
        d="M191.973 138.44v19.107c-.466.013-.92-.067-1.28-.24l-7-3.507c-.36-.173-.813-.253-1.28-.24v-19.107c.467-.013.92.067 1.28.24l7 3.507c.36.173.814.253 1.28.24Z"
      />
      <Path
        fill="#191D31"
        d="M200.333 138.653v12.974c0 .84-.6 1.88-1.346 2.306l-5.774 3.307c-.333.187-.786.293-1.24.307V138.44c.454-.013.907-.12 1.24-.32l3.134-1.787c2.186-1.253 3.986-.213 3.986 2.32Z"
        opacity={0.4}
      />
      <G>
        <Circle cx={69} cy={86} r={30} fill="#fff" />
      </G>
      <G clipPath="url(#clip0)">
        <Path
          fill="#1D272F"
          d="M69 72.667c-7.347 0-13.333 5.986-13.333 13.333S61.653 99.333 69 99.333 82.333 93.347 82.333 86 76.347 72.667 69 72.667Zm6.373 10.266-7.56 7.56a.999.999 0 0 1-1.413 0l-3.773-3.773a1.006 1.006 0 0 1 0-1.413 1.006 1.006 0 0 1 1.413 0l3.067 3.066 6.853-6.853a1.006 1.006 0 0 1 1.413 0 1.006 1.006 0 0 1 0 1.413Z"
        />
      </G>
      <Defs>
        <ClipPath id="clip0">
          <Path fill="#fff" d="M53 70h32v32H53z" />
        </ClipPath>
      </Defs>
    </Svg>
  </View>
)

export default SvgComponent