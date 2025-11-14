import React, { useCallback, useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import PaymentHeader from "./payment-header";
import PaymentRow from "./payment-row";

export default function PaymentList({
  disabled,
  payments,
  handleDelete,
}: {
  disabled: boolean;
  payments: any[];
  handleDelete: any;
}) {
  const theme = useTheme();
  const { hp } = useResponsive();

  const renderPaymentRow = useCallback(
    (item: any, index: number) => {
      return (
        <PaymentRow
          key={index}
          data={item}
          index={index}
          disabled={disabled}
          handleDelete={(idx: number) => {
            handleDelete(idx, payments);
          }}
        />
      );
    },
    [disabled, payments]
  );

  const listEmptyComponent = useMemo(() => {
    return (
      <View
        style={{
          paddingBottom: hp("6%"),
          backgroundColor: theme.colors.white[1000],
        }}
      >
        <NoDataPlaceholder title={t("No Payments!")} marginTop={hp("6%")} />
      </View>
    );
  }, []);

  return (
    <View style={{ ...styles.container }}>
      <PaymentHeader />

      <FlatList
        scrollEnabled={false}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        data={payments}
        renderItem={({ item, index }) => {
          return renderPaymentRow(item, index);
        }}
        ListEmptyComponent={listEmptyComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
