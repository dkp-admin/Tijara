import { useIsFocused, useNavigation } from "@react-navigation/core";
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
  Alert,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { EventRegister } from "react-native-event-listeners";
import { useQueryClient } from "react-query";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import AuthContext from "../../context/auth-context";
import DeviceContext from "../../context/device-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import useCartCalculation from "../../hooks/use-cart-calculation";
import useItems from "../../hooks/use-items";
import usePrinterStatus from "../../hooks/use-printer-status";
import { useResponsive } from "../../hooks/use-responsiveness";
import useCommonApis from "../../hooks/useCommonApis";
import useCartStore from "../../store/cart-item";
import useTicketStore from "../../store/ticket-store";
import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";
// import { autoApplyCustomCharges } from "../../utils/auto-apply-custom-charge";
import useChannelStore from "../../store/channel-store";
import { objectId } from "../../utils/bsonObjectIdTransformer";
import calculateCart from "../../utils/calculate-cart";
import cart from "../../utils/cart";
import { getErrorMsg } from "../../utils/common-error-msg";
import { ChannelsName, PROVIDER_NAME } from "../../utils/constants";
import { repo } from "../../utils/createDatabaseConnection";
import { ERRORS } from "../../utils/errors";
import generateUniqueCode from "../../utils/generate-unique-code";
import ICONS from "../../utils/icons";
import { debugLog, errorLog } from "../../utils/log-patch";
import { printKOTSunmi } from "../../utils/printKOTSunmi";
import { printKOTSunmi3Inch } from "../../utils/printKOTSunmi3inch";
import { printSunmi4Inch } from "../../utils/printSunmi3inch";
import { showAlert } from "../../utils/showAlert";
import { transformCartItems } from "../../utils/transform-cart-items";
import { transformKOTData } from "../../utils/transform-kot-data";
import { transformOrderData } from "../../utils/transform-order-data";
import SeparatorHorizontalView from "../common/separator-horizontal-view";
import Loader from "../loader";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import DefaultText from "../text/Text";
import SaveTicketModal from "../tickets/save-ticket-modal";
import TicketsListModal from "../tickets/tickets-list";
import showToast from "../toast";
import BillingProductPriceModal from "./left-view/modal/billing-product-price-modal";
import BillingOrderHeader from "./right-view/billing-order-header";
import BillingOrderRow from "./right-view/billing-order-row";
import BillingOrderTopView from "./right-view/billing-order-top-view";
import BillingPaymentCompleteView from "./right-view/billing-payment-complete-view";
import BillingSearchAdd from "./right-view/billing-search-add";
import ChargesView from "./right-view/charges-view";
import DiscountView from "./right-view/discount-view";
import AppliedChargeModal from "./right-view/modal/applied-charge-modal";
import AppliedDiscountModal from "./right-view/modal/applied-discount-modal";
import CardTransactionModal from "./right-view/modal/card-transaction-modal";
import CreditTransactionModal from "./right-view/modal/credit-transaction-modal";
import PaymentStatusModal from "./right-view/modal/payment-status-modal";
import SpecialInstructionModal from "./right-view/modal/special-instructions-modal";
import TenderCashModal from "./right-view/modal/tender-cash-modal";
import WalletCustomerModal from "./right-view/modal/wallet-customer-modal";
import WalletTransactionModal from "./right-view/modal/wallet-transaction-modal";

const ItemsList = ({
  row,
  setVisibleAppliedDiscount,
  setVisibleAppliedCharge,
}: any) => {
  const flatListRef = useRef<FlatList | null>(null) as any;
  const { items, totalDiscount, chargesApplied, totalDiscountPromotion } =
    useItems();
  const { hp } = useResponsive();

  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && cart.cartItems?.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, []);

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
    <FlatList
      ref={flatListRef}
      style={{ flex: 2 }}
      alwaysBounceVertical={false}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={scrollToBottom}
      keyExtractor={(item: any, index) => `${item.sku}-${index}`}
      data={items}
      renderItem={row}
      ListHeaderComponent={() => <BillingOrderHeader />}
      ListEmptyComponent={() => {
        return (
          <View style={{ marginHorizontal: 16 }}>
            <NoDataPlaceholder
              title={t("No Product Added!")}
              marginTop={hp("20%")}
            />
          </View>
        );
      }}
      ListFooterComponent={() => (
        <View>
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

          <ChargesView
            items={items}
            chargesApplied={chargesApplied}
            handlePress={() => {
              setVisibleAppliedCharge(true);
            }}
          />
        </View>
      )}
    />
  );
};

