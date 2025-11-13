import React, { useEffect, useMemo, useRef, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Menu, MenuItem } from "react-native-material-menu";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import ICONS from "../../../../utils/icons";
import ItemDivider from "../../../action-sheet/row-divider";
import DefaultText from "../../../text/Text";
import repository from "../../../../db/repository";

const floorName: any = {
  floor0: "Level 0",
  floor1: "Level 1",
  floor2: "Level 2",
  floor3: "Level 3",
  floor4: "Level 4",
};

export default function FloorMenuOptions({
  floor,
  handleFloor,
  data,
}: {
  floor: string;
  handleFloor: any;
  data: any;
}) {
  const theme = useTheme();
  const menu = useRef<any>();
  const { hp } = useResponsive();
  const [sectionTables, setSectionTables] = useState([]);
  const floorTypeOptions = useMemo(() => {
    return [
      {
        label: t("G-Floor"),
        value: "floor0",
      },
      {
        label: t("1st Floor"),
        value: "floor1",
      },
      {
        label: t("2nd Floor"),
        value: "floor2",
      },
      {
        label: t("3rd Floor"),
        value: "floor3",
      },
      {
        label: t("4th Floor"),
        value: "floor4",
      },
    ];
  }, []);

  useEffect(() => {
    repository.sectionTableRepository
      .findAndCount({
        skip: 0,
        take: 20,
        where: {
          status: "active",
        },
      })
      .then((sections: any) => {
        setSectionTables(sections?.[0]);
      });
  }, [data]);

  const activeFloors = useMemo(() => {
    return floorTypeOptions
      .map((flr) => {
        if (sectionTables.map((op: any) => op?.floorType).includes(flr.value)) {
          return flr;
        }
      })
      .filter((op) => op);
  }, [sectionTables, data]);

  useEffect(() => {
    if (!floor) {
      handleFloor(activeFloors[0]?.value);
    }
  }, [activeFloors, floor]);

  return (
    <Menu
      ref={menu}
      style={{
        borderRadius: 16,
        marginTop: hp("5%"),
        justifyContent: "flex-end",
        height: activeFloors?.length * hp("6.5%"),
        backgroundColor: theme.colors.white[1000],
      }}
      anchor={
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingRight: hp("2%"),
            paddingTop: hp("1.5%"),
            paddingBottom: hp("0.75%"),
          }}
          onPress={() => {
            menu.current.show();
          }}
        >
          <DefaultText fontSize="lg" fontWeight="medium">
            {floorName[floor]}
          </DefaultText>

          <View style={{ marginTop: 5, marginLeft: 8 }}>
            <ICONS.ArrowDownIcon
              width={12}
              opacity={1}
              color={theme.colors.text.primary}
            />
          </View>
        </TouchableOpacity>
      }
      onRequestClose={() => {
        menu.current.hide();
      }}
    >
      {activeFloors?.map((floor: any, index: number) => {
        return (
          <View key={index}>
            <MenuItem
              style={{ borderRadius: 16, height: hp("6.5%") }}
              onPress={() => {
                handleFloor(floor.value);
                menu.current.hide();
              }}
            >
              <DefaultText fontSize="lg" fontWeight="medium">
                {floor.label}
              </DefaultText>
            </MenuItem>

            {activeFloors?.length - 1 > index && (
              <ItemDivider
                style={{
                  margin: 0,
                  borderWidth: 0,
                  borderBottomWidth: 1.5,
                  borderColor: "#E5E9EC",
                }}
              />
            )}
          </View>
        );
      })}
    </Menu>
  );
}
