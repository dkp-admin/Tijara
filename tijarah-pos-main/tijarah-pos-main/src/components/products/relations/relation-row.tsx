import React from "react";
import { View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { checkDirection } from "../../../hooks/check-direction";
import { useResponsive } from "../../../hooks/use-responsiveness";
import DefaultText from "../../text/Text";

export default function RelationRow({
  data,
  product,
}: {
  data: any;
  product: any;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { hp } = useResponsive();

  if (
    !data ||
    !product.variants.some((variant: any) =>
      variant.sku.includes(data.productSku)
    )
  ) {
    return <></>;
  }

  return (
    <View
      style={{
        paddingVertical: hp("2.5%"),
        paddingHorizontal: hp("1.75%"),
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: "#E5E9EC",
        backgroundColor: theme.colors.white[1000],
      }}
    >
      <DefaultText style={{ width: "33%", marginRight: "3%" }} fontSize="lg">
        {data.type === "crate"
          ? `${isRTL ? data.name.ar : data.name.en} (${data.crateSku}) - ${
              data.qty
            } ${t("Boxes Per Crate")}`
          : "-"}
      </DefaultText>

      <DefaultText style={{ width: "33%", marginRight: "3%" }} fontSize="lg">
        {data.type == "crate"
          ? `${
              data?.boxName?.en
                ? `${isRTL ? data.boxName.ar : data.boxName.en} `
                : ""
            }(${data.boxSku})`
          : data.type == "box"
          ? `${isRTL ? data.name.ar : data.name.en} (${data.boxSku}) - ${
              data.qty
            } ${t("Products Per Box")} `
          : "-"}
      </DefaultText>

      <DefaultText style={{ width: "27%", marginRight: "1%" }} fontSize="lg">
        {`${isRTL ? data.product.name.ar : data.product.name.en}${
          data.product?.variant?.en
            ? `, ${isRTL ? data.product.variant.ar : data.product.variant.en}`
            : ""
        } (${data.product.sku})`}
      </DefaultText>
    </View>
  );
}
