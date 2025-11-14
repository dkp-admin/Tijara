import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { t } from "../../../i18n";
import { PrimaryButton } from "../../components/buttons/primary-button";
import Spacer from "../../components/spacer";
import DefaultText, { getOriginalSize } from "../../components/text/Text";
import CarouselWelcome from "../../components/welcome/carousel";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";

const Welcome = () => {
  const theme = useTheme();
  const { wp, hp } = useResponsive();
  const navigation = useNavigation<any>();

  const [index, setIndex] = useState(0);

  const textData = [
    {
      title: t("Sales insights"),
      helperText: t(
        "Compared sales data for a deeper understanding of your business growth"
      ),
    },
    {
      title: t("Inventory insights"),
      helperText: t("Real-time visibility into your inventory levels"),
    },
    {
      title: t("Vendors insights"),
      helperText: t(
        "Get insights on vendor payments, orders, best vendors and much more"
      ),
    },
    {
      title: t("Multi Lingual"),
      helperText: t("Stay connected with your preferred language"),
    },
    {
      title: t("Dedicated support team"),
      helperText: t("Dedicated support to keep you moving forward"),
    },
  ];

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: wp("6%"),
        backgroundColor: theme.colors.bgColor2,
      }}
    >
      <Spacer space={hp("10%")} />

      <View style={styles.top_view}>
        <DefaultText fontSize="lg" fontWeight="medium" color="text.secondary">
          {textData[index].title}
        </DefaultText>

        <TouchableOpacity
          style={{
            ...styles.skip_view,
            backgroundColor: theme.colors.dark[50],
          }}
          onPress={() => {
            navigation.navigate("Login");
          }}
        >
          <DefaultText fontSize="lg" fontWeight="bold">
            {t("Skip")}
          </DefaultText>
        </TouchableOpacity>
      </View>

      <Spacer space={hp("2%")} />

      <DefaultText fontSize="4xl" fontWeight="bold">
        {textData[index].helperText}
      </DefaultText>

      <View style={styles.crousel_container}>
        <CarouselWelcome
          onIndexChange={(idx) => {
            setIndex(idx);
          }}
        />
      </View>

      <Spacer space={hp("25%")} />

      <PrimaryButton
        style={{
          width: "100%",
          bottom: hp("10%"),
          position: "absolute",
          marginLeft: "7%",
        }}
        title={t("Login")}
        onPress={() => {
          navigation.navigate("Login");
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  crousel_container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  top_view: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skip_view: {
    borderRadius: getOriginalSize(8),
    paddingVertical: getOriginalSize(8),
    paddingHorizontal: getOriginalSize(16),
  },
});

export default Welcome;
