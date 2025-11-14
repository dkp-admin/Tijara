import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FlatList, Modal, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import dineinCart from "../../../../utils/dinein-cart";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import NoDataPlaceholder from "../../../no-data-placeholder/no-data-placeholder";
import ReprintTicketHeader from "./reprint-ticket-header";
import ReprintTicketRow from "./reprint-ticket-row";
import useCartStore from "../../../../store/cart-item-dinein";
import useItemsDineIn from "../../../../hooks/use-items-dinein";
import { transformCartItems } from "../../../../utils/transform-cart-items";
import AuthContext from "../../../../context/auth-context";
import useCommonApis from "../../../../hooks/useCommonApis";
import DeviceContext from "../../../../context/device-context";
import { transformOrderData } from "../../../../utils/transform-order-data";
import * as ExpoPrintHelp from "expo-print-help";
import useCartCalculation from "../../../../hooks/use-cart-calculation";
import MMKVDB from "../../../../utils/DB-MMKV";
import repository from "../../../../db/repository";
import { useCurrency } from "../../../../store/get-currency";

export default function ReprintTicketModal({
  visible,
  handleClose,
}: {
  visible: boolean;
  handleClose: any;
}) {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();
  const [kitchenMngt, setKitchenMngt] = useState<any[]>([]);
  const [kotData, setKotData] = useState<any[]>([]);
  const authContext = useContext(AuthContext) as any;
  const deviceContext = useContext(DeviceContext) as any;
  const { businessData, billingSettings } = useCommonApis();
  const { getCardAndCashPayment } = useCartCalculation();
  const { currency } = useCurrency();
  const { customer, specialInstructions } = useCartStore() as any;

  const {
    items,
    totalDiscount,
    totalAmount,
    totalDiscountPromotion,
    discountCodes,
    promotionPercentage,
    promotionCodes,
    promotion,
    discountsPercentage: discountPercentage,
    totalVatAmount,
    chargesApplied,
    totalCharges,
    vatWithoutDiscount,
    vatCharges,
    subTotalWithoutDiscount,
  } = useItemsDineIn();

  async function handleLanKot(kotItems: any) {
    try {
      const tData = MMKVDB.get("activeTableDineIn");

      const allItems = transformCartItems(kotItems, discountPercentage);

      const printTemplates: any =
        await repository.printTemplateRepository.findByLocation(
          authContext.user.locationRef
        );

      const printTemplate = printTemplates?.[0];
      const subtotal = totalAmount - totalVatAmount - totalCharges + vatCharges;

      const localPayment = {
        total: totalAmount,
        vat: totalVatAmount,
        vatPercentage: totalAmount
          ? Number(((totalVatAmount * 100) / totalAmount).toFixed(2))
          : 0,
        subTotal: Number(subtotal.toFixed(2)) || 0,
        discount: totalDiscount + totalDiscountPromotion || 0,
        discountPercentage: discountPercentage + promotionPercentage || 0,
        discountCode: `${discountCodes}`,
        vatWithoutDiscount,
        subTotalWithoutDiscount,
        breakup: [],
        charges: chargesApplied,
      };

      const orderObject: any = {
        // _id: objectId(),
        tokenNum: "",
        showToken: printTemplate?.showToken,
        showOrderType: printTemplate?.showOrderType,
        orderType: "Dine-in",
        orderStatus: "completed",
        qrOrdering: false,
        specialInstructions: specialInstructions,
        items: allItems,
        kotId: tData?.label ? `${tData?.label}-${kotItems?.[0]?.kotId}` : "",
        table: tData?.label,
        customer: {
          name: customer?.firstName
            ? `${customer.firstName} ${customer.lastName}`
            : "",
          vat: customer?.vat || "",
          phone: customer?.phone,
        },
        customerRef: customer?._id,
        company: {
          en: deviceContext?.user?.company?.name?.en || "NA",
          ar: deviceContext?.user?.company?.name?.ar || "NA",
          logo: deviceContext?.user?.company?.logo || "",
        },
        companyRef: businessData?.company?._id,

        cashier: { name: authContext?.user?.name || "NA" },
        cashierRef: authContext.user._id,
        device: { deviceCode: deviceContext.user.phone },
        deviceRef: deviceContext.user.deviceRef,
        locationRef: businessData?.location?._id,
        location: {
          en: printTemplate.location.name.en,
          ar: printTemplate.location.name.ar,
        },
        createdAt: new Date().toISOString(),
        refunds: [],
        appliedDiscount: totalDiscount > 0 || totalDiscountPromotion > 0,
        refundAvailable: false,
        payment: {
          ...localPayment,
          total: totalAmount,
          discount:
            Number(totalDiscount || 0) + Number(totalDiscountPromotion || 0),
          discountPercentage: Number(discountPercentage?.toFixed(2)) || 0,
          discountCode: `${discountCodes}`,
          promotionPercentage,
          promotionCode: promotionCodes,
          promotionRefs: promotion?.promotionRefs || [],
        },
        phone: businessData?.location?.phone,
        vat: printTemplate.location.vat,
        address: printTemplate.location.address,
        footer: printTemplate.footer,
        returnPolicyTitle: "Return Policy",
        returnPolicy: printTemplate.returnPolicy,
        customText: printTemplate.customText,
        noOfPrints: billingSettings?.noOfReceiptPrint === "1" ? [1] : [1, 2],
        source: "local",
      };

      console.log(orderObject);

      const { paymentMethods } = getCardAndCashPayment(orderObject);

      orderObject.paymentMethods = paymentMethods;
      console.log(orderObject);

      const netPrinters = await repository.printerRepository.findByType(
        "network"
      );
      console.log("NET PRINTERS BILLING ORDER VIEW", netPrinters);
      const orderDoc = transformOrderData(orderObject);

      for (const printer of netPrinters) {
        if (printer.enableReceipts) {
          console.log("Printer:Cash", printer.printerWidthMM);
          console.log("Printer:Cash", printer.charsPerLine);
          console.log("Adding Print to", printer.ip);
          await ExpoPrintHelp.printTcp(
            printer.ip,
            printer.port,
            JSON.stringify({ ...orderDoc, currency: currency }),
            "202",
            printer.printerWidthMM.toString(),
            printer.charsPerLine.toString(),
            "kot"
          );
        }
      }
    } catch (error) {
      console.log("ERROR::::::", error);
    }
  }

  useEffect(() => {
    repository.kitchenManagementRepository
      .findByLocation(authContext?.user?.locationRef)
      .then((data) => {
        setKitchenMngt(data);
      });
  }, []);

  const listHeaderComponent = useMemo(() => <ReprintTicketHeader />, []);

  const listFooterComponent = useMemo(
    () => <View style={{ height: hp("10%") }} />,
    []
  );

  const listEmptyComponent = useMemo(
    () => (
      <View style={{ marginHorizontal: 16 }}>
        <NoDataPlaceholder title={t("No Tickets!")} marginTop={hp("30%")} />
      </View>
    ),
    []
  );

  const renderTicket = useCallback(({ item, index }: any) => {
    return (
      <ReprintTicketRow data={item} index={index} handleLanKot={handleLanKot} />
    );
  }, []);

  interface Item {
    id: number;
    name: string;
    sentToKotAt: string;
    // Add other properties as needed
  }

  interface GroupedObject {
    data: Item[];
    kotNumber: number;

    sentToKotAt: string;
  }

  function groupItemsByKotTime(items: Item[]): GroupedObject[] {
    // Sort items by sentToKotAt
    const sortedItems = [...items].sort((a, b) => {
      const dateA = new Date(a.sentToKotAt);
      const dateB = new Date(b.sentToKotAt);
      return (
        Math.floor(dateA.getTime() / 1000) - Math.floor(dateB.getTime() / 1000)
      );
    });

    const groupedObjects: GroupedObject[] = [];
    let currentGroup: GroupedObject | null = null;

    sortedItems.forEach((item) => {
      if (
        !currentGroup ||
        !isWithinTimeWindow(item.sentToKotAt, currentGroup.sentToKotAt)
      ) {
        // Start a new group
        if (currentGroup) {
          groupedObjects.push(currentGroup);
        }
        currentGroup = {
          data: [item],
          kotNumber: groupedObjects.length + 1,
          sentToKotAt: item.sentToKotAt,
        };
      } else {
        // Add to existing group
        currentGroup.data.push(item);
      }
    });

    // Add the last group if it exists
    if (currentGroup) {
      groupedObjects.push(currentGroup);
    }

    return groupedObjects;
  }

  function isWithinTimeWindow(time1: string, time2: string): boolean {
    const date1 = new Date(time1);
    const date2 = new Date(time2);
    const differenceInSeconds = Math.abs(
      Math.floor(date1.getTime() / 1000) - Math.floor(date2.getTime() / 1000)
    );

    // Define your time window here (e.g., 5 seconds)
    const timeWindowSeconds = 5;

    return differenceInSeconds <= timeWindowSeconds;
  }

  useEffect(() => {
    // if (kitchenMngt?.length > 0) {
    const data = [...(dineinCart?.getCartItems() || [])]?.filter(
      (item: any) => item?.sentToKot === true
    );

    const groupedObjects = groupItemsByKotTime(data);

    setKotData(groupedObjects);
    // }
  }, [kitchenMngt]);

  console.log(JSON.stringify(kotData?.[0]));

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
            title={t("Reprint Ticket")}
            handleLeftBtn={() => {
              handleClose();
            }}
            permission
          />

          <FlatList
            onEndReached={() => {}}
            onEndReachedThreshold={0.01}
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            data={kotData}
            renderItem={renderTicket}
            ListHeaderComponent={listHeaderComponent}
            ListEmptyComponent={listEmptyComponent}
            ListFooterComponent={listFooterComponent}
          />
        </View>
      </View>

      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { overflow: "hidden", height: "100%" },
});
