import { ProgressBar } from "@react-native-community/progress-bar-android";
import React, { useContext, useEffect, useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { t } from "../../../i18n";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import repository from "../../db/repository";
import { useResponsive } from "../../hooks/use-responsiveness";
import DatabasePush from "../../sync/database-push";
import ICONS from "../../utils/icons";
import DefaultText from "../text/Text";

const validEntityNames: any = [
  "products",
  "category",
  "collection",
  "customer",
  "business-details",
  "orders",
  "stock-history",
  "batch",
  "custom-charge",
  "billing-settings",
  "kitchen-management",
  "section-tables",
  "void-comp",
  "box-crates",
];

const syncName: any = {
  "business-details": "Business Details",
  products: "Products",
  category: "Categories",
  collection: "Collections",
  customer: "Customers",
  orders: "Orders",
  "stock-history": "Stock History",
  batch: "Batch",
  "custom-charge": "Custom Charges",
  "billing-settings": "Billing Details",
  "kitchen-management": "Kitchen Management",
  "section-tables": "Section Tables",
  "void-comp": "Void Comp",
  "box-crates": "Box/Crates",
};

export default function PrepareUpdate({
  visible = false,
  handleClose,
}: {
  visible: boolean;
  handleClose: any;
}) {
  const theme = useTheme();
  const { hp } = useResponsive();

  const authContext = useContext(AuthContext);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [entityName, setEntityName] = useState("");
  const [results, setResults] = useState<any>([]);

  const prepareUpdate = async () => {
    const prepareResults: any[] = [];

    for (const [index, entityName] of validEntityNames.entries()) {
      setProgress((prev) => prev + 5);
      setEntityName(t(syncName[entityName]));

      const allPendingOps =
        await repository.oplogRepository.findPendingLogsByTableName(entityName);

      if (allPendingOps) {
        const db = new DatabasePush();

        try {
          await db.pushEntity(entityName);
        } catch (error) {
          prepareResults.push({ entityName, pushed: false });
          continue;
        }
      } else {
        prepareResults.push({ entityName, pushed: true });
      }

      if (index === 15) {
        setIsComplete(true);
        setResults([...prepareResults]);
        setProgress(100);
      }
    }

    if (prepareResults?.filter((op) => !op?.pushed)?.length <= 0) {
      authContext.logout();
    }
  };

  useEffect(() => {
    if (visible && !isComplete) {
      prepareUpdate();
    }
  }, [visible, isComplete]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent={true}
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
            width: hp("50%"),
            borderRadius: 16,
            paddingVertical: hp("2%"),
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <View
            style={{
              paddingHorizontal: hp("2%"),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <DefaultText
              style={{ fontSize: 20, width: "80%" }}
              fontWeight="medium"
            >
              {t("Prepare for update")}
            </DefaultText>

            <TouchableOpacity
              onPress={() => {
                setProgress(0);
                setIsComplete(false);
                handleClose();
              }}
            >
              <ICONS.ClosedFilledIcon />
            </TouchableOpacity>
          </View>

          <View
            style={{
              marginVertical: hp("1.5%"),
              height: 1,
              backgroundColor: theme.colors.dividerColor.main,
            }}
          />

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <DefaultText
              style={{ paddingHorizontal: hp("2%") }}
              fontSize="md"
              color={"otherGrey.200"}
            >
              {isComplete ? t("Completed") : entityName}
            </DefaultText>
            <DefaultText
              style={{ paddingHorizontal: hp("2%") }}
              fontSize="md"
              color={"otherGrey.200"}
            >
              {`${Math.round(progress)}%`}
            </DefaultText>
          </View>

          <ProgressBar
            styleAttr="Horizontal"
            indeterminate={false}
            color={theme.colors.primary[1000]}
            style={{
              borderTopEndRadius: 20,
              borderBottomLeftRadius: 20,
              transform: [{ scaleX: 1.0 }, { scaleY: 2.5 }],
              margin: 10,
            }}
            progress={progress / 100}
          />

          {isComplete && (
            <View style={{ paddingHorizontal: hp("2%") }}>
              {results?.filter((fil: any) => !fil.pushed)?.length > 0 && (
                <>
                  {results
                    ?.filter((fil: any) => !fil.pushed)
                    ?.map((res: any) => {
                      return (
                        <View
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                          }}
                        >
                          <DefaultText fontSize="md" color={"otherGrey.200"}>
                            {t(syncName[res?.entityName])}
                          </DefaultText>
                          {res?.pushed ? (
                            <ICONS.TickFilledIcon
                              width={25}
                              height={25}
                              color={theme.colors.primary[1000]}
                            />
                          ) : (
                            <ICONS.InfoCircleMediumIcon
                              width={25}
                              height={25}
                              fill={"#F44837"}
                            />
                          )}
                        </View>
                      );
                    })}
                  <View
                    style={{
                      backgroundColor: theme.colors.red[100],
                    }}
                  >
                    <DefaultText
                      fontSize={"md"}
                      color={theme.colors.red["default"]}
                      style={{ opacity: 1, paddingHorizontal: 5 }}
                    >
                      {t("Above entities are not synced with server")}
                    </DefaultText>
                  </View>
                </>
              )}
            </View>
          )}
        </View>
      </View>

      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  content_view: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  contact_view: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  contact_text: {
    marginTop: 5,
    textAlign: "center",
  },
});
