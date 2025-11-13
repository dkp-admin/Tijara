import * as IntentLauncher from "expo-intent-launcher";
import React from "react";
import { Button, View } from "react-native";

const Consts = {
  PACKAGE: "com.intersoft.acquire.mada",
  SERVICE_ACTION: "android.intent.action.intersoft.PAYMENT.SERVICE",
  CARD_ACTION: "android.intent.action.intersoft.PAYMENT",
  UNIONPAY_ACTION: "android.intent.action.intersoft.PAYMENT_UNION_SCAN",
  INSTALLMENT_ACTION: "android.intent.action.intersoft.PAYMENT_INSTALLMENT",
};

const launchIntent = () => {
  const tvType = 2;
  const tvOutOrderNo = new Date().getUTCMilliseconds().toString();
  const etAmount = BigInt(10);

  IntentLauncher.startActivityAsync(Consts.CARD_ACTION, {
    packageName: Consts.PACKAGE,
    flags: 0,
    extra: {
      "com.intersoft.acquire.mada.transType": tvType,
      "com.intersoft.acquire.mada.outOrderNo": tvOutOrderNo,
      "com.intersoft.acquire.mada.amount": etAmount,
    },
  }).then(
    () => {
      console.log("Intent launched");
    },
    (error: any) => {
      console.log(`An error occurred: ${error}`);
    }
  );
};

const LaunchIntentButton = () => {
  return (
    <View style={{ margin: 20 }}>
      <Button title="Launch Intent" onPress={launchIntent} />
    </View>
  );
};

export default LaunchIntentButton;
