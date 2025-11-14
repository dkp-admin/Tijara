import React, { useContext, useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { t } from "../../../../../i18n";
import AuthContext from "../../../../context/auth-context";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import { AuthType } from "../../../../types/auth-types";
import ItemDivider from "../../../action-sheet/row-divider";
import NoDataPlaceholder from "../../../no-data-placeholder/no-data-placeholder";
import PermissionPlaceholderComponent from "../../../permission-placeholder";
import Spacer from "../../../spacer";
import DefaultText from "../../../text/Text";
import repository from "../../../../db/repository";

export default function VoidCompSelection({
  type,
  sheetRef,
  handleSelected,
}: {
  type: string;
  sheetRef: any;
  handleSelected: any;
}) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  const [selected, setSelected] = useState<any>(null);
  const [voidComp, setVoidComp] = useState<any[]>([]);

  useEffect(() => {
    repository.voidCompRepository
      .find({
        where: {
          type: type,
          status: "active",
        },
      })
      .then((data) => {
        setVoidComp(data);
      });
  }, [type]);

  return (
    //@ts-ignore
    <RBSheet
      ref={sheetRef}
      closeOnDragDown={true}
      closeOnPressMask={true}
      animationType="fade"
      onClose={() => {
        setSelected(null);
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
            {type === "void" ? t("Select Void") : t("Select Comp")}
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
            disabled={!selected}
          >
            <DefaultText
              fontSize="2xl"
              fontWeight="medium"
              color={selected ? "primary.1000" : theme.colors.placeholder}
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

        {!authContext.permission["pos:void-comp"]?.read ? (
          <PermissionPlaceholderComponent
            title={
              type === "void"
                ? t("You don't have permission to select void")
                : t("You don't have permission to select comp")
            }
            marginTop="-20%"
          />
        ) : (
          <FlatList
            style={{ marginTop: 5, minHeight: hp("60%") }}
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            data={voidComp}
            renderItem={({ item, index }) => {
              return (
                <>
                  <TouchableOpacity
                    key={index}
                    style={{
                      ...styles.item_row,
                      backgroundColor:
                        item._id === selected?._id
                          ? theme.colors.primary[100]
                          : theme.colors.bgColor,
                    }}
                    onPress={() => {
                      setSelected(item);
                    }}
                  >
                    <DefaultText
                      fontWeight={
                        item._id === selected?._id ? "medium" : "normal"
                      }
                      color={
                        item._id === selected?._id
                          ? "primary.1000"
                          : "text.primary"
                      }
                    >
                      {item.reason.en}
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
                    title={type === "void" ? t("No Void!") : t("No Comp!")}
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
