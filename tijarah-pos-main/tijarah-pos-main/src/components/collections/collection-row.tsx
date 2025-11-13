import React, { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { In } from "typeorm";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { useResponsive } from "../../hooks/use-responsiveness";
import { repo } from "../../utils/createDatabaseConnection";
import ICONS from "../../utils/icons";
import ItemDivider from "../action-sheet/row-divider";
import DefaultText from "../text/Text";

export default function CollectionRow({
  data,
  selectedCollection,
  handleSelected,
}: any) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { wp, hp } = useResponsive();

  const isSelected = () => {
    return data?._id == selectedCollection;
  };

  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    if (data?._id != null) {
      repo.product
        .count({ where: { collections: In(data._id) } })
        .then((count) => {
          setProductCount(count);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [data]);

  return (
    <>
      <TouchableOpacity
        style={{
          paddingVertical: hp("1.75%"),
          paddingHorizontal: wp("1.4%"),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: isSelected()
            ? "#8A959E1A"
            : theme.colors.white[1000],
        }}
        onPress={() => {
          handleSelected(data._id);
        }}
      >
        <View style={{ width: "75%" }}>
          <DefaultText fontSize="lg">{data?.name?.en}</DefaultText>

          <DefaultText
            style={{ marginTop: 5 }}
            fontSize="lg"
            fontWeight="medium"
          >
            {data?.name?.ar}
          </DefaultText>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <DefaultText style={{ textAlign: "right" }} fontSize="2xl">
            {`${productCount}`}
          </DefaultText>

          <View
            style={{
              marginLeft: wp("1.25%"),
              transform: [
                {
                  rotate: isRTL ? "180deg" : "0deg",
                },
              ],
            }}
          >
            <ICONS.RightContentIcon />
          </View>
        </View>
      </TouchableOpacity>

      <ItemDivider
        style={{
          margin: 0,
          borderWidth: 0,
          borderBottomWidth: 1,
          borderColor: "#E5E9EC",
        }}
      />
    </>
  );
}
