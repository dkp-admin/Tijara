import React, { useMemo, useRef } from "react";
import { Image, ImageBackground, ScrollView, Text, View } from "react-native";
import { t } from "../../../i18n";
import { checkDirection } from "../../hooks/check-direction";
import useItems from "../../hooks/use-items";
import useCommonApis from "../../hooks/useCommonApis";
import useCartStore from "../../store/cart-item";
import { getCartItemUnit } from "../../utils/constants";
import CurrencyView from "../modal/currency-view-modal";
import DefaultText from "../text/Text";

export default function CartView() {
  const isRTL = checkDirection();
  const scrollViewRef = useRef() as any;
  const { businessData } = useCommonApis() as any;
  const { order } = useCartStore();
  const {
    items,
    totalVatAmount,
    totalDiscount,
    totalAmount,
    totalQty,
    chargesApplied,
  } = useItems();

  const totalPaidAmount = useMemo(() => {
    return (order as any)?.payment?.breakup?.reduce(
      (prev: any, cur: any) => prev + Number(cur.total),
      0
    );
  }, [(order as any)?.payment?.breakup]);

  return (
    <View style={{ flex: 1, flexDirection: "row", backgroundColor: "#006C35" }}>
      <View style={{ width: "55%" }}>
        <View style={{ flexDirection: "row", paddingLeft: 20 }}>
          <View style={{ flex: 1, padding: 20 }}>
            <DefaultText style={{ fontSize: 25, color: "#fff" }}>
              {t("To Pay")}
            </DefaultText>
            <CurrencyView
              amountColor="#fff"
              decimalColor="#fff"
              symbolColor="#fff"
              amountFontsize={37}
              symbolFontsize={23}
              decimalFontsize={29}
              amount={Number(totalAmount - (totalPaidAmount || 0)).toFixed(2)}
            />

            <DefaultText style={{ fontSize: 23, color: "#fff" }}>
              {`${totalQty} ${t("QTY")}`}
            </DefaultText>
          </View>

          <View
            style={{
              width: 100,
              height: 100,
              marginRight: 50,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fff",
            }}
          >
            {businessData?.company?.logo ? (
              <Image
                resizeMode="contain"
                source={{ uri: businessData.company.logo }}
                style={{ width: 90, height: 90 }}
              />
            ) : (
              <Image
                resizeMode="contain"
                source={require("../../components/assets/tijarah-logo.png")}
                style={{ width: 85, height: 85 }}
              />
            )}
          </View>
        </View>
        <ScrollView
          style={{ paddingLeft: 20 }}
          ref={scrollViewRef}
          onContentSizeChange={(width, height) =>
            scrollViewRef?.current?.scrollTo({ y: height })
          }
        >
          {items.map((cItem: any, idx: any) => {
            return (
              <View
                style={{
                  flexDirection: "row",
                  paddingVertical: 10,
                  paddingHorizontal: 30,
                  justifyContent: "space-between",
                }}
                key={idx}
              >
                <Text
                  style={{
                    flex: 0.25,
                    color: "#fff",
                    fontSize: 20,
                    textAlign: "left",
                  }}
                >
                  {cItem.qty + getCartItemUnit[cItem.unit]}
                </Text>
                <Text
                  style={{
                    flex: 1,
                    color: "#fff",
                    fontSize: 20,
                    textAlign: "left",
                  }}
                >
                  {isRTL ? cItem.name.ar : cItem.name.en}
                </Text>
                <View
                  style={{
                    flex: 1,
                    alignItems: "flex-end",
                    paddingRight: 40,
                  }}
                >
                  <CurrencyView
                    amountColor="#fff"
                    decimalColor="#fff"
                    symbolColor="#fff"
                    amountFontsize={23}
                    amount={Number(cItem?.total)?.toFixed(2)}
                  />
                </View>
              </View>
            );
          })}

          {Number(totalDiscount) > 0 && (
            <View
              style={{
                flexDirection: "row",
                paddingVertical: 10,
                paddingHorizontal: 30,
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  flex: 0.3,
                  color: "#fff",
                  fontSize: 20,
                  textAlign: "left",
                }}
              >
                {t("Discount")}
              </Text>
              <Text style={{ flex: 1, color: "#fff" }}></Text>
              <View
                style={{ flex: 1, alignItems: "flex-end", paddingRight: 40 }}
              >
                <CurrencyView
                  amountColor="#fff"
                  symbolColor="#fff"
                  decimalColor="#fff"
                  amountFontsize={25}
                  amount={`-${(Number(totalDiscount) || 0)?.toFixed(2)}`}
                />
              </View>
            </View>
          )}

          {chargesApplied?.map((charge: any) => {
            return (
              <View
                key={charge.chargeId}
                style={{
                  flexDirection: "row",
                  paddingVertical: 10,
                  paddingHorizontal: 30,
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    flex: 0.3,
                    color: "#fff",
                    fontSize: 20,
                    textAlign: "left",
                  }}
                >
                  {isRTL ? charge.name.ar : charge.name.en}
                </Text>
                <Text style={{ flex: 1, color: "#fff" }}></Text>
                <View
                  style={{ flex: 1, alignItems: "flex-end", paddingRight: 40 }}
                >
                  <CurrencyView
                    amountColor="#fff"
                    symbolColor="#fff"
                    decimalColor="#fff"
                    amountFontsize={25}
                    amount={`+${(Number(charge.total) || 0)?.toFixed(2)}`}
                  />
                </View>
              </View>
            );
          })}

          <View
            style={{
              flexDirection: "row",
              paddingVertical: 10,
              paddingHorizontal: 30,
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                flex: 0.3,
                color: "#fff",
                textAlign: "left",
                fontSize: 20,
              }}
            >
              {t("VAT")}
            </Text>
            <Text style={{ flex: 1, color: "#fff" }}></Text>
            <View style={{ flex: 1, alignItems: "flex-end", paddingRight: 40 }}>
              <CurrencyView
                amountColor="#fff"
                symbolColor="#fff"
                decimalColor="#fff"
                amountFontsize={25}
                amount={Number(totalVatAmount || 0)?.toFixed(2)}
              />
            </View>
          </View>
        </ScrollView>
      </View>

      <View style={{ width: "45%" }}>
        <ImageBackground
          source={
            businessData?.company?.industry === "restaurant"
              ? require("../../components/assets/restaurant.jpg")
              : require("../../components/assets/retail.jpg")
          }
          style={{
            width: "100%",
            height: 585,
          }}
          resizeMode="stretch"
        />
      </View>
    </View>
  );
}
