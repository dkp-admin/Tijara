import { FC, ReactElement } from "react";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import EmptyCartAnimationFile from "src/lotties/empty-cart.json";

interface EmptyCartProps {
  text?: ReactElement<any, any>;
  button?: ReactElement<any, any>;
}

const EmptyCartAnimation: FC<EmptyCartProps> = ({ text, button }) => {
  return (
    <>
      <Lottie
        loop={true}
        autoPlay={true}
        animationData={EmptyCartAnimationFile}
        style={{ height: 300, marginTop: 2 }}
      />
      {text}
      {button}
    </>
  );
};

export default EmptyCartAnimation;
