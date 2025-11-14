import * as Font from "expo-font";

const customFonts = {
  "Tijarah-Light": require("../../assets/fonts/CircularStd-Light.otf"),
  "Tijarah-Regular": require("../../assets/fonts/CircularStd-Book.otf"),
  "Tijarah-Medium": require("../../assets/fonts/CircularStd-Medium.otf"),
  "Tijarah-Bold": require("../../assets/fonts/CircularStd-Bold.otf"),
  "Tijarah-Black": require("../../assets/fonts/CircularStd-Black.otf"),
  "Tijarah-Italic-Regular": require("../../assets/fonts/CircularStd-BookItalic.otf"),
};

export default async function loadFonts() {
  await Font.loadAsync(customFonts);
}
