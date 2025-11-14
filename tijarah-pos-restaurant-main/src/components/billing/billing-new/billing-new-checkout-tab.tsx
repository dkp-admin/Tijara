import { useNavigation } from "@react-navigation/core";
import * as ExpoCustomIntent from "expo-custom-intent";
import * as ExpoPrintHelp from "expo-print-help";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FlatList,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import AutoScroll from "react-native-auto-scroll";
import { EventRegister } from "react-native-event-listeners";
import { t } from "../../../../i18n";
import serviceCaller from "../../../api";
import AuthContext from "../../../context/auth-context";
import DeviceContext from "../../../context/device-context";
import { useTheme } from "../../../context/theme-context";
import repository from "../../../db/repository";
import { checkDirection } from "../../../hooks/check-direction";
import { checkInternet } from "../../../hooks/check-internet";
import useCartCalculation from "../../../hooks/use-cart-calculation";
import useItems from "../../../hooks/use-items";
import usePrinterStatus from "../../../hooks/use-printer-status";
import { useResponsive } from "../../../hooks/use-responsiveness";
import useCommonApis from "../../../hooks/useCommonApis";
import { queryClient } from "../../../query-client";
import useCartStore from "../../../store/cart-item";
import useChannelStore from "../../../store/channel-store";
import useStcPayStore from "../../../store/stcpay-store";
import useTicketStore from "../../../store/ticket-store";
import { AuthType } from "../../../types/auth-types";
import MMKVDB from "../../../utils/DB-MMKV";
import { DBKeys } from "../../../utils/DBKeys";
import { logError, logInfo } from "../../../utils/axiom-logger";
import { objectId } from "../../../utils/bsonObjectIdTransformer";
import calculateCart from "../../../utils/calculate-cart";
import cart from "../../../utils/cart";
import { getErrorMsg } from "../../../utils/common-error-msg";
import { ChannelsName, PROVIDER_NAME } from "../../../utils/constants";
import NearpaySDK from "../../../utils/embedNearpay";
import { ERRORS } from "../../../utils/errors";
import generateOrderNumber from "../../../utils/generate-order-number";
import ICONS from "../../../utils/icons";
import { printKOTSunmi } from "../../../utils/printKOTSunmi";
import { printKOTSunmi3Inch } from "../../../utils/printKOTSunmi3inch";
import { printLandiPos } from "../../../utils/printLandipos";
import { printSunmi4Inch } from "../../../utils/printSunmi3inch";
import { showAlert } from "../../../utils/showAlert";
import { transformCartItems } from "../../../utils/transform-cart-items";
import { transformKOTData } from "../../../utils/transform-kot-data";
import { transformOrderData } from "../../../utils/transform-order-data";
import ChargesView from "../../billing/right-view/charges-view";
import DiscountView from "../../billing/right-view/discount-view";
import STCPayModal from "../../billing/right-view/modal/stc-pay-modal";
import SeparatorHorizontalView from "../../common/separator-horizontal-view";
import CustomerSearchAdd from "../../dienin/dinein-cart/customer/customer-search-add";
import CurrencyView from "../../modal/currency-view-modal";
import Spacer from "../../spacer";
import DefaultText from "../../text/Text";
import showToast from "../../toast";
import BillingProductPriceModal from "../left-view/modal/billing-product-price-modal";
import BillingPaymentCompleteView from "../right-view/billing-payment-complete-view";
import AppliedChargeModal from "../right-view/modal/applied-charge-modal";
import AppliedDiscountModal from "../right-view/modal/applied-discount-modal";
import CardTransactionModal from "../right-view/modal/card-transaction-modal";
import CreditTransactionModal from "../right-view/modal/credit-transaction-modal";
import PaymentStatusModal from "../right-view/modal/payment-status-modal";
import TenderCashModal from "../right-view/modal/tender-cash-modal";
import WalletCustomerModal from "../right-view/modal/wallet-customer-modal";
import WalletTransactionModal from "../right-view/modal/wallet-transaction-modal";
import { useCurrency } from "../../../store/get-currency";

function groupItemsByKitchen(orderData: any): any[] {
  // Create a map to group items by kitchenRef
  const kitchenGroups: { [key: string]: any } = {};

  // Iterate through each item and group by kitchenRef
  orderData.items.forEach((item: any) => {
    item?.kitchenRefs?.forEach((kitchenRef: string) => {
      // If this kitchen hasn't been seen yet, initialize a new order object for it
      if (!kitchenGroups[kitchenRef]) {
        // Clone the order data without items
        kitchenGroups[kitchenRef] = {
          ...orderData,
          items: [],
          kitchenRef,
        };
      }

      // Add this item to the appropriate kitchen group
      kitchenGroups[kitchenRef].items.push(item);
    });
    // Use kitchen reference if available, otherwise use "no-kitchen" as key
  });

  // Convert the map to an array of objects
  return Object.values(kitchenGroups);
}

function groupItemsByKitchenLan(orderData: any): any[] {
  // Create a map to group items by kitchenRef
  const kitchenGroups: { [key: string]: any } = {};

  // Iterate through each item and group by kitchenRef
  orderData.items.forEach((item: any) => {
    item?.kitchenRefs?.forEach((kitchenRef: string) => {
      if (!kitchenGroups[kitchenRef]) {
        kitchenGroups[kitchenRef] = {
          ...orderData,
          items: [],
          kitchenRef,
        };
      }
      kitchenGroups[kitchenRef].items.push(item);
    });
  });

  return Object.values(kitchenGroups);
}

