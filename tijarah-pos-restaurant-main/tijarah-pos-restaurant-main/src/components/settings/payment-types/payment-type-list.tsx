import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import SortableList from "react-native-sortable-list";
import Toast from "react-native-toast-message";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { queryClient } from "../../../query-client";
import { getErrorMsg } from "../../../utils/common-error-msg";
import ActionSheetHeader from "../../action-sheet/action-sheet-header";
import showToast from "../../toast";
import PaymentTypeHeader from "./payment-type-header";
import PaymentTypeRow from "./payment-type-row";
import repository from "../../../db/repository";

function Row(props: any) {
  const { active, data, walletEnabled, creditEnabled, handleStatusChange } =
    props;

  const activeAnim = useRef(new Animated.Value(0));
  const style = useMemo(
    () => ({
      ...Platform.select({
        ios: {
          transform: [
            {
              scale: activeAnim.current.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.07],
              }),
            },
          ],
          shadowRadius: activeAnim.current.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 10],
          }),
        },

        android: {
          transform: [
            {
              scale: activeAnim.current.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.07],
              }),
            },
          ],
          elevation: activeAnim.current.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 6],
          }),
        },
      }),
    }),
    []
  );
  useEffect(() => {
    Animated.timing(activeAnim.current, {
      duration: 300,
      easing: Easing.bounce,
      toValue: Number(active),
      useNativeDriver: false,
    }).start();
  }, [active]);

  return (
    <Animated.View style={[style]}>
      <PaymentTypeRow
        data={data}
        walletEnabled={walletEnabled}
        creditEnabled={creditEnabled}
        handleStatusChange={handleStatusChange}
      />
    </Animated.View>
  );
}

export default function PaymentTypeListModal({
  data,
  visible = false,
  handleClose,
  setSeed = () => {},
  seed = false,
  walletEnabled = false,
  creditEnabled = false,
}: {
  data: any;
  visible: boolean;
  handleClose?: any;
  setSeed?: any;
  seed?: boolean;
  walletEnabled: boolean;
  creditEnabled: boolean;
}) {
  const theme = useTheme();
  const { twoPaneView } = useResponsive();

  const handleStatusChange = async (val: any, paymentType: any) => {
    const payment = data.paymentTypes?.filter(
      (type: any) =>
        type.name !== "Wallet" && type.name !== "Credit" && type.status
    );

    if (
      !val &&
      payment?.length == 1 &&
      paymentType.name !== "Wallet" &&
      paymentType.name !== "Credit"
    ) {
      showToast("info", t("At least one payment type should be active"));
      return;
    }

    const dataObj = data.paymentTypes.map((payment: any) => {
      if (payment.name == paymentType.name) {
        return { _id: payment._id, name: payment.name, status: val };
      } else {
        return payment;
      }
    });

    try {
      await repository.billing.update(data?._id, {
        ...data,
        paymentTypes: dataObj,
      });

      await queryClient.invalidateQueries("find-billing-settings");

      setSeed(!seed);
    } catch (err: any) {
      showToast("error", getErrorMsg("billing-settings", "update"));
    }
  };

  const renderRow = useCallback(
    ({ data, active }: any) => {
      return (
        <Row
          data={data}
          active={active}
          walletEnabled={walletEnabled}
          creditEnabled={creditEnabled}
          handleStatusChange={handleStatusChange}
        />
      );
    },
    [data?.paymentTypes, walletEnabled, creditEnabled]
  );

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
          backgroundColor: theme.colors.transparentBg,
        }}
      >
        <View
          style={{
            ...styles.container,
            marginHorizontal: twoPaneView ? "20%" : "0%",
            backgroundColor: theme.colors.bgColor,
          }}
        >
          <ActionSheetHeader
            title={t("Payment Types")}
            handleLeftBtn={() => handleClose()}
          />

          <PaymentTypeHeader />

          <SortableList
            style={styles.list}
            contentContainerStyle={styles.contentContainer}
            data={data.paymentTypes}
            renderRow={renderRow}
            onReleaseRow={async (key: any, current: any) => {
              //Update Order in Payment Types Array
              const newPaymentTypes = current.map(
                (index: any) => data.paymentTypes[index]
              );

              //Update Payment Types in DATABASE
              await repository.billing.update(data?._id, {
                ...data,
                paymentTypes: newPaymentTypes,
              });
              await queryClient.invalidateQueries("find-billing-settings");

              setSeed(!seed);
            }}
          />
        </View>
      </View>

      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { overflow: "hidden", height: "100%" },
  title: {
    fontSize: 20,
    paddingVertical: 20,
    color: "#999999",
  },
  list: {
    flex: 1,
  },
  contentContainer: {
    width: "100%",
    ...Platform.select({
      ios: {
        paddingHorizontal: 30,
      },
      android: {
        paddingHorizontal: 0,
      },
    }),
  },

  image: {
    width: 50,
    height: 50,
    marginRight: 30,
    borderRadius: 25,
  },
  text: {
    fontSize: 24,
    color: "#222222",
  },
});
