import React from "react";
import { View } from "react-native";
import DefaultText from "../../../components/text/Text";
import { t } from "../../../../i18n";

const SalesSummaryListComponent = ({ label, value, count }: any) => {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <DefaultText style={{ textTransform: "capitalize" }}>{label}</DefaultText>
      <View style={{ flexDirection: "row" }}>
        <DefaultText>{value}</DefaultText>
        {count && (
          <DefaultText style={{ marginLeft: 6, fontSize: 20 }}>
            {t("Count")}: {count}
          </DefaultText>
        )}
      </View>
    </View>
  );
};

export default SalesSummaryListComponent;