const CheckoutView = ({ row, itemsList, discountsData }: any) => {
  const theme = useTheme();
  const { hp } = useResponsive();
  const [visibleAppliedDiscount, setVisibleAppliedDiscount] = useState(false);
  const [visibleAppliedCharge, setVisibleAppliedCharge] = useState(false);
  const flatListRef = useRef(null) as any;
  const { totalDiscount, chargesApplied, items, totalDiscountPromotion } =
    useItems();

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [itemsList]);

  const discountPrice: any = `${Number(totalDiscount)}`;

  const promotionPrice: any = `${Number(totalDiscountPromotion)}`;

  const freeItemDiscount: any = cart.cartItems?.reduce(
    (prev: any, cur: any) => {
      if (cur?.isFree || cur?.isQtyFree)
        return (
          prev +
          Number(
            cur?.discountedTotal > 0
              ? cur?.total - cur?.discountedTotal
              : cur?.total
          )
        );
      else return prev;
    },
    0
  );

  return (
    <AutoScroll
      alwaysBounceVertical={false}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          ...styles.empty_view,
          paddingTop: hp("1.5%"),
          paddingHorizontal: hp("1.5%"),
          borderColor: theme.colors.dividerColor.secondary,
        }}
      >
        <DefaultText fontSize="lg" fontWeight="medium">
          {t("Items")}
        </DefaultText>

        <Spacer space={10} />

        <SeparatorHorizontalView />

        <Spacer space={10} />

        <FlatList
          ref={flatListRef}
          scrollEnabled={false}
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item: any, index) => `${item.sku}-${index}`}
          data={itemsList}
          renderItem={row}
          ListEmptyComponent={() => {
            return (
              <View
                style={{
                  paddingTop: hp("1%"),
                  paddingBottom: hp("2.5%"),
                }}
              >
                <DefaultText fontSize="lg" fontWeight="medium">
                  {t("No new items on check")}
                </DefaultText>
              </View>
            );
          }}
        />
      </View>

      {discountsData?.length > 0 && (
        <View
          style={{
            ...styles.empty_view,
            marginTop: hp("1.5%"),

            borderColor: theme.colors.dividerColor.secondary,
          }}
        >
          <DiscountView
            discountPrice={Number(
              parseFloat(discountPrice) +
                parseFloat(promotionPrice) +
                parseFloat(freeItemDiscount)
            ).toFixed(2)}
            items={items}
            handlePress={() => {
              setVisibleAppliedDiscount(true);
            }}
          />
        </View>
      )}

      {chargesApplied?.length > 0 && (
        <View
          style={{
            ...styles.empty_view,
            marginTop: hp("1.5%"),

            borderColor: theme.colors.dividerColor.secondary,
          }}
        >
          <ChargesView
            chargesApplied={chargesApplied}
            items={items}
            handlePress={() => {
              setVisibleAppliedCharge(true);
            }}
          />
        </View>
      )}

      {visibleAppliedDiscount && (
        <AppliedDiscountModal
          data={[...discountsData]}
          visible={visibleAppliedDiscount}
          handleClose={() => setVisibleAppliedDiscount(false)}
        />
      )}

      {visibleAppliedCharge && (
        <AppliedChargeModal
          data={chargesApplied}
          visible={visibleAppliedCharge}
          handleClose={() => setVisibleAppliedCharge(false)}
        />
      )}
    </AutoScroll>
  );
};

const Consts = {
  PACKAGE: "com.intersoft.acquire.mada",
  SERVICE_ACTION: "android.intent.action.intersoft.PAYMENT.SERVICE",
  CARD_ACTION: "android.intent.action.intersoft.PAYMENT",
  UNIONPAY_ACTION: "android.intent.action.intersoft.PAYMENT_UNION_SCAN",
  INSTALLMENT_ACTION: "android.intent.action.intersoft.PAYMENT_INSTALLMENT",
};

