import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import SeparatorVerticalView from "../common/separator-vertical-view";
import SideMenu from "../common/side-menu";
import PrinterListModal from "./printers/printer-list-modal";
import PrinterList from "./printers/printers";

export default function Hardware() {
  const theme = useTheme();
  const { twoPaneView } = useResponsive();

  const [selectedMenu, setSelectedMenu] = useState(
    twoPaneView ? "printers" : ""
  );
  const [visible, setVisible] = useState(false);

  const menuOptions = [
    { title: t("Printers"), value: "printers" },
    // { title: t("Scanners"), value: "scanners" },
  ];

  return (
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
          {selectedMenu == "printers" && <PrinterList />}

          {selectedMenu == "scanners" && <></>}
        </View>
      )}

      <PrinterListModal
        visible={visible}
        handleClose={() => setVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
});
