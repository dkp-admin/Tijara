import React, { useEffect, useMemo } from "react";
import { Image, View } from "react-native";
import { t } from "../../../i18n";
import useCommonApis from "../../hooks/useCommonApis";
import useCartStore from "../../store/cart-item";
import DefaultText from "../text/Text";

export default function Success() {
  const { lastOrder, setLastOrder } = useCartStore() as any;

  const { businessData } = useCommonApis() as any;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLastOrder(null);
    }, 10000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const totalAmount = useMemo(() => {
    if (lastOrder?.payment?.breakup?.length > 0) {
      return lastOrder?.payment?.breakup?.reduce(
        (prev: any, cur: any) => prev + Number(cur.total),
        0
      );
    }
    return 0;
  }, [lastOrder]);

  return (
    <View style={{ flex: 1, backgroundColor: "#006C35" }}>
      <View style={{ alignItems: "flex-end" }}>
        {businessData?.company?.logo && (
          <Image
            source={{ uri: businessData.company.logo }}
            style={{ width: 100, height: 100, marginRight: 50 }}
          />
        )}
      </View>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          marginTop: -100,
        }}
      >
        <DefaultText style={{ fontSize: 32, color: "#fff" }}>
          {`${t("Your payment of")} ${t("SAR")} ${totalAmount.toFixed(2)} ${t(
            "is completed"
          )}.`}
        </DefaultText>
        <DefaultText style={{ fontSize: 32, color: "#fff", marginTop: 10 }}>
          {`${t("Thank you for shopping with us")}. ${t("See you soon")}!`}
        </DefaultText>
      </View>
    </View>
  );
}
