import React from "react";
import { View } from "react-native";
import { t } from "../../../../../../i18n";
import { useTheme } from "../../../../../context/theme-context";
import { checkDirection } from "../../../../../hooks/check-direction";
import { useResponsive } from "../../../../../hooks/use-responsiveness";
import DefaultText from "../../../../text/Text";
import ImageView from "../../../left-view/catalogue/image-view";
import { useCurrency } from "../../../../../store/get-currency";

export default function DeletedItemsRow({
  data,
  isLast,
}: {
  data: any;
  isLast: boolean;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { currency } = useCurrency();
  const { hp, twoPaneView } = useResponsive();

  if (!data) {
    return <></>;
  }

  const getItemName = () => {
    let units = "";

    if (data.variant.type === "box") {
      units = `, (${t("Box")} - ${data.variant.unitCount} ${t("Units")})`;
    }

    if (data.type === "crate") {
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
        opacity: 0.6,
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
          width: twoPaneView ? "50%" : "65%",
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

      {twoPaneView ? (
        <>
          <DefaultText
            style={{ width: "18%", marginLeft: "0.5%", marginRight: "1.5%" }}
            fontSize="lg"
            fontWeight="medium"
          >
            {data.quantity}
          </DefaultText>

          {data?.isFree ? (
            <View
              style={{
                width: "24%",
                marginRight: "1%",
                alignItems: "flex-end",
              }}
            >
              <DefaultText fontSize="lg" fontWeight="medium">
                {"FREE"}
              </DefaultText>

              <DefaultText
                fontSize="lg"
                fontWeight="medium"
                color="otherGrey.200"
                style={{ textDecorationLine: "line-through" }}
              >
                {`${currency} ${Number(data.billing.total)?.toFixed(2)}`}
              </DefaultText>
            </View>
          ) : data?.isQtyFree ? (
            <DefaultText
              style={{ width: "24%", marginRight: "1%", textAlign: "right" }}
              fontSize="lg"
              fontWeight="medium"
            >
              {`${currency} ${Number(
                data.billing.total - data.billing.discountAmount
              )?.toFixed(2)}`}
            </DefaultText>
          ) : (
            <DefaultText
              style={{ width: "24%", marginRight: "1%", textAlign: "right" }}
              fontSize="lg"
              fontWeight="medium"
            >
              {`${currency} ${Number(data.billing.total)?.toFixed(2)}`}
            </DefaultText>
          )}
        </>
      ) : (
        <View
          style={{ width: "29%", marginRight: "1%", alignItems: "flex-end" }}
        >
          {data?.isFree ? (
            <View>
              <DefaultText fontSize="lg" fontWeight="medium">
                {"FREE"}
              </DefaultText>

              <DefaultText
                fontSize="lg"
                fontWeight="medium"
                color="otherGrey.200"
                style={{ textDecorationLine: "line-through" }}
              >
                {`${currency} ${Number(data.billing.total)?.toFixed(2)}`}
              </DefaultText>
            </View>
          ) : data?.isQtyFree ? (
            <DefaultText fontSize="lg" fontWeight="medium">
              {`${currency} ${Number(
                data.billing.total - data.billing.discountAmount
              )?.toFixed(2)}`}
            </DefaultText>
          ) : (
            <DefaultText fontSize="lg" fontWeight="medium">
              {`${currency} ${Number(data.billing.total)?.toFixed(2)}`}
            </DefaultText>
          )}

          <DefaultText fontSize="lg" fontWeight="medium">
            {data.quantity}
          </DefaultText>
        </View>
      )}
    </View>
  );
}
