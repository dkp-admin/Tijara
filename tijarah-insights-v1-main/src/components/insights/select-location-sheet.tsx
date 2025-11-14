import React, { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useAuth } from "../../hooks/use-auth";
import { useEntity } from "../../hooks/use-entity";
import { useResponsive } from "../../hooks/use-responsiveness";
import ICONS from "../../utils/icons";
import ActionSheetHeader from "../action-sheet/action-sheet-header";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import Spacer from "../spacer";
import DefaultText, { getOriginalSize } from "../text/Text";
import { PrimaryButton } from "../buttons/primary-button";

const allData = { _id: "all", name: "All Locations" };

export default function SelectLocationSheet({
  sheetRef,
  selectedLocation,
  handleSelectedLocation,
}: {
  sheetRef: any;
  selectedLocation: any;
  handleSelectedLocation: any;
}) {
  const theme = useTheme();
  const { user } = useAuth();
  const { hp } = useResponsive();

  const [location, setLocation] = useState(allData);

  const { find: findLocations, entities } = useEntity("location");

  const locations = useMemo(() => {
    if (entities?.total > 0) {
      const locationData = entities.results.map((location: any) => {
        return {
          _id: location._id,
          name: `${location.name.en}, ${location.address.city}`,
        };
      });

      return [allData, ...locationData];
    } else {
      return [allData];
    }
  }, [entities]);

  useEffect(() => {
    findLocations({
      page: 0,
      limit: 100,
      _q: "",
      sort: "desc",
      activeTab: "all",
      companyRef: user?.companyRef,
    });
  }, []);

  useEffect(() => {
    setLocation(selectedLocation);
  }, [selectedLocation]);

  return (
    //@ts-ignore
    <RBSheet
      ref={sheetRef}
      animationType="fade"
      closeOnDragDown={true}
      closeOnPressMask={true}
      customStyles={{
        container: {
          ...styles.card_view,
          backgroundColor: theme.colors.bgColor2,
        },
        wrapper: {
          backgroundColor: theme.colors.transparentBg,
        },
      }}
    >
      <View>
        <ActionSheetHeader
          center
          title={t("Select Location")}
          sheetRef={sheetRef}
        />

        <FlatList
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          data={locations}
          renderItem={({ item }: any) => {
            return (
              <View key={item._id}>
                <TouchableOpacity
                  style={styles.location_row}
                  onPress={() => {
                    setLocation(item);
                  }}
                >
                  {item._id === location._id ? (
                    <ICONS.RadioFilledIcon
                      width={getOriginalSize(24)}
                      height={getOriginalSize(24)}
                    />
                  ) : (
                    <ICONS.RadioEmptyIcon
                      width={getOriginalSize(24)}
                      height={getOriginalSize(24)}
                    />
                  )}

                  <DefaultText
                    style={{ marginLeft: getOriginalSize(12) }}
                    fontWeight="medium"
                  >
                    {item.name}
                  </DefaultText>
                </TouchableOpacity>

                <View
                  style={{
                    marginLeft: getOriginalSize(16),
                    borderWidth: 0,
                    borderBottomWidth: getOriginalSize(0.5),
                    borderStyle: "solid",
                    borderColor: theme.colors.dividerColor.main,
                  }}
                />
              </View>
            );
          }}
          ListEmptyComponent={() => {
            return (
              <View style={{ marginTop: "45%", marginHorizontal: 16 }}>
                <NoDataPlaceholder title={t("No Locations!")} />
              </View>
            );
          }}
          ListFooterComponent={() => <Spacer space={hp("15%")} />}
        />
      </View>

      <View
        style={{
          ...styles.footer,
          paddingVertical: hp("3.5%"),
          paddingHorizontal: hp("2%"),
          backgroundColor: theme.colors.bgColor2,
        }}
      >
        <View style={{ flex: 1 }}>
          <PrimaryButton
            reverse
            style={{ paddingVertical: hp("2%") }}
            textStyle={{ fontSize: getOriginalSize(18) }}
            title={t("Default")}
            onPress={() => {
              handleSelectedLocation(allData);
            }}
          />
        </View>

        <Spacer space={hp("3%")} />

        <View style={{ flex: 1 }}>
          <PrimaryButton
            style={{ paddingVertical: hp("2%") }}
            textStyle={{ fontSize: getOriginalSize(18) }}
            title={t("Apply")}
            onPress={() => {
              handleSelectedLocation(location);
            }}
          />
        </View>
      </View>
    </RBSheet>
  );
}

const styles = StyleSheet.create({
  card_view: {
    elevation: getOriginalSize(100),
    marginTop: "5%",
    minHeight: "85%",
    borderTopLeftRadius: getOriginalSize(32),
    borderTopRightRadius: getOriginalSize(32),
  },
  location_row: {
    paddingVertical: getOriginalSize(18),
    paddingHorizontal: getOriginalSize(20),
    flexDirection: "row",
    alignItems: "center",
  },
  footer: {
    flex: 1,
    bottom: 0,
    margin: 0,
    width: "100%",
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    borderTopLeftRadius: getOriginalSize(34),
    borderTopRightRadius: getOriginalSize(34),
    elevation: getOriginalSize(24),
    shadowRadius: getOriginalSize(24),
    shadowOpacity: getOriginalSize(24),
    shadowColor: "#15141F",
    shadowOffset: { width: getOriginalSize(16), height: getOriginalSize(16) },
  },
});
