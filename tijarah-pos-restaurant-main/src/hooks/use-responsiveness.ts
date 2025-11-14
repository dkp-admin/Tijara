import { Dimensions } from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

const breakpoints = {
  xs: 375,
  sm: 768,
  md: 992,
};

export const useResponsive = () => {
  const responsive = {
    twoPaneView: Dimensions.get("window").width >= breakpoints.md,
    wp: (percentage: string) => wp(percentage),
    hp: (percentage: string) => hp(percentage),
  };

  return responsive;
};
