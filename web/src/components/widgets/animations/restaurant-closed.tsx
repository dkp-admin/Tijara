import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import { FC, ReactElement } from "react";
import RestaurantClosedAnimationFile from "src/lotties/restaurant-closed.json";

interface LoaderProps {
  text?: ReactElement<any, any>;
  button?: ReactElement<any, any>;
}

const RestaurantClosedAnimation: FC<LoaderProps> = ({ text, button }) => {
  return (
    <>
      {text}
      <Lottie
        loop={true}
        autoPlay={true}
        animationData={RestaurantClosedAnimationFile}
        style={{ height: 225 }}
      />
      {button}
    </>
  );
};

export default RestaurantClosedAnimation;
