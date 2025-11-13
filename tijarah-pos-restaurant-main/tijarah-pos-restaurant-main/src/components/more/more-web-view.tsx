import Constants from "expo-constants";
import React, { useContext, useEffect, useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { t } from "../../../i18n";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { AuthType } from "../../types/auth-types";
import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";
import ActionSheetHeader from "../action-sheet/action-sheet-header";

const env = Constants.expoConfig?.extra?.env || "development";

export default function MoreWebViewModal({
  data,
  visible = false,
  handleClose,
}: {
  data: any;
  visible: boolean;
  handleClose?: any;
}) {
  const theme = useTheme();
  const authContext = useContext<AuthType>(AuthContext);

  const [webURL, setWebURL] = useState("");

  const getHeaderText = () => {
    if (data === "vendor") {
      return t("Vendors");
    } else if (data === "purchase-order") {
      return t("PO/GRN");
    } else {
      return t("Inventory History");
    }
  };

  const redirectionURL = async () => {
    let url;
    const phone = authContext.user.phone;
    const posSessionId = MMKVDB.get(DBKeys.POS_SESSION_ID);

    if (env === "production") {
      url = `https://app.tijarah360.com/authentication/authorize?redirectURL=${data}&phone=${phone}&pos_id=${posSessionId}&locationRef=${authContext.user.locationRef}`;
    } else if (env === "qa") {
      url = `https://tijarah-qa.vercel.app/authentication/authorize?redirectURL=${data}&phone=${phone}&pos_id=${posSessionId}&locationRef=${authContext.user.locationRef}`;
    } else {
      url = `https://tijarah.vercel.app/authentication/authorize?redirectURL=${data}&phone=${phone}&pos_id=${posSessionId}&locationRef=${authContext.user.locationRef}`;
    }

    setWebURL(url);
  };

  useEffect(() => {
    if (visible) {
      redirectionURL();
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent={false}
      style={{ height: "100%" }}
    >
      <View
        style={{
          ...styles.container,
          backgroundColor: theme.colors.transparentBg,
        }}
      >
        <View
          style={{
            ...styles.container,
            backgroundColor: theme.colors.white[1000],
          }}
          renderToHardwareTextureAndroid
        >
          <ActionSheetHeader
            title={getHeaderText()}
            handleLeftBtn={() => handleClose()}
          />

          <WebView
            style={{ flex: 1 }}
            originWhitelist={["*"]}
            source={{ uri: webURL }}
            androidLayerType="software"
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
});
