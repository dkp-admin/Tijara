import { Audio } from "expo-av";

export const playTouchSound = async () => {
  const { sound } = await Audio.Sound.createAsync(
    require("../components/assets/product_not_found.mp3")
  );

  await sound.playAsync();
  await unloadSound(sound);

  return true;
};

const unloadSound = (sound: any) => {
  const timeout = setTimeout(() => {
    if (sound) {
      sound.unloadAsync();
    }
  }, 500);

  return () => {
    clearTimeout(timeout);
  };
};