const Consts = {
  PACKAGE: "com.intersoft.acquire.mada",
  SERVICE_ACTION: "android.intent.action.intersoft.PAYMENT.SERVICE",
  CARD_ACTION: "android.intent.action.intersoft.PAYMENT",
  UNIONPAY_ACTION: "android.intent.action.intersoft.PAYMENT_UNION_SCAN",
  INSTALLMENT_ACTION: "android.intent.action.intersoft.PAYMENT_INSTALLMENT",
};

export default function BillingRightOrderView(props: any) {
  const theme = useTheme();
  const isFocused = useIsFocused();
  const isConnected = checkInternet();
  const { hp, twoPaneView } = useResponsive();
  const { isConnected: isPrinterConnected, isKOTConnected } =
    usePrinterStatus();
  const queryClient = useQueryClient();
  const navigation = useNavigation() as any;
  const { businessData: businessDetails } = useCommonApis();
  const authContext = useContext(AuthContext) as any;
  const deviceContext = useContext(DeviceContext) as any;
  const {
    items,
    totalVatAmount,
    discountCodes,
    discountsApplied,
    promotionsApplied,
    chargesApplied,
    totalDiscount,
    totalDiscountPromotion,
    totalAmount,
    totalItem,
    totalQty,
    vatWithoutDiscount,
    subTotalWithoutDiscount,
    totalCharges,
    vatCharges,
    discountsPercentage: discountPercentage,
    promotionCodes,
    promotionPercentage,
    promotion,
  } = useItems();

  const [loading, setLoading] = useState(false);
  const [visibleAddCustomer, setVisibleAddCustomer] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);
  const [visibleSaveTicket, setVisibleSaveTicket] = useState(false);
  const [visibleTickets, setVisibleTickets] = useState(false);
  const [visibleAppliedDiscount, setVisibleAppliedDiscount] = useState(false);
  const [visibleAppliedCharge, setVisibleAppliedCharge] = useState(false);
  const [visibleTenderCash, setVisibleTenderCash] = useState(false);
  const [visibleCardTransaction, setVisibleCardTransaction] = useState(false);
  const [visibleWalletTransaction, setVisibleWalletTransaction] =
    useState(false);
  const [visibleCreditTransaction, setVisibleCreditTransaction] =
    useState(false);
  const [productData, setProductData] = useState<any>(null);
  const [visibleProductPrice, setVisibleProductPrice] = useState(false);
  const [visiblePaymentStatus, setVisiblePaymentStatus] = useState(false);
  const completedOrder = useRef() as any;
  const [activeIndex, setActiveIndex] = useState(null) as any;
  const [completeWithPrint, setCompleteWithPrint] = useState(false);
  const [ticketIndex, setTicketIndex] = useState(null) as any;
  const [billingSettings, setBillingSettings] = useState(null) as any;
  const [visibleSpecialInstModal, setVisibleSpecialInstModal] = useState(false);
  const { getCardAndCashPayment } = useCartCalculation();
  const { channel, setChannel } = useChannelStore();
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

  const { removeSingleTicket } = useTicketStore() as any;

  const createOrder = async (localOrder: any, print: boolean) => {
    debugLog(
      "Order started",
      localOrder,
      "cart-billing-screen",
      "handleCreateOrderFunction"
    );

    const printTemplate: any = await repo.printTemplate.findOne({
      where: { locationRef: authContext.user.locationRef },
    });

    let tokenNum = "";

    if (printTemplate?.showToken) {
      tokenNum = MMKVDB.get(DBKeys.ORDER_TOKEN) || `1`;
    }

    const { paymentMethods } = getCardAndCashPayment(localOrder);

    const orderNum = generateUniqueCode(6);

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
        en: businessDetails?.company?.name?.en,
        ar: businessDetails?.company?.name?.ar,
        logo: businessDetails?.company?.logo || "",
      },
      companyRef: businessDetails?.company?._id,
      customer: localOrder.customer,
      customerRef: localOrder.customerRef,
      cashier: { name: authContext.user.name },
      cashierRef: authContext.user._id,
      device: { deviceCode: deviceContext.user.phone },
      deviceRef: deviceContext.user.deviceRef,
      locationRef: businessDetails?.location?._id,
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
      phone: businessDetails?.location?.phone,
      vat: printTemplate.location.vat,
      address: printTemplate.location.address,
      footer: printTemplate.footer,
      returnPolicyTitle: "Return Policy",
      returnPolicy: printTemplate.returnPolicy,
      customText: printTemplate.customText,
      noOfPrints: billingSettings.noOfReceiptPrint == "1" ? [1] : [1, 2],
      source: "local",
    };

    completedOrder.current = obj;

    EventRegister.emit("order-complete", {
      ...obj,
      print: print && isPrinterConnected,
      printKOT: isKOTConnected,
    });

    if (!print && isPrinterConnected) {
      const kickDrawer = obj?.payment?.breakup?.some(
        (b: any) => b.providerName === PROVIDER_NAME.CASH
      );

      if (kickDrawer) {
        ExpoPrintHelp.openCashDrawer();
      }
    }

    const orderData = {
      _id: objectId(),
      ...obj,
      company: {
        name: businessDetails?.company?.name?.en,
      },
      location: { name: businessDetails?.location?.name?.en },
    };

    const kotPrinter = await repo.printer.findOneBy({
      enableKOT: true,
      printerType: "inbuilt",
    });

    if (kotPrinter && isKOTConnected) {
      try {
        const kotDoc = transformKOTData({
          ...obj,
          print: print && isKOTConnected,
        });

        debugLog(
          "Inbuilt kot print started",
          kotDoc,
          "cart-billing-screen",
          "handleCreateOrderFunction"
        );

        if (kotPrinter.device_id === "sunmi") {
          if (
            kotPrinter?.printerSize === "2 Inch" ||
            kotPrinter?.printerSize === "2-inch"
          ) {
            await printKOTSunmi(kotDoc as any);
          } else {
            await printKOTSunmi3Inch(kotDoc as any);
          }
        } else {
          // ExpoPrintHelp.init();
          // await ExpoPrintHelp.print(JSON.stringify(orderDoc));
        }

        debugLog(
          "Inbuilt kot print completed",
          {},
          "cart-billing-screen",
          "handleCreateOrderFunction"
        );
      } catch (error) {
        errorLog(
          "Inbuilt kot print failed",
          {},
          "cart-billing-screen",
          "handleCreateOrderFunction",
          error
        );
      }
    }

    const printer = await repo.printer.findOneBy({
      enableReceipts: true,
      printerType: "inbuilt",
    });

    if (printer && print && isPrinterConnected) {
      try {
        const orderDoc = transformOrderData({
          ...obj,
          print: print && isPrinterConnected,
        });

        if (printer.device_id === "sunmi") {
          if (
            printer?.printerSize === "2 Inch" ||
            printer?.printerSize === "2-inch"
          ) {
            EventRegister.emit("print-sunmi-2-inch-order", orderDoc);
          } else {
            debugLog(
              "Inbuilt Sunmi 3 inch order print started",
              orderDoc,
              "cart-billing-screen",
              "handleCreateOrderFunction"
            );

            await printSunmi4Inch(orderDoc as any);

            debugLog(
              "Inbuilt Sunmi 3 inch order print completed",
              {},
              "cart-billing-screen",
              "handleCreateOrderFunction"
            );
          }
        } else {
          debugLog(
            "Inbuilt NeoLeap order print started",
            orderDoc,
            "cart-billing-screen",
            "handleCreateOrderFunction"
          );

          ExpoPrintHelp.init();
          await ExpoPrintHelp.print(JSON.stringify(orderDoc));

          debugLog(
            "Inbuilt NeoLeap order print completed",
            {},
            "cart-billing-screen",
            "handleCreateOrderFunction"
          );
        }
      } catch (error) {
        errorLog(
          "Inbuilt order print failed",
          {},
          "cart-billing-screen",
          "handleCreateOrderFunction",
          error
        );
      }
    }

    repo.order
      .insert(orderData)
      .then(() => {
        debugLog(
          "Order created",
          orderData,
          "cart-billing-screen",
          "handleCreateOrderFunction"
        );

        if (printTemplate?.showToken) {
          MMKVDB.set(DBKeys.ORDER_TOKEN, `${Number(tokenNum) + 1}`);
        }

        if (visiblePaymentStatus) {
          setVisiblePaymentStatus(false);
        }

        if (ticketData?.id === ticketIndex) {
          debugLog(
            "Save ticket removed",
            ticketData,
            "cart-billing-screen",
            "handleCreateOrderFunction"
          );
          removeSingleTicket(ticketIndex);
          setTicketIndex(null);
          setTicketData(null);
        }
        if (customer?._id) {
          updateCustomer(customer, obj);
          debugLog(
            "Customer removed from cart",
            customer,
            "cart-billing-screen",
            "handleCreateOrderFunction"
          );
          setCustomer({});
        }

        const promoDoc = obj?.items?.some(
          (promo: any) => promo?.promotionsData?.length > 0
        );

        if (obj?.payment?.promotionRefs?.length > 0 || promoDoc) {
          updatePromotionDiscount(obj);
        }

        if (!twoPaneView) {
          debugLog(
            "Navigate back to billing screen",
            {},
            "cart-billing-screen",
            "handleCreateOrderFunction"
          );
          navigation.goBack();
        }
        setLoading(false);
        setSpecialInstructions("");
        setRemainingWalletBalance(0);
        setRemainingCreditBalance(0);
        queryClient.invalidateQueries("find-order");
      })
      .catch((err) => {
        errorLog(
          "Order creation failed",
          orderData,
          "cart-billing-screen",
          "handleCreateOrderFunction",
          err
        );
        showToast("error", getErrorMsg("order", "create"));
      });
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

        await repo.customer.update(
          { _id: customer._id },
          {
            ...customer,
            usedCredit:
              Number(customer?.usedCredit || 0) + Number(creditBalance || 0),
            availableCredit:
              Number(customer?.availableCredit || 0) -
              Number(creditBalance || 0),
            totalSpend:
              Number(customer.totalSpend) +
              Number(obj.payment.total) -
              Number(walletBalance || 0),
            totalOrders: Number(customer.totalOrders) + 1,
            lastOrder: new Date(),
            source: Number(creditBalance > 0) ? "server" : "local",
          }
        );

        debugLog(
          "Customer details updated",
          {
            ...customer,
            totalSpend:
              Number(customer.totalSpend) +
              Number(obj.payment.total) -
              Number(walletBalance || 0),
            totalOrders: Number(customer.totalOrders) + 1,
            lastOrder: new Date(),
            source: "local",
          },
          "cart-billing-screen",
          "handleUpdateCustomerFunction"
        );
      } catch (err) {
        errorLog(
          "Customer updation failed",
          customer,
          "cart-billing-screen",
          "handleCreateOrderFunction",
          err
        );
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

  const getTotalPaid = useCallback((localOrder: any) => {
    return localOrder?.payment?.breakup?.reduce(
      (prev: any, cur: any) => prev + Number(cur.total),
      0
    );
  }, []);

  const handleComplete = (data: any) => {
    let localOrder = null;
    if (!order || Object.keys(order).length === 0) {
      const allItems = transformCartItems(cart.cartItems, discountPercentage);

      const subtotal = totalAmount - totalVatAmount - totalCharges + vatCharges;

      const orderObject = {
        items: allItems,
        customer: {
          name: customer?.firstName
            ? `${customer.firstName} ${customer.lastName}`
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

      debugLog(
        "Order initialized",
        {},
        "cart-billing-screen",
        "handleCompleteFunction"
      );
      localOrder = orderObject;
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

    setOrder(localOrder);

    calculateCart();

    const totalPaid = getTotalPaid(localOrder);

    if (Number(totalPaid) < Number(totalAmount)) {
      debugLog(
        "Payment partially done",
        data,
        "cart-billing-screen",
        "handleCompleteFunction"
      );
      setVisiblePaymentStatus(true);
      return;
    } else {
      debugLog(
        "Payment completed",
        localOrder.payment.breakup,
        "cart-billing-screen",
        "handleCompleteFunction"
      );
      createOrder(localOrder, completeWithPrint);
      return;
    }
  };

  const getNameInitials = () => {
    const firstNameInitial = customer?.firstName?.charAt(0)?.toUpperCase() + "";

    return `${firstNameInitial || ""}`;
  };

  const handleCompleteBtn = useCallback(
    (selectedPayment: string) => {
      if (
        billingSettings?.defaultCompleteBtn === "with-print" &&
        !isPrinterConnected
      ) {
        showPrintAttachedAlert(true, selectedPayment);
        return;
      }

      if (billingSettings?.defaultCompleteBtn === "with-print") {
        setCompleteWithPrint(true);
      } else {
        setCompleteWithPrint(false);
      }

      debugLog(
        "Payment initialized",
        selectedPayment,
        "cart-billing-screen",
        "handleCompleteBtnFunction"
      );

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
          debugLog(
            "Internet not connected for credit payment",
            selectedPayment,
            "cart-billing-screen",
            "handleCompleteBtnFunction"
          );
          setLoading(false);
          showToast("error", t("Please connect with internet"));
          return;
        }

        setVisibleCreditTransaction(true);
      } else {
        if (!isConnected) {
          debugLog(
            "Internet not connected for wallet payment",
            selectedPayment,
            "cart-billing-screen",
            "handleCompleteBtnFunction"
          );
          setLoading(false);
          showToast("error", t("Please connect with internet"));
          return;
        }

        setVisibleWalletTransaction(true);
      }
    },
    [
      billingSettings,
      businessDetails,
      isPrinterConnected,
      totalAmount,
      totalDiscount,
      totalDiscountPromotion,
    ]
  );

  const handleClearItems = useCallback(() => {
    Alert.alert(t("Confirmation"), t("Do you want to clear cart items?"), [
      {
        text: t("No"),
        onPress: () => {},
        style: "destructive",
      },
      {
        text: t("Yes"),
        onPress: async () => {
          debugLog(
            "Cart items cleared",
            items,
            "cart-billing-screen",
            "handleClearCartFunction"
          );
          cart.clearCart();
          setCustomer({});
          setTicketIndex(null);
          setTicketData(null);
          setSpecialInstructions("");

          if (!twoPaneView) {
            navigation.goBack();
          }
          showToast("success", t("Cart items cleared"));
        },
      },
    ]);
  }, []);

  const renderProdRow = ({ item, index }: any) => {
    return (
      <BillingOrderRow
        data={item}
        // channel={channel}
        businessDetails={businessDetails}
        handleOnPress={(data: any) => {
          setActiveIndex(index);
          setProductData({
            ...data,
          });

          setVisibleProductPrice(true);
        }}
      />
    );
  };

  const renderCompleteView = useMemo(
    () =>
      items?.length > 0 && (
        <View style={{ height: hp("25%") }}>
          <BillingPaymentCompleteView
            billingSettings={billingSettings}
            businessDetails={businessDetails}
            totalAmount={totalAmount - (totalPaidAmount || 0)}
            totalItem={totalItem}
            totalQty={totalQty}
            items={items}
            // channel={channel}
            totalVatAmount={totalVatAmount}
            loading={loading}
            handleComplete={(selectedPayment: string) => {
              if (!isConnected && promotionsApplied.length > 0) {
                showToast("error", "Please connect to internet");
                debugLog(
                  "Applying promotions offline",
                  {},
                  "cart-billing-screen",
                  "handleCompleteFunction"
                );
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
                debugLog(
                  "Applying promotions offline",
                  {},
                  "cart-billing-screen",
                  "handleCompleteFunction"
                );
                return;
              }
              setLoading(true);
              setCompleteWithPrint(val);
              if (val && !isPrinterConnected) {
                showPrintAttachedAlert(false, selectedPayment);
                return;
              }

              debugLog(
                "Payment initialized",
                selectedPayment,
                "cart-billing-screen",
                "handlePrintFunction"
              );

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
                  debugLog(
                    "Internet not connected for credit payment",
                    selectedPayment,
                    "cart-billing-screen",
                    "handlePrintFunction"
                  );
                  setLoading(false);
                  showToast("error", t("Please connect with internet"));
                  return;
                }

                setVisibleCreditTransaction(true);
              } else {
                if (!isConnected) {
                  debugLog(
                    "Internet not connected for wallet payment",
                    selectedPayment,
                    "cart-billing-screen",
                    "handlePrintFunction"
                  );
                  setLoading(false);
                  showToast("error", t("Please connect with internet"));
                  return;
                }

                setVisibleWalletTransaction(true);
              }
            }}
            handlePreview={() => {}}
          />
        </View>
      ),
    [
      billingSettings,
      businessDetails,
      items,
      chargesApplied,
      totalDiscount,
      totalDiscountPromotion,
      loading,
      cart.cartItems,
      isConnected,
      // channel,
    ]
  );

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

        debugLog(
          "Payment initialized",
          selectedPayment,
          "cart-billing-screen",
          "handlePrintAttachedAlertFunction"
        );

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
            debugLog(
              "Internet not connected for credit payment",
              selectedPayment,
              "cart-billing-screen",
              "handlePrintAttachedAlertFunction"
            );
            setLoading(false);
            showToast("error", t("Please connect with internet"));
            return;
          }

          setVisibleCreditTransaction(true);
        } else {
          if (!isConnected) {
            debugLog(
              "Internet not connected for wallet payment",
              selectedPayment,
              "cart-billing-screen",
              "handlePrintAttachedAlertFunction"
            );
            setLoading(false);
            showToast("error", t("Please connect with internet"));
            return;
          }

          setVisibleWalletTransaction(true);
        }
      },
    });
  };

  useEffect(() => {
    if (isFocused) {
      if (
        props?.route?.params?.billing !== null &&
        props?.route?.params?.billing !== undefined
      ) {
        setBillingSettings(props?.route?.params?.billing);
        return;
      }

      repo.billingSettings
        .findOne({
          where: { _id: deviceContext.user.locationRef },
        })
        .then((billingSettings) => {
          setBillingSettings(billingSettings);
        });
    }
  }, [isFocused]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries(`find-customer`);
    };
  }, []);

  useEffect(() => {
    MMKVDB.remove("activeTableDineIn");
  }, []);

  const handleSaveTicket = useCallback(() => {
    setTicketData(null);
    setTicketIndex(null);
    setVisibleSaveTicket(false);
  }, []);

  const handleCloseTicket = useCallback(() => {
    setVisibleSaveTicket(false);
  }, []);

  const launchIntent = (amount: string) => {
    setLoading(true);

    try {
      const tvType = "2";
      const tvOutOrderNo = new Date().getMilliseconds().toString();
      const etAmount = parseInt(Number(amount).toString(), 10);

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
            debugLog(
              "NeoLeap result",
              result,
              "cart-billing-screen",
              "launchIntentFunction"
            );

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
              debugLog(
                "NeoLeap payment failed",
                { payment: paymentData, response: jsonData },
                "cart-billing-screen",
                "launchIntentFunction"
              );
              showToast("error", t("Transaction couldn't be completed"));
            }
          } else {
            debugLog(
              "NeoLeap payment failed",
              paymentData,
              "cart-billing-screen",
              "launchIntentFunction"
            );
            showToast("error", ERRORS.SOMETHING_WENT_WRONG);
          }
        },
        (error) => {
          errorLog(
            "NeoLeap payment failed",
            paymentData,
            "cart-billing-screen",
            "launchIntentFunction",
            error
          );
        }
      );
    } catch (error) {
      errorLog(
        "NeoLeap payment failed",
        error,
        "cart-billing-screen",
        "launchIntentFunction",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   if (promotionsApplied?.length <= 0) {
  //     cart.cartItems.map((item: any, index: number) => {
  //       if (item?.isFree || item?.isQtyFree) {
  //         cart.removeFromCart(index, (removedItems: any) => {
  //           debugLog(
  //             "Item removed from cart",
  //             removedItems,
  //             "cart-billing-screen",
  //             "handleRemoveCartItem"
  //           );
  //           EventRegister.emit("itemRemoved", removedItems);
  //         });
  //       }
  //     });
  //   }
  // }, [promotionsApplied, cart?.cartItems]);

  const renderList = useMemo(() => {
    return (
      <>
        <ItemsList
          row={renderProdRow}
          setVisibleAppliedDiscount={setVisibleAppliedDiscount}
          setVisibleAppliedCharge={setVisibleAppliedCharge}
        />
      </>
    );
  }, [
    businessDetails,
    promotionsApplied,
    discountsApplied,
    totalAmount,
    cart.cartItems,
    totalDiscountPromotion,
    // channel,
  ]);

  if (!twoPaneView && !businessDetails && !billingSettings) {
    return <Loader marginTop={hp("40%")} />;
  }

  return (
    <View style={{ height: "100%", flex: 1 }}>
      <BillingOrderTopView
        ticketName={ticketData?.name}
        handleClearItems={handleClearItems}
        handleSaveTicket={() => {
          setTicketData({ ...ticketData, id: ticketIndex });
          setVisibleSaveTicket(true);
        }}
        handleTickets={() => {
          setVisibleTickets(true);
        }}
      />

      {customer?._id ? (
        <View
          style={{
            ...styles.customerContentView,
            marginRight: hp("2%"),
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
              style={{ padding: 10, marginRight: 5 }}
              onPress={() => {
                debugLog(
                  "Customer removed from cart screen",
                  customer,
                  "cart-billing-screen",
                  "handleRemoveCustomerFunction"
                );
                setCustomer({});
                cart.clearPromotions();
                cart.updateAllPromotions([], (items: any) => {
                  EventRegister.emit("promotionApplied", items);
                });
                const indexes: number[] = [];
                cart.cartItems.map((item: any, index: number) => {
                  delete item.exactTotal;
                  delete item.exactVat;
                  delete item.discountedTotal;
                  delete item.discountedVatAmount;
                  delete item.promotionsData;

                  if (item?.isFree || item?.isQtyFree) {
                    indexes.push(index);
                  }
                });

                cart.bulkRemoveFromCart(indexes, (updatedItems: any) => {
                  EventRegister.emit("itemRemoved", updatedItems);
                });
              }}
            >
              <ICONS.CloseClearIcon />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <BillingSearchAdd
          handlePress={() => {
            setVisibleAddCustomer(true);
          }}
        />
      )}

      <SeparatorHorizontalView />

      {renderList}

      <SeparatorHorizontalView />

      {businessDetails?.company?.industry?.toLowerCase() === "restaurant" && (
        <TouchableOpacity
          style={{
            alignSelf: "flex-start",
            paddingTop: hp("0.5%"),
            paddingBottom: hp("0.15%"),
            paddingHorizontal: hp("2%"),
          }}
          onPress={() => {
            setVisibleSpecialInstModal(true);
          }}
        >
          <DefaultText fontSize="md" fontWeight="medium" color="primary.1000">
            {specialInstructions
              ? t("Update Special Instruction")
              : t("Add Special Instruction")}
          </DefaultText>
        </TouchableOpacity>
      )}

      {renderCompleteView}

      {visibleSaveTicket && (
        <SaveTicketModal
          data={ticketData}
          items={items}
          visible={visibleSaveTicket}
          handleSave={handleSaveTicket}
          handleClose={handleCloseTicket}
        />
      )}

      {visibleTickets && (
        <TicketsListModal
          visible={visibleTickets}
          handleClose={() => setVisibleTickets(false)}
          handleTicketRowTap={(data: any) => {
            debugLog(
              "Retrive saved ticket from list to cart",
              data,
              "cart-billing-screen",
              "handleTicketRowFunction"
            );
            setTicketData(data);
            setChannel(data.type);
            setTicketIndex(data?.id);
            setVisibleTickets(false);
          }}
        />
      )}

      {visibleAddCustomer && (
        <WalletCustomerModal
          visible={visibleAddCustomer}
          handleSelectedCustomer={(customer: any) => {
            debugLog(
              "Customer added to cart",
              customer,
              "cart-billing-screen",
              "handleAddCustomerFunction"
            );
            setCustomer(customer);
            setVisibleAddCustomer(false);
            cart.clearPromotions();
            cart.updateAllPromotions([], (items: any) => {
              EventRegister.emit("promotionApplied", items);
            });
            const indexes: number[] = [];
            cart.cartItems.map((item: any, index: number) => {
              delete item.exactTotal;
              delete item.exactVat;
              delete item.discountedTotal;
              delete item.discountedVatAmount;
              delete item.promotionsData;

              if (item?.isFree || item?.isQtyFree) {
                indexes.push(index);
              }
            });

            cart.bulkRemoveFromCart(indexes, (updatedItems: any) => {
              EventRegister.emit("itemRemoved", updatedItems);
            });
          }}
          handleClose={() => {
            setVisibleAddCustomer(false);
          }}
        />
      )}

      {visibleAppliedDiscount && (
        <AppliedDiscountModal
          data={[...discountsApplied, ...promotionsApplied]}
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

      {visiblePaymentStatus && (
        <PaymentStatusModal
          billingSettings={billingSettings}
          businessDetails={businessDetails}
          visible={visiblePaymentStatus}
          totalPaidAmount={totalPaidAmount}
          total={totalAmount}
          onChange={(data: any) => {
            if (data.method === "card") {
              setVisibleCardTransaction(true);
            } else if (data.method === "cash") {
              setVisibleTenderCash(true);
            } else if (data.method === "credit") {
              setVisibleCreditTransaction(true);
            } else {
              setVisibleWalletTransaction(true);
            }
          }}
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
          businessDetails={businessDetails}
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
          totalPaidAmount={totalPaidAmount}
          totalAmount={totalAmount}
          businessDetails={businessDetails}
          visible={visibleCreditTransaction}
          handleClose={() => {
            setLoading(false);
            setVisibleCreditTransaction(false);
          }}
          onChange={handleComplete}
        />
      )}

      {visibleProductPrice && (
        <BillingProductPriceModal
          data={productData}
          businessDetails={businessDetails}
          onDelete={() => {
            if (items.length === 1) {
              debugLog(
                "Item removed from cart",
                items,
                "cart-billing-screen",
                "handleRemoveCartItem"
              );
              setCustomer({});
              setTicketIndex(null);
              setTicketData(null);
              setSpecialInstructions("");
              setVisiblePaymentStatus(false);
              cart.clearCart();
            } else {
              // autoApplyCustomCharges(
              //   channel,
              //   totalAmount -
              //     totalCharges +
              //     totalCharges -
              //     cart.cartItems[activeIndex].total,
              //   subTotalWithoutDiscount -
              //     getItemSellingPrice(
              //       cart.cartItems[activeIndex].total,
              //       cart.cartItems[activeIndex].vat
              //     )
              // );

              cart.removeFromCart(activeIndex, (removedItems: any) => {
                debugLog(
                  "Item removed from cart",
                  removedItems,
                  "cart-billing-screen",
                  "handleRemoveCartItem"
                );
                EventRegister.emit("itemRemoved", removedItems);
              });
            }
            setVisibleProductPrice(false);
          }}
          onChange={(changedObject: any) => {
            if (changedObject.qty == 0) {
              setSpecialInstructions("");

              cart.removeFromCart(activeIndex, (updatedItems: any) => {
                debugLog(
                  "Item removed from cart",
                  updatedItems,
                  "cart-billing-screen",
                  "handleRemoveCartItem"
                );
                EventRegister.emit("itemRemoved", updatedItems);
              });
            } else {
              cart.updateCartItem(
                activeIndex,
                changedObject,
                (updatedItems: any) => {
                  debugLog(
                    "Item updated to cart",
                    updatedItems,
                    "cart-billing-screen",
                    "handleUpdatedCartItem"
                  );
                  EventRegister.emit("itemUpdated", updatedItems);
                }
              );
            }
            setActiveIndex(null);
            setVisibleProductPrice(false);
          }}
          visible={visibleProductPrice}
          handleClose={() => setVisibleProductPrice(false)}
        />
      )}

      {visibleSpecialInstModal && (
        <SpecialInstructionModal
          data={specialInstructions}
          visible={visibleSpecialInstModal}
          handleClose={() => {
            setVisibleSpecialInstModal(false);
          }}
          handleSuccess={(data: string) => {
            setSpecialInstructions(data);
            setVisibleSpecialInstModal(false);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  customerContentView: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    marginLeft: 10,
    marginVertical: 10,
  },
  customerTotalOrdersView: {
    flex: 1,
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    borderRadius: 16,
    overflow: "hidden",
    position: "absolute",
  },
  customerOrdersBgView: {
    top: "28%",
    left: "-48%",
    width: "100%",
    paddingVertical: 5,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
  orderLoadingView: {
    opacity: 0.75,
    width: "100%",
    height: "100%",
    paddingBottom: "5%",
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});
