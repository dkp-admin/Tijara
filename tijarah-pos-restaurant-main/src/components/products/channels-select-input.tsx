import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import Checkbox from "react-native-bouncy-checkbox";
import RBSheet from "react-native-raw-bottom-sheet";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import ICONS from "../../utils/icons";
import ItemDivider from "../action-sheet/row-divider";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import Spacer from "../spacer";
import DefaultText from "../text/Text";

export default function ChannelsSelectInput({
  sheetRef,
  selectedIds,
  channelOptions = [],
  handleSelected,
}: {
  sheetRef: any;
  selectedIds: any;
  channelOptions: any[];
  handleSelected: any;
}) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();

  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

  const isSelected = (item: any) => {
    if (selectedChannels?.length > 0) {
      if (item.value === "all") {
        if (selectedChannels?.length === channelOptions?.length) {
          return true;
        } else {
          return false;
        }
      }

      return selectedChannels.includes(item.value);
    }

    return false;
  };

  useEffect(() => {
    setSelectedChannels(selectedIds);
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
            {t("Select Channels")}
          </DefaultText>

          <TouchableOpacity
            style={{
              paddingVertical: 15,
              paddingHorizontal: 12,
              position: "absolute",
              right: wp("1.5%"),
            }}
            onPress={() => {
              handleSelected(selectedChannels);
            }}
          >
            <DefaultText
              fontSize="2xl"
              fontWeight="medium"
              color="primary.1000"
            >
              {t("Add")}
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

        <FlatList
          style={{ marginTop: 5, minHeight: hp("60%") }}
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          data={[
            {
              label: "All",
              value: "all",
            },
            ...channelOptions,
          ]}
          renderItem={({ item, index }) => {
            return (
              <>
                <TouchableOpacity
                  key={index}
                  style={{
                    ...styles.item_row,
                    backgroundColor: theme.colors.bgColor,
                  }}
                  onPress={() => {
                    const idx = selectedChannels?.indexOf(item.value);

                    if (item.value === "all") {
                      const newIds: string[] = channelOptions?.map(
                        (channel: any) => {
                          return channel.value;
                        }
                      );

                      setSelectedChannels(newIds);
                      return;
                    }

                    if (idx === -1) {
                      setSelectedChannels([...selectedChannels, item.value]);
                    } else {
                      const newIds = [...selectedChannels];
                      newIds.splice(idx, 1);
                      setSelectedChannels(newIds);
                    }
                  }}
                >
                  <Checkbox
                    style={{ marginRight: -hp("0.5%") }}
                    isChecked={isSelected(item)}
                    fillColor={theme.colors.white[1000]}
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
                    {item.label}
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
                  title={t("No Channels!")}
                  marginTop={hp("10%")}
                />
              </View>
            );
          }}
          ListFooterComponent={() => <View style={{ height: hp("18%") }} />}
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
