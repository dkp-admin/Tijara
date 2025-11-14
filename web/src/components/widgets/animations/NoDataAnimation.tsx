import { FC, ReactElement } from "react";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import NoDataAnimationFile from "src/lotties/no-data-preview.json";

interface NoDataAnimationProps {
  text?: ReactElement<any, any>;
  button?: ReactElement<any, any>;
}

const NoDataAnimation: FC<NoDataAnimationProps> = ({ text, button }) => {
  return (
    <>
      {text}
      <Lottie
        animationData={NoDataAnimationFile}
        style={{ height: 275, marginTop: -50, marginBottom: -70 }}
      />
      {button}
    </>
  );
};

export default NoDataAnimation;
