import { default as React } from "react";
import { TouchableOpacity, View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { OrderItem } from "../../../database/order/order";
import { checkDirection } from "../../../hooks/check-direction";
import { useResponsive } from "../../../hooks/use-responsiveness";
import cart from "../../../utils/cart";
import { getCartItemUnit } from "../../../utils/constants";
import ICONS from "../../../utils/icons";
import ItemDivider from "../../action-sheet/row-divider";
import CurrencyView from "../../modal/currency-view-modal";
import DefaultText from "../../text/Text";
import ImageView from "../left-view/catalogue/image-view";

const outOfStock = (data: any, businessDetails: any) => {
  if (data.tracking && businessDetails?.location?.negativeBilling) {
    const stockCount = data.stockCount;

    const items = cart.cartItems?.filter((item: any) => item.sku === data.sku);

    const totalAddedQty = items?.reduce((acc: number, item: OrderItem) => {
      return acc + item.qty;
    }, 0);

    return stockCount - totalAddedQty < 0;
  }

  return false;
};

export default function BillingOrderRow({
  data,
  // channel,
  businessDetails,
  handleOnPress,
}: any) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { wp, hp, twoPaneView } = useResponsive();

  const getItemName = () => {
    let units = "";

    if (data.type === "box") {
      units = `, (${t("Box")} - ${data.noOfUnits} ${t("Units")})`;
    }

    if (data.type === "crate") {
      units = `, (${t("Crate")} - ${data.noOfUnits} ${t("Units")})`;
    }

    const variantNameEn = data.hasMultipleVariants
      ? ` - ${data.variantNameEn}`
      : "";
    const variantNameAr = data.hasMultipleVariants
      ? ` - ${data.variantNameAr}`
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

  const appliedPromos = data?.promotionsData
    ?.map((promo: any) => promo?.name)
    .join(",");

  return (
    <>
      <TouchableOpacity
        style={{
          paddingVertical: 10,
          paddingHorizontal: hp("2%"),
          flexDirection: "row",
          alignItems: "flex-start",
          // backgroundColor:
          //   data?.channels?.length === 0 || data?.channels?.includes(channel)
          //     ? "transparent"
          //     : "#FFDDE4",
        }}
        onPress={() => {
          if (!data?.isFree && !data?.isQtyFree) {
            handleOnPress(data);
          }
        }}
      >
        <View
          style={{
            width: twoPaneView ? "45%" : "48%",
            marginRight: "2%",
            flexDirection: "row",
            alignItems: "flex-start",
          }}
        >
          {twoPaneView && (
            <View style={{ alignItems: "center" }}>
              {outOfStock(data, businessDetails) ? (
                <View
                  style={{
                    width: hp("6.5%"),
                    height: hp("6.5%"),
                    borderRadius: 16,
                    borderWidth: 1.5,
                    borderColor: "#E5E9EC",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: theme.colors.white[1000],
                  }}
                >
                  <ICONS.WarningIcon />
                </View>
              ) : (
                <ImageView data={data} />
              )}
            </View>
          )}

          <View
            style={{
              marginTop: 5,
              marginHorizontal: hp("1%"),
              maxWidth: twoPaneView ? "65%" : "100%",
            }}
          >
            <DefaultText
              style={{ textDecorationColor: "#006C35" }}
              fontSize="lg"
              color="primary.1000"
            >
              {getItemName()}
            </DefaultText>

            <DefaultText style={{ marginTop: 2 }} fontSize="lg">
              {data.unit == "perItem" ||
              data.type === "box" ||
              data.type === "crate"
                ? `x ${data.qty}`
                : `${data.qty + getCartItemUnit[data.unit]}`}
            </DefaultText>

            <DefaultText
              style={{ marginTop: 3, lineHeight: 18 }}
              fontSize="md"
              color="otherGrey.100"
            >
              {getModifierName()}
            </DefaultText>
          </View>
        </View>

        {twoPaneView && (
          <View style={{ marginTop: 5, width: "13%", marginRight: "2%" }}>
            <DefaultText fontSize="lg">
              {Number(data.sellingPrice + data.vatAmount).toFixed(2)}
            </DefaultText>
          </View>
        )}

        <View style={{ marginTop: 5, width: "13%", marginRight: "2%" }}>
          <DefaultText fontSize="lg">
            {Number(data.vatAmount).toFixed(2)}
          </DefaultText>

          {/* {businessDetails?.company?.industry?.toLowerCase() === "retail" && (
            <DefaultText style={{ marginTop: 5 }} fontSize="lg">
              {data.vat}%
            </DefaultText>
          )} */}
        </View>

        {/* <View style={{ width: "12%" }}>
          <DefaultText
            style={{ textDecorationLine: data.discount ? "underline" : "none" }}
            fontSize="lg"
            color="primary.1000"
          >
            {data.discount ? data.discount : "-"}
          </DefaultText>

          <DefaultText
            style={{
              marginTop: 5,
              textDecorationLine: data.discountPercentage
                ? "underline"
                : "none",
            }}
            fontSize="lg"
            color="primary.1000"
          >
            {data.discountPercentage ? data.discountPercentage : ""}
          </DefaultText>
        </View> */}

        <View
          style={{
            marginTop: 1,
            width: twoPaneView ? "21%" : "33%",
            marginLeft: "2%",
            marginRight: wp("1.8%"),
          }}
        >
          <View style={{ alignItems: "flex-end" }}>
            {data.discountedTotal > 0 ? (
              <View>
                <CurrencyView
                  amount={Number(data.discountedTotal).toFixed(2)}
                />
                <CurrencyView
                  strikethrough
                  amount={Number(data.total).toFixed(2)}
                />
                {appliedPromos && (
                  <View>
                    <View
                      style={{
                        padding: 10,
                        paddingLeft: 12,
                        paddingRight: 12,
                        borderColor: "green",
                        borderWidth: 1,
                        borderRadius: 100,
                        backgroundColor: "white", // Set a background color if needed
                      }}
                    >
                      <DefaultText
                        style={{
                          color: "green",
                          fontSize: 12,
                        }}
                      >
                        {appliedPromos}
                      </DefaultText>
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <>
                {data?.isFree ? (
                  <>
                    <DefaultText>FREE</DefaultText>
                    <CurrencyView
                      strikethrough
                      amount={Number(data.total).toFixed(2)}
                    />
                    {appliedPromos !== "-" && appliedPromos !== "" && (
                      <View>
                        <View
                          style={{
                            padding: 10,
                            paddingLeft: 12,
                            paddingRight: 12,
                            borderColor: "green",
                            borderWidth: 1,
                            borderRadius: 100,
                            backgroundColor: "white", // Set a background color if needed
                          }}
                        >
                          <DefaultText
                            style={{
                              color: "green",
                              fontSize: 12,
                            }}
                          >
                            {appliedPromos}
                          </DefaultText>
                        </View>
                      </View>
                    )}
                  </>
                ) : (
                  <CurrencyView amount={Number(data.total).toFixed(2)} />
                )}
              </>
            )}
          </View>

          {data.discount && (
            <View style={{ alignItems: "flex-end" }}>
              <CurrencyView
                strikethrough
                amount={"23.50"}
                symbolFontsize={10}
                amountFontsize={16}
                decimalFontsize={16}
                symbolColor="otherGrey.100"
                amountColor="otherGrey.100"
                decimalColor="otherGrey.100"
              />
            </View>
          )}
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
