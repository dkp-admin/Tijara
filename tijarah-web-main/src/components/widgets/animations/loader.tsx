import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import { FC, ReactElement } from "react";
import LoaderAnimationFile from "src/lotties/loader.json";

interface LoaderProps {
  text?: ReactElement<any, any>;
  button?: ReactElement<any, any>;
}

const LoaderAnimation: FC<LoaderProps> = ({ text, button }) => {
  return (
    <>
      {text}
      <Lottie
        loop={true}
        autoPlay={true}
        animationData={LoaderAnimationFile}
        style={{ height: 100 }}
      />
      {button}
    </>
  );
};

export default LoaderAnimation;
