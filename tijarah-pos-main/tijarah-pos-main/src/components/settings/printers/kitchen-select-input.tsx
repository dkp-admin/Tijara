import React, { useContext, useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { t } from "../../../../i18n";
import AuthContext from "../../../context/auth-context";
import { useTheme } from "../../../context/theme-context";
import { checkDirection } from "../../../hooks/check-direction";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { AuthType } from "../../../types/auth-types";
import { repo } from "../../../utils/createDatabaseConnection";
import { debugLog } from "../../../utils/log-patch";
import ItemDivider from "../../action-sheet/row-divider";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import PermissionPlaceholderComponent from "../../permission-placeholder";
import Spacer from "../../spacer";
import DefaultText from "../../text/Text";

export default function KitchenSelectInput({
  data,
  sheetRef,
  handleSelected,
}: {
  data: any;
  sheetRef: any;
  handleSelected: any;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { wp, hp } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  const [kitchenMngt, setKitchenMngt] = useState<any[]>([]);
  const [selected, setSelected] = useState({ key: "", value: "" });

  useEffect(() => {
    repo.kitchenManagement
      .find({
        where: {
          status: "active",
        },
      })
      .then((data) => {
        debugLog(
          "Kitchen management fetched from db",
          {},
          "kitchen-management-selection",
          "fetchKitchenManagement"
        );
        setKitchenMngt(data);
      });
  }, []);

  useEffect(() => {
    if (data) {
      setSelected(data);
    }
  }, [data]);

  return (
    //@ts-ignore
    <RBSheet
      ref={sheetRef}
      closeOnDragDown={true}
      closeOnPressMask={true}
      animationType="fade"
      onClose={() => {
        setSelected({ key: "", value: "" });
      }}
      customStyles={{
        container: {
          ...styles.card_view,
          minHeight: hp("75%"),
          backgroundColor: theme.colors.bgColor,
        },
        wrapper: {
          backgroundColor: theme.colors.transparentBg,
        },
      }}
    >
      <View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <DefaultText
            style={{ marginLeft: hp("2.25%") }}
            fontSize="2xl"
            fontWeight="medium"
          >
            {t("Select Kitchen")}
          </DefaultText>

          <TouchableOpacity
            style={{
              paddingVertical: 15,
              paddingHorizontal: 12,
              position: "absolute",
              right: wp("1.5%"),
            }}
            onPress={() => {
              handleSelected(selected);
            }}
            disabled={selected?.key === ""}
          >
            <DefaultText
              fontSize="2xl"
              fontWeight="medium"
              color={
                selected?.key !== "" ? "primary.1000" : theme.colors.placeholder
              }
            >
              {t("Done")}
            </DefaultText>
          </TouchableOpacity>
        </View>

        <Spacer space={10} />

        <ItemDivider
          style={{
            margin: 0,
            borderWidth: 0,
            borderBottomWidth: 1,
            borderTop: 10,
          }}
        />

        {!authContext.permission["pos:kitchen"]?.read ? (
          <PermissionPlaceholderComponent
            title={t("You don't have permission to select kitchen")}
            marginTop="-15%"
          />
        ) : (
          <FlatList
            style={{ marginTop: 5, minHeight: hp("60%") }}
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            data={kitchenMngt}
            renderItem={({ item, index }) => {
              return (
                <>
                  <TouchableOpacity
                    key={index}
                    style={{
                      ...styles.item_row,
                      backgroundColor:
                        item._id === selected?.key
                          ? theme.colors.primary[100]
                          : theme.colors.bgColor,
                    }}
                    onPress={() => {
                      setSelected({ key: item._id, value: item.name.en });
                    }}
                  >
                    <DefaultText
                      fontWeight={
                        item._id === selected?.key ? "medium" : "normal"
                      }
                      color={
                        item._id === selected?.key
                          ? "primary.1000"
                          : "text.primary"
                      }
                    >
                      {isRTL ? item.name.ar : item.name.en}
                    </DefaultText>
                  </TouchableOpacity>

                  <ItemDivider
                    style={{
                      margin: 0,
                      borderWidth: 0,
                      borderBottomWidth: StyleSheet.hairlineWidth,
                    }}
                  />
                </>
              );
            }}
            ListEmptyComponent={() => {
              return (
                <View style={{ marginHorizontal: 16 }}>
                  <NoDataPlaceholder
                    title={t("No Kitchens!")}
                    marginTop={hp("10%")}
                  />
                </View>
              );
            }}
            ListFooterComponent={() => <Spacer space={hp("18%")} />}
          />
        )}
      </View>
    </RBSheet>
  );
}

const styles = StyleSheet.create({
  card_view: {
    elevation: 100,
    marginTop: "3%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  textInput: {
    flex: 0.99,
    marginRight: -16,
  },
  item_row: {
    paddingVertical: 18,
    paddingHorizontal: 26,
    flexDirection: "row",
    alignItems: "center",
  },
});
