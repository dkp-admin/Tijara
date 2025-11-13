import Toast from "react-native-toast-message";

const showToast = (
  type: "success" | "error" | "info",
  title: string,
  description?: string,
  duration: number = 1500
) => {
  let obj = {
    type: type,
    text1: title,
    visibilityTime: duration,
    props: {
      text1NumberOfLines: 3,
    },
  } as {
    type: string;
    text1: string;
    text2?: string;
  };

  if (description && description?.length > 0) {
    obj.text2 = description;
  }

  Toast.show(obj);
};

export default showToast;
