import { FC, ReactElement } from "react";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import TickAnimationFile from "src/lotties/tick-preview.json";

interface TickAnimationProps {
  text?: ReactElement<any, any>;
  button?: ReactElement<any, any>;
}

const TickAnimation: FC<TickAnimationProps> = ({ text, button }) => {
  return (
    <>
      {text}
      <Lottie
        loop={false}
        autoPlay={false}
        animationData={TickAnimationFile}
        // style={{ height: 50, marginTop: 50 }}
      />
      {button}
    </>
  );
};

export default TickAnimation;
