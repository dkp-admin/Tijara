import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Checkbox from "react-native-bouncy-checkbox";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import ICONS from "../../../../utils/icons";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import ItemDivider from "../../../action-sheet/row-divider";
import NoDataPlaceholder from "../../../no-data-placeholder/no-data-placeholder";
import Spacer from "../../../spacer";
import DefaultText from "../../../text/Text";
import showToast from "../../../toast";
import Toast from "react-native-toast-message";
import repository from "../../../../db/repository";

const MergeShiftTableModal = ({
  data,
  type,
  visible = false,
  handleClose,
  handleSubmit,
}: {
  data: any;
  type: string;
  visible: boolean;
  handleClose: any;
  handleSubmit: any;
}) => {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();

  const [tables, setTables] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    repository.sectionTableRepository
      .findActiveBySection(data?.sectionRef)
      .then((res) => {
        let tables: any[] = [];

        res?.forEach((section: any) => {
          const updatedTablesData = section.tables?.filter(
            (table: any) =>
              table.status !== "inactive" &&
              table?.status !== "seated" &&
              table?.id !== data?.id
          );

          tables.push(...updatedTablesData);
        });

        setTables(tables);
      });
  }, [type, data]);

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
            marginHorizontal: twoPaneView ? "20%" : "0%",
            backgroundColor: theme.colors.bgColor,
          }}
        >
          <Toast />
          <ActionSheetHeader
            title={type === "merge" ? t("Merge Table") : t("Shift Table")}
            rightBtnText={type === "merge" ? t("Merge") : t("Shift")}
            handleLeftBtn={() => handleClose()}
            handleRightBtn={() => {
              if (
                Number(selected?.capacity) < Number(data?.noOfGuests) &&
                type === "shift"
              ) {
                showToast("error", t("This table has less capacity"));
                return;
              }
              handleSubmit(selected, data, type);
            }}
            permission={true}
          />

          <Spacer space={hp("2.5%")} />

          <View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <DefaultText style={{ marginLeft: hp("3%") }} fontSize="xl">
                {type === "merge" ? `${t("Merge")} ` : `${t("Shift")} `}
              </DefaultText>

              <DefaultText
                fontSize="xl"
                fontWeight="medium"
                color="primary.1000"
              >
                {data?.label}
              </DefaultText>

              {selected && (
                <DefaultText fontSize="xl">{` ${t("to")} `}</DefaultText>
              )}

              {selected && (
                <DefaultText
                  fontSize="xl"
                  fontWeight="medium"
                  color="primary.1000"
                >
                  {selected?.label}
                </DefaultText>
              )}
            </View>

            <Spacer space={hp("2%")} />

            <ItemDivider
              style={{
                margin: 0,
                borderWidth: 0,
                borderBottomWidth: 1,
                borderTop: 10,
              }}
            />

            <FlatList
              style={{ minHeight: hp("60%") }}
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              data={tables}
              keyExtractor={(item, index) => `${index}-${item?.id}`}
              renderItem={({ item, index }) => {
                return (
                  <>
                    <TouchableOpacity
                      key={index}
                      style={{
                        ...styles.item_row,
                        backgroundColor:
                          item?.id && item.id === selected?.id
                            ? theme.colors.primary[100]
                            : theme.colors.bgColor,
                      }}
                      onPress={() => {
                        setSelected(item);
                      }}
                    >
                      <Checkbox
                        style={{ marginRight: -hp("0.5%") }}
                        isChecked={item?.id && item.id === selected?.id}
                        fillColor={"transparent"}
                        unfillColor={"transparent"}
                        iconComponent={
                          item?.id && item.id === selected?.id ? (
                            <ICONS.RadioFilledIcon
                              width={25}
                              height={25}
                              color={theme.colors.primary[1000]}
                            />
                          ) : (
                            <ICONS.RadioEmptyIcon
                              width={25}
                              height={25}
                              color={theme.colors.primary[1000]}
                            />
                          )
                        }
                        disableBuiltInState
                        disabled
                      />

                      <DefaultText
                        fontWeight={
                          item?.id && item.id === selected?.id
                            ? "medium"
                            : "normal"
                        }
                        color={
                          item?.id && item.id === selected?.id
                            ? "primary.1000"
                            : "text.primary"
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
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { overflow: "hidden", height: "100%" },
  card_view: {
    elevation: 100,
    marginTop: "3%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  textInput: { flex: 0.99, marginRight: -16 },
  item_row: {
    paddingVertical: 18,
    paddingHorizontal: 26,
    flexDirection: "row",
    alignItems: "center",
  },
});

export default MergeShiftTableModal;
