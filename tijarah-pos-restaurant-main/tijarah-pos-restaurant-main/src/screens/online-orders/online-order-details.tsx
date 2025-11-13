import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import * as ExpoPrintHelp from "expo-print-help";
import {
  default as React,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { EventRegister } from "react-native-event-listeners";
import { Menu, MenuItem } from "react-native-material-menu";
import Toast from "react-native-toast-message";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import ItemDivider from "../../components/action-sheet/row-divider";
import CardTransactionModal from "../../components/billing/right-view/modal/card-transaction-modal";
import CreditTransactionModal from "../../components/billing/right-view/modal/credit-transaction-modal";
import PaymentStatusModal from "../../components/billing/right-view/modal/payment-status-modal";
import TenderCashModal from "../../components/billing/right-view/modal/tender-cash-modal";
import WalletTransactionModal from "../../components/billing/right-view/modal/wallet-transaction-modal";
import AssignDeliveryModal from "../../components/billing/right-view/online-ordering/assign-delivery-modal";
import DeletedItemsList from "../../components/billing/right-view/online-ordering/deleted-online-items/deleted-items-list";
import ModifiersModal from "../../components/billing/right-view/online-ordering/modifiers-modal";
import OnlineOrderItemsList from "../../components/billing/right-view/online-ordering/online-order-items/online-items-list";
import OnlineOrderSuccessModal, {
  getOrderDataObj,
} from "../../components/billing/right-view/online-ordering/online-order-success-modal";
import ProductSelectInput from "../../components/billing/right-view/online-ordering/product-select-input";
import VariantItemModal from "../../components/billing/right-view/online-ordering/variant-item-modal";
import CustomHeader from "../../components/common/custom-header";
import SeparatorHorizontalView from "../../components/common/separator-horizontal-view";
import Loader from "../../components/loader";
import Spacer from "../../components/spacer";
import DefaultText from "../../components/text/Text";
import showToast from "../../components/toast";
import AuthContext from "../../context/auth-context";
import DeviceContext from "../../context/device-context";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { checkInternet } from "../../hooks/check-internet";
import usePrinterStatus from "../../hooks/use-printer-status";
import { useResponsive } from "../../hooks/use-responsiveness";
import useCommonApis from "../../hooks/useCommonApis";
import useCartStore from "../../store/cart-item";
import { AuthType } from "../../types/auth-types";
import EntityNames from "../../types/entity-name";
import calculateCart from "../../utils/calculate-cart";
import cart from "../../utils/cart";
import { checkNotBillingOnlineProduct } from "../../utils/check-updated-product-stock";
import { PROVIDER_NAME } from "../../utils/constants";
import { getItemSellingPrice, getItemVAT } from "../../utils/get-price";
import ICONS from "../../utils/icons";
import { printKOTSunmi } from "../../utils/printKOTSunmi";
import { printKOTSunmi3Inch } from "../../utils/printKOTSunmi3inch";
import { printSunmi4Inch } from "../../utils/printSunmi3inch";
import { showAlert } from "../../utils/showAlert";
import { transformKOTData } from "../../utils/transform-kot-data";
import { transformOrderData } from "../../utils/transform-order-data";
import repository from "../../db/repository";
import { useCurrency } from "../../store/get-currency";

const currentDate = new Date();

// Set the time to the start of the day
const startOfDay = new Date(
  Date.UTC(
    currentDate.getUTCFullYear(),
    currentDate.getUTCMonth(),
    currentDate.getUTCDate()
  )
);

// Set the time to the end of the day
const endOfDay = new Date(
  Date.UTC(
    currentDate.getUTCFullYear(),
    currentDate.getUTCMonth(),
    currentDate.getUTCDate(),
    23,
    59,
    59,
    999
  )
);

type ORDERSTATUS = "open" | "inprocess" | "ready" | "completed" | "cancelled";

const OnlineOrderDetails = (props: any) => {
  const theme = useTheme();
  const isRTL = checkDirection();
  const isConnected = checkInternet();
  const navigation = useNavigation() as any;
  const productSelectInputRef = useRef<any>();
  const { hp, wp, twoPaneView } = useResponsive();
  const opacity = useRef(new Animated.Value(0)).current;
  const authContext = useContext<AuthType>(AuthContext);
  const deviceContext = useContext(DeviceContext) as any;
  const {
    isConnected: isPrinterConnected,
    isKOTConnected: isKOTPrinterConnected,
  } = usePrinterStatus();
  const {
    businessData: businessDetails,
    billingSettings,
    printTemplateData,
  } = useCommonApis();
  const menuButton = useRef<any>();

  const { id, orderType, industry } = props?.route?.params;

  const { setCustomer, customer, totalPaidAmount, setTotalPaidAmount } =
    useCartStore() as any;

  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>({});
  const [items, setItems] = useState<any[]>([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [deleteIndex, setDeleteIndex] = useState(-1);
  const [newItems, setNewItems] = useState<any>(null);
  const [deletedItems, setDeletedItems] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [openVariantModal, setOpenVariantModal] = useState(false);
  const [openModifierModal, setOpenModifierModal] = useState(false);
  const [modifierProduct, setModifierProduct] = useState<any>(null);
  const [activeOrderStatus, setActiveOrderStatus] =
    useState<ORDERSTATUS>("open");
  const [visibleAssignDelivery, setVisibleAssignDelivery] = useState(false);
  const [paymentBreakup, setPaymentBreakup] = useState<any[]>([]);
  const [visiblePaymentStatus, setVisiblePaymentStatus] = useState(false);
  const [visibleTenderCash, setVisibleTenderCash] = useState(false);
  const [visibleCardTransaction, setVisibleCardTransaction] = useState(false);
  const [visibleWalletTransaction, setVisibleWalletTransaction] =
    useState(false);
  const [visibleCreditTransaction, setVisibleCreditTransaction] =
    useState(false);
  const [visibleSuccess, setVisibleSuccess] = useState(false);
  const { currency } = useCurrency();

  const fetchOrderApi = async () => {
    try {
      const res = await serviceCaller(`${endpoint.onlineOrdering.path}/${id}`, {
        method: endpoint.onlineOrdering.method,
      });

      if (res) {
        setOrder(res);
        // orderActivityLogsApi(res._id, res.companyRef);
      }
    } catch (error: any) {
      setOrder({});
    }
  };

  const orderActivityLogsApi = async (orderId: string, companyRef: string) => {
    try {
      const res = await serviceCaller(
        `${endpoint.onlineOrderingActivityLogs.path}/${id}`,
        {
          method: endpoint.onlineOrderingActivityLogs.method,
          query: {
            _q: "",
            page: 0,
            limit: 100,
            sort: "desc",
            orderRef: orderId,
            companyRef: companyRef,
          },
        }
      );

      if (res) {
        setActivityLogs(res);
      }
    } catch (error: any) {
      setActivityLogs([]);
    }
  };

  const orderStatusData = {
    open: {
      title: t("Open"),
      description: order?.createdAt
        ? format(new Date(order.createdAt), "do MMMM yyyy, h:mm a")
        : "",
      color: "#2F3746",
      action: t("Accept"),
      disabled: false,
    },
    inprocess: {
      title: t("Inprocess"),
      description:
        order?.cashierRef === authContext.user._id
          ? `${order?.cashier?.name}, ${order?.device?.deviceCode}`
          : `${t("Order being served by")} ${order?.cashier?.name}`,
      color: "#06AED4",
      action: orderType === "Pickup" ? t("Ready") : t("Assign Delivery"),
      disabled: order?.cashierRef !== authContext.user._id,
    },
    ready: {
      title: orderType === "Pickup" ? t("Order Ready") : t("On the way"),
      description:
        order?.cashierRef === authContext.user._id
          ? `${order?.cashier?.name}, ${order?.device?.deviceCode}`
          : `${t("Order being served by")} ${order?.cashier?.name}`,
      color: "#F79009",
      action: t("Complete"),
      disabled: order?.cashierRef !== authContext.user._id,
    },
    completed: {
      title: t("Order Completed"),
      description: order?.updatedAt
        ? format(new Date(order.updatedAt), "do MMMM yyyy, h:mm a")
        : "",
      color: "#006C35",
      action: "",
    },
    cancelled: {
      title: t("Order Cancelled"),
      description: order?.updatedAt
        ? format(new Date(order.updatedAt), "do MMMM yyyy, h:mm a")
        : order?.updatedAt,
      color: "#F04438",
      action: "",
    },
  };

  const handlePrintReceipt = async (order: any, kickDrawer: boolean) => {
    const orderData = {
      ...getOrderDataObj(order),
      showToken: printTemplateData?.[0]?.showToken,
      showOrderType: printTemplateData?.[0]?.showOrderType,
      company: {
        en: businessDetails?.company?.name?.en,
        ar: businessDetails?.company?.name?.ar,
        logo: businessDetails?.company?.logo || "",
      },
      location: {
        en: printTemplateData?.[0]?.location?.name?.en,
        ar: printTemplateData?.[0]?.location?.name?.ar,
      },
      phone: businessDetails?.location?.phone,
      vat: printTemplateData?.[0]?.location?.vat,
      address: printTemplateData?.[0]?.location?.address,
      footer: printTemplateData?.[0]?.footer,
      returnPolicyTitle: "Return Policy",
      returnPolicy: printTemplateData?.[0]?.returnPolicy,
      customText: printTemplateData?.[0]?.customText,
      noOfPrints: billingSettings?.noOfReceiptPrint == "1" ? [1] : [1, 2],
      kickDrawer: kickDrawer,
    };

    const allprinter = await repository.printerRepository.findByType("inbuilt");
    const printer = allprinter.find((t) => t.enableReceipts);

    if (printer) {
      try {
        const orderDoc = transformOrderData({
          ...orderData,
          print: true,
        });

        if (printer.device_id === "sunmi") {
          if (
            printer?.printerSize === "2 Inch" ||
            printer?.printerSize === "2-inch"
          ) {
            EventRegister.emit("print-sunmi-2-inch-order", orderDoc);
          } else {
            await printSunmi4Inch(orderDoc as any);
          }
        } else {
          ExpoPrintHelp.init();
          await ExpoPrintHelp.print(JSON.stringify(orderDoc), currency);
        }
      } catch (error) {}
    } else {
      if (authContext.permission["pos:order"]?.print) {
        EventRegister.emit("print-order", orderData);
      }
    }
  };

  const handleKOTPrintReceipt = async (order: any) => {
    const printData = {
      orderNum: order.orderNum,
      createdAt: new Date(order.createdAt),
      tokenNum: order?.tokenNumber || "",
      orderType: order?.orderType || "",
      items: order.items.map((item: any) => {
        return {
          isOpenPrice: false,
          productRef: item.productRef || "",
          categoryRef: item.categoryRef || "",
          category: { name: item?.category?.name || "" },
          name: {
            en: item.name.en || "",
            ar: item.name.ar || "",
          },
          image: item?.image,
          contains: item?.contains,
          promotionsData: item?.promotionsData,
          variantNameEn: item.variant.name.en,
          variantNameAr: item.variant.name.ar,
          type: item.variant.type || "item",
          sku: item.variant.sku,
          parentSku: item.variant.parentSku,
          sellingPrice: item.billing.subTotal,
          total: item.billing.total,
          qty: item.quantity,
          hasMultipleVariants: item.hasMultipleVariants,
          vat: item.billing.vatAmount,
          vatPercentage: item.billing.vatPercentage,
          discount: item.billing.discountAmount,
          discountPercentage: item.billing.discountPercentage,
          unit: item.variant.unit,
          costPrice: item.variant.costPrice,
          noOfUnits: item.variant.unitCount,
          availability: item?.variant?.stock?.availability || true,
          stockCount: item?.variant?.stock?.count || 0,
          tracking: item?.variant?.stock?.tracking || false,
          note: item.note || "",
          refundedQty: 0,
          modifiers: item?.modifiers || [],
        };
      }),
      specialInstructions: order?.specialInstructions || "",
      showToken: printTemplateData?.[0]?.showToken,
      showOrderType: printTemplateData?.[0]?.showOrderType,
      location: {
        en: printTemplateData?.[0]?.location?.name?.en,
        ar: printTemplateData?.[0]?.location?.name?.ar,
      },
      address: printTemplateData?.[0]?.location?.address,
      noOfPrints: [1],
      kickDrawer: false,
    };

    const allprinter = await repository.printerRepository.findByType("inbuilt");
    const printer = allprinter.find((t) => t.enableKOT);

    if (printer) {
      try {
        const kotDoc = transformKOTData({
          ...printData,
          print: true,
        });

        if (printer.device_id === "sunmi") {
          if (
            printer?.printerSize === "2 Inch" ||
            printer?.printerSize === "2-inch"
          ) {
            await printKOTSunmi(kotDoc as any);
          } else {
            await printKOTSunmi3Inch(kotDoc as any);
          }
        } else {
          // ExpoPrintHelp.init();
          // await ExpoPrintHelp.print(JSON.stringify(kotDoc));
        }
      } catch (error) {}
    } else {
      if (authContext.permission["pos:order"]?.print) {
        EventRegister.emit("print-kot-non-kitchen", printData);
      }
    }
  };

  const getTotalQuantity = () => {
    const quantity = items?.reduce(
      (prev: any, cur: any) => prev + Number(cur.quantity),
      0
    );

    return quantity || 0;
  };

  const handleComplete = async (data: any) => {
    const breakup = {
      name: data.cardType,
      total: Number(Number(data.amount)?.toFixed(2)),
      refId: data.transactionNumber,
      providerName: data.providerName || "cash",
      createdAt: new Date(),
      paid:
        Number(data?.change || 0) > 0
          ? Number(Number(data.amount)?.toFixed(2)) -
            Number((data.change || 0)?.toFixed(2))
          : Number(Number(data.amount)?.toFixed(2)),
      change: Number((data?.change || 0)?.toFixed(2)),
    };

    setPaymentBreakup([...paymentBreakup, breakup]);
    calculateCart(true, [...paymentBreakup, breakup]);

    const totalPaid = [...paymentBreakup, breakup]?.reduce(
      (prev: any, cur: any) => prev + Number(cur.total),
      0
    );

    if (
      Number((totalPaid || 0)?.toFixed(2)) <
      Number(order?.payment?.total?.toFixed(2))
    ) {
      setVisiblePaymentStatus(true);
      return;
    } else {
      if (!isConnected) {
        showToast("info", t("Please connect with internet"));
        return;
      }

      setLoading(true);

      try {
        const res = await serviceCaller(
          `${endpoint.onlineOrderingUpdate.path}/${order?._id}`,
          {
            method: endpoint.onlineOrderingUpdate.method,
            body: {
              createdAt: new Date().toISOString(),
              acceptedAt: new Date().toISOString(),
              orderStatus: "completed",
              payment: {
                ...order?.payment,
                breakup: [...paymentBreakup, breakup],
                paymentStatus: "paid",
                paymentType: order?.payment?.paymentType,
              },
            },
          }
        );

        if (res) {
          if (isPrinterConnected) {
            const kickDrawer = [...paymentBreakup, breakup]?.some(
              (b: any) => b.providerName === PROVIDER_NAME.CASH
            );

            handlePrintReceipt(res, kickDrawer);
          }

          EventRegister.emit("update-product-stock", {
            ...order,
          });
          setOrder(res);
          setVisibleSuccess(true);
          setVisiblePaymentStatus(false);
          updateCustomer([...paymentBreakup, breakup]);
          return;
        }
      } catch (error: any) {
        showToast("error", error?._err?.message || error?.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const updateCustomer = useCallback(
    async (breakup: any[]) => {
      if (customer) {
        const walletBalance = breakup
          ?.filter((p: any) => p.providerName === PROVIDER_NAME.WALLET)
          ?.reduce((pv: any, cv: any) => pv + cv.total, 0);

        const creditBalance = breakup
          ?.filter((p: any) => p.providerName === PROVIDER_NAME.CREDIT)
          ?.reduce((pv: any, cv: any) => pv + cv.total, 0);

        try {
          if (creditBalance > 0) {
            await serviceCaller(`/customer/${customer._id}`, {
              method: "PATCH",
              body: {
                totalSpent:
                  Number(customer.totalSpend) +
                  Number(order.payment.total?.toFixed(2)) -
                  Number(walletBalance),
                totalOrder: Number(customer.totalOrders) + 1,
                lastOrderDate: new Date(),
              },
            });
          }

          await repository.customerRepository.update(customer._id, {
            ...customer,
            usedCredit:
              Number(customer?.usedCredit || 0) + Number(creditBalance || 0),
            availableCredit:
              Number(customer?.availableCredit || 0) -
              Number(creditBalance || 0),
            totalSpend:
              Number(customer.totalSpend) +
              Number(order.payment.total?.toFixed(2)) -
              Number(walletBalance || 0),
            totalOrders: Number(customer.totalOrders) + 1,
            lastOrder: new Date(),
            source: Number(creditBalance > 0) ? "server" : "local",
          });
        } catch (err) {}
      }
    },
    [order, customer]
  );

  const handleOrderStatus = async (status: ORDERSTATUS) => {
    const data =
      order.orderStatus === "open"
        ? {
            createdAt: new Date().toISOString(),
            acceptedAt: new Date().toISOString(),
            orderStatus: status,
            cashier: { name: authContext.user.name },
            cashierRef: authContext.user._id,
            device: { deviceCode: deviceContext.user.phone },
            deviceRef: deviceContext.user.deviceRef,
          }
        : status === "completed"
        ? {
            createdAt: new Date().toISOString(),
            acceptedAt: new Date().toISOString(),
            orderStatus: status,
            payment: {
              ...order?.payment,
              paymentStatus: "paid",
              paymentType: order?.payment?.paymentType,
            },
          }
        : { orderStatus: status };

    if (!isConnected) {
      showToast("info", t("Please connect with internet"));
      return;
    }

    setLoading(true);

    try {
      const res = await serviceCaller(
        `${endpoint.onlineOrderingUpdate.path}/${order?._id}`,
        {
          method: endpoint.onlineOrderingUpdate.method,
          body: { ...data },
        }
      );

      if (res) {
        if (status === "completed") {
          EventRegister.emit("sync:enqueue", {
            entityName: EntityNames.OrdersPull,
          });
          EventRegister.emit("update-product-stock", {
            ...order,
          });
          updateCustomer(order?.payment?.breakup);
          showToast("success", t("Order completed successfully"));
          setCustomer({});
          setPaymentBreakup([]);
          setTotalPaidAmount(0);
          navigation.goBack();
        } else {
          if (status === "inprocess") {
            if (
              businessDetails?.company?.industry?.toLowerCase() ===
                "restaurant" &&
              isKOTPrinterConnected
            ) {
              handleKOTPrintReceipt(order);
            } else if (
              businessDetails?.company?.industry?.toLowerCase() !==
                "restaurant" &&
              isPrinterConnected
            ) {
              handlePrintReceipt(res, false);
            }
          }

          setOrder(res);
          setActiveOrderStatus(status);
          showToast("success", t("Order status updated"));
        }
      }
    } catch (error: any) {
      showToast("error", error?._err?.message || error?.message);
    } finally {
      setLoading(false);
    }
  };

  const showTakeoverAlert = async () => {
    await showAlert({
      confirmation: t("Takeover?"),
      alertMsg: `${t("Order being served by")} ${order?.cashier?.name}. ${t(
        "Do you want to takeover this order?"
      )}`,
      btnText1: t("No"),
      btnText2: `${t("Yes")}, ${t("Confirm")}`,
      onPressBtn1: () => {},
      onPressBtn2: () => {
        handleTakeoverOrder();
      },
    });
  };

  const showCancelAlert = async () => {
    await showAlert({
      confirmation: t("Cancel?"),
      alertMsg: t("Do you want to cancel this order?"),
      btnText1: t("No"),
      btnText2: `${t("Yes")}, ${t("Cancel")}`,
      onPressBtn1: () => {},
      onPressBtn2: () => {
        handleCancelOrder();
      },
    });
  };

  const handleTakeoverOrder = async () => {
    if (!isConnected) {
      showToast("info", t("Please connect with internet"));
      return;
    }

    setLoading(true);

    try {
      const res = await serviceCaller(
        `${endpoint.onlineOrderingUpdate.path}/${order?._id}`,
        {
          method: endpoint.onlineOrderingUpdate.method,
          body: {
            createdAt: new Date().toISOString(),
            acceptedAt: new Date().toISOString(),
            cashier: { name: authContext.user.name },
            cashierRef: authContext.user._id,
            device: { deviceCode: deviceContext.user.phone },
            deviceRef: deviceContext.user.deviceRef,
          },
        }
      );

      if (res) {
        setOrder(res);
        showToast("success", t("Order takeover successfully"));
      }
    } catch (error: any) {
      showToast("error", error?._err?.message || error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!isConnected) {
      showToast("info", t("Please connect with internet"));
      return;
    }

    setLoading(true);

    try {
      const res = await serviceCaller(
        `${endpoint.onlineOrderingUpdate.path}/${order?._id}`,
        {
          method: endpoint.onlineOrderingUpdate.method,
          body: {
            createdAt: new Date().toISOString(),
            orderStatus: "cancelled",
          },
        }
      );

      if (res) {
        setActiveOrderStatus("cancelled");
        showToast("success", t("Order cancelled successfully"));
        setCustomer({});
        navigation.goBack();
      }
    } catch (error: any) {
      showToast("error", error?._err?.message || error?.message);
    } finally {
      setLoading(false);
    }
  };

  const deliveryDetailsData = [
    {
      title: t("Name"),
      value: order?.driver?.name,
    },
    {
      title: t("Phone"),
      value: order?.driver?.phone,
    },
  ];

  const orderDetailsData = [
    {
      title: `${t("Order")} #`,
      value: order?.orderNum,
      desc: "",
      color: "text.primary",
      show: true,
    },
    {
      title: t("Order Type"),
      value: order?.orderType,
      desc: "",
      color: "text.primary",
      show: true,
    },
    {
      title: t("Source"),
      value: order?.qrOrdering ? "QR" : order?.onlineOrdering ? "Online" : "-",
      desc: "",
      color: "text.primary",
      show: true,
    },
    {
      title: `${t("Token")} #`,
      value: order?.tokenNumber || "-",
      desc: "",
      color: "text.primary",
      show: true,
    },
    {
      title: t("Date"),
      value: order?.createdAt
        ? format(new Date(order.createdAt), "do MMM, yyyy, h:mm a")
        : "",
      desc: "",
      color: "text.primary",
      show: true,
    },
    {
      title: t("Payment"),
      value:
        order?.payment?.paymentType === "offline" ? t("Offline") : t("Online"),
      desc:
        order?.payment?.paymentStatus === "unpaid"
          ? `(${t("Due")})`
          : `(${t("Paid")})`,
      color:
        order?.payment?.paymentStatus === "unpaid"
          ? "red.default"
          : "primary.1000",
      show: true,
    },
    {
      title: t("Customer Name"),
      value:
        order?.customer?.address?.type === "Friends and Family"
          ? order?.customer?.address?.receiverName || order?.customer?.name
          : order?.customer?.name,
      desc: "",
      color: "text.primary",
      show: order?.customer?.name,
    },
    {
      title: t("Customer Phone"),
      value:
        order?.customer?.address?.type === "Friends and Family"
          ? order?.customer?.address?.receiverPhone || order?.customer?.phone
          : order?.customer?.phone,
      desc: "",
      color: "text.primary",
      show: true,
    },
    {
      title: t("Customer Address"),
      value:
        order?.customer?.address?.houseFlatBlock +
        `${
          order?.customer?.address?.apartmentArea
            ? `, ${order?.customer?.address?.apartmentArea}`
            : ""
        }` +
        `${
          order?.customer?.address?.directionToReach
            ? `, ${order?.customer?.address?.directionToReach}`
            : ""
        }`,
      desc: "",
      color: "text.primary",
      show: order?.orderType === "Delivery",
    },
    {
      title: t("Special Instructions"),
      value: order?.specialInstructions || "-",
      desc: "",
      color: "text.primary",
      show: order?.specialInstructions,
    },
  ];

  const getPaymentData = (items: any[]) => {
    return items.reduce(
      (accumulator: any, item: any) => {
        let totalVat = accumulator.vatAmount;
        let totalAmount = accumulator.total;
        let totalModifierAmount = 0;
        let totalModifierVAT = 0;

        if (item?.modifiers?.length > 0) {
          totalModifierAmount =
            item?.modifiers?.reduce(
              (ac: number, ar: any) => ac + Number(ar.total),
              0
            ) * Number(item.quantity);

          totalModifierVAT =
            item?.modifiers?.reduce(
              (ac: number, ar: any) => ac + Number(ar.vatAmount),
              0
            ) * Number(item.quantity);
        }

        totalVat += Number(
          getItemVAT(
            item.billing.total - totalModifierAmount,
            item.billing.vatPercentage
          ) + totalModifierVAT
        );

        totalAmount += item.billing.total;

        return {
          total: Number(totalAmount),
          subTotal: Number(totalAmount) - Number(totalVat),
          vatAmount: Number(totalVat),
          vatWithoutDiscount: Number(totalVat),
          subTotalWithoutDiscount: Number(totalAmount) - Number(totalVat),
        };
      },
      {
        total: 0,
        subTotal: 0,
        vatAmount: 0,
        vatWithoutDiscount: 0,
        subTotalWithoutDiscount: 0,
      }
    );
  };

  const handleAddItems = async (newItems: any) => {
    const {
      _id,
      categoryRef,
      tax,
      variants,
      boxRefs,
      crateRefs,
      name,
      modifiers,
    } = newItems;

    const variant = variants[0];

    const priceData = variant.prices?.find(
      (price: any) => price?.locationRef === order?.locationRef
    );

    const activeModifiers = modifiers?.filter(
      (modifier: any) => modifier.status === "active"
    );

    if (variants?.length > 1 || boxRefs?.length > 0 || crateRefs?.length > 0) {
      setOpenVariantModal(true);
    } else if (modifiers?.length > 0 && activeModifiers?.length > 0) {
      setModifierProduct({
        productRef: _id,
        categoryRef: categoryRef || "",
        name: { en: name.en, ar: name.ar },
        variantNameEn: variant.name.en,
        variantNameAr: variant.name.ar,
        type: variant.type || "item",
        sku: variant.sku,
        parentSku: variant?.parentSku || "",
        boxSku: variant?.boxSku || "",
        crateSku: variant?.crateSku || "",
        boxRef: variant?.boxRef ? variant.boxRef : null,
        crateRef: variant?.crateRef ? variant.crateRef : null,
        qty: 1,
        unit: variant.unit || "perItem",
        unitCount: variant.unitCount || 1,
        tax: tax.percentage,
        hasMultipleVariants: variants.length > 1,
        itemSubTotal: getItemSellingPrice(
          variant.type === "box" || variant.type === "crate"
            ? priceData?.price || variant.price
            : priceData.price,
          tax.percentage
        ),
        itemVAT: getItemVAT(
          variant.type === "box" || variant.type === "crate"
            ? priceData?.price || variant.price
            : priceData.price,
          tax.percentage
        ),
        total:
          variant.type === "box" || variant.type === "crate"
            ? priceData?.price || variant.price
            : priceData.price,
        productModifiers: modifiers,
      });
      setOpenModifierModal(true);
    } else {
      if (checkNotBillingOnlineProduct(variant, order?.locationRef, false)) {
        showToast("error", t("Looks like the item is out of stock"));
        return;
      }

      const addedItems = items.map((item: any) => {
        return {
          productRef: item.productRef,
          variant: {
            sku: item.variant.sku,
            type: item.variant.type,
            boxSku: item.variant?.boxSku || "",
            crateSku: item.variant?.crateSku || "",
            boxRef: item?.variant?.boxRef ? item.variant.boxRef : null,
            crateRef: item?.variant?.crateRef ? item.variant.crateRef : null,
            unit: item?.variant?.unit || "perItem",
            unitCount: item?.variant?.unitCount || 1,
          },
          quantity: item.quantity,
          hasMultipleVariants: item.hasMultipleVariants,
          modifiers: item.modifiers?.map((modifier: any) => {
            return {
              modifierRef: modifier.modifierRef,
              modifier: modifier.name,
              optionId: modifier.optionId,
              optionName: modifier.optionName,
              total: modifier.total,
              vatAmount: modifier.vatAmount,
            };
          }),
          categoryRef: item.categoryRef,
          billing: {
            total: item.billing.total,
            vatAmount: item.billing.vatAmount,
            vatPercentage: item.billing.vatPercentage,
          },
        };
      });

      const data = {
        productRef: _id,
        variant: {
          sku: variant?.sku,
          type: variant?.type,
          boxSku: variant?.boxSku || "",
          crateSku: variant?.crateSku || "",
          boxRef: variant?.boxRef ? variant.boxRef : null,
          crateRef: variant?.crateRef ? variant.crateRef : null,
          unit: variant.unit || "perItem",
          unitCount: variant.unitCount || 1,
        },
        quantity: 1,
        hasMultipleVariants: variants?.length > 1,
        modifiers: modifiers?.map((modifier: any) => {
          return {
            modifierRef: modifier.modifierRef,
            modifier: modifier.name,
            optionId: modifier.optionId,
            optionName: modifier.optionName,
            total: modifier.total,
            vatAmount: modifier.vatAmount,
          };
        }),
        categoryRef: categoryRef,
        billing: {
          total:
            variant.type === "box" || variant.type === "crate"
              ? priceData?.price || variant.price
              : priceData.price,
          vatAmount: getItemVAT(
            variant.type === "box" || variant.type === "crate"
              ? priceData?.price || variant.price
              : priceData.price,
            tax.percentage
          ),
          vatPercentage: tax.percentage,
        },
      };

      const payment = getPaymentData([...addedItems, data]);

      try {
        const res = await serviceCaller(
          `${endpoint.onlineOrderingUpdate.path}/${order?._id}`,
          {
            method: endpoint.onlineOrderingUpdate.method,
            body: {
              items: [...addedItems, data],
              deletedItems: deletedItems,
              companyRef: order?.companyRef,
              locationRef: order?.locationRef,
              discount: order?.payment?.discountCode || "",
              charges: order?.charges?.map((charge: any) => charge?._id) || [],
              startOfDay,
              endOfDay,
              customerRef: order?.customerRef,
              payment: {
                ...order?.payment,
                paymentStatus: order?.payment?.paymentStatus,
                paymentType: order?.payment?.paymentType,
                total: payment?.total,
                subTotal: payment?.subTotal,
                vatAmount: payment?.vatAmount,
                vatWithoutDiscount: payment?.vatWithoutDiscount,
                subTotalWithoutDiscount: payment?.subTotalWithoutDiscount,
              },
            },
          }
        );

        if (res) {
          setNewItems(null);
          showToast("success", t("Item Added"));
          fetchOrderApi();
        }
      } catch (error: any) {
        showToast("error", error?._err?.message || error?.message);
      }
    }
  };

  const handleVariantSelect = async (data: any) => {
    const item = {
      productRef: data?._id,
      categoryRef: data?.categoryRef || "",
      name: { en: data?.name?.en, ar: data?.name?.ar },
      variantNameEn: data?.variantName?.en,
      variantNameAr: data?.variantName?.ar,
      type: data.type,
      sku: data.sku,
      parentSku: data.parentSku,
      boxSku: data.boxSku,
      crateSku: data.crateSku,
      boxRef: data?.boxRef ? data.boxRef : null,
      crateRef: data?.crateRef ? data.crateRef : null,
      qty: data.qty,
      unit: data.unit,
      tax: data?.tax,
      unitCount: data.unitCount,
      hasMultipleVariants: data.hasMultipleVariants,
      itemSubTotal: getItemSellingPrice(data?.price, data?.tax),
      itemVAT: getItemVAT(data?.price, data?.tax),
      total: data?.price,
      productModifiers: data?.productModifiers,
    };

    const activeModifiers = data?.productModifiers?.filter(
      (modifier: any) => modifier.status === "active"
    );

    if (data?.productModifiers?.length > 0 && activeModifiers?.length > 0) {
      setModifierProduct(item);
      setOpenModifierModal(true);
      return;
    }

    const addedItems = items.map((item: any) => {
      return {
        productRef: item.productRef,
        variant: {
          sku: item.variant.sku,
          type: item.variant.type,
          boxSku: item.variant?.boxSku || "",
          crateSku: item.variant?.crateSku || "",
          boxRef: item?.variant?.boxRef ? item.variant.boxRef : null,
          crateRef: item?.variant?.crateRef ? item.variant.crateRef : null,
          unit: item?.variant?.unit || "perItem",
          unitCount: item?.variant?.unitCount || 1,
        },
        quantity: item.quantity,
        hasMultipleVariants: item.hasMultipleVariants,
        modifiers: item.modifiers?.map((modifier: any) => {
          return {
            modifierRef: modifier.modifierRef,
            modifier: modifier.name,
            optionId: modifier.optionId,
            optionName: modifier.optionName,
            total: modifier.total,
            vatAmount: modifier.vatAmount,
          };
        }),
        categoryRef: item.categoryRef,
        billing: {
          total: item.billing.total,
          vatAmount: item.billing.vatAmount,
          vatPercentage: item.billing.vatPercentage,
        },
      };
    });

    const dataObj = {
      productRef: item.productRef,
      variant: {
        sku: item.sku,
        type: item.type,
        boxSku: item.boxSku,
        crateSku: item.crateSku,
        boxRef: item?.boxRef ? item.boxRef : null,
        crateRef: item?.crateRef ? item.crateRef : null,
        unit: item.unit,
        unitCount: item.unitCount,
      },
      quantity: item.qty,
      hasMultipleVariants: item.hasMultipleVariants,
      modifiers: item.productModifiers?.map((modifier: any) => {
        return {
          modifierRef: modifier.modifierRef,
          modifier: modifier.name,
          optionId: modifier.optionId,
          optionName: modifier.optionName,
          total: modifier.total,
          vatAmount: modifier.vatAmount,
        };
      }),
      categoryRef: item.categoryRef,
      billing: {
        total: item.total,
        vatAmount: item.itemVAT,
        vatPercentage: item.tax,
      },
    };

    const payment = getPaymentData([...addedItems, dataObj]);

    try {
      const res = await serviceCaller(
        `${endpoint.onlineOrderingUpdate.path}/${order?._id}`,
        {
          method: endpoint.onlineOrderingUpdate.method,
          body: {
            items: [...addedItems, dataObj],
            deletedItems: deletedItems,
            companyRef: order?.companyRef,
            locationRef: order?.locationRef,
            discount: order?.payment?.discountCode || "",
            charges: order?.charges?.map((charge: any) => charge?._id) || [],
            startOfDay,
            endOfDay,
            customerRef: order?.customerRef,
            payment: {
              ...order?.payment,
              paymentStatus: order?.payment?.paymentStatus,
              paymentType: order?.payment?.paymentType,
              total: payment?.total,
              subTotal: payment?.subTotal,
              vatAmount: payment?.vatAmount,
              vatWithoutDiscount: payment?.vatWithoutDiscount,
              subTotalWithoutDiscount: payment?.subTotalWithoutDiscount,
            },
          },
        }
      );

      if (res) {
        showToast("success", t("Item Added"));
        fetchOrderApi();
      }
    } catch (error: any) {
      showToast("error", error?._err?.message || error?.message);
    } finally {
      setNewItems(null);
      setOpenVariantModal(false);
    }
  };

  const handleUpdateItems = async (items: any[]) => {
    const data = items.map((item: any) => {
      return {
        productRef: item.productRef,
        variant: {
          sku: item.variant.sku,
          type: item.variant.type,
          boxSku: item.variant?.boxSku || "",
          crateSku: item.variant?.crateSku || "",
          boxRef: item?.variant?.boxRef ? item.variant.boxRef : null,
          crateRef: item?.variant?.crateRef ? item.variant.crateRef : null,
          unit: item?.variant?.unit || "perItem",
          unitCount: item?.variant?.unitCount || 1,
        },
        quantity: item.quantity,
        hasMultipleVariants: item.hasMultipleVariants,
        modifiers: item.modifiers?.map((modifier: any) => {
          return {
            modifierRef: modifier.modifierRef,
            modifier: modifier.name,
            optionId: modifier.optionId,
            optionName: modifier.optionName,
            total: modifier.total,
            vatAmount: modifier.vatAmount,
          };
        }),
        categoryRef: item.categoryRef,
        billing: {
          total: item.billing.total,
          vatAmount: item.billing.vatAmount,
          vatPercentage: item.billing.vatPercentage,
        },
      };
    });

    const payment = getPaymentData(data);

    try {
      const res = await serviceCaller(
        `${endpoint.onlineOrderingUpdate.path}/${order?._id}`,
        {
          method: endpoint.onlineOrderingUpdate.method,
          body: {
            items: data,
            deletedItems: deletedItems,
            companyRef: order?.companyRef,
            locationRef: order?.locationRef,
            discount: order?.payment?.discountCode || "",
            charges: order?.charges?.map((charge: any) => charge?._id) || [],
            startOfDay,
            endOfDay,
            customerRef: order?.customerRef,
            payment: {
              ...order?.payment,
              paymentStatus: order?.payment?.paymentStatus,
              paymentType: order?.payment?.paymentType,
              total: payment?.total,
              subTotal: payment?.subTotal,
              vatAmount: payment?.vatAmount,
              vatWithoutDiscount: payment?.vatWithoutDiscount,
              subTotalWithoutDiscount: payment?.subTotalWithoutDiscount,
            },
          },
        }
      );

      if (res) {
        showToast("success", t("Item updated"));
        fetchOrderApi();
      }
    } catch (error: any) {
      showToast("error", error?._err?.message || error?.message);
    } finally {
      setEditIndex(-1);
    }
  };

  const handleDeleteItems = async (index: number) => {
    const deletedItems = [...order?.deletedItems, order?.items[index]];

    const data = order?.items.map((item: any, idx: number) => {
      if (index === idx) {
        return null;
      }

      return {
        productRef: item.productRef,
        variant: {
          sku: item.variant.sku,
          type: item.variant.type,
          boxSku: item.variant?.boxSku || "",
          crateSku: item.variant?.crateSku || "",
          boxRef: item?.variant?.boxRef ? item.variant.boxRef : null,
          crateRef: item?.variant?.crateRef ? item.variant.crateRef : null,
          unit: item?.variant?.unit || "perItem",
          unitCount: item?.variant?.unitCount || 1,
          ...item?.variant,
        },
        quantity: item.quantity,
        hasMultipleVariants: item.hasMultipleVariants,
        image: item?.image,
        modifiers: item.modifiers?.map((modifier: any) => {
          return {
            modifierRef: modifier.modifierRef,
            modifier: modifier.name,
            optionId: modifier.optionId,
            optionName: modifier.optionName,
            total: modifier.total,
            vatAmount: modifier.vatAmount,
          };
        }),
        categoryRef: item.categoryRef,
        billing: {
          total: item.billing.total,
          vatAmount: item.billing.vatAmount,
          vatPercentage: item.billing.vatPercentage,
        },
        ...item,
      };
    });

    const updatedItems = data?.filter((d: any) => {
      return d !== null;
    });

    const payment = getPaymentData(updatedItems);

    try {
      const res = await serviceCaller(
        `${endpoint.onlineOrderingUpdate.path}/${order?._id}`,
        {
          method: endpoint.onlineOrderingUpdate.method,
          body: {
            items: updatedItems,
            deletedItems: deletedItems,
            companyRef: order?.companyRef,
            locationRef: order?.locationRef,
            discount: order?.payment?.discountCode || "",
            charges:
              payment?.total > 0
                ? order?.payment?.charges?.map(
                    (charge: any) => charge?.chargeId
                  ) || []
                : [],
            startOfDay,
            endOfDay,
            customerRef: order?.customerRef,
            payment: {
              ...order?.payment,
              paymentStatus: order?.payment?.paymentStatus,
              paymentType: order?.payment?.paymentType,
              total: payment?.total,
              subTotal: payment?.subTotal,
              vatAmount: payment?.vatAmount,
              vatWithoutDiscount: payment?.vatWithoutDiscount,
              subTotalWithoutDiscount: payment?.subTotalWithoutDiscount,
            },
          },
        }
      );

      if (res) {
        showToast("success", t("Item deleted"));
        fetchOrderApi();
      }
    } catch (error: any) {
      showToast("error", error?._err?.message || error?.message);
    } finally {
      setDeleteIndex(-1);
    }
  };

  const showItemDeleteAlert = async (idx: number) => {
    await showAlert({
      confirmation: t("Delete?"),
      alertMsg: t("Do you want to delete this item?"),
      btnText1: t("No"),
      btnText2: `${t("Yes")}, ${t("Delete")}`,
      onPressBtn1: () => {
        setDeleteIndex(-1);
      },
      onPressBtn2: () => {
        handleDeleteItems(idx);
      },
    });
  };

  useEffect(() => {
    if (order?.orderStatus) {
      setActiveOrderStatus(order.orderStatus);
    } else {
      setActiveOrderStatus("open");
    }
  }, [order?.orderStatus]);

  useEffect(() => {
    if (order?.customerRef) {
      repository.customerRepository
        .findById(order.customerRef)
        .then((result) => {
          setCustomer(result);
          cart.clearPromotions();
          cart.updateAllPromotions([], (items: any) => {
            EventRegister.emit("promotionApplied", items);
          });
          cart.cartItems.map((item: any) => {
            delete item.exactTotal;
            delete item.exactVat;
            delete item.discountedTotal;
            delete item.discountedVatAmount;
            delete item.promotionsData;
          });
        });
    }
  }, [order?.customerRef]);

  useEffect(() => {
    if (id) {
      fetchOrderApi();
    }
  }, [id]);

  useEffect(() => {
    if (order?.items?.length > 0) {
      setItems(order?.items);
    } else {
      setItems([]);
    }
  }, [order?.items]);

  useEffect(() => {
    if (order?.deletedItems?.length > 0) {
      setDeletedItems(order?.deletedItems);
    } else {
      setDeletedItems([]);
    }
  }, [order?.deletedItems]);

  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 750,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 750,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 }
      ).start();
    };

    animate();

    return () => {
      opacity.setValue(0); // Reset the opacity value when component unmounts
    };
  }, []);

  return (
    <View style={styles.container}>
      <CustomHeader />

      <TouchableOpacity
        style={{
          marginLeft: 10,
          paddingVertical: 10,
          flexDirection: "row",
          alignItems: "center",
          alignSelf: "flex-start",
          backgroundColor: "transparent",
        }}
        onPress={() => {
          navigation.goBack();
        }}
      >
        <View
          style={{
            transform: [{ rotate: isRTL ? "180deg" : "0deg" }],
          }}
        >
          <ICONS.ArrowLeftIcon />
        </View>

        <DefaultText
          style={{ marginHorizontal: 12 }}
          fontSize="lg"
          fontWeight="medium"
        >
          {t("Online")}
        </DefaultText>
      </TouchableOpacity>

      <SeparatorHorizontalView />

      <View
        style={{
          ...styles.container,
          backgroundColor: theme.colors.bgColor,
        }}
      >
        {!order?._id ? (
          <Loader style={{ marginTop: hp("35%") }} />
        ) : (
          <KeyboardAvoidingView
            enabled={true}
            behavior={"height"}
            keyboardVerticalOffset={Platform.OS == "ios" ? 50 : 20}
          >
            <ScrollView
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingVertical: hp("3%"),
                paddingHorizontal: hp("2.5%"),
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: hp("1%"),
                  justifyContent: "space-between",
                }}
              >
                <DefaultText style={{ fontSize: 26 }} fontWeight="medium">
                  {t("Order Details")}
                </DefaultText>

                <TouchableOpacity
                  style={{
                    right: 0,
                    position: "absolute",
                    paddingVertical: 15,
                    paddingHorizontal: 12,
                  }}
                  onPress={() => {
                    console.log(isKOTPrinterConnected);
                    const showError =
                      businessDetails?.company?.industry?.toLowerCase() ===
                      "restaurant"
                        ? !isKOTPrinterConnected
                        : !isPrinterConnected;

                    if (showError) {
                      return showToast("info", t("Printer not configured"));
                    }

                    if (
                      businessDetails?.company?.industry?.toLowerCase() ===
                      "restaurant"
                    ) {
                      handleKOTPrintReceipt(order);
                    } else {
                      handlePrintReceipt(order, false);
                    }
                  }}
                  disabled={activeOrderStatus === "open" || loading}
                >
                  {loading ? (
                    <ActivityIndicator size={"small"} />
                  ) : (
                    <DefaultText
                      fontSize="2xl"
                      fontWeight="medium"
                      color={
                        activeOrderStatus === "open" || loading
                          ? "otherGrey.200"
                          : "primary.1000"
                      }
                    >
                      {t("Print")}
                    </DefaultText>
                  )}
                </TouchableOpacity>
              </View>

              <View
                style={{
                  borderRadius: 16,
                  padding: hp("2%"),
                  marginTop: hp("2.5%"),
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: theme.colors.white[1000],
                }}
              >
                <View
                  style={twoPaneView ? {} : { width: "47%", marginRight: "3%" }}
                >
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Animated.View style={{ opacity }}>
                      <FontAwesome
                        size={18}
                        name="circle"
                        color={orderStatusData[activeOrderStatus].color}
                      />
                    </Animated.View>

                    <DefaultText
                      style={{ marginLeft: 10, fontSize: 24 }}
                      fontWeight="medium"
                    >
                      {orderStatusData[activeOrderStatus].title}
                    </DefaultText>
                  </View>

                  {orderStatusData[activeOrderStatus].description && (
                    <DefaultText
                      style={{ marginTop: 5 }}
                      fontSize="md"
                      fontWeight="normal"
                      color="otherGrey.200"
                    >
                      {orderStatusData[activeOrderStatus].description}
                    </DefaultText>
                  )}
                </View>

                {activeOrderStatus !== "completed" &&
                  activeOrderStatus !== "cancelled" && (
                    <View style={twoPaneView ? {} : { width: "50%" }}>
                      <View
                        style={{
                          marginBottom: 5,
                          borderRadius: 8,
                          paddingHorizontal: wp("0.5%"),
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          borderWidth: 1,
                          borderColor: theme.colors.primary[200],
                          backgroundColor: theme.colors.white[1000],
                        }}
                      >
                        <TouchableOpacity
                          style={{
                            marginRight: 16,
                            paddingVertical: hp("1.25%"),
                          }}
                          onPress={() => {
                            if (activeOrderStatus === "open") {
                              handleOrderStatus("inprocess");
                            } else if (activeOrderStatus === "inprocess") {
                              if (order?.orderType === "Pickup") {
                                handleOrderStatus("ready");
                              } else {
                                setVisibleAssignDelivery(true);
                              }
                            } else if (activeOrderStatus === "ready") {
                              if (order?.payment?.paymentStatus === "paid") {
                                handleOrderStatus("completed");
                              } else {
                                setVisiblePaymentStatus(true);
                              }
                            }
                          }}
                          disabled={
                            loading ||
                            orderStatusData[activeOrderStatus].disabled ||
                            !authContext.permission["pos:order"]?.update
                          }
                        >
                          <DefaultText
                            style={{ paddingLeft: 5 }}
                            fontSize={twoPaneView ? "lg" : "md"}
                            fontWeight="medium"
                            color={
                              loading ||
                              orderStatusData[activeOrderStatus].disabled
                                ? theme.colors.placeholder
                                : theme.colors.primary[1000]
                            }
                          >
                            {orderStatusData[activeOrderStatus].action}
                          </DefaultText>
                        </TouchableOpacity>

                        <View
                          style={{
                            width: 1,
                            height: "100%",
                            marginLeft: 12,
                            marginRight: 5,
                            backgroundColor: theme.colors.primary[200],
                          }}
                        />

                        <Menu
                          ref={menuButton}
                          style={{
                            borderRadius: 16,
                            height: hp("15%"),
                            marginTop: hp("3.25%"),
                            justifyContent: "flex-end",
                            backgroundColor: theme.colors.white[1000],
                          }}
                          anchor={
                            <TouchableOpacity
                              style={{ paddingHorizontal: hp("1.75%") }}
                              onPress={() => {
                                menuButton.current.show();
                              }}
                              disabled={loading}
                            >
                              <ICONS.ArrowDownIcon
                                opacity={1}
                                color={
                                  loading
                                    ? theme.colors.dividerColor.secondary
                                    : theme.colors.primary[1000]
                                }
                              />
                            </TouchableOpacity>
                          }
                          onRequestClose={() => {
                            menuButton.current.hide();
                          }}
                        >
                          <MenuItem
                            style={{
                              borderRadius: 16,
                              height: hp("7.5%"),
                            }}
                            onPress={() => {
                              showTakeoverAlert();
                              menuButton.current.hide();
                            }}
                            disabled={
                              activeOrderStatus === "open"
                                ? true
                                : order?.cashierRef === authContext.user._id
                            }
                          >
                            <DefaultText
                              fontSize="lg"
                              fontWeight="medium"
                              color={
                                activeOrderStatus === "open"
                                  ? theme.colors.placeholder
                                  : order?.cashierRef === authContext.user._id
                                  ? theme.colors.placeholder
                                  : theme.colors.text.primary
                              }
                            >
                              {t("Takeover")}
                            </DefaultText>
                          </MenuItem>

                          <ItemDivider
                            style={{
                              margin: 0,
                              borderWidth: 0,
                              borderBottomWidth: 1.5,
                              borderColor: "#E5E9EC",
                            }}
                          />

                          <MenuItem
                            style={{
                              borderRadius: 16,
                              height: hp("7.5%"),
                            }}
                            onPress={() => {
                              showCancelAlert();
                              menuButton.current.hide();
                            }}
                            disabled={
                              activeOrderStatus === "open"
                                ? false
                                : order?.cashierRef !== authContext.user._id
                            }
                          >
                            <DefaultText
                              fontSize="lg"
                              fontWeight="medium"
                              color={
                                activeOrderStatus === "open"
                                  ? theme.colors.red.default
                                  : order?.cashierRef !== authContext.user._id
                                  ? theme.colors.placeholder
                                  : theme.colors.red.default
                              }
                            >
                              {t("Cancel")}
                            </DefaultText>
                          </MenuItem>
                        </Menu>
                      </View>

                      <DefaultText
                        fontSize="md"
                        fontWeight="normal"
                        color={
                          order?.payment?.paymentStatus === "unpaid"
                            ? "red.default"
                            : "primary.1000"
                        }
                      >
                        {`${t("Payment of")} ${currency} ${(order?.payment
                          ?.paymentStatus === "unpaid"
                          ? order?.payment?.total || 0
                          : 0
                        )?.toFixed(2)} ${
                          order?.payment?.paymentStatus === "unpaid"
                            ? t("Due")
                            : t("Paid")
                        }`}
                      </DefaultText>
                    </View>
                  )}
              </View>

              {order?.orderType === "Delivery" &&
                activeOrderStatus === "ready" && (
                  <View
                    style={{
                      borderRadius: 16,
                      paddingVertical: hp("2%"),
                      marginTop: hp("3.5%"),
                      backgroundColor: theme.colors.white[1000],
                    }}
                  >
                    <View
                      style={{
                        paddingHorizontal: hp("2%"),
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <DefaultText fontSize="xl" fontWeight="medium">
                        {t("Delivery Details")}
                      </DefaultText>

                      <TouchableOpacity
                        style={{
                          marginRight: 10,
                          paddingVertical: hp("1%"),
                        }}
                        onPress={() => {
                          setVisibleAssignDelivery(true);
                        }}
                        disabled={!authContext.permission["pos:order"]?.update}
                      >
                        <DefaultText
                          fontSize={twoPaneView ? "lg" : "md"}
                          fontWeight="medium"
                          color={theme.colors.primary[1000]}
                        >
                          {t("Change")}
                        </DefaultText>
                      </TouchableOpacity>
                    </View>

                    <Spacer space={16} />

                    <SeparatorHorizontalView />

                    {deliveryDetailsData.map((data, index) => {
                      return (
                        <View
                          key={index}
                          style={{
                            marginVertical: 16,
                            paddingHorizontal: hp("2%"),
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <DefaultText fontSize="lg">{data.title}</DefaultText>

                          <DefaultText fontSize="lg">{data.value}</DefaultText>
                        </View>
                      );
                    })}
                  </View>
                )}

              <View
                style={{
                  borderRadius: 16,
                  paddingVertical: hp("2%"),
                  marginTop: hp("3.5%"),
                  backgroundColor: theme.colors.white[1000],
                }}
              >
                <DefaultText
                  style={{ paddingHorizontal: hp("2%") }}
                  fontSize="xl"
                  fontWeight="medium"
                >
                  {t("Order Details")}
                </DefaultText>

                <Spacer space={16} />

                <SeparatorHorizontalView />

                {orderDetailsData.map((data, index) => {
                  if (!data.show) {
                    return <></>;
                  }

                  return (
                    <View
                      key={index}
                      style={{
                        marginTop:
                          data.title === t("Special Instructions") ? 24 : 16,
                        marginBottom: 16,
                        paddingHorizontal: hp("2%"),
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <DefaultText style={{ maxWidth: "35%" }} fontSize="lg">
                        {data.title}
                      </DefaultText>

                      <View
                        style={{
                          maxWidth: "65%",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <DefaultText fontSize="lg">{data.value}</DefaultText>

                        {data.desc && (
                          <DefaultText
                            style={{ marginLeft: 8 }}
                            fontSize="lg"
                            color={data.color}
                          >
                            {data.desc}
                          </DefaultText>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>

              <View
                style={{
                  borderRadius: 16,
                  paddingBottom: 20,
                  marginTop: hp("3.5%"),
                  backgroundColor: theme.colors.white[1000],
                }}
              >
                <View
                  style={{
                    marginTop: 16,
                    paddingHorizontal: hp("2%"),
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <DefaultText fontSize="lg" fontWeight="normal">
                    {t("Item Total")}
                  </DefaultText>

                  <DefaultText fontSize="lg" fontWeight="normal">
                    {`${currency} ${(
                      order?.payment?.subTotalWithoutDiscount || 0
                    )?.toFixed(2)}`}
                  </DefaultText>
                </View>

                {order?.payment?.discountAmount > 0 && (
                  <View
                    style={{
                      marginTop: 16,
                      paddingHorizontal: hp("2%"),
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <DefaultText fontSize="lg" fontWeight="normal">
                        {t("Discount")}
                      </DefaultText>

                      <DefaultText
                        style={{ marginTop: 3, marginLeft: 8 }}
                        fontSize="lg"
                        color="red.default"
                      >
                        {`(${order?.payment?.discountCode})`}
                      </DefaultText>
                    </View>

                    <DefaultText
                      fontSize="lg"
                      fontWeight="normal"
                      color="primary.1000"
                    >
                      {`- ${currency} ${(
                        order?.payment?.discountAmount || 0
                      )?.toFixed(2)}`}
                    </DefaultText>
                  </View>
                )}

                <View
                  style={{
                    height: 0.75,
                    width: "100%",
                    marginTop: 16,
                    backgroundColor: theme.colors.dividerColor.secondary,
                  }}
                />

                <View
                  style={{
                    marginTop: 16,
                    paddingHorizontal: hp("2%"),
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <DefaultText fontSize="lg" fontWeight="normal">
                    {t("Subtotal")}
                  </DefaultText>

                  <DefaultText fontSize="lg" fontWeight="normal">
                    {`${currency} ${(order?.payment?.subTotal || 0)?.toFixed(
                      2
                    )}`}
                  </DefaultText>
                </View>

                <View
                  style={{
                    marginTop: 16,
                    paddingHorizontal: hp("2%"),
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <DefaultText fontSize="lg" fontWeight="normal">
                    {t("Taxes")}
                  </DefaultText>

                  <DefaultText fontSize="lg" fontWeight="normal">
                    {`+ ${currency} ${(order?.payment?.vatAmount || 0)?.toFixed(
                      2
                    )}`}
                  </DefaultText>
                </View>

                {order?.payment?.charges?.map((charge: any) => {
                  return (
                    <View
                      style={{
                        marginTop: 16,
                        paddingHorizontal: hp("2%"),
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <DefaultText fontSize="lg" fontWeight="normal">
                        {isRTL ? charge?.name?.ar : charge?.name?.en}
                      </DefaultText>

                      <DefaultText fontSize="lg" fontWeight="normal">
                        {`+ ${currency} ${(
                          charge?.total - charge?.vat
                        )?.toFixed(2)}`}
                      </DefaultText>
                    </View>
                  );
                })}

                <View
                  style={{
                    height: 1,
                    width: "100%",
                    marginTop: 16,
                    backgroundColor: theme.colors.dividerColor.secondary,
                  }}
                />

                <View
                  style={{
                    marginTop: 16,
                    paddingHorizontal: hp("2%"),
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <DefaultText fontSize="xl" fontWeight="medium">
                    {t("Total Amount")}
                  </DefaultText>

                  <DefaultText fontSize="xl" fontWeight="medium">
                    {`${currency} ${(order?.payment?.total || 0)?.toFixed(2)}`}
                  </DefaultText>
                </View>
              </View>

              <View
                style={{
                  borderRadius: 16,
                  paddingVertical: hp("2%"),
                  marginTop: hp("3.5%"),
                  backgroundColor: theme.colors.white[1000],
                }}
              >
                <View
                  style={{
                    paddingHorizontal: hp("2%"),
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <DefaultText fontSize="xl" fontWeight="medium">
                      {t("Items")}
                    </DefaultText>

                    <DefaultText fontSize="xl" fontWeight="medium">
                      {`  -  ${getTotalQuantity()} ${t("Qty")}.`}
                    </DefaultText>
                  </View>

                  {order?.payment?.discountAmount === 0 && (
                    <TouchableOpacity
                      style={{ paddingLeft: hp("3%"), paddingRight: 5 }}
                      onPress={() => {
                        if (!authContext.permission["pos:order"]?.update) {
                          return showToast("error", t("You don't have access"));
                        }
                        productSelectInputRef.current.open();
                      }}
                      disabled={loading && newItems !== null}
                    >
                      {loading && newItems !== null ? (
                        <ActivityIndicator size={"small"} />
                      ) : (
                        <DefaultText
                          style={{ textAlign: "center" }}
                          fontSize="xl"
                          fontWeight="medium"
                          color="primary.1000"
                        >
                          {t("Add New Item")}
                        </DefaultText>
                      )}
                    </TouchableOpacity>
                  )}
                </View>

                <Spacer space={16} />

                <SeparatorHorizontalView />

                <OnlineOrderItemsList
                  items={items}
                  loading={loading}
                  editIndex={editIndex}
                  deleteIndex={deleteIndex}
                  handleEdit={(idx: number) => {
                    setEditIndex(idx);
                  }}
                  handleDelete={(idx: number) => {
                    if (items?.length === 1) {
                      showToast(
                        "error",
                        t("Order must contain at least one item")
                      );
                      return;
                    }

                    setDeleteIndex(idx);
                    showItemDeleteAlert(idx);
                  }}
                  handleSave={(quantity: any) => {
                    const data = items;
                    const qty = Number(data[editIndex].quantity);
                    const total =
                      (Number(data[editIndex].billing.total) / qty) *
                      Number(quantity);
                    data[editIndex].quantity = Number(quantity);
                    data[editIndex].billing.total = total;
                    data[editIndex].billing.vatAmount = getItemVAT(
                      total,
                      Number(data[editIndex].billing.vatPercentage)
                    );

                    handleUpdateItems(data);
                  }}
                  disabled={order?.payment?.discountAmount > 0}
                />

                {deletedItems?.length > 0 && (
                  <View
                    style={{
                      marginTop: hp("5%"),
                      paddingHorizontal: hp("2%"),
                    }}
                  >
                    <DefaultText
                      style={{ marginLeft: hp("1.5%") }}
                      fontSize="lg"
                      fontWeight="medium"
                      color="red.default"
                    >
                      {t("Removed Items")}
                    </DefaultText>

                    <Spacer space={hp("2%")} />

                    <DeletedItemsList deletedItems={deletedItems} />
                  </View>
                )}
              </View>

              {/* <View
                style={{
                  borderRadius: 16,
                  marginTop: hp("3.5%"),
                  paddingVertical: hp("2%"),
                  paddingHorizontal: hp("2%"),
                  backgroundColor: theme.colors.white[1000],
                }}
              >
                <DefaultText fontSize="xl" fontWeight="medium">
                  {t("Activity Logs")}
                </DefaultText>

                <Spacer space={hp("2.5%")} />

                <OrderActivityLogs activityLogs={activityLogs} />
              </View> */}

              <Spacer space={hp("20%")} />
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </View>

      <Toast />

      <ProductSelectInput
        industry={industry}
        orderType={orderType}
        sheetRef={productSelectInputRef}
        companyRef={businessDetails?.company?._id}
        locationRef={businessDetails?.location?._id}
        handleSelected={(val: any) => {
          setNewItems(val);
          handleAddItems(val);
          productSelectInputRef.current.close();
        }}
      />

      {openVariantModal && (
        <VariantItemModal
          data={newItems}
          visible={openVariantModal}
          locationRef={order?.locationRef}
          negativeBilling={businessDetails?.location?.negativeBilling}
          handleClose={() => {
            setOpenVariantModal(false);
            setNewItems(null);
          }}
          onChange={handleVariantSelect}
        />
      )}

      {openModifierModal && (
        <ModifiersModal
          order={order}
          data={modifierProduct}
          visible={openModifierModal}
          handleClose={() => {
            setOpenModifierModal(false);
            setModifierProduct(null);
          }}
          handleSuccess={() => {
            setNewItems(null);
            setModifierProduct(null);
            setOpenVariantModal(false);
            setOpenModifierModal(false);
            showToast("success", t("Item Added"));
            fetchOrderApi();
          }}
        />
      )}

      {visibleAssignDelivery && (
        <AssignDeliveryModal
          order={{
            _id: order?._id,
            company: order?.company,
            location: order?.location,
            companyRef: order?.companyRef,
            locationRef: order?.locationRef,
            driver: order?.driver,
            driverRef: order?.driverRef || "",
          }}
          visible={visibleAssignDelivery}
          handleClose={() => {
            setVisibleAssignDelivery(false);
          }}
          handleSuccess={() => {
            fetchOrderApi();
            setActiveOrderStatus("ready");
            setVisibleAssignDelivery(false);
          }}
        />
      )}

      {visiblePaymentStatus && (
        <PaymentStatusModal
          showLoader={loading}
          close={paymentBreakup?.length === 0}
          isOnlineOrder={true}
          breakup={paymentBreakup}
          businessDetails={businessDetails}
          visible={visiblePaymentStatus}
          totalPaidAmount={totalPaidAmount || 0}
          total={order?.payment?.total || 0}
          onChange={(data: any) => {
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
                    ? `${
                        (order?.payment?.total - totalPaidAmount).toFixed(2) ||
                        "0"
                      }`
                    : `${order?.payment?.total.toFixed(2) || "0"}`
                ),
              });
            }
          }}
          handleClose={() => setVisiblePaymentStatus(false)}
        />
      )}

      {visibleTenderCash && (
        <TenderCashModal
          visible={visibleTenderCash}
          handleClose={() => {
            setVisibleTenderCash(false);
          }}
          isOnlineOrder={true}
          breakup={paymentBreakup}
          onChange={handleComplete}
          totalAmount={order?.payment?.total || 0}
          totalDiscount={order?.payment?.discount || 0}
        />
      )}

      {visibleCardTransaction && (
        <CardTransactionModal
          data={{}}
          isOnlineOrder={true}
          breakup={paymentBreakup}
          billingSettings={billingSettings}
          totalPaidAmount={totalPaidAmount || 0}
          totalAmount={order?.payment?.total || 0}
          visible={visibleCardTransaction}
          handleClose={() => {
            setVisibleCardTransaction(false);
          }}
          onChange={handleComplete}
          handleNFCPayment={() => {}}
        />
      )}

      {visibleWalletTransaction && (
        <WalletTransactionModal
          isOnlineOrder={true}
          breakup={paymentBreakup}
          totalPaidAmount={totalPaidAmount || 0}
          totalAmount={order?.payment?.total || 0}
          businessDetails={businessDetails}
          visible={visibleWalletTransaction}
          handleClose={() => {
            setVisibleWalletTransaction(false);
          }}
          onChange={handleComplete}
        />
      )}

      {visibleCreditTransaction && (
        <CreditTransactionModal
          isOnlineOrder={true}
          breakup={paymentBreakup}
          totalPaidAmount={totalPaidAmount || 0}
          totalAmount={order?.payment?.total || 0}
          businessDetails={businessDetails}
          visible={visibleCreditTransaction}
          handleClose={() => {
            setVisibleCreditTransaction(false);
          }}
          onChange={handleComplete}
        />
      )}

      {visibleSuccess && (
        <OnlineOrderSuccessModal
          data={order}
          visible={visibleSuccess}
          handleClose={() => {
            setVisibleSuccess(false);
            setCustomer({});
            setPaymentBreakup([]);
            setTotalPaidAmount(0);

            EventRegister.emit("sync:enqueue", {
              entityName: EntityNames.OrdersPull,
            });

            navigation.goBack();
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { overflow: "hidden", height: "100%" },
  content_view: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default OnlineOrderDetails;
