import React, { useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import ActionSheetHeader from "../action-sheet/action-sheet-header";
import TabButton from "../buttons/tab-button";
import TransactionHeader from "./header";
import IssueRefundItemModal from "./issue-refund/issue-refund-item";
import Payments from "./payments/payments";
import Refunds from "./refunds/refunds";

export default function TransactionHeaderModal({
  orderData,
  totalAmount,
  visible = false,
  setSelectedOrder,
  handleClose,
}: {
  orderData: any;
  totalAmount: string;
  visible: boolean;
  setSelectedOrder: any;
  handleClose?: any;
}) {
  const theme = useTheme();

  const [openIssueRefund, setopenIssueRefund] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent={false}
      style={{ height: "100%" }}
    >
      <View
        style={{
          ...styles.container,
          backgroundColor: theme.colors.white[1000],
        }}
      >
        <ActionSheetHeader
          title={t("Transactions")}
          handleLeftBtn={() => handleClose()}
        />

        <View
          style={{
            height: "100%",
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <TransactionHeader
            order={orderData}
            amount={totalAmount}
            handleIssueRefund={() => setopenIssueRefund(true)}
          />

          <TabButton
            tabs={[t("Payments"), t("Refunds")]}
            activeTab={activeTab}
            onChange={(tab: any) => {
              setActiveTab(tab);
            }}
          />

          {activeTab == 0 ? (
            <Payments data={orderData} setSelectedOrder={setSelectedOrder} />
          ) : (
            <Refunds data={orderData} />
          )}
        </View>

        <Toast />
      </View>

      <IssueRefundItemModal
        data={orderData}
        visible={openIssueRefund}
        handleIssueRefund={(data: any) => {
          setSelectedOrder(data);
          setopenIssueRefund(false);
        }}
        handleClose={() => setopenIssueRefund(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
});
