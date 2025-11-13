import { AntDesign, Feather } from "@expo/vector-icons";
import React, { useContext, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { t } from "../../../../../../i18n";
import AuthContext from "../../../../../context/auth-context";
import { useTheme } from "../../../../../context/theme-context";
import { checkDirection } from "../../../../../hooks/check-direction";
import { useResponsive } from "../../../../../hooks/use-responsiveness";
import { AuthType } from "../../../../../types/auth-types";
import Input from "../../../../input/input";
import DefaultText from "../../../../text/Text";
import showToast from "../../../../toast";
import ImageView from "../../../left-view/catalogue/image-view";

export default function OnlineOrderItemsRow({
  data,
  index,
  isLast,
  editIndex,
  deleteIndex,
  handleEdit,
  handleDelete,
  handleSave,
  disabled,
  loading,
}: {
  data: any;
  index: number;
  isLast: boolean;
  editIndex: number;
  deleteIndex: number;
  handleEdit: any;
  handleDelete: any;
  handleSave: any;
  disabled: boolean;
  loading: boolean;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  if (!data) {
    return <></>;
  }

  const [quantity, setQuantity] = useState<string>(data.quantity || "1");

  const getItemName = () => {
    let units = "";

    if (data.variant.type === "box") {
      units = `, (${t("Box")} - ${data.variant.unitCount} ${t("Units")})`;
    }

    if (data.variant.type === "crate") {
      units = `, (${t("Crate")} - ${data.variant.unitCount} ${t("Units")})`;
    }

    const variantNameEn = data.hasMultipleVariants
      ? ` - ${data.variant.name.en}`
      : "";
    const variantNameAr = data.hasMultipleVariants
      ? ` - ${data.variant.name.ar}`
      : "";

    if (isRTL) {
      return `${data.name.ar}${variantNameAr}${units}`;
    } else {
      return `${data.name.en}${variantNameEn}${units}`;
    }
  };

  const getModifierName = () => {
    let name = "";

    data?.modifiers?.map((mod: any) => {
      name += `${name === "" ? "" : ", "}${mod.optionName}`;
    });

    return name;
  };

  return (
    <View
      style={{
        paddingVertical: hp("2.5%"),
        paddingHorizontal: hp("1.75%"),
        flexDirection: "row",
        alignItems: "center",
        borderColor: "#E5E9EC",
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomLeftRadius: isLast ? 16 : 0,
        borderBottomRightRadius: isLast ? 16 : 0,
        backgroundColor: theme.colors.dark[50],
      }}
    >
      <View
        style={{
          width: twoPaneView ? "45%" : "51%",
          marginLeft: "1%",
          marginRight: "4%",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <ImageView data={data} borderRadius={8} />

        <View style={{ marginHorizontal: hp("1.5%") }}>
          <DefaultText fontSize="lg" fontWeight="medium">
            {getItemName()}
          </DefaultText>

          {data?.modifiers?.length > 0 && (
            <DefaultText
              style={{ marginTop: 5 }}
              fontSize="lg"
              color="otherGrey.200"
            >
              {getModifierName()}
            </DefaultText>
          )}
        </View>
      </View>

      <View
        style={{
          width: twoPaneView ? "13%" : "10%",
          marginRight: "4%",
        }}
      >
        <Input
          containerStyle={{ height: hp("6.5%") }}
          values={`${editIndex === index ? quantity : data.quantity}`}
          handleChange={(val: any) => {
            const regex = /^[0-9\b]+$/;

            if (val === "" || regex.test(val)) {
              setQuantity(val);
            }
          }}
          maxLength={10}
          keyboardType="number-pad"
          placeholderText={t("Quantity")}
          disabled={editIndex !== index}
        />
      </View>

      {data?.isFree ? (
        <View
          style={{
            width: twoPaneView ? "23%" : "20%",
            marginRight: "2%",
          }}
        >
          <DefaultText fontSize="lg" fontWeight="medium">
            {"FREE"}
          </DefaultText>

          <DefaultText
            fontSize="md"
            fontWeight="medium"
            color="otherGrey.200"
            style={{ textDecorationLine: "line-through" }}
          >
            {`${t("SAR")} ${Number(data.billing.total)?.toFixed(2)}`}
          </DefaultText>
        </View>
      ) : data?.isQtyFree ? (
        <View
          style={{
            width: twoPaneView ? "23%" : "20%",
            marginRight: "2%",
          }}
        >
          <DefaultText fontSize="lg" fontWeight="medium">
            {`${t("SAR")} ${Number(
              data.billing.total - data.billing.discountAmount
            )?.toFixed(2)}`}
          </DefaultText>

          <DefaultText
            fontSize="md"
            fontWeight="medium"
            color="otherGrey.200"
            style={{ textDecorationLine: "line-through" }}
          >
            {`${t("SAR")} ${Number(data.billing.total)?.toFixed(2)}`}
          </DefaultText>
        </View>
      ) : (
        <DefaultText
          style={{
            width: twoPaneView ? "23%" : "20%",
            marginRight: "2%",
          }}
          fontSize="lg"
          fontWeight="medium"
        >
          {`${t("SAR")} ${Number(data.billing.total)?.toFixed(2)}`}
        </DefaultText>
      )}

      {editIndex === index ? (
        <TouchableOpacity
          style={{
            width: "7%",
            marginRight: "1%",
            paddingLeft: hp("3%"),
            paddingVertical: hp("1.5%"),
          }}
          onPress={() => {
            if (!authContext.permission["pos:order"]?.update) {
              return showToast("error", t("You don't have access"));
            }
            handleSave(
              quantity === "" || quantity === "0" ? data.quantity : quantity
            );
          }}
        >
          {loading ? (
            <ActivityIndicator size={"small"} />
          ) : (
            <DefaultText
              style={{ textAlign: "right" }}
              fontSize="2xl"
              fontWeight="medium"
              color="primary.1000"
            >
              {t("Save")}
            </DefaultText>
          )}
        </TouchableOpacity>
      ) : (
        <View
          style={{
            width: "7%",
            marginRight: "1%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <TouchableOpacity
            style={{
              paddingLeft: hp("3%"),
              paddingVertical: hp("1.5%"),
            }}
            onPress={() => {
              if (disabled) {
                return showToast(
                  "error",
                  t("Discounted order can't be modified")
                );
              }

              if (!authContext.permission["pos:order"]?.update) {
                return showToast("error", t("You don't have access"));
              }
              handleEdit(index);
            }}
          >
            <Feather name="edit" size={24} color={theme.colors.primary[1000]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              paddingLeft: hp("3%"),
              paddingVertical: hp("1.5%"),
            }}
            onPress={() => {
              if (disabled) {
                return showToast(
                  "error",
                  t("Discounted order can't be deleted")
                );
              }

              if (!authContext.permission["pos:order"]?.update) {
                return showToast("error", t("You don't have access"));
              }
              handleDelete(index);
            }}
            disabled={deleteIndex === index}
          >
            {deleteIndex === index ? (
              <ActivityIndicator size={"small"} />
            ) : (
              <AntDesign
                name="delete"
                size={24}
                color={theme.colors.red.default}
              />
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
