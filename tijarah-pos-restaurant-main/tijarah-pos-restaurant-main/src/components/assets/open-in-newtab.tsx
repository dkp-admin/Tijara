import React from "react"
import { Path, Svg, SvgProps } from "react-native-svg"

const OpenInNewTab = (props: SvgProps) => {
  return (
    <Svg
      //@ts-ignore
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M14 3v2h5l-7 7 1.4 1.4 7-7v5h2V3h-7zM3 9v12h12v-6h2v6a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9h2z"
        fill="currentColor"
      />
    </Svg>
  )
}

export default OpenInNewTab
