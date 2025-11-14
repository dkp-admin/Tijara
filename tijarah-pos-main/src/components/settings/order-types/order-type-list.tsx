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
import { repo } from "../../../utils/createDatabaseConnection";
import { debugLog, errorLog } from "../../../utils/log-patch";
import ActionSheetHeader from "../../action-sheet/action-sheet-header";
import showToast from "../../toast";
import OrderTypeHeader from "./order-type-header";
import OrderTypeRow from "./order-type-row";

function Row(props: any) {
  const { active, data, handleStatusChange } = props;

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
      <OrderTypeRow data={data} handleStatusChange={handleStatusChange} />
    </Animated.View>
  );
}

export default function OrderTypeListModal({
  data,
  visible = false,
  handleClose,
  setSeed = () => {},
  seed = false,
}: {
  data: any;
  visible: boolean;
  handleClose?: any;
  setSeed?: any;
  seed?: boolean;
}) {
  const theme = useTheme();
  const { twoPaneView } = useResponsive();

  const handleStatusChange = async (val: any, orderType: any) => {
    const type = data.orderTypesList?.filter((type: any) => type.status);

    if (!val && type?.length == 1) {
      debugLog(
        "At least one order type should be active",
        type,
        "setting-billing-screen",
        "updateOrderTypeBillingSettings"
      );
      showToast("info", t("At least one order type should be active"));
      return;
    }

    const dataObj = data.orderTypesList.map((type: any) => {
      if (type.name === orderType.name) {
        return { _id: type._id, name: type.name, status: val };
      } else {
        return type;
      }
    });

    try {
      await repo.billingSettings.update(
        { _id: data?._id },
        {
          ...data,
          orderTypesList: dataObj,
        }
      );
      debugLog(
        "Billing settings updated to db",
        {
          ...data,
          orderTypesList: dataObj,
        },
        "setting-billing-screen",
        "handleOrderTypeStatusChange"
      );
      await queryClient.invalidateQueries("find-billing-settings");

      setSeed(!seed);
    } catch (err: any) {
      errorLog(
        err?.message,
        dataObj,
        "setting-billing-screen",
        "handleOrderTypeStatusChange",
        err
      );
      showToast("error", getErrorMsg("billing-settings", "update"));
    }
  };

  const renderRow = useCallback(
    ({ data, active }: any) => {
      return (
        <Row
          data={data}
          active={active}
          handleStatusChange={handleStatusChange}
        />
      );
    },
    [data?.orderTypesList]
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
            title={t("Order types")}
            handleLeftBtn={() => handleClose()}
          />

          <OrderTypeHeader />

          <SortableList
            style={styles.list}
            contentContainerStyle={styles.contentContainer}
            data={data.orderTypesList}
            renderRow={renderRow}
            onReleaseRow={async (key: any, current: any) => {
              //Update Order in Payment Types Array
              const newOrderTypes = current.map(
                (index: any) => data.orderTypesList[index]
              );

              //Update Payment Types in DATABASE
              await repo.billingSettings.update(
                { _id: data?._id },
                {
                  ...data,
                  orderTypesList: newOrderTypes,
                }
              );
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
