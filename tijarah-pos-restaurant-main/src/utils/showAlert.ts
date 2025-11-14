import { Alert } from "react-native";

export const showAlert = async ({
  confirmation,
  alertMsg,
  btnText1,
  btnText2,
  onPressBtn1,
  onPressBtn2,
}: {
  confirmation: string;
  alertMsg: string;
  btnText1: string;
  btnText2: string;
  onPressBtn1: any;
  onPressBtn2: any;
}) => {
  let pressBtn = false;

  Alert.alert(confirmation, alertMsg, [
    {
      text: btnText1,
      onPress: () => {
        onPressBtn1();
        pressBtn = true;
      },
      style: "destructive",
    },
    {
      text: btnText2,
      onPress: () => {
        onPressBtn2();
        pressBtn = true;
      },
    },
  ]);

  return pressBtn;
};
