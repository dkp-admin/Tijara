import { useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import Carousel, { Pagination } from "react-native-snap-carousel";
import { useTheme } from "../../context/theme-context";
import { getOriginalSize } from "../text/Text";

const SALES_INSIGHTS_IMG = require("../assets/sales-insights.png");
const INVENTORY_INSIGHTS_IMG = require("../assets/inventory-insights.png");
const VENDOR_INSIGHTS_IMG = require("../assets/vendor-insights.png");
const MULTI_LINGUAL_IMG = require("../assets/multi-lingual.png");
const SUPPORT_IMG = require("../assets/24x7-support.png");

const items = [
  { icon: SALES_INSIGHTS_IMG },
  { icon: INVENTORY_INSIGHTS_IMG },
  { icon: VENDOR_INSIGHTS_IMG },
  { icon: MULTI_LINGUAL_IMG },
  { icon: SUPPORT_IMG },
];

const renderCarouselItem = ({ item }: any) => {
  return (
    <View style={styles.container_view}>
      <Image
        source={item?.icon}
        resizeMode="contain"
        style={styles.crousel_bg_img}
      />
    </View>
  );
};

export default function CarouselWelcome({
  onIndexChange,
}: {
  onIndexChange: (index: number) => void;
}) {
  const theme = useTheme();

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    onIndexChange(activeSlide);
  }, [activeSlide]);

  return (
    <View>
      <Carousel
        layout={"default"}
        autoplay
        data={items}
        sliderWidth={getOriginalSize(300)}
        itemWidth={getOriginalSize(300)}
        renderItem={renderCarouselItem}
        loop={true}
        onSnapToItem={(index: any) => setActiveSlide(index)}
      />

      <Pagination
        dotsLength={items.length}
        activeDotIndex={activeSlide}
        inactiveDotStyle={{ width: getOriginalSize(10) }}
        inactiveDotOpacity={0.2}
        inactiveDotScale={0.8}
        dotStyle={{
          ...styles.dotStyle,
          backgroundColor: theme.colors.primary[1000],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container_view: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  crousel_bg_img: {
    borderRadius: getOriginalSize(5),
    height: getOriginalSize(Dimensions.get("screen").height * 0.2),
  },
  dotStyle: {
    width: getOriginalSize(35),
    height: getOriginalSize(10),
    borderRadius: getOriginalSize(5),
    marginHorizontal: getOriginalSize(2),
  },
});
