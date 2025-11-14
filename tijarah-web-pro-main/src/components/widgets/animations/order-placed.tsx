import { FC, ReactElement } from "react";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import OrderPlacedAnimationFile from "src/lotties/order-placed.json";

interface OrderPlacedProps {
  text?: ReactElement<any, any>;
  button?: ReactElement<any, any>;
}

const OrderPlacedAnimation: FC<OrderPlacedProps> = ({ text, button }) => {
  return (
    <>
      {text}
      <Lottie
        loop={true}
        autoPlay={true}
        animationData={OrderPlacedAnimationFile}
        style={{ height: 300, marginTop: -20 }}
      />
      {button}
    </>
  );
};

export default OrderPlacedAnimation;
