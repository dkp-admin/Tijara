import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import ItemDivider from "../../../action-sheet/row-divider";
import NoDataPlaceholder from "../../../no-data-placeholder/no-data-placeholder";
import Spacer from "../../../spacer";
import DefaultText from "../../../text/Text";
import MMKVDB from "../../../../utils/DB-MMKV";
import showToast from "../../../toast";
import Toast from "react-native-toast-message";
import Loader from "../../../loader";
import { ActivityIndicator } from "react-native";
import repository from "../../../../db/repository";

export default function MoveTable({
  sheetRef,
  handleSelected,
}: {
  sheetRef: any;
  handleSelected: any;
}) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();
  const activeTable = MMKVDB.get("activeTableDineIn");
  const [tables, setTables] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    repository.sectionTableRepository
      .findActiveBySection({
        where: {
          status: "active",
          _id: activeTable?.sectionRef,
        },
      })
      .then((data) => {
        let tables: any[] = [];

        data?.forEach((section: any) => {
          const data = section.tables?.filter(
            (table: any) => table.status === "true"
          );

          tables.push(...data);
        });

        setTables(tables);
      });
  }, []);

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
      <Toast />

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
            {t("Select Table")}
          </DefaultText>

          <TouchableOpacity
            style={{
              paddingVertical: 15,
              paddingHorizontal: 12,
              position: "absolute",
              right: wp("1.5%"),
            }}
            onPress={async () => {
              setLoading(true);

              const activeTableDinein = await MMKVDB.get("activeTableDineIn");

              if (
                Number(selected?.capacity) <
                Number(activeTableDinein?.noOfGuests)
              ) {
                showToast("error", t("This table has less capacity"));
                return;
              }

              handleSelected(selected);
            }}
            disabled={!selected}
          >
            {loading ? (
              <ActivityIndicator size={"small"} />
            ) : (
              <DefaultText
                fontSize="2xl"
                fontWeight="medium"
                color={selected ? "primary.1000" : theme.colors.placeholder}
              >
                {t("Shift")}
              </DefaultText>
            )}
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

        <FlatList
          style={{ marginTop: 5, minHeight: hp("60%") }}
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          data={tables}
          keyExtractor={(item: any, index) => `${index}`}
          renderItem={({ item, index }) => {
            return (
              <>
                <TouchableOpacity
                  key={index}
                  style={{
                    ...styles.item_row,
                    backgroundColor:
                      item.id === selected?.id
                        ? theme.colors.primary[100]
                        : theme.colors.bgColor,
                  }}
                  onPress={() => {
                    setSelected(item);
                  }}
                >
                  <DefaultText
                    fontWeight={item.id === selected?.id ? "medium" : "normal"}
                    color={
                      item.id === selected?.id ? "primary.1000" : "text.primary"
                    }
                  >
                    {`${item.label} (${t("Capacity")}: ${item.capacity})`}
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
                  title={t("No Tables!")}
                  marginTop={hp("10%")}
                />
              </View>
            );
          }}
          ListFooterComponent={() => <Spacer space={hp("18%")} />}
        />
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
