import { FC, ReactElement } from "react";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

import TickAnimationFile from "src/lotties/tick-preview.json";
import CrossAnimationFile from "src/lotties/cross-preview.json";

interface CrossAnimationProps {
  text?: ReactElement<any, any>;
  button?: ReactElement<any, any>;
}

const CrossAnimation: FC<CrossAnimationProps> = ({ text, button }) => {
  return (
    <>
      {text}
      <Lottie
        loop={false}
        autoPlay={false}
        animationData={CrossAnimationFile}
      />
      {button}
    </>
  );
};

export default CrossAnimation;
