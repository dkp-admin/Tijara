import React from "react";
import { View } from "react-native";
import QRCodeComponent from "./qr-code";

export default function PrintSunmi2InchCanvas({
  valueRef: ref,
  order,
  trigger = () => {},
}: any) {
  return (
    <View>
      <QRCodeComponent
        qrData={order.qr}
        onChange={(base64: any) => {
          ref.current.base64qr = base64;
          trigger();
        }}
      />
    </View>
  );
}
