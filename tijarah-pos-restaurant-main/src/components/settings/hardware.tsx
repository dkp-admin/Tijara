import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import SeparatorVerticalView from "../common/separator-vertical-view";
import SideMenu from "../common/side-menu";
import PrinterListModal from "./printers/printer-list-modal";
import PrinterList from "./printers/printers";
import CustomHeader from "../common/custom-header";
import DefaultText from "../text/Text";

export default function Hardware() {
  const theme = useTheme();
  const { twoPaneView, hp, wp } = useResponsive();

  const [selectedMenu, setSelectedMenu] = useState(
    twoPaneView ? "printers" : ""
  );
  const [visible, setVisible] = useState(false);

  const menuOptions = [
    { title: t("Printers"), value: "printers" },
    // { title: t("Scanners"), value: "scanners" },
  ];

  const getHeaderText: any = {
    printers: t("PRINTERS"),
    // billing: t("BILLING"),
    // hardware: t("HARDWARE"),
  };

  return (
    <>
      <CustomHeader />
      <View
        style={{ ...styles.container, backgroundColor: theme.colors.bgColor }}
      >
        <View
          style={{
            overflow: "hidden",
            flex: twoPaneView ? 0.3 : 1,
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <SideMenu
            title={t("Hardwares & Printers")}
            selectedMenu={selectedMenu}
            setSelectedMenu={(val: string) => {
              if (twoPaneView) {
                setSelectedMenu(val);
              } else {
                setVisible(true);
              }
            }}
            menuOptions={menuOptions}
          />
        </View>

        <SeparatorVerticalView />

        {twoPaneView && (
          <View style={{ flex: 0.7 }}>
            <View
              style={{
                height: hp("9.5%"),
                paddingTop: hp("3.75%"),
                paddingLeft: wp("1.75%"),
                paddingRight: wp("0.75%"),
                borderBottomWidth: 1,
                borderColor: theme.colors.dividerColor.secondary,
                backgroundColor: theme.colors.primary[100],
              }}
            >
              <DefaultText fontWeight="medium">
                {getHeaderText[selectedMenu]}
              </DefaultText>
            </View>
            {selectedMenu == "printers" && <PrinterList />}

            {selectedMenu == "scanners" && <></>}
          </View>
        )}

        <PrinterListModal
          visible={visible}
          handleClose={() => setVisible(false)}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
});
