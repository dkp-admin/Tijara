import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

export const useResponsive = () => {
  const responsive = {
    wp: (percentage: string) => wp(percentage),
    hp: (percentage: string) => hp(percentage),
  };

  return responsive;
};