export default function CheckoutTabBilling(props: any) {
  const { hp, twoPaneView } = useResponsive();
  const { businessData, billingSettings } = useCommonApis();
  const authContext = useContext<AuthType>(AuthContext);
  const deviceContext = useContext(DeviceContext) as any;
  const navigation = useNavigation() as any;
  const { isConnected: isPrinterConnected, isKOTConnected } =
    usePrinterStatus();
  const [stcPay, setStcPay] = useState(false);
  const [completeWithPrint, setCompleteWithPrint] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [itemModifyData, setItemModifydata] = useState<any>(null);
  const [visibleEditItemModal, setVisibleEditItemModal] = useState(false);
  const [visibleCustomer, setVisibleCustomers] = useState(false);
  const [visiblePaymentStatus, setVisiblePaymentStatus] = useState(false);
  const [visibleTenderCash, setVisibleTenderCash] = useState(false);
  const [visibleCardTransaction, setVisibleCardTransaction] = useState(false);
  const { currency } = useCurrency();
  const [visibleWalletTransaction, setVisibleWalletTransaction] =
    useState(false);
  const [visibleCreditTransaction, setVisibleCreditTransaction] =
    useState(false);
  const { removeSingleTicket } = useTicketStore() as any;
  const theme = useTheme();
  const { getCardAndCashPayment } = useCartCalculation();
  const isConnected = checkInternet();

  const completedOrder = useRef() as any;
  const { data, setData } = useStcPayStore();

  const {
    setCustomer,
    customer,
    order,
    setOrder,
    totalPaidAmount,
    specialInstructions,
    setSpecialInstructions,
    setRemainingWalletBalance,
    setRemainingCreditBalance,
  } = useCartStore() as any;

  const { channel } = useChannelStore();
  const isRTL = checkDirection();

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
    discountsApplied,
    totalItem,
    totalQty,
    promotionsApplied,
  } = useItems();

  const renderItemRow = ({ item, index }: any) => {
    const appliedPromos = item?.promotionsData
      ?.map((promo: any) => promo?.name)
      .join(",");
    return (
      <TouchableOpacity
        key={item._id}
        disabled={item?.isFree || item?.isQtyFree}
        style={{
          ...styles.item_row,
          paddingBottom: hp("1.75%"),
        }}
        onPress={() => {
          if (!item?.isFree && !item?.isQtyFree) {
            setVisibleEditItemModal(true);
            setItemModifydata(item);
            setActiveIndex(index);
          }
        }}
      >
        <View>
          <DefaultText fontSize="lg">
            {isRTL ? item?.name?.ar : item?.name?.en} x {item?.qty}
          </DefaultText>

          {item.hasMultipleVariants && (
            <DefaultText
              style={{ marginTop: 2 }}
              fontSize="md"
              color="otherGrey.100"
            >
              {item.variantNameEn}
            </DefaultText>
          )}

          {item.modifiers?.length > 0 && (
            <DefaultText
              style={{ marginTop: 2 }}
              fontSize="md"
              color="otherGrey.100"
            >
              {item.modifiers
                ?.map((mod: any) => {
                  return `${mod.optionName}`;
                })
                .join(",")}
            </DefaultText>
          )}

          {item?.void && (
            <DefaultText
              style={{ marginTop: 2 }}
              fontSize="md"
              color="otherGrey.100"
            >
              {`${t("Void")}: Entry error`}
            </DefaultText>
          )}

          {item?.comp && (
            <DefaultText
              style={{ marginTop: 2 }}
              fontSize="md"
              color="otherGrey.100"
            >
              {`${t("Comp")}: ${item?.compReason?.en}`}
            </DefaultText>
          )}

          {item.note && (
            <DefaultText
              style={{ marginTop: 2 }}
              fontSize="md"
              color="otherGrey.100"
            >
              {item.note}
            </DefaultText>
          )}
        </View>

        <View style={{ alignItems: "flex-end" }}>
          {item.discountedTotal > 0 ? (
            <View>
              <CurrencyView amount={Number(item.discountedTotal).toFixed(2)} />
              <CurrencyView
                strikethrough
                amount={Number(item.total).toFixed(2)}
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
              {item?.isFree ? (
                <>
                  <DefaultText>FREE</DefaultText>
                  <CurrencyView
                    strikethrough
                    amount={Number(item.total).toFixed(2)}
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
                <CurrencyView amount={Number(item?.total).toFixed(2)} />
              )}
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const getTotalPaid = useCallback((localOrder: any) => {
    return localOrder?.payment?.breakup?.reduce(
      (prev: any, cur: any) => prev + Number(cur.total),
      0
    );
  }, []);

  const renderCheckout = useMemo(() => {
    return (
      <CheckoutView
        discountsData={[...discountsApplied, ...promotionsApplied]}
        row={renderItemRow}
        itemsList={items}
        sentItemsList={items}
      />
    );
  }, [items, discountsApplied, chargesApplied, promotionsApplied]);

  const renderCompleteView = useMemo(
    () =>
      items?.length > 0 && (
        <View style={{ height: hp("25%") }}>
          <BillingPaymentCompleteView
            billingSettings={billingSettings}
            businessDetails={businessData}
            totalAmount={totalAmount - (totalPaidAmount || 0)}
            totalItem={totalItem}
            totalQty={totalQty}
            items={items}
            totalVatAmount={totalVatAmount}
            loading={loading}
            handleComplete={(selectedPayment: string) => {
              if (!isConnected && promotionsApplied.length > 0) {
                showToast("error", "Please connect to internet");

                return;
              }

              if (selectedPayment) {
                setLoading(true);
                handleCompleteBtn(selectedPayment);
              }
            }}
            handlePrint={(val: any, selectedPayment: string) => {
              if (!isConnected && promotionsApplied.length > 0) {
                showToast("error", "Please connect to internet");

                return;
              }
              setLoading(true);
              setCompleteWithPrint(val);

              if (val && !isPrinterConnected) {
                showPrintAttachedAlert(false, selectedPayment);
                return;
              }

              console.log(val, "Should print");

              if (selectedPayment == "Cash") {
                if (billingSettings.quickAmounts) {
                  setVisibleTenderCash(true);
                } else {
                  handleComplete({
                    providerName: PROVIDER_NAME.CASH,
                    cardType: "Cash",
                    transactionNumber: "Cash",
                    amount: Number(totalAmount.toFixed(2)),
                  });
                }
              } else if (selectedPayment == "Card") {
                setVisibleCardTransaction(true);
              } else if (selectedPayment === "Credit") {
                if (!isConnected) {
                  setLoading(false);
                  showToast("error", t("Please connect with internet"));
                  return;
                }

                setVisibleCreditTransaction(true);
              } else if (selectedPayment == "Wallet") {
                if (!isConnected) {
                  setLoading(false);
                  showToast("error", t("Please connect with internet"));
                  return;
                }
                setVisibleWalletTransaction(true);
              } else if (selectedPayment.toLowerCase() == "stc pay") {
                handleCompleteBtn("STC Pay", false);
              } else {
                handleComplete(
                  {
                    providerName: selectedPayment
                      .toLowerCase()
                      .replace(/\s+/g, ""),
                    cardType: selectedPayment,
                    transactionNumber: selectedPayment,
                    amount: Number(totalAmount.toFixed(2)),
                  },
                  val
                );
              }
            }}
            handlePreview={() => {}}
          />
        </View>
      ),
    [
      billingSettings,
      businessData,
      items,
      chargesApplied,
      totalDiscount,
      totalDiscountPromotion,
      loading,
      items,
      isConnected,
      customer,
      // channel,
    ]
  );

  useEffect(() => {
    if (
      data?.status &&
      data?.amount !== undefined &&
      data?.refNum !== undefined &&
      data?.billNum !== undefined &&
      stcPay
    ) {
      handleComplete({
        providerName: PROVIDER_NAME.STC,
        cardType: "stcpay",
        transactionNumber: data?.refNum,
        amount: Number((data?.amount as any)?.toFixed(2)),
        change: 0,
        billNum: data?.billNum,
        refNum: data?.refNum,
        _id: data?.refNum,
      });
      setData(null);
    }
    setStcPay(false);
    setLoading(false);
  }, [data]);

  const createOrder = async (localOrder: any, print: boolean) => {
    try {
      const printTemplates: any =
        await repository.printTemplateRepository.findByLocation(
          deviceContext?.user?.locationRef
        );
      const printTemplate = printTemplates?.[0];

      let tokenNum = "";

      if (printTemplate?.showToken) {
        tokenNum = MMKVDB.get(DBKeys.ORDER_TOKEN) || `1`;
      }

      const { paymentMethods } = getCardAndCashPayment(localOrder);

      const orderNum = localOrder?.refNum || (await generateOrderNumber());

      const business = await repository.business.findByLocationId(
        deviceContext?.user?.locationRef
      );

      const obj = {
        ...localOrder,
        orderNum,
        tokenNum:
          tokenNum === ""
            ? ""
            : `${deviceContext.user?.tokenSequence || ""}${tokenNum}`,
        showToken: printTemplate?.showToken,
        showOrderType: printTemplate?.showOrderType,
        orderType: ChannelsName[channel] || channel || "",
        orderStatus: "completed",
        qrOrdering: false,
        specialInstructions: specialInstructions,
        company: {
          en: business?.company?.name?.en,
          ar: business?.company?.name?.ar,
          logo: business?.company?.logo || "",
        },
        companyRef: business?.company?._id,
        customer: localOrder.customer,
        customerRef: localOrder.customerRef,
        cashier: { name: authContext.user.name },
        cashierRef: authContext.user._id,
        device: { deviceCode: deviceContext.user.phone },
        deviceRef: deviceContext.user.deviceRef,
        locationRef: business?.location?._id,
        location: {
          en: printTemplate.location.name.en,
          ar: printTemplate.location.name.ar,
        },
        createdAt: new Date().toISOString(),
        refunds: [],
        appliedDiscount: totalDiscount > 0 || totalDiscountPromotion > 0,
        paymentMethod: paymentMethods,
        refundAvailable: false,
        payment: {
          ...localOrder.payment,
          total: totalAmount,
          discount: Number(totalDiscount) + Number(totalDiscountPromotion) || 0,
          discountPercentage: Number(discountPercentage?.toFixed(2)) || 0,
          discountCode: `${discountCodes},${promotionCodes}`,
          promotionPercentage,
          promotionCode: promotionCodes,
          promotionRefs: promotion?.promotionRefs || [],
        },
        phone: business?.location?.phone,
        vat: printTemplate.location.vat,
        address: printTemplate.location.address,
        footer: printTemplate.footer,
        returnPolicyTitle: "Return Policy",
        returnPolicy: printTemplate.returnPolicy,
        customText: printTemplate.customText,
        noOfPrints: billingSettings?.noOfReceiptPrint == "1" ? [1] : [1, 2],
        source: "local",
        currency,
      };

      completedOrder.current = obj;

      EventRegister.emit("order-complete", {
        ...obj,
        print: print,
        printKOT: isKOTConnected,
      });

      logInfo("order complete", {
        ...obj,
        print: print,
        printKOT: print,
      });

      const kickDrawer = obj?.payment?.breakup?.some(
        (b: any) => b.providerName === PROVIDER_NAME.CASH
      );

      const orderData = {
        _id: objectId(),
        ...obj,
        company: {
          name: business?.company?.name?.en,
        },
        location: { name: business?.location?.name?.en },
      };

      const kotPrinters = await repository.printerRepository.findKotPrinters();

      const kotPrinter = kotPrinters?.[0];

      if (kotPrinter && isKOTConnected) {
        try {
          const kotDoc = transformKOTData({
            ...obj,
            print: print && isKOTConnected,
          });

          if (kotPrinter.device_id === "sunmi") {
            if (
              kotPrinter?.printerSize === "2 Inch" ||
              kotPrinter?.printerSize === "2-inch"
            ) {
              const promises = [];
              for (let i = 0; i < kotDoc.items.length; i++) {
                console.log("PRINTING", i, "of", kotDoc.items.length);
                promises.push(printKOTSunmi(kotDoc as any));
              }
            } else {
              const promises = [];
              for (let i = 0; i < kotDoc.items.length; i++) {
                promises.push(printKOTSunmi3Inch(kotDoc as any));
              }
            }
          } else {
          }
        } catch (error) {}
      }

      const allPrinter =
        await repository.printerRepository.findReceiptPrinters();
      const printer = allPrinter.find((p) => p.printerType === "inbuilt");

      if (printer && print) {
        try {
          const orderDoc = transformOrderData({
            ...obj,
            print: print && isPrinterConnected,
          });

          logInfo("neoleap print", {
            ...obj,
            print: print && isPrinterConnected,
            printKOT: isKOTConnected,
          });

          console.log("::::::::NEOLEAP::::::::::\n", JSON.stringify(orderDoc));

          if (printer.device_id === "sunmi") {
            if (
              printer?.printerSize === "2 Inch" ||
              printer?.printerSize === "2-inch"
            ) {
              EventRegister.emit("print-sunmi-2-inch-order", orderDoc);
            } else {
              await printSunmi4Inch(orderDoc as any);
            }
          } else if (printer.device_id === "landi") {
            await printLandiPos(orderDoc as any);
          } else {
            try {
              ExpoPrintHelp.init();
              await ExpoPrintHelp.print(JSON.stringify(orderDoc));
            } catch (error) {
              console.log("ERROR", error);
            }

            for (const printer of kotPrinters) {
              console.log("Adding Kot to", printer.ip);
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
        } catch (error) {}
      }

      repository.orderRepository
        .create(orderData)
        .then(async (res) => {
          try {
            const orderDoc = transformOrderData({
              ...obj,
              print: print && isPrinterConnected,
            });

            console.log("ORDER TRANSFORMED LAN-", JSON.stringify(orderDoc));

            logInfo("lan print", {
              ...orderDoc,
              print: print && isPrinterConnected,
              printKOT: isKOTConnected,
            });

            if (print) {
              const allPrinters = await repository.printerRepository.findByType(
                "network"
              );

              for (const printer of allPrinters) {
                if (printer.enableReceipts) {
                  await ExpoPrintHelp.printTcp(
                    printer.ip,
                    printer.port,
                    JSON.stringify({ ...orderDoc, currency: currency }),
                    "202",
                    printer.printerWidthMM.toString(),
                    printer.charsPerLine.toString(),
                    "order",
                    kickDrawer
                  );
                  console.log("RECIEPT PRINTED");
                }
              }

              console.log("NET PRINTERS BILLING ORDER VIEW", allPrinters);
            }

            if (true) {
              const allPrinters = await repository.printerRepository.findByType(
                "network"
              );

              const kotPrinters = allPrinters.filter((o) => o?.enableKOT);

              if (businessData?.company?.enableKitchenManagement) {
                const lanData = groupItemsByKitchenLan(orderDoc);

                for (const d of lanData) {
                  const printersKitchen =
                    await repository.printerRepository.findByKitchen(
                      d?.kitchenRef
                    );

                  const printers = printersKitchen.filter((p) => p?.enableKOT);

                  const prms = [];
                  if (printers?.length > 0) {
                    for (const printer of printers) {
                      console.log("Adding Print to", printer.ip);
                      for (let i = 0; i < (printer?.numberOfKots || 1); i++) {
                        prms.push(
                          ExpoPrintHelp.printTcp(
                            printer.ip,
                            printer.port,
                            JSON.stringify({ ...d, currency: currency }),
                            "202",
                            printer.printerWidthMM.toString(),
                            printer.charsPerLine.toString(),
                            "kot"
                          )
                        );
                      }
                    }

                    await Promise.all(prms);
                  }

                  await Promise.all(prms);

                  console.log("printed successfully");
                }
              }

              for (const printer of kotPrinters) {
                if (
                  printer.enableKOT &&
                  !businessData?.company?.enableKitchenManagement
                ) {
                  console.log("Adding Kot to", printer.ip);
                  const prms = [];
                  for (let i = 0; i < (printer?.numberOfKots || 1); i++) {
                    prms.push(
                      ExpoPrintHelp.printTcp(
                        printer.ip,
                        printer.port,
                        JSON.stringify({ ...orderDoc, currency: currency }),
                        "202",
                        printer.printerWidthMM.toString(),
                        printer.charsPerLine.toString(),
                        "kot"
                      )
                    );
                  }

                  await Promise.all(prms);
                }
              }
            }
          } catch (error) {
            console.log("ERROR OCCURED", error);
          }

          if (printTemplate?.showToken) {
            MMKVDB.set(DBKeys.ORDER_TOKEN, `${Number(tokenNum) + 1}`);
          }
          if (visiblePaymentStatus) {
            setVisiblePaymentStatus(false);
          }

          const ticketData = MMKVDB.get("currentTicket");

          if (ticketData) {
            removeSingleTicket(ticketData?.id);
            MMKVDB.remove("currentTicket");
          }
          if (customer?._id) {
            updateCustomer(customer, obj);
            setCustomer({});
          }

          const promoDoc = obj?.items?.some(
            (promo: any) => promo?.promotionsData?.length > 0
          );

          if (obj?.payment?.promotionRefs?.length > 0 || promoDoc) {
            updatePromotionDiscount(obj);
          }
          if (!twoPaneView) {
            navigation.goBack();
          }
          setLoading(false);
          setSpecialInstructions("");
          setRemainingWalletBalance(0);
          setRemainingCreditBalance(0);
          queryClient.invalidateQueries("find-order");
        })
        .catch((err) => {
          showToast("error", getErrorMsg("order", "create"));
        });
    } catch (error) {
      console.log("order creation error", error);

      logError("order creation error", error);
    }
  };

  const updateCustomer = useCallback(async (customer: any, obj: any) => {
    if (customer) {
      const walletBalance = obj?.payment?.breakup
        ?.filter((p: any) => p.providerName === PROVIDER_NAME.WALLET)
        ?.reduce((pv: any, cv: any) => pv + cv.total, 0);

      const creditBalance = obj?.payment?.breakup
        ?.filter((p: any) => p.providerName === PROVIDER_NAME.CREDIT)
        ?.reduce((pv: any, cv: any) => pv + cv.total, 0);

      try {
        await serviceCaller("/promotion/update-usage", {
          method: "POST",
          body: {
            order: obj,
            customerRef: customer?._id,
          },
        });
        if (creditBalance > 0) {
          await serviceCaller(`/customer/${customer._id}`, {
            method: "PATCH",
            body: {
              totalSpent:
                Number(customer.totalSpend) +
                Number(obj.payment.total) -
                Number(walletBalance),
              totalOrder: Number(customer.totalOrders) + 1,
              lastOrderDate: new Date(),
            },
          });
        }

        console.log("updating customer-------", {
          ...customer,
          usedCredit:
            Number(customer?.usedCredit || 0) + Number(creditBalance || 0),
          availableCredit:
            Number(customer?.availableCredit || 0) - Number(creditBalance || 0),
          totalSpend:
            Number(customer.totalSpend) +
            Number(obj.payment.total) -
            Number(walletBalance || 0),
          totalOrders: Number(customer.totalOrders) + 1,
          lastOrder: new Date(),
          source: Number(creditBalance > 0) ? "server" : "local",
        });

        await repository.customerRepository.update(customer._id, {
          ...customer,
          usedCredit:
            Number(customer?.usedCredit || 0) + Number(creditBalance || 0),
          availableCredit:
            Number(customer?.availableCredit || 0) - Number(creditBalance || 0),
          totalSpend:
            Number(customer.totalSpend) +
            Number(obj.payment.total) -
            Number(walletBalance || 0),
          totalOrders: Number(customer.totalOrders) + 1,
          lastOrder: new Date(),
          source: "local",
        });
      } catch (err) {
        showToast("error", getErrorMsg("customer-stats", "update"));
      }
    }
  }, []);

  const updatePromotionDiscount = async (order: any) => {
    const data = order?.items
      .flatMap((op: any) => op.promotionsData)
      .filter((p: any) => p) as any;

    const grouped = data.reduce((acc: any, item: any) => {
      if (acc[item.id]) {
        acc[item.id].discount += item.discount;
      } else {
        acc[item.id] = { ...item };
      }
      return acc;
    }, {});

    Object.values(grouped).map(async (op: any) => {
      await serviceCaller("/promotion/update", {
        method: "POST",
        body: {
          amount: op?.discount,
          code: op?.name,
          id: op?.id,
        },
      });
    });
  };

  const handleComplete = (data: any, print: any = false) => {
    let localOrder = null;

    if (!order || Object.keys(order).length === 0) {
      try {
        const allItems = transformCartItems(items, discountPercentage);

        const subtotal =
          totalAmount - totalVatAmount - totalCharges + vatCharges;

        const orderObject = {
          ...(data?.refNum && { refNum: data.refNum }),
          items: allItems,
          customer: {
            name: customer?.firstName
              ? `${customer.firstName} ${customer?.lastName || ""}`
              : "",
            vat: customer?.vat || "",
            phone: customer?.phone,
          },
          customerRef: customer?._id,
          payment: {
            total: totalAmount,
            vat: totalVatAmount,
            vatPercentage: ((totalVatAmount * 100) / totalAmount).toFixed(0),
            subTotal: Number(subtotal.toFixed(2)),
            discount: totalDiscount + totalDiscountPromotion || 0,
            discountPercentage: discountPercentage + promotionPercentage || 0,
            discountCode: `${discountCodes},${promotionCodes}`,
            vatWithoutDiscount,
            subTotalWithoutDiscount,
            breakup: [
              {
                name: data.cardType,
                total: Number(data.amount),
                refId: data.transactionNumber,
                providerName: data?.providerName || PROVIDER_NAME.CASH,
                createdAt: new Date(),
                paid:
                  Number(data?.change || 0) > 0
                    ? Number(data.amount?.toFixed(2)) -
                      Number((data.change || 0)?.toFixed(2))
                    : Number(data.amount?.toFixed(2)),
                change: data?.change || 0,
              },
            ],
            charges: chargesApplied,
          },
        };

        localOrder = orderObject;
      } catch (error) {
        console.log(error);
      }
    } else {
      let orderDoc = {
        ...order,
        customer: {
          name: customer?.firstName
            ? `${customer.firstName} ${customer.lastName}`
            : "",
          vat: customer?.vat || "",
        },
        customerRef: customer?._id,
      };

      orderDoc.payment.breakup.push({
        name: data.cardType,
        total: Number(data.amount?.toFixed(2)),
        refId: data.transactionNumber,
        providerName: data.providerName,
        createdAt: new Date(),
        paid:
          Number(data?.change || 0) > 0
            ? Number(data.amount?.toFixed(2)) -
              Number((data.change || 0)?.toFixed(2))
            : Number(data.amount?.toFixed(2)),
        change: Number((data?.change || 0)?.toFixed(2)),
      });
      localOrder = orderDoc;
    }

    if (localOrder.items.length === 0) return;
    console.log("local order", localOrder);

    setOrder(localOrder);

    calculateCart();

    const totalPaid = getTotalPaid(localOrder);

    if (Number(totalPaid) < Number(totalAmount)) {
      setVisiblePaymentStatus(true);
      return;
    } else {
      console.log("-------::::::------", completeWithPrint || print);
      createOrder(localOrder, completeWithPrint || print);
    }
  };

  const showPrintAttachedAlert = async (
    complete: boolean,
    selectedPayment: string
  ) => {
    await showAlert({
      confirmation: t("Confirmation"),
      alertMsg: `${t(
        "The printer is not attached, do you want to complete the billing without print?"
      )}`,
      btnText1: t("No"),
      btnText2: t("Yes"),
      onPressBtn1: () => {
        setLoading(false);
      },
      onPressBtn2: () => {
        if (complete) {
          setCompleteWithPrint(false);
        }

        if (selectedPayment === "Nearpay") {
          NearpaySDK.getInstance().then((embededNearpay) => {
            if (!embededNearpay) {
              return;
            }
            embededNearpay
              .purchase({
                amount: totalAmount * 100,
                // transactionId: txnId,
                enableReceiptUi: true,
                enableReversalUi: true,
                enableUiDismiss: true,
              })
              .then((response) => {
                setLoading(false);
                handleComplete({
                  providerName: PROVIDER_NAME.Nearpay,
                  cardType: "nearpay",
                  transactionNumber: response?.receipts?.[0]?.transaction_uuid,
                  amount: Number((totalAmount as any)?.toFixed(2)),
                  change: 0,
                });
              })
              .catch((error: any) => {
                console.log(error);
                setLoading(false);
              });
          });

          return;
        }

        if (selectedPayment === "STC Pay") {
          setStcPay(true);

          EventRegister.emit("initStcPay", {
            amount: totalAmount,
            deviceCode: deviceContext.user.phone,
            locationId: deviceContext?.user?.locationRef,
          });

          return;
        }

        if (selectedPayment == "Cash") {
          if (billingSettings.quickAmounts) {
            setVisibleTenderCash(true);
          } else {
            handleComplete({
              providerName: PROVIDER_NAME.CASH,
              cardType: "Cash",
              transactionNumber: "Cash",
              amount: Number(totalAmount.toFixed(2)),
            });
          }
        } else if (selectedPayment == "Card") {
          setVisibleCardTransaction(true);
        } else if (selectedPayment == "Credit") {
          setVisibleCreditTransaction(true);
        } else if (selectedPayment === "Wallet") {
          if (!isConnected) {
            setLoading(false);
            showToast("error", t("Please connect with internet"));
            return;
          }
          setVisibleWalletTransaction(true);
        } else {
          handleComplete({
            providerName: selectedPayment.toLowerCase().replace(/\s+/g, ""),
            cardType: selectedPayment,
            transactionNumber: selectedPayment,
            amount: Number(totalAmount.toFixed(2)),
          });
        }
      },
    });
  };

  const handleCompleteBtn = useCallback(
    (selectedPayment: string, showAlert = true) => {
      if (
        billingSettings?.defaultCompleteBtn === "with-print" &&
        !isPrinterConnected &&
        showAlert
      ) {
        showPrintAttachedAlert(true, selectedPayment);
        return;
      }

      if (billingSettings?.defaultCompleteBtn === "with-print") {
        setCompleteWithPrint(true);
      } else {
        setCompleteWithPrint(false);
      }

      if (selectedPayment === "Nearpay") {
        NearpaySDK.getInstance().then((embededNearpay) => {
          if (!embededNearpay) {
            return;
          }
          embededNearpay
            .purchase({
              amount: Number(totalAmount) * 100,
              // transactionId: txnId,
              enableReceiptUi: true,
              enableReversalUi: true,
              enableUiDismiss: true,
            })
            .then((response) => {
              setLoading(false);
              handleComplete(
                {
                  providerName: PROVIDER_NAME.Nearpay,
                  cardType: "nearpay",
                  transactionNumber: response?.receipts?.[0]?.transaction_uuid,
                  amount: Number((totalAmount as any)?.toFixed(2)),
                  change: 0,
                },
                billingSettings?.defaultCompleteBtn === "with-print"
              );
            })
            .catch((error: any) => {
              console.log(error);
              setLoading(false);
            });
        });

        return;
      }

      if (selectedPayment === "STC Pay") {
        setStcPay(true);
        console.log("STC PAY");

        EventRegister.emit("initStcPay", {
          amount: totalAmount,
          deviceCode: deviceContext.user.phone,
          locationId: deviceContext?.user?.locationRef,
        });

        return;
      }

      if (selectedPayment == "Cash") {
        if (billingSettings?.quickAmounts) {
          setVisibleTenderCash(true);
        } else {
          handleComplete({
            providerName: PROVIDER_NAME.CASH,
            cardType: "Cash",
            transactionNumber: "Cash",
            amount: Number(totalAmount.toFixed(2)),
            change: 0,
          });
        }
      } else if (selectedPayment == "Card") {
        setVisibleCardTransaction(true);
      } else if (selectedPayment === "Credit") {
        if (!isConnected) {
          setLoading(false);
          showToast("error", t("Please connect with internet"));
          return;
        }

        setVisibleCreditTransaction(true);
      } else if (selectedPayment === "Wallet") {
        if (!isConnected) {
          setLoading(false);
          showToast("error", t("Please connect with internet"));
          return;
        }
        setVisibleWalletTransaction(true);
      } else {
        handleComplete({
          providerName: selectedPayment.toLowerCase().replace(/\s+/g, ""),
          cardType: selectedPayment,
          transactionNumber: selectedPayment,
          amount: Number(totalAmount.toFixed(2)),
        });
      }
    },
    [
      billingSettings,
      businessData,
      isPrinterConnected,
      totalAmount,
      totalDiscount,
      totalDiscountPromotion,
      stcPay,
    ]
  );

  const launchIntent = (amount: string) => {
    setLoading(true);

    try {
      const paymentData = {
        packageName: Consts.PACKAGE,
        transType: "2",
        channelId: "acquire",
        outOrderNo: "37928378297",
        amount: (Number(amount) * 100)?.toFixed(0) || "0",
        action: Consts.CARD_ACTION,
      };

      ExpoCustomIntent.startActivityAsync(paymentData).then(
        (result: any) => {
          if (result.resultCode === -1) {
            const jsonData = result?.extra
              ? JSON.parse(result.extra["JSON_DATA"])
              : null;

            if (jsonData?.madaTransactionResult?.StatusCode === "00") {
              handleComplete({
                providerName: PROVIDER_NAME.CARD,
                cardType:
                  jsonData.madaTransactionResult?.CardScheme?.English || "NA",
                transactionNumber:
                  jsonData.madaTransactionResult?.ApprovalCode || "12345678",
                amount: Number(amount),
              });
            } else {
              showToast("error", t("Transaction couldn't be completed"));
            }
          } else {
            showToast("error", ERRORS.SOMETHING_WENT_WRONG);
          }
        },
        (error) => {}
      );
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getNameInitials = () => {
    const firstNameInitial = customer?.firstName?.charAt(0)?.toUpperCase() + "";
    return `${firstNameInitial || ""}`;
  };

  return (
    <View style={{ flex: 1, height: "100%" }}>
      <ScrollView
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={Keyboard.dismiss}
        contentContainerStyle={{
          flex: 2,
          marginTop: hp("2%"),
          paddingHorizontal: hp("2%"),
        }}
      >
        {customer?._id ? (
          <View
            style={{
              ...styles.customerContentView,
              backgroundColor: theme.colors.primary[100],
            }}
          >
            {customer.totalOrders != 0 && (
              <View style={styles.customerTotalOrdersView}>
                <View
                  style={{
                    ...styles.customerOrdersBgView,
                    backgroundColor:
                      customer?.totalOrders == 0
                        ? theme.colors.red.default
                        : theme.colors.primary[1000],
                  }}
                >
                  <DefaultText
                    style={{ textAlign: "center", marginHorizontal: 5 }}
                    fontSize="sm"
                    color="white.1000"
                  >
                    {Number(customer?.totalOrders) == 1
                      ? t("One Timer")
                      : t("Regular")}
                  </DefaultText>
                </View>
              </View>
            )}

            <View
              style={{
                width: customer.totalOrders != 0 ? "96%" : "100%",
                marginLeft: customer.totalOrders != 0 ? "4%" : "0%",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  paddingVertical: hp("0.75%"),
                  paddingHorizontal: 16,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                {customer?.profilePicture ? (
                  <Image
                    key={"customer-pic"}
                    resizeMode="contain"
                    style={{ width: 42, height: 42 }}
                    borderRadius={50}
                    source={{ uri: customer.profilePicture }}
                  />
                ) : (
                  <View
                    style={{
                      ...styles.customerNameInitialView,
                      backgroundColor: theme.colors.primary[300],
                    }}
                  >
                    <DefaultText
                      fontSize="xl"
                      fontWeight="medium"
                      color="white.1000"
                    >
                      {getNameInitials()}
                    </DefaultText>
                  </View>
                )}

                <View
                  style={{
                    width: twoPaneView ? "65%" : "75%",
                    marginHorizontal: hp("1.25%"),
                  }}
                >
                  <DefaultText fontSize="lg" fontWeight="medium" noOfLines={1}>
                    {`${customer.firstName} ${customer.lastName}`}
                  </DefaultText>

                  <DefaultText
                    fontSize="md"
                    fontWeight="normal"
                    color="otherGrey.100"
                  >
                    {customer.phone}
                  </DefaultText>
                </View>
              </View>

              <TouchableOpacity
                style={{ padding: 10 }}
                onPress={() => {
                  setCustomer(null);
                }}
              >
                <ICONS.CloseClearIcon />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <CustomerSearchAdd
            handlePress={() => {
              setVisibleCustomers(true);
            }}
          />
        )}
        {renderCheckout}
      </ScrollView>

      {renderCompleteView}

      {visibleEditItemModal && (
        <BillingProductPriceModal
          data={itemModifyData}
          businessDetails={businessData}
          onDelete={() => {
            if (items.length === 1) {
              setCustomer({});
              setSpecialInstructions("");
              setVisiblePaymentStatus(false);
              cart.clearCart();
            } else {
              cart.removeFromCart(activeIndex, (removedItems: any) => {
                EventRegister.emit("itemRemoved", removedItems);
              });
            }
            setVisibleEditItemModal(false);
          }}
          onChange={(changedObject: any) => {
            if (changedObject.qty === 0) {
              setSpecialInstructions("");
            } else {
              cart.updateCartItem(
                activeIndex,
                changedObject,
                (updatedItems: any) => {
                  EventRegister.emit("itemUpdated", updatedItems);
                }
              );
            }
            setActiveIndex(null);
            setVisibleEditItemModal(false);
          }}
          visible={visibleEditItemModal}
          handleClose={() => setVisibleEditItemModal(false)}
        />
      )}

      {visiblePaymentStatus && (
        <PaymentStatusModal
          close={
            order?.payment?.breakup === undefined ||
            order?.payment?.breakup?.length === 0
          }
          businessDetails={businessData}
          visible={visiblePaymentStatus}
          totalPaidAmount={totalPaidAmount}
          total={totalAmount}
          onChange={(data: any) => {
            if (data.method === "stc pay") {
              setStcPay(true);

              EventRegister.emit("initStcPay", {
                amount: totalAmount,
                deviceCode: deviceContext.user.phone,
                locationId: deviceContext?.user?.locationRef,
              });

              return;
            }

            if (data.method === "nearpay") {
              NearpaySDK.getInstance().then((embededNearpay) => {
                if (!embededNearpay) {
                  return;
                }
                embededNearpay
                  .purchase({
                    amount: Number(totalAmount) * 100,
                    // transactionId: txnId,
                    enableReceiptUi: true,
                    enableReversalUi: true,
                    enableUiDismiss: true,
                  })
                  .then((response) => {
                    setLoading(false);
                    handleComplete({
                      providerName: PROVIDER_NAME.Nearpay,
                      cardType: "nearpay",
                      transactionNumber:
                        response?.receipts?.[0]?.transaction_uuid,
                      amount: Number((totalAmount as any)?.toFixed(2)),
                      change: 0,
                    });
                  })
                  .catch((error) => {
                    console.log(error);
                    setLoading(false);
                  });
              });

              return;
            }
            if (data.method === "card") {
              setVisibleCardTransaction(true);
            } else if (data.method === "cash") {
              setVisibleTenderCash(true);
            } else if (data.method === "credit") {
              setVisibleCreditTransaction(true);
            } else if (data.method === "wallet") {
              setVisibleWalletTransaction(true);
            } else {
              handleComplete({
                providerName: data?.method,
                cardType: data?.method,
                transactionNumber: data?.method,
                amount: Number(
                  totalPaidAmount
                    ? `${(totalAmount - totalPaidAmount).toFixed(2) || "0"}`
                    : `${totalAmount.toFixed(2) || "0"}`
                ),
              });
            }
          }}
          handleClose={() => {
            setLoading(false);
            setVisiblePaymentStatus(false);
          }}
        />
      )}

      {visibleTenderCash && (
        <TenderCashModal
          visible={visibleTenderCash}
          handleClose={() => {
            setLoading(false);
            setVisibleTenderCash(false);
          }}
          onChange={handleComplete}
          totalAmount={totalAmount}
          totalDiscount={totalDiscount}
        />
      )}

      {visibleCardTransaction && (
        <CardTransactionModal
          data={{}}
          billingSettings={billingSettings}
          totalPaidAmount={totalPaidAmount}
          totalAmount={totalAmount}
          visible={visibleCardTransaction}
          handleClose={() => {
            setLoading(false);
            setVisibleCardTransaction(false);
          }}
          onChange={handleComplete}
          handleNFCPayment={launchIntent}
        />
      )}

      {visibleWalletTransaction && (
        <WalletTransactionModal
          totalPaidAmount={totalPaidAmount}
          totalAmount={totalAmount}
          businessDetails={businessData}
          visible={visibleWalletTransaction}
          handleClose={() => {
            setLoading(false);
            setVisibleWalletTransaction(false);
          }}
          onChange={handleComplete}
        />
      )}

      {visibleCreditTransaction && (
        <CreditTransactionModal
          businessDetails={businessData}
          totalPaidAmount={totalPaidAmount}
          totalAmount={totalAmount}
          visible={visibleCreditTransaction}
          handleClose={() => {
            setLoading(false);
            setVisibleCreditTransaction(false);
          }}
          onChange={handleComplete}
        />
      )}

      {visibleCustomer && (
        <WalletCustomerModal
          visible={visibleCustomer}
          handleSelectedCustomer={(customer: any) => {
            setCustomer(customer);
            setVisibleCustomers(false);
          }}
          handleClose={() => {
            setVisibleCustomers(false);
          }}
        />
      )}

      <STCPayModal
        connected={isConnected}
        visible={stcPay}
        handleCancel={() => {
          setLoading(false);
          EventRegister.emit("cancelStcPay");
          setStcPay(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  item_row: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  empty_view: {
    borderWidth: 1,
    borderRadius: 8,
  },
  footer_view: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  customerContentView: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    // marginTop: 15,
    marginBottom: 12,
  },
  customerTotalOrdersView: {
    flex: 1,
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    borderRadius: 8,
    overflow: "hidden",
    position: "absolute",
  },
  customerOrdersBgView: {
    top: "28%",
    left: "-48%",
    width: "100%",
    paddingVertical: 5,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    position: "absolute",
    transform: [{ rotate: "-90deg" }],
  },
  customerNameInitialView: {
    width: 40,
    height: 40,
    padding: 6,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});
