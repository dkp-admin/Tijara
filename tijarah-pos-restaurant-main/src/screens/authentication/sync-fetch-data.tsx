import { ProgressBar } from "@react-native-community/progress-bar-android";
import { useNavigation } from "@react-navigation/native";
import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import { t } from "../../../i18n";
import Spacer from "../../components/spacer";
import DefaultText from "../../components/text/Text";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { useBusinessDetails } from "../../hooks/use-business-details";
import { useResponsive } from "../../hooks/use-responsiveness";
import EntityNames from "../../types/entity-name";
import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";

const syncName: any = {
  "business-details-pull": "Business Details",
  "products-pull": "Products",
  "category-pull": "Categories",
  "collection-pull": "Collections",
  "customer-pull": "Customers",
  "orders-pull": "Orders",
  "print-template-pull": "Print Template",
  "stock-history-pull": "Stock History",
  "batch-pull": "Batch",
  "quick-items-pull": "Quick Items",
  "custom-charge-pull": "Custom Charges",
  "billing-settings-pull": "Billing Details",
  "ads-management-pull": "Ads Management",
  "kitchen-management-pull": "Kitchen Management",
  "section-tables-pull": "Section Tables",
  "menu-pull": "Menu Management",
  "void-comp-pull": "Void Comp",
  "box-crates-pull": "Box/Crates",
  "order-number-sequence-pull": "Order Configuration",
};

const SyncFetchData = (props: any) => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const authContext = useContext(AuthContext) as any;
  const { subscriptionDetails } = useBusinessDetails();
  const [progress, setProgress] = useState(0) as any;
  const [showMsg, setShowMsg] = useState(false);
  const [entityName, setEntityName] = useState("");
  const { hp } = useResponsive();
  const { user } = props.route.params;

  useEffect(() => {
    EventRegister.addEventListener("sync:start", ({ entityName }) => {
      setEntityName(t(syncName[entityName]));
      setProgress((prev: number) => prev + 2.75);
    });

    return () => {
      EventRegister.removeEventListener("sync:start");
    };
  }, []);

  useEffect(() => {
    EventRegister.addEventListener("sync:end", ({ entityName }) => {
      setProgress((prev: number) => prev + 2.75);
    });

    return () => {
      EventRegister.removeEventListener("sync:end");
    };
  }, []);

  useEffect(() => {
    EventRegister.addEventListener("sync:failed", ({ entityName }) => {});

    return () => {
      EventRegister.removeEventListener("sync:failed");
    };
  }, []);

  useEffect(() => {
    if (progress > 98) {
      setProgress(100);
    }
  }, [progress]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowMsg(true);
    }, 60000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (user) {
      (async () => {
        try {
          Object.values(EntityNames).map((entityName: any) => {
            if (entityName?.includes("pull")) {
              EventRegister.emit("sync:enqueue", { entityName });
            }
          });
        } catch (err: any) {}
      })();
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (progress === 100) {
        if (subscriptionDetails.renewIn >= 0) {
          MMKVDB.set(DBKeys.USER, user);
          MMKVDB.set(DBKeys.USERTYPE, user.userType);
          MMKVDB.set(DBKeys.FIRST_TIME_SYNC_ALL, "success");
          authContext.login({ ...user });
        } else {
          navigation.navigate("SubscriptionExpired");
        }
      }
    })();
  }, [progress]);

  return (
    <View
      style={{ ...styles.container, backgroundColor: theme.colors.bgColor }}
    >
      <DefaultText
        style={{ marginTop: 16, marginHorizontal: "10%" }}
        fontSize="2xl"
        fontWeight="medium"
      >
        {t("Please wait!")}
      </DefaultText>

      <DefaultText
        style={{ marginTop: 2, marginHorizontal: "10%" }}
        fontSize="2xl"
        fontWeight="medium"
      >
        {t("Setting up an environment for you")}
      </DefaultText>

      <Spacer space={hp("6%")} />

      <View style={{ width: "80%" }}>
        <ProgressBar
          styleAttr="Horizontal"
          indeterminate={false}
          color={theme.colors.primary[1000]}
          style={{
            borderTopEndRadius: 20,
            borderBottomLeftRadius: 20,
            transform: [{ scaleX: 1.0 }, { scaleY: 2.5 }],
          }}
          progress={progress / 100}
        />

        <DefaultText
          style={{ marginTop: 16, marginHorizontal: 5 }}
          fontSize="lg"
          fontWeight="medium"
          color="otherGrey.200"
        >
          {entityName}
        </DefaultText>
      </View>

      {showMsg && (
        <View
          style={{
            marginTop: 16,
            width: "80%",
            paddingRight: "7%",
            flexDirection: "row",
            alignItems: "flex-start",
          }}
        >
          <DefaultText fontSize="xl" fontWeight="medium" color="otherGrey.100">
            {`${t("Note")}: `}
          </DefaultText>

          <DefaultText fontSize="xl" color="otherGrey.200">
            {`${t(
              "While the setup is in progress, please refrain from navigating away or closing the app"
            )}. ${t("It may take a while based on the data size")}.`}
          </DefaultText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SyncFetchData;
