import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import Checkbox from "react-native-bouncy-checkbox";
import RBSheet from "react-native-raw-bottom-sheet";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ICONS from "../../../utils/icons";
import ItemDivider from "../../action-sheet/row-divider";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import Spacer from "../../spacer";
import DefaultText from "../../text/Text";
import showToast from "../../toast";
import Toast from "react-native-toast-message";

export default function ExcludeOptionSelectInput({
  sheetRef,
  options,
  selectedIds,
  minimumOption,
  handleSelected,
}: {
  sheetRef: any;
  options: any;
  selectedIds: any;
  minimumOption: number;
  handleSelected: any;
}) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();

  const [showError, setShowError] = useState(false);
  const [selectedExclude, setSelectedExclude] = useState<string[]>([]);

  const isSelected = (item: any) => {
    if (selectedExclude?.length > 0) {
      return selectedExclude.includes(item._id);
    }

    return false;
  };

  useEffect(() => {
    setShowError(false);
    setSelectedExclude(selectedIds);
  }, [selectedIds]);

  return (
    //@ts-ignore
    <RBSheet
      ref={sheetRef}
      closeOnDragDown={true}
      closeOnPressMask={true}
      animationType="fade"
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
            {t("Select Exclude Options")}
          </DefaultText>

          <TouchableOpacity
            style={{
              paddingVertical: 15,
              paddingHorizontal: 12,
              position: "absolute",
              right: wp("1.5%"),
            }}
            onPress={() => {
              handleSelected(selectedExclude);
            }}
          >
            <DefaultText
              fontSize="2xl"
              fontWeight="medium"
              color="primary.1000"
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

        {showError && (
          <DefaultText
            style={{ marginLeft: 20, marginTop: 5 }}
            color="red.default"
            fontSize="md"
          >
            {`${t(
              "Since the 'Minimum options' value equals the total number of modifier options, excluding an option is no longer possible"
            )}.`}
          </DefaultText>
        )}

        <FlatList
          style={{ marginTop: 5, minHeight: hp("60%") }}
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          data={options || []}
          renderItem={({ item, index }) => {
            return (
              <>
                <TouchableOpacity
                  key={index}
                  style={{
                    ...styles.item_row,
                  }}
                  onPress={() => {
                    const idx = selectedExclude?.indexOf(item._id);

                    const exclude =
                      minimumOption === 0
                        ? options?.length - selectedExclude?.length <= 1
                        : options?.length - selectedExclude?.length <=
                          minimumOption;

                    if (idx === -1 && exclude) {
                      setShowError(true);
                      return;
                    }

                    if (idx === -1) {
                      setSelectedExclude([...selectedExclude, item._id]);
                    } else {
                      const newIds = [...selectedExclude];
                      newIds.splice(idx, 1);
                      setSelectedExclude(newIds);
                    }

                    setShowError(false);
                  }}
                >
                  <Checkbox
                    style={{ marginRight: -hp("0.5%") }}
                    isChecked={isSelected(item)}
                    fillColor={theme.colors.primary[100]}
                    unfillColor={theme.colors.white[1000]}
                    iconComponent={
                      isSelected(item) ? (
                        <ICONS.TickFilledIcon
                          width={25}
                          height={25}
                          color={theme.colors.primary[1000]}
                        />
                      ) : (
                        <ICONS.TickEmptyIcon
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
                    fontWeight={isSelected(item) ? "medium" : "normal"}
                  >
                    {item.name}
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
                  title={t("No Exclude Options!")}
                  marginTop={hp("10%")}
                />
              </View>
            );
          }}
          ListFooterComponent={() => <View style={{ height: hp("18%") }} />}
        />
      </View>

      <Toast />
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
