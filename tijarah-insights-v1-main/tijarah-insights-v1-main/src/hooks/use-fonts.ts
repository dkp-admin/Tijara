import * as Font from "expo-font";
const customFonts = {
  "Tijarah-Regular": require("../../assets/fonts/Manrope-Regular.ttf"),
  "Tijarah-Bold": require("../../assets/fonts/Manrope-Bold.ttf"),
  "Tijarah-ExtraBold": require("../../assets/fonts/Manrope-ExtraBold.ttf"),
  "Tijarah-ExtraLight": require("../../assets/fonts/Manrope-ExtraLight.ttf"),
  "Tijarah-Light": require("../../assets/fonts/Manrope-Light.ttf"),
  "Tijarah-Medium": require("../../assets/fonts/Manrope-Medium.ttf"),
  "Tijarah-SemiBold": require("../../assets/fonts/Manrope-SemiBold.ttf"),
};

export default async function loadFonts() {
  await Font.loadAsync(customFonts);
}
