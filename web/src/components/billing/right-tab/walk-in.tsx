import {
  AddCircleOutline,
  Delete,
  RemoveCircleOutline,
} from "@mui/icons-material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CreditIcon from "@mui/icons-material/CreditScore";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import PaymentsIcon from "@mui/icons-material/Payments";
import PrintDisabledIcon from "@mui/icons-material/PrintDisabled";
import WalletIcon from "@mui/icons-material/Wallet";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  ButtonGroup,
  CardContent,
  Chip,
  ClickAwayListener,
  Divider,
  Grid,
  Grow,
  IconButton,
  Paper,
  Popper,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ChevronDownIcon from "@untitled-ui/icons-react/build/esm/ChevronDown";
import generate from "bson-objectid";
import { useFormik } from "formik";
import {
  FC,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import serviceCaller from "src/api/serviceCaller";
import { TransformedArrowIcon } from "src/components/TransformedIcons";
import ConfirmationDialog from "src/components/confirmation-dialog";
import { Scrollbar } from "src/components/scrollbar";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import useItems from "src/hooks/use-items";
import { usePageView } from "src/hooks/use-page-view";
import { XCircle } from "src/icons/x-circle";
import { MoleculeType } from "src/permissionManager";
import useCartStore from "src/store/cart-item";
import useScanStore from "src/store/scan-store";
import useTicketStore from "src/store/ticket-store";
// import { autoApplyCustomCharges } from "src/utils/auto-apply-custom-charge";
import {
  getOrdersFromCache,
  storeOrdersInCache,
} from "src/utils/cache-manager";
import calculateCart from "src/utils/calculate-cart";
import cart from "src/utils/cart";
import { getUpdatedProductStock } from "src/utils/check-updated-product-stock";
import { ChannelsName, getCartItemUnit } from "src/utils/constants";
import { trigger } from "src/utils/custom-event";
import generateOrderNumber from "src/utils/generate-unique-order-code";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { transformCartItems } from "src/utils/transform-cart-items";
import CustomChargeIcon from "../../../icons/custom-charge";
import DiscountIcon from "../../../icons/discount";
import OutOfStockIcon from "../../../icons/warning";
import { AppliedChargeModal } from "./applied-charges-modal";
import { AppliedDiscountModal } from "./applied-discount-modal";
import { CartModifiersModal } from "./cart-modifiers-modal";
import CustomerDropdown from "./customer-singleSelect";
import { CardPaymentModal } from "./payment/card-payment-modal";
import { CashPaymentModal } from "./payment/cash-payment-modal";
import { CreditPaymentModal } from "./payment/credit-payment-modal";
import { SplitPaymentModal } from "./payment/split-payment-modal";
import { SuccessModal } from "./payment/success-modal";
import { WalletPaymentModal } from "./payment/wallet-payment-modal";
import { SpecialInstructionModal } from "./special-instructions-modal";
// import { updateProductStock } from "./update-product-stock";
import { capitalize } from "src/utils/capitalize";
import { useCurrency } from "src/utils/useCurrency";

interface UpdateProduct {
  name: string;
}

interface BillingWalkInProps {
  companyRef: string;
  company: any;
  location: any;
  device: any;
  removeTicket: any;
  ticketData: any;
  ticketIndex: any;
  handleBack: any;
}

export const BillingWalkIn: FC<BillingWalkInProps> = (props) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { user, device: deviceData } = useAuth();
  const currency = useCurrency();

  const {
    companyRef,
    company,
    location,
    device,
    removeTicket,
    ticketData,
    ticketIndex,
    handleBack,
  } = props;
  const [open, setOpen] = useState(false);
  const [paymentPopperOpen, setPaymentPopperOpen] = useState(false);
  const anchorRef = useRef(null);
  const paymentTypeAnchorRef = useRef(null);
  const [currentProduct, setCurrentProduct] = useState<number>(null);
  usePageView();
  const completedOrder = useRef() as any;
  const { setScan } = useScanStore();
  const xsDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const {
    items,
    totalVatAmount,
    discountCodes,
    promotionCodes,
    discountsApplied,
    promotionsApplied,
    chargesApplied,
    totalDiscount,
    totalAmount,
    totalItem,
    totalQty,
    vatWithoutDiscount,
    subTotalWithoutDiscount,
    totalCharges,
    vatCharges,
    totalDiscountPromotion,
    discountsPercentage: discountPercentage,
    promotionPercentage,
    promotion,
  } = useItems();

  const {
    channel,
    customer,
    customerRef,
    setCustomer,
    setCustomerRef,
    staff,
    staffRef,
    setStaff,
    setStaffRef,
    order,
    setOrder,
    customCharges,
    totalPaidAmount,
    setRemainingWalletBalance,
    setRemainingCreditBalance,
  } = useCartStore() as any;
  const { removeSingleTicket } = useTicketStore();

  const { find: findPrintTemplate, entities: printtemplates } =
    useEntity("print-template");
  const { updateEntity: updateCustomerStats } = useEntity("customer");

  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const canAccess = usePermissionManager();
  const canCreate = canAccess(MoleculeType["order:create"]);

  const [selectedButton, setSelectedButton] = useState("");
  const [openCardModal, setOpenCardModal] = useState(false);
  const [openCashModal, setOpenCashModal] = useState(false);
  const [openWalletModal, setOpenWalletModal] = useState(false);
  const [openCreditModal, setOpenCreditModal] = useState(false);
  const [openSplitModal, setOpenSplitModal] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [openDiscouuntApplied, setOpenDiscouunApplied] = useState(false);
  const [openChargeApplied, setOpenChargeApplied] = useState(false);
  const [complete, setComplete] = useState(false);
  const [completeWithPrint, setCompleteWithPrint] = useState(false);
  const [showDialogPrinterCheck, setShowDialogPrinterCheck] = useState(false);
  const [showDialogOutOfStock, setShowDialogOutOfStock] = useState(false);
  const [completeBtnTap, setCompleteBtnTap] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");

  const [openSpecialInstModal, setOpenSpecialInstModal] = useState(false);
  const [itemData, setItemData] = useState<any>(null);
  const [itemIndex, setItemIndex] = useState<number>(-1);
  const [openModifiersModal, setOpenModifersModal] = useState(false);

  const handleButtonClick = (value: string) => {
    setSelectedButton(value);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleTogglePaymentPopper = () => {
    setPaymentPopperOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: any) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const initialValues: UpdateProduct = {
    name: "",
  };

  const formik = useFormik({
    initialValues,
    onSubmit: () => {},
  });

  const createOrder = async (localOrder: any, print: boolean) => {
    const printTemplate = printtemplates.results?.[0];

    let tokenNum = "";

    if (printTemplate?.showToken) {
      tokenNum = localStorage.getItem("orderTokenCount") || `1`;
    }

    const orderNum = await generateOrderNumber(
      deviceData.phone,
      deviceData.deviceRef
    );

    if (customerRef) {
      const customerAddress = await serviceCaller("/ordering/address", {
        method: "GET",
        query: {
          customerRef: localOrder.customerRef,
        },
      });
      if (customerAddress?.results?.length > 0) {
        localOrder.customer.address = customerAddress.results[0];
      }
    }

    const obj = {
      ...localOrder,
      orderNum,
      tokenNum:
        tokenNum === "" ? "" : `${device?.tokenSequence || ""}${tokenNum}`,
      showToken: printTemplate?.showToken,
      showOrderType: printTemplate?.showOrderType,
      orderType: ChannelsName[channel] || channel || "",
      orderStatus: "completed",
      qrOrdering: false,
      specialInstructions: specialInstructions,
      company: {
        en: company?.name?.en,
        ar: company?.name?.ar,
        logo: company?.logo || "",
      },
      companyRef: companyRef,
      customer: localOrder.customer,
      customerRef: localOrder.customerRef,
      staff: localOrder.staff || { name: "" },
      staffRef: localOrder.staffRef || null,
      cashier: { name: user.name },
      cashierRef: user._id,
      device: { deviceCode: deviceData.phone },
      deviceRef: deviceData.deviceRef,
      locationRef: location?._id,
      location: {
        en: printTemplate?.location?.name?.en,
        ar: printTemplate?.location?.name?.ar,
      },
      createdAt: new Date().toISOString(),
      refunds: [],
      payment: {
        ...localOrder.payment,
        total: totalAmount,
        discount: Number(totalDiscount) + Number(totalDiscountPromotion) || 0,
        discountPercentage: Number(discountPercentage?.toFixed(2)) || 0,
        discountCode: [discountCodes, promotionCodes].filter(Boolean).join(","),
        promotionPercentage,
        promotionCode: promotionCodes,
        promotionRefs: promotion?.promotionRefs || [],
      },
      phone: location?.phone,
      vat: printTemplate?.location?.vat,
      address: printTemplate?.location?.address,
      footer: printTemplate?.footer,
      returnPolicyTitle: "Return Policy",
      returnPolicy: printTemplate?.returnPolicy,
      customText: printTemplate?.customText,
      noOfPrints: device?.configuration?.numberOfPrint == 1 ? [1] : [1, 2],
      orderSource: "web",
      source: "local",
      currency,
    };

    const objectId = generate();

    const orderData = {
      _id: objectId.toString(),
      ...obj,
      company: {
        name: company?.name?.en,
      },

      location: {
        name: location?.name?.en,
        en: printTemplate?.location?.name?.en,
        ar: printTemplate?.location?.name?.ar,
      },
      print: print,
    };

    completedOrder.current = {
      ...orderData,
      print: print,
      printKOT: company?.industry?.toLowerCase() === "restaurant",
    };

    const orderDataObj: any = await getOrdersFromCache();
    storeOrdersInCache(
      orderDataObj?.length > 0
        ? [...orderDataObj, { order: orderData, customer: customer }]
        : [{ order: orderData, customer: customer }]
    );

    if (completedOrder.current !== null) {
      setOpenSuccessModal(true);
    }

    if (printTemplate?.showToken) {
      localStorage.setItem("orderTokenCount", `${Number(tokenNum) + 1}`);
    }

    if (openSplitModal) {
      setOpenSplitModal(false);
    }

    if (ticketData?.id === ticketIndex) {
      removeSingleTicket(ticketIndex);
      removeTicket();
    }
    if (customer?._id) {
      setCustomer({});
      setCustomerRef("");
    }
    if (staffRef) {
      setStaff({});
      setStaffRef("");
    }
    setSpecialInstructions("");
    setRemainingWalletBalance(0);
    setRemainingCreditBalance(0);
    processOrderToServer();
  };

  const processOrderToServer = async () => {
    try {
      const cachedOrderArray = await getOrdersFromCache();

      if (cachedOrderArray?.length > 0) {
        if (processing) {
          return;
        }
        setProcessing(true);

        const { order, customer } = cachedOrderArray[0];

        const id = generate();

        const pendingOperations = [
          {
            id: 1,
            requestId: id.toString(),
            data: JSON.stringify({
              insertOne: {
                document: {
                  ...order,
                },
              },
            }),
            tableName: "orders",
            action: "INSERT",
            timestamp: new Date().toISOString(),
            status: "pending",
          },
        ];

        try {
          const res = await serviceCaller("/push/orders", {
            method: "POST",
            body: {
              requestId: id.toString(),
              operations: pendingOperations,
            },
            headers: { TYPE: "web", "X-USER-ID": `${user?._id || ""}` },
          });

          if (res?.message === "accepted") {
            updateCustomer(customer, order);
            // updateProductStock(order);

            const promoDoc = order?.items?.some(
              (promo: any) => promo?.promotionsData?.length > 0
            );

            if (order?.payment?.promotionRefs?.length > 0 || promoDoc) {
              updatePromotionDiscount(order);
            }

            const orderDataArray: any = cachedOrderArray?.filter(
              (orderObj: any) => orderObj?.order?._id !== order?._id
            );
            storeOrdersInCache(orderDataArray);
            setProcessing(false);
          }
        } catch (error) {
          if (error?.code === 11000) {
            const data = cachedOrderArray?.filter(
              (va: any) => va?.order?._id !== cachedOrderArray[0].order?._id
            );
            storeOrdersInCache(data);
          } else if (
            error?.statusCode === 401 ||
            error?.message === "unauthorized"
          ) {
            storeOrdersInCache([]);
          }
          console.error(error);
          setProcessing(false);
        }
      }
    } catch (error) {
      console.error(error);
      setProcessing(false);
    }
  };

  const updateCustomer = async (customer: any, obj: any) => {
    if (customer?._id) {
      await serviceCaller("/promotion/update-usage", {
        method: "POST",
        body: {
          order: obj,
          customerRef: customer?._id,
        },
      });

      const walletBalance = obj?.payment?.breakup
        ?.filter((p: any) => p.providerName === "wallet")
        ?.reduce((pv: any, cv: any) => pv + cv.total, 0);

      try {
        updateCustomerStats(customer._id, {
          totalSpent:
            Number(customer.totalSpent) +
            Number(obj.payment.total) -
            Number(walletBalance),
          totalOrder: Number(customer.totalOrder) + 1,
          lastOrderDate: new Date(),
        });
      } catch (err: any) {
        console.log(err);
      }
    }
  };

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

  const handleProductClose = useCallback((): void => {
    setCurrentProduct(null);
  }, []);

  const handleProductToggle = useCallback((index: number): void => {
    setCurrentProduct((prevIndex) => {
      if (prevIndex === index) {
        return null;
      }

      return index;
    });
  }, []);

  const checkProductSameChannel = () => {
    let sameChannel = false;

    for (let index = 0; index < cart.cartItems.length; index++) {
      if (
        cart.cartItems[index]?.channel?.length === 0 ||
        cart.cartItems[index]?.channel?.includes(channel)
      ) {
        sameChannel = true;
      } else {
        sameChannel = false;
        return false;
      }
    }

    return sameChannel;
  };

  const outOfStock = (data: any) => {
    if (data.tracking && location?.allowNegativeBilling) {
      const stockCount = data.stockCount;

      const items = cart.cartItems?.filter(
        (item: any) => item.sku === data.sku
      );

      const totalAddedQty = items?.reduce((acc: number, item: any) => {
        return acc + item.qty;
      }, 0);

      return stockCount - totalAddedQty < 0;
    }

    return false;
  };

  const getItemName = (data: any) => {
    let units = "";

    if (data.type === "box") {
      units = `${data.hasMultipleVariants ? "," : ""} (${t("Box")} - ${
        data.noOfUnits
      } ${t("Units")})`;
    }

    if (data.type === "crate") {
      units = `${data.hasMultipleVariants ? "," : ""} (${t("Crate")} - ${
        data.noOfUnits
      } ${t("Units")})`;
    }

    const variantNameEn = data.hasMultipleVariants
      ? ` - ${data.variantNameEn}`
      : "";
    const variantNameAr = data.hasMultipleVariants
      ? ` - ${data.variantNameAr}`
      : "";

    if (isRTL) {
      return `${data.name.ar}${variantNameAr}${units}`;
    } else {
      return `${data.name.en}${variantNameEn}${units}`;
    }
  };

  const getModifierName = (data: any) => {
    let name = "";

    data?.modifiers?.map((mod: any) => {
      name += `${name === "" ? "" : ", "}${mod.optionName}`;
    });

    return name;
  };

  const checkOutOfStockItem = (data: any, index: any, quantity: number) => {
    if (!Boolean(location?.allowNegativeBilling) && data.tracking) {
      const stockCount = getUpdatedProductStock(
        data.stockCount,
        data.type,
        data.sku,
        quantity - data.qty,
        false
      );

      if (stockCount < 0) {
        toast.error(t("Looks like the item is out of stock"));
      } else {
        handleUpdateItem(data, index, quantity);
      }
    } else {
      handleUpdateItem(data, index, quantity);
    }
  };

  const handleUpdateItem = (
    data: any,
    index: any,
    quantity: number,
    value: string = ""
  ) => {
    const name: any = {
      en: data?.name.en,
      ar: data?.name.ar,
    };

    if (data?.isOpenItem && value) {
      name[isRTL ? "ar" : "en"] = value;
    }

    const price = data?.modifiers?.reduce(
      (pc: number, item: any) => pc + item?.total,
      0
    );

    const productPrice = data?.itemSubTotal + data?.itemVAT;

    const updatedTotal = (productPrice + price) * quantity;

    const item = {
      ...data,
      qty: quantity,
      note: "",
      name: name,
      total: updatedTotal,
    };

    cart.updateCartItem(index, item, (updatedItems: any) => {
      trigger("itemUpdated", null, updatedItems, null, null);
    });

    // autoApplyCustomCharges(
    //   (productPrice + price) * (quantity - data.qty) +
    //     totalAmount -
    //     totalCharges +
    //     totalCharges,
    //   customCharges,
    //   chargesApplied,
    //   getItemSellingPrice(
    //     (productPrice + price) * (quantity - data.qty),
    //     item.vat
    //   ) + subTotalWithoutDiscount
    // );
  };

  const handleDeleteItem = (index: any) => {
    if (items.length === 1) {
      setCustomer({});
      setCustomerRef("");
      setStaff({});
      setStaffRef("");
      removeTicket();
      cart.clearCart();
      handleProductClose();
    } else {
      // autoApplyCustomCharges(
      //   totalAmount - totalCharges + totalCharges - cart.cartItems[index].total,
      //   customCharges,
      //   chargesApplied,
      //   subTotalWithoutDiscount -
      //     getItemSellingPrice(
      //       cart.cartItems[index].total,
      //       cart.cartItems[index].vat
      //     )
      // );

      cart.removeFromCart(index, (removedItems: any) => {
        trigger("itemRemoved", null, removedItems, null, null);
        handleProductClose();
      });
    }
  };

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

  const paymentData = useMemo(() => {
    const data: any[] = [];

    if (device?.configuration?.paymentTypes?.length > 0) {
      device?.configuration?.paymentTypes?.forEach((type: any) => {
        if (type.name === "Wallet" && !company?.configuration?.enableLoyalty) {
          return <></>;
        }

        if (type.name === "Credit" && !company?.credit?.enableCredit) {
          return <></>;
        }

        if (type.status) {
          data.push({ label: type.name, value: type.name });
        }
      });
    }

    if (data?.length > 0) {
      setSelectedButton(data[0].label);
    }

    return data;
  }, [device, company]);

  const getPaymentIcon = (payment: any) => {
    if (payment == "Cash") {
      return <PaymentsIcon />;
    } else if (payment == "Card") {
      return <CreditCardIcon />;
    } else if (payment === "Credit") {
      return <CreditIcon />;
    } else {
      return <WalletIcon />;
    }
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
          name: customer?.name?.trim() || "",
          vat: customer?.vat || "",
          phone: customer?.phone || "",
        },
        customerRef: customer?._id,
        staff: {
          name: staff?.name || "",
        },
        staffRef: staffRef || null,
        payment: {
          total: totalAmount,
          vat: totalVatAmount,
          vatPercentage: ((totalVatAmount * 100) / totalAmount).toFixed(0),
          subTotal: Number(subtotal.toFixed(2)),
          discount: totalDiscount + totalDiscountPromotion || 0,
          discountPercentage: discountPercentage + promotionPercentage || 0,
          discountCode: [discountCodes, promotionCodes]
            .filter(Boolean)
            .join(","),
          vatWithoutDiscount,
          subTotalWithoutDiscount,
          totalDiscountPromotion,
          promotionPercentage,
          promotionCode: promotionCodes,
          promotionRefs: promotion?.promotionRefs || [],
          breakup: [
            {
              name: data.cardType,
              total: Number(data.amount?.toFixed(2)),
              refId: data.transactionNumber,
              providerName: data?.providerName || "cash",
              createdAt: new Date(),
              paid:
                Number(data?.change || 0) > 0
                  ? Number(data.amount?.toFixed(2)) -
                    Number((data.change || 0)?.toFixed(2))
                  : Number(data.amount?.toFixed(2)),
              change: Number((data?.change || 0)?.toFixed(2)),
            },
          ],
          charges: chargesApplied,
        },
      };

      localOrder = orderObject;
    } else {
      let orderDoc = {
        ...order,
        customer: {
          name: customer?.name || "",
          vat: customer?.vat || "",
        },
        customerRef: customer?._id,
        staff: {
          name: staff?.name || "",
        },
        staffRef: staffRef || null,
      };

      orderDoc.payment.breakup.push({
        name: data.cardType,
        total: Number(data.amount),
        refId: data.transactionNumber,
        providerName: data.providerName,
        createdAt: new Date(),
        paid:
          Number(data?.change || 0) > 0
            ? Number(data.amount?.toFixed(2)) -
              Number((data.change || 0)?.toFixed(2))
            : Number(data.amount?.toFixed(2)),
        change: data?.change || 0,
      });
      localOrder = orderDoc;
    }

    if (localOrder.items.length === 0) return;

    setOrder(localOrder);
    calculateCart();

    const totalPaid = getTotalPaid(localOrder);

    if (
      Number(Number(totalPaid || 0)?.toFixed(2)) <
      Number(Number(totalAmount || 0)?.toFixed(2))
    ) {
      setOpenSplitModal(true);
      return;
    } else {
      createOrder(localOrder, completeWithPrint);
      return;
    }
  };

  const getProductNameInitial = (item: any) => {
    const name = item.name.en?.split(" ");

    return name?.length > 1
      ? name[0]?.charAt(0)?.toUpperCase() + name[1]?.charAt(0)?.toUpperCase()
      : name[0]?.charAt(0)?.toUpperCase();
  };

  const checkOutOfStock = () => {
    const cartItems = cart.cartItems.filter(
      (item: any) =>
        item.tracking && item.stockCount - item.qty * item.noOfUnits < 0
    );

    return cartItems?.length > 0;
  };

  const handleCompleteBtn = useCallback(() => {
    if (!canCreate) {
      return toast.error(t("You don't have access"));
    }

    if (!selectedButton) {
      toast.error(t("Please select payment type"));
      return;
    }

    // if (device?.configuration?.defaultComplete !== "with-print") {
    //   setComplete(true);
    //   setShowDialogPrinterCheck(true);
    //   return;
    // }

    if (device?.configuration?.defaultComplete === "with-print") {
      setCompleteWithPrint(true);
    } else {
      setCompleteWithPrint(false);
    }

    if (selectedButton == "Cash") {
      if (device?.configuration?.quickAmount) {
        setOpenCashModal(true);
      } else {
        handleComplete({
          providerName: "cash",
          cardType: "Cash",
          transactionNumber: "Cash",
          amount: Number(totalAmount.toFixed(2)),
          change: 0,
        });
      }
    } else if (selectedButton == "Card") {
      setOpenCardModal(true);
    } else if (selectedButton === "Credit") {
      if (!navigator.onLine) {
        toast.error(t("Please connect with internet"));
        return;
      }
      setOpenCreditModal(true);
    } else if (selectedButton === "Wallet") {
      setOpenWalletModal(true);
    } else {
      if (!navigator.onLine) {
        toast.error(t("Please connect with internet"));
        return;
      }
      handleComplete({
        providerName: selectedButton.toLowerCase().replace(/\s+/g, ""),
        cardType: selectedButton,
        transactionNumber: selectedButton,
        amount: Number(totalAmount.toFixed(2)),
        change: 0,
      });
    }
  }, [device, company, totalAmount, totalDiscount, selectedButton]);

  const handlePrint = (val: boolean) => {
    if (!canCreate) {
      return toast.error(t("You don't have access"));
    }

    if (!selectedButton) {
      toast.error(t("Please select payment type"));
      return;
    }

    setCompleteWithPrint(val);

    if (val) {
      setComplete(false);
      setShowDialogPrinterCheck(true);
      return;
    }

    if (selectedButton == "Cash") {
      if (device?.configuration?.quickAmount) {
        setOpenCashModal(true);
      } else {
        handleComplete({
          providerName: "cash",
          cardType: "Cash",
          transactionNumber: "Cash",
          amount: Number(totalAmount.toFixed(2)),
        });
      }
    } else if (selectedButton == "Card") {
      setOpenCardModal(true);
    } else if (selectedButton === "Credit") {
      if (!navigator.onLine) {
        toast.error(t("Please connect with internet"));
        return;
      }
      setOpenCreditModal(true);
    } else if (selectedButton === "Wallet") {
      setOpenWalletModal(true);
    } else {
      if (!navigator.onLine) {
        toast.error(t("Please connect with internet"));
        return;
      }
      handleComplete({
        providerName: selectedButton.toLowerCase().replace(/\s+/g, ""),
        cardType: selectedButton,
        transactionNumber: selectedButton,
        amount: Number(totalAmount.toFixed(2)),
        change: 0,
      });
    }
  };

  useEffect(() => {
    if (deviceData?.locationRef) {
      findPrintTemplate({
        page: 0,
        sort: "asc",
        activeTab: "all",
        limit: 10,
        locationRef: deviceData.locationRef,
      });
    }
  }, [deviceData]);

  useEffect(() => {
    const intervalId = setInterval(processOrderToServer, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    cart.clearPromotions();
    cart.updateAllPromotions([], (items: any) => {
      trigger("promotionApplied", null, items, null, null);
    });
    cart.cartItems.map((item: any) => {
      delete item.exactTotal;
      delete item.exactVat;
      delete item.discountedTotal;
      delete item.discountedVatAmount;
      delete item.promotionsData;
    });
    cart.cartItems.map((item: any, index: number) => {
      if (item?.isFree || item?.isQtyFree) {
        cart.removeFromCart(index, (removedItems: any) => {
          trigger("itemRemoved", null, removedItems, null, null);
        });
      }
    });
  }, [customer]);

  return (
    <>
      <Stack
        alignItems="center"
        direction="row"
        spacing={2}
        sx={{
          px: 2,
          pb: 1,
        }}
      >
        <Box sx={{ width: "100%" }}>
          {customerRef ? (
            <Box
              sx={{
                mt: 1,
                py: 0.75,
                width: "100%",
                borderRadius: 1,
                border:
                  theme.palette.mode === "dark"
                    ? "1.25px solid #15B364"
                    : "1.25px solid #15B364",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
                mb: staffRef ? 1 : 0,
              }}
            >
              <Box
                sx={{
                  ml: 1.25,
                  flex: 1,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 30,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#15B364",
                  }}
                >
                  <Typography variant="h6" color="#fff">
                    {customer.name?.charAt(0)?.toUpperCase()}
                  </Typography>
                </Box>
                <Box sx={{ ml: 1.5 }}>
                  <Typography fontSize={16} fontWeight="500">
                    {customer.name}
                  </Typography>
                  <Typography fontSize={12} fontWeight="400">
                    {customer.phone}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mr: 2, display: "flex", flexDirection: "row" }}>
                <Button
                  sx={{
                    p: 1,
                    borderRadius: 50,
                    minWidth: "auto",
                    opacity: Number(totalPaidAmount || 0) === 0 ? 1 : 0.5,
                  }}
                  onClick={() => {
                    setCustomer({});
                    setCustomerRef("");
                    cart.clearPromotions();
                    cart.updateAllPromotions([], (items: any) => {
                      trigger("promotionApplied", null, items, null, null);
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

                    cart.bulkRemoveFromCart(indexes, (removedItems: any) => {
                      trigger("itemRemoved", null, removedItems, null, null);
                    });
                  }}
                  disabled={Number(totalPaidAmount || 0) !== 0}
                >
                  <SvgIcon
                    color="error"
                    fontSize="medium"
                    sx={{ m: "auto", mr: -1, cursor: "pointer" }}
                  >
                    <XCircle />
                  </SvgIcon>
                </Button>
              </Box>
            </Box>
          ) : (
            <CustomerDropdown
              companyRef={companyRef}
              required={false}
              onChange={(id, customer) => {
                if (id) {
                  console.log(customer, "CUSTOMER");
                  setCustomerRef(id || "");
                  setCustomer(customer);
                  cart.clearPromotions();
                  cart.updateAllPromotions([], (items: any) => {
                    trigger("promotionApplied", null, items, null, null);
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

                  cart.bulkRemoveFromCart(indexes, (removedItems: any) => {
                    trigger("itemRemoved", null, removedItems, null, null);
                  });
                } else {
                  setCustomerRef("");
                  setCustomer({});
                  cart.clearPromotions();
                  cart.updateAllPromotions([], (items: any) => {
                    trigger("promotionApplied", null, items, null, null);
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

                  cart.bulkRemoveFromCart(indexes, (removedItems: any) => {
                    trigger("itemRemoved", null, removedItems, null, null);
                  });
                }
              }}
              selectedId={customerRef || ""}
              id="expiry"
              label={t("Select Customer")}
              disabled={Number(totalPaidAmount || 0) !== 0}
            />
          )}

          {staffRef ? (
            <Box
              sx={{
                py: 0.75,
                width: "100%",
                borderRadius: 1,
                border:
                  theme.palette.mode === "dark"
                    ? "1.25px solid #3f51b5"
                    : "1.25px solid #3f51b5",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <Box
                sx={{
                  ml: 1.25,
                  flex: 1,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 30,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#3f51b5",
                  }}
                >
                  <Typography variant="h6" color="#fff">
                    {staff.name?.charAt(0)?.toUpperCase()}
                  </Typography>
                </Box>
                <Box sx={{ ml: 1.5 }}>
                  <Typography fontSize={16} fontWeight="500">
                    {staff.name}
                  </Typography>
                  <Typography fontSize={12} fontWeight="400">
                    {t("Assigned Staff")}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mr: 2, display: "flex", flexDirection: "row" }}>
                <Button
                  sx={{
                    p: 1,
                    borderRadius: 50,
                    minWidth: "auto",
                    opacity: Number(totalPaidAmount || 0) === 0 ? 1 : 0.5,
                  }}
                  onClick={() => {
                    setStaff({});
                    setStaffRef("");
                  }}
                  disabled={Number(totalPaidAmount || 0) !== 0}
                >
                  <SvgIcon
                    color="error"
                    fontSize="medium"
                    sx={{ m: "auto", mr: -1, cursor: "pointer" }}
                  >
                    <XCircle />
                  </SvgIcon>
                </Button>
              </Box>
            </Box>
          ) : null}
        </Box>
      </Stack>

      <Scrollbar
        sx={{
          pb: 5,
          maxHeight: xsDown ? "calc(100vh - 475px)" : "calc(100vh - 400px)",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>{t("Product Name/ Quantity")}</TableCell>
                <TableCell>{t("Selling Price")}</TableCell>
                <TableCell>{t("VAT")}</TableCell>
                <TableCell align="right">
                  {t("Total")} {currency}
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {items?.length > 0 ? (
                items?.map((item: any, index: number) => {
                  const isCurrent = index === currentProduct;

                  const appliedPromos = item?.promotionsData
                    ?.map((promo: any) => promo?.name)
                    .join(", ");

                  return (
                    <Fragment key={item?.ProductRef}>
                      <TableRow
                        hover
                        key={item?.ProductRef}
                        onClick={() => {
                          if (!item?.isFree && !item?.isQtyFree) {
                            if (!isCurrent) {
                              formik.setValues({
                                name: item?.name.en,
                              });
                            }
                            handleProductToggle(index);
                          }
                        }}
                        sx={{
                          background:
                            item?.channel?.length === 0 ||
                            item?.channel?.includes(channel)
                              ? "transparent"
                              : "#FFDDE4",
                        }}
                      >
                        <TableCell
                          padding="checkbox"
                          sx={{
                            borderBottom:
                              theme.palette.mode === "dark"
                                ? "1px dotted #2D3748"
                                : "1px dotted #E5E7EB",
                            position: "relative",
                            "&:after": {
                              position: "absolute",
                              content: '" "',
                              top: 0,
                              left: 0,
                              backgroundColor: isCurrent
                                ? "primary.main"
                                : "primary.secondary",
                              width: 2,
                              height: "calc(100% + 1px)",
                            },
                            p: 1,
                            maxWidth: "40px",
                          }}
                          width="40px"
                          style={{ padding: "10px" }}
                        >
                          <IconButton sx={{ p: 0 }}>
                            <SvgIcon>
                              {isCurrent ? (
                                <ChevronDownIcon />
                              ) : (
                                <TransformedArrowIcon name="chevron-right" />
                              )}
                            </SvgIcon>
                          </IconButton>
                        </TableCell>

                        <TableCell
                          sx={{
                            borderBottom:
                              theme.palette.mode === "dark"
                                ? "1px dotted #2D3748"
                                : "1px dotted #E5E7EB",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {!xsDown && (
                              <>
                                {outOfStock(item) ? (
                                  <OutOfStockIcon />
                                ) : item?.image ? (
                                  <Box
                                    sx={{
                                      alignItems: "center",
                                      backgroundColor: "neutral.50",
                                      backgroundImage: `url(${item?.image})`,
                                      backgroundPosition: "center",
                                      backgroundSize: "cover",
                                      borderRadius: 1,
                                      display: "flex",
                                      height: 50,
                                      justifyContent: "center",
                                      overflow: "hidden",
                                      width: 50,
                                    }}
                                  />
                                ) : (
                                  <Box
                                    sx={{
                                      width: 50,
                                      height: 50,
                                      borderRadius: 1,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      backgroundColor:
                                        theme.palette.mode === "dark"
                                          ? "#0C935680"
                                          : "#006C3580",
                                    }}
                                  >
                                    <Typography variant="h6" color="#fff">
                                      {getProductNameInitial(item)}
                                    </Typography>
                                  </Box>
                                )}
                              </>
                            )}
                            <Box
                              sx={{
                                flex: 1,
                                cursor: "pointer",
                                ml: !xsDown ? 2 : 0,
                              }}
                              onClick={() => {
                                if (item.modifiers?.length > 0) {
                                  setItemData(item);
                                  setItemIndex(index);
                                  setOpenModifersModal(true);
                                }
                              }}
                            >
                              <Typography variant="subtitle2">
                                {getItemName(item)}
                              </Typography>
                              <Typography
                                color="text.secondary"
                                variant="body2"
                              >
                                {item.unit == "perItem" ||
                                item.type === "box" ||
                                item.type === "crate"
                                  ? `x ${item.qty}`
                                  : `${item.qty + getCartItemUnit[item.unit]}`}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ fontSize: 13 }}
                                color="text.secondary"
                              >
                                {getModifierName(item)}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell
                          sx={{
                            borderBottom:
                              theme.palette.mode === "dark"
                                ? "1px dotted #2D3748"
                                : "1px dotted #E5E7EB",
                          }}
                        >
                          {item?.discountedTotal ? (
                            <div>
                              <Typography variant="subtitle2">
                                {`${currency} ${toFixedNumber(
                                  Number(item.sellingPrice + item.vatAmount)
                                )}` || "SAR 0.00"}
                              </Typography>
                            </div>
                          ) : (
                            <Typography variant="subtitle2">
                              {`${currency} ${toFixedNumber(
                                Number(item.sellingPrice + item.vatAmount)
                              )}` || "SAR 0.00"}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell
                          sx={{
                            borderBottom:
                              theme.palette.mode === "dark"
                                ? "1px dotted #2D3748"
                                : "1px dotted #E5E7EB",
                          }}
                        >
                          <>
                            <Typography variant="subtitle2">
                              {`${currency} ${toFixedNumber(
                                item.vatAmount || 0
                              )}`}
                            </Typography>
                            {/* {company?.industry?.toLowerCase() !==
                              "restaurant" && (
                              <Typography variant="subtitle2">
                                {item.vat}%
                              </Typography>
                            )} */}
                          </>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            borderBottom:
                              theme.palette.mode === "dark"
                                ? "1px dotted #2D3748"
                                : "1px dotted #E5E7EB",
                          }}
                        >
                          {item?.discountedTotal > -1 ? (
                            <>
                              <div>
                                <Typography variant="subtitle2">
                                  {`${currency} ${toFixedNumber(
                                    Number(item.discountedTotal)
                                  )}` || "SAR 0.00"}
                                </Typography>
                                <del style={{ fontSize: 12 }}>
                                  <Typography variant="subtitle2">
                                    {`${currency} ${toFixedNumber(
                                      Number(item.exactTotal)
                                    )}` || "SAR 0.00"}
                                  </Typography>
                                </del>
                                {appliedPromos !== "" && (
                                  <Chip
                                    label={appliedPromos}
                                    color="success"
                                    variant="outlined"
                                  />
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              {item?.isFree ? (
                                <>
                                  <Typography variant="subtitle2">
                                    FREE
                                  </Typography>
                                  <del style={{ fontSize: 12 }}>
                                    <Typography variant="subtitle2">
                                      {`${currency} ${toFixedNumber(
                                        Number(item.total)
                                      )}` || "SAR 0.00"}
                                    </Typography>
                                  </del>
                                  {appliedPromos !== "" && (
                                    <Chip
                                      label={appliedPromos}
                                      color="success"
                                      variant="outlined"
                                    />
                                  )}
                                </>
                              ) : (
                                <Typography variant="subtitle2">
                                  {`${currency} ${toFixedNumber(
                                    item.total || 0
                                  )}`}
                                </Typography>
                              )}
                            </>
                          )}
                        </TableCell>
                      </TableRow>

                      {isCurrent && !xsDown && (
                        <TableRow
                          sx={{
                            background:
                              item?.channel?.length === 0 ||
                              item?.channel?.includes(channel)
                                ? "transparent"
                                : "#FFDDE4",
                          }}
                        >
                          <TableCell
                            colSpan={4}
                            sx={{
                              p: 0,
                              borderBottom:
                                theme.palette.mode === "dark"
                                  ? "1px dotted #2D3748"
                                  : "1px dotted #E5E7EB",
                              position: "relative",
                              "&:after": {
                                position: "absolute",
                                content: '" "',
                                top: 0,
                                left: 0,
                                backgroundColor: "primary.main",
                                width: 2,
                                height: "calc(100% + 1px)",
                              },
                            }}
                          >
                            <CardContent>
                              <Grid
                                container
                                spacing={0}
                                sx={{ mx: -0.75, my: -2.5 }}
                              >
                                <Box>
                                  <TextField
                                    label={t("Price")}
                                    name="price"
                                    InputProps={{
                                      startAdornment: (
                                        <Typography
                                          color="textSecondary"
                                          variant="body2"
                                          sx={{ mr: 1, mt: 2.4 }}
                                        >
                                          {currency}
                                        </Typography>
                                      ),
                                    }}
                                    disabled
                                    style={{ width: "150px" }}
                                    value={toFixedNumber(
                                      Number(item.sellingPrice + item.vatAmount)
                                    )}
                                    onChange={() => {}}
                                    onFocus={() => setScan(true)}
                                    onBlur={() => setScan(false)}
                                  />
                                </Box>

                                <Box sx={{ display: "flex", ml: 2 }}>
                                  {item.unit === "perItem" && (
                                    <Button
                                      sx={{ mr: 0.5 }}
                                      onClick={() => {
                                        if (item.qty > 1) {
                                          checkOutOfStockItem(
                                            item,
                                            index,
                                            Number(item.qty) - 1
                                          );
                                        }
                                      }}
                                      disabled={item.qty === 1}
                                    >
                                      <RemoveCircleOutline />
                                    </Button>
                                  )}

                                  <TextField
                                    sx={{
                                      "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                                        {
                                          display: "none",
                                        },
                                      "& input[type=number]": {
                                        MozAppearance: "textfield",
                                      },
                                    }}
                                    value={item.qty || 0}
                                    type="number"
                                    label={
                                      item.unit === "perItem"
                                        ? t("Quantity")
                                        : item.unit == "perLitre"
                                        ? t("Volume")
                                        : t("Weight")
                                    }
                                    name="quantity"
                                    style={{ width: "80px" }}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const regex =
                                        item.unit === "perItem"
                                          ? /^[0-9\b]+$/
                                          : /^[0-9]*(\.[0-9]{0,3})?$/;

                                      if (
                                        val?.length < 10 &&
                                        (val === "" || regex.test(val))
                                      ) {
                                        const newCount =
                                          val === "" || val === "0" ? "1" : val;

                                        checkOutOfStockItem(
                                          item,
                                          index,
                                          Number(newCount)
                                        );
                                      }
                                    }}
                                    onFocus={() => setScan(true)}
                                    onBlur={() => setScan(false)}
                                  />

                                  {item.unit === "perItem" && (
                                    <Button
                                      sx={{ ml: 0.5 }}
                                      onClick={() => {
                                        checkOutOfStockItem(
                                          item,
                                          index,
                                          Number(item.qty) + 1
                                        );
                                      }}
                                    >
                                      <AddCircleOutline />
                                    </Button>
                                  )}
                                </Box>

                                {item.sku === "Open Item" && (
                                  <Box>
                                    <TextField
                                      sx={{ ml: 2 }}
                                      label={t("Name")}
                                      name="name"
                                      style={{ width: "160px" }}
                                      inputProps={{ maxLength: 60 }}
                                      value={formik.values.name || ""}
                                      onChange={(e) => {
                                        formik.setFieldValue(
                                          "name",
                                          e.target.value?.trimStart()
                                        );
                                        if (
                                          e.target.value?.trimStart() !== ""
                                        ) {
                                          handleUpdateItem(
                                            item,
                                            index,
                                            Number(item.qty),
                                            e.target.value
                                          );
                                        }
                                      }}
                                      onFocus={() => setScan(true)}
                                      onBlur={() => setScan(false)}
                                    />
                                  </Box>
                                )}
                              </Grid>
                            </CardContent>
                          </TableCell>

                          <TableCell
                            align="right"
                            sx={{
                              borderBottom:
                                theme.palette.mode === "dark"
                                  ? "1px dotted #2D3748"
                                  : "1px dotted #E5E7EB",
                            }}
                          >
                            <IconButton
                              onClick={() => {
                                handleDeleteItem(index);
                              }}
                              sx={{ mr: !xsDown ? -1 : 0 }}
                            >
                              <SvgIcon>
                                <Delete fontSize="medium" color="error" />
                              </SvgIcon>
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      )}

                      {isCurrent && xsDown && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            sx={{
                              p: 0,
                              borderBottom:
                                theme.palette.mode === "dark"
                                  ? "1px dotted #2D3748"
                                  : "1px dotted #E5E7EB",
                              position: "relative",
                              "&:after": {
                                position: "absolute",
                                content: '" "',
                                top: 0,
                                left: 0,
                                backgroundColor: "primary.main",
                                width: 3,
                                height: "calc(100% + 1px)",
                              },
                            }}
                          >
                            <Grid
                              container
                              spacing={{ xs: 2, md: 3 }}
                              columns={{ xs: 4, sm: 8, md: 12 }}
                            >
                              <Grid item xs={4} sm={4} md={4} key={index}>
                                <Box sx={{ ml: 2, mt: 3 }}>
                                  <TextField
                                    label={t("Price")}
                                    name="price"
                                    InputProps={{
                                      startAdornment: (
                                        <Typography
                                          color="textSecondary"
                                          variant="body2"
                                          sx={{ mr: 1, mt: 2.4 }}
                                        >
                                          {currency}
                                        </Typography>
                                      ),
                                    }}
                                    disabled
                                    style={{ width: "150px" }}
                                    value={
                                      item.sellingPrice + item.vatAmount || 0
                                    }
                                    onChange={() => {}}
                                    onFocus={() => setScan(true)}
                                    onBlur={() => setScan(false)}
                                  />
                                </Box>
                              </Grid>
                              <Grid item xs={4} sm={4} md={4} key={index}>
                                <Box
                                  sx={{
                                    display: "flex",
                                  }}
                                >
                                  {item.unit === "perItem" && (
                                    <Button
                                      onClick={() => {
                                        if (item.qty > 1) {
                                          checkOutOfStockItem(
                                            item,
                                            index,
                                            Number(item.qty) - 1
                                          );
                                        }
                                      }}
                                      disabled={item.qty === 1}
                                    >
                                      <RemoveCircleOutline />
                                    </Button>
                                  )}

                                  <TextField
                                    sx={{
                                      "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                                        {
                                          display: "none",
                                        },
                                      "& input[type=number]": {
                                        MozAppearance: "textfield",
                                      },
                                      ml: 2,
                                    }}
                                    value={item.qty || 0}
                                    type="number"
                                    label={
                                      item.unit === "perItem"
                                        ? t("Quantity")
                                        : item.unit == "perLitre"
                                        ? t("Volume")
                                        : t("Weight")
                                    }
                                    name="quantity"
                                    style={{ width: "100px" }}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const regex =
                                        item.unit === "perItem"
                                          ? /^[0-9\b]+$/
                                          : /^[0-9]*(\.[0-9]{0,3})?$/;

                                      if (
                                        val?.length < 10 &&
                                        (val === "" || regex.test(val))
                                      ) {
                                        const newCount =
                                          val === "" || val === "0" ? "1" : val;

                                        checkOutOfStockItem(
                                          item,
                                          index,
                                          Number(newCount)
                                        );
                                      }
                                    }}
                                    onFocus={() => setScan(true)}
                                    onBlur={() => setScan(false)}
                                  />

                                  {item.unit === "perItem" && (
                                    <Button
                                      onClick={() => {
                                        checkOutOfStockItem(
                                          item,
                                          index,
                                          Number(item.qty) + 1
                                        );
                                      }}
                                    >
                                      <AddCircleOutline />
                                    </Button>
                                  )}
                                </Box>
                              </Grid>
                              {item.sku === "Open Item" && (
                                <Grid item xs={4} sm={4} md={4}>
                                  <Box>
                                    <TextField
                                      sx={{ ml: 2, mb: 3 }}
                                      label={t("Name")}
                                      name="name"
                                      style={{ width: "200px" }}
                                      inputProps={{ maxLength: 60 }}
                                      value={formik.values.name || ""}
                                      onChange={(e) => {
                                        formik.setFieldValue(
                                          "name",
                                          e.target.value?.trimStart()
                                        );
                                        if (
                                          e.target.value?.trimStart() !== ""
                                        ) {
                                          handleUpdateItem(
                                            item,
                                            index,
                                            Number(item.qty),
                                            e.target.value
                                          );
                                        }
                                      }}
                                      onFocus={() => setScan(true)}
                                      onBlur={() => setScan(false)}
                                    />
                                  </Box>
                                </Grid>
                              )}
                            </Grid>
                          </TableCell>

                          <TableCell
                            align="right"
                            sx={{
                              borderBottom:
                                theme.palette.mode === "dark"
                                  ? "1px dotted #2D3748"
                                  : "1px dotted #E5E7EB",
                            }}
                          >
                            <IconButton
                              onClick={() => {
                                handleDeleteItem(index);
                              }}
                              sx={{ mr: !xsDown ? -1 : 0 }}
                            >
                              <SvgIcon>
                                <Delete fontSize="medium" color="error" />
                              </SvgIcon>
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      )}

                      {item.total > company?.transactionVolumeCategory && (
                        <TableRow>
                          {/* {[1, 2, 3].map((op) => {
                            return <TableCell key={op}></TableCell>;
                          })} */}
                          <TableCell colSpan={2}>
                            <Typography
                              variant="subtitle2"
                              style={{ fontSize: 12, color: "red" }}
                            >
                              {`${t("Amount can't be greater than SAR ")}${
                                company?.transactionVolumeCategory
                              }`}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    style={{ textAlign: "center", borderBottom: "none" }}
                  >
                    <Box sx={{ mt: 10, mb: 6 }}>
                      <NoDataAnimation
                        text={
                          <Typography
                            variant="h6"
                            textAlign="center"
                            sx={{ mt: 5 }}
                          >
                            {t("No Products!")}
                          </Typography>
                        }
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableBody>
              {items?.length > 0 &&
                (discountPrice > 0 ||
                  promotionPrice > 0 ||
                  freeItemDiscount > 0) && (
                  <Fragment key={"discount"}>
                    <TableRow
                      hover
                      key="discount"
                      onClick={() => {
                        setOpenDiscouunApplied(true);
                      }}
                    >
                      <TableCell
                        padding="checkbox"
                        width="40px"
                        style={{
                          padding: "10px",
                          borderBottom:
                            theme.palette.mode === "dark"
                              ? "1px dotted #2D3748"
                              : "1px dotted #E5E7EB",
                        }}
                      />
                      <TableCell
                        sx={{
                          borderBottom:
                            theme.palette.mode === "dark"
                              ? "1px dotted #2D3748"
                              : "1px dotted #E5E7EB",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Box
                            sx={{
                              alignItems: "center",
                              backgroundColor: "neutral.100",
                              borderRadius: 1,
                              display: "flex",
                              height: 50,
                              justifyContent: "center",
                              width: 50,
                            }}
                          >
                            <DiscountIcon />
                          </Box>

                          <Box
                            sx={{
                              flex: 1,
                              cursor: "pointer",
                              ml: 2,
                            }}
                          >
                            <Typography variant="subtitle2">
                              {isRTL ? "تخفيض" : "Discount"}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom:
                            theme.palette.mode === "dark"
                              ? "1px dotted #2D3748"
                              : "1px dotted #E5E7EB",
                        }}
                      />
                      <TableCell
                        sx={{
                          borderBottom:
                            theme.palette.mode === "dark"
                              ? "1px dotted #2D3748"
                              : "1px dotted #E5E7EB",
                        }}
                      />
                      <TableCell
                        align="right"
                        sx={{
                          borderBottom:
                            theme.palette.mode === "dark"
                              ? "1px dotted #2D3748"
                              : "1px dotted #E5E7EB",
                        }}
                      >
                        <Typography variant="subtitle2">
                          {`-${currency} ${Number(
                            parseFloat(discountPrice) +
                              parseFloat(promotionPrice) +
                              parseFloat(freeItemDiscount)
                          ).toFixed(2)}`}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                )}
            </TableBody>

            <TableBody>
              {items?.length > 0 &&
                chargesApplied?.map((charge: any, index: number) => (
                  <Fragment key={index}>
                    <TableRow
                      hover
                      key={index}
                      onClick={() => {
                        setOpenChargeApplied(true);
                      }}
                    >
                      <TableCell
                        padding="checkbox"
                        width="40px"
                        style={{
                          padding: "10px",
                          borderBottom:
                            theme.palette.mode === "dark"
                              ? "1px dotted #2D3748"
                              : "1px dotted #E5E7EB",
                        }}
                      />
                      <TableCell
                        sx={{
                          borderBottom:
                            theme.palette.mode === "dark"
                              ? "1px dotted #2D3748"
                              : "1px dotted #E5E7EB",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Box
                            sx={{
                              alignItems: "center",
                              backgroundColor: "neutral.100",
                              borderRadius: 1,
                              display: "flex",
                              height: 50,
                              justifyContent: "center",
                              width: 50,
                            }}
                          >
                            <CustomChargeIcon />
                          </Box>

                          <Box
                            sx={{
                              flex: 1,
                              cursor: "pointer",
                              ml: 2,
                            }}
                          >
                            <Typography variant="subtitle2">
                              {isRTL ? charge.name.ar : charge.name.en}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom:
                            theme.palette.mode === "dark"
                              ? "1px dotted #2D3748"
                              : "1px dotted #E5E7EB",
                        }}
                      />
                      <TableCell
                        sx={{
                          borderBottom:
                            theme.palette.mode === "dark"
                              ? "1px dotted #2D3748"
                              : "1px dotted #E5E7EB",
                        }}
                      />
                      <TableCell
                        align="right"
                        sx={{
                          borderBottom:
                            theme.palette.mode === "dark"
                              ? "1px dotted #2D3748"
                              : "1px dotted #E5E7EB",
                        }}
                      >
                        {`${currency} ${toFixedNumber(charge.total)}`}
                      </TableCell>
                    </TableRow>
                  </Fragment>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>
      <>
        <Grid
          container
          spacing={2}
          sx={{
            position: "fixed",
            pb: 0.5,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: !xsDown ? "50%" : "100%",
            backgroundColor:
              theme.palette.mode !== "dark" ? `#f8f9fa` : "#0B0F19",
          }}
        >
          <Grid style={{ paddingLeft: "0px" }} item xs={12}>
            <Divider
              sx={{
                borderBottom: `1px solid ${
                  theme.palette.mode !== "dark" ? "#E5E7EB" : "#2D3748"
                }`,
              }}
            />

            {company?.industry?.toLowerCase() === "restaurant" &&
              items.length > 0 && (
                <>
                  <Button
                    sx={{
                      mx: 0,
                      color:
                        theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
                    }}
                    variant="text"
                    onClick={() => setOpenSpecialInstModal(true)}
                  >
                    {specialInstructions
                      ? t("Update Special Instruction")
                      : t("Add Special Instruction")}
                  </Button>
                </>
              )}

            <Box
              sx={{
                textAlign: "center",
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                mt: 0.25,
                px: 2,
                backgroundColor:
                  theme.palette.mode !== "dark" ? `#f8f9fa` : "#0B0F19",
              }}
            >
              <Box sx={{ display: "flex" }}>
                <Typography color="text.secondary" variant="body2">
                  {t("Items/QTY.")}:
                </Typography>
                <Typography sx={{ ml: 1 }} variant="subtitle2">
                  {` ${totalItem || 0}/${totalQty || 0}`}
                </Typography>
              </Box>
              <Box sx={{ display: "flex" }}>
                <Typography color="text.secondary" variant="body2">
                  {t("Total VAT")}:
                </Typography>
                <Typography sx={{ ml: 1 }} variant="subtitle2">
                  {`${currency} ${(totalVatAmount || 0).toFixed(2)}`}
                </Typography>
              </Box>
              <Typography variant="h6">
                {`${currency} ${(totalAmount || 0).toFixed(2)}`}
              </Typography>
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            sx={{
              mt: 0.25,
              textAlign: "center",
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              gap: 1,
              flexDirection: !xsDown ? "row" : "column",
            }}
          >
            <Box sx={{ pr: 1.75, pb: 2 }}>
              <ButtonGroup>
                <LoadingButton
                  variant="contained"
                  startIcon={<CreditCardIcon />}
                >
                  {selectedButton
                    ? t(selectedButton)
                    : t("Select payment method")}
                </LoadingButton>
                <Button
                  ref={paymentTypeAnchorRef}
                  aria-controls={
                    paymentPopperOpen ? "menu-list-grow" : undefined
                  }
                  aria-haspopup="true"
                  onClick={handleTogglePaymentPopper}
                  sx={{ px: 1 }}
                >
                  <TransformedArrowIcon name="chevron-right" />
                </Button>
              </ButtonGroup>
              <Popper
                open={paymentPopperOpen}
                anchorEl={paymentTypeAnchorRef.current}
                transition
                placement="top"
                sx={{ zIndex: 9999 }}
              >
                {({ TransitionProps, placement }) => (
                  <Grow {...TransitionProps}>
                    <Paper sx={{ minWidth: 250, maxWidth: 320 }}>
                      <ClickAwayListener onClickAway={handleClose}>
                        <Scrollbar
                          sx={{
                            maxHeight: 700,
                            minHeight: 350,
                            overflowY: "auto",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              minWidth: 220,
                            }}
                            p={3}
                          >
                            {paymentData?.map((data: any) => (
                              <ButtonGroup
                                key={data.label}
                                sx={{
                                  mb: { xs: 2, sm: 2, lg: 2 },
                                  width: "100%",
                                }}
                              >
                                <Button
                                  sx={{
                                    mr: 2,
                                    minHeight: 48,
                                    fontSize: "0.95rem",
                                    fontWeight: 500,
                                  }}
                                  variant={
                                    selectedButton === data.label
                                      ? "contained"
                                      : "outlined"
                                  }
                                  startIcon={getPaymentIcon(data.label)}
                                  onClick={() => {
                                    handleButtonClick(data.label);
                                    setPaymentPopperOpen(false);
                                  }}
                                >
                                  {data.value === "Wallet"
                                    ? t("Wallet Payment")
                                    : t(data.value)}
                                </Button>
                              </ButtonGroup>
                            ))}
                          </Box>
                        </Scrollbar>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </Box>
            <Box sx={{ pr: 1.75, pb: 2 }}>
              <ButtonGroup>
                <LoadingButton
                  variant="contained"
                  onClick={() => {
                    if (!device) {
                      toast.error(
                        t("Device not selected reselect again or refresh")
                      );
                      return;
                    }
                    if (device.status === "inactive") {
                      toast.error(t("Device is inactive for billing"));
                      return;
                    }
                    if (device.connectivityStatus === "offline") {
                      toast.error(
                        t(
                          "Device is unpaired for billing pair again to continue"
                        )
                      );
                      return;
                    }

                    if (totalAmount >= company?.transactionVolumeCategory) {
                      toast.error(
                        `${"Billing amount must be less than or equal to "}${
                          company?.transactionVolumeCategory
                        }`
                      );
                      return;
                    }

                    if (items?.length > 0) {
                      if (totalAmount > 0) {
                        if (
                          location?.allowNegativeBilling &&
                          checkOutOfStock()
                        ) {
                          setCompleteBtnTap(true);
                          setShowDialogOutOfStock(true);
                        } else {
                          handleCompleteBtn();
                        }
                      } else {
                        toast.error(t("Billing amount must be greater than 0"));
                      }
                    }
                  }}
                  startIcon={
                    device?.configuration?.defaultComplete === "with-print" ? (
                      <LocalPrintshopIcon />
                    ) : (
                      <PrintDisabledIcon />
                    )
                  }
                  disabled={!checkProductSameChannel()}
                >
                  {t("Complete")}
                </LoadingButton>
                <Button
                  ref={anchorRef}
                  aria-controls={open ? "menu-list-grow" : undefined}
                  aria-haspopup="true"
                  onClick={handleToggle}
                  sx={{ px: 1 }}
                  disabled={!checkProductSameChannel()}
                >
                  <TransformedArrowIcon name="chevron-right" />
                </Button>
              </ButtonGroup>
              <Popper
                placement="top"
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
              >
                {({ TransitionProps, placement }) => (
                  <Grow
                    {...TransitionProps}
                    style={{
                      transformOrigin:
                        placement === "bottom" ? "center top" : "center bottom",
                    }}
                  >
                    <Paper sx={{ background: "transparent" }}>
                      <ClickAwayListener onClickAway={handleClose}>
                        <Box p={2}>
                          <LoadingButton
                            variant="contained"
                            onClick={() => {
                              if (!device) {
                                toast.error(
                                  t(
                                    "Device not selected reselect again or refresh"
                                  )
                                );
                                return;
                              }
                              if (device.status === "inactive") {
                                toast.error(
                                  t("Device is inactive for billing")
                                );
                                return;
                              }
                              if (device.connectivityStatus === "offline") {
                                toast.error(
                                  t(
                                    "Device is unpaired for billing pair again to continue"
                                  )
                                );
                                return;
                              }

                              if (totalAmount > 0) {
                                if (
                                  location?.allowNegativeBilling &&
                                  checkOutOfStock()
                                ) {
                                  setCompleteBtnTap(false);
                                  setShowDialogOutOfStock(true);
                                } else {
                                  handlePrint(
                                    device?.configuration?.defaultComplete ==
                                      "with-print"
                                      ? false
                                      : true
                                  );
                                }
                              } else {
                                toast.error(
                                  t("Billing amount must be greater than 0")
                                );
                              }
                            }}
                          >
                            {device?.configuration?.defaultComplete ===
                            "with-print"
                              ? t("Continue without print")
                              : t("Complete with print")}
                          </LoadingButton>
                        </Box>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </Box>
          </Grid>
        </Grid>
      </>

      <AppliedDiscountModal
        discounts={[...discountsApplied, ...promotionsApplied]}
        open={openDiscouuntApplied}
        handleClose={() => {
          setOpenDiscouunApplied(false);
        }}
      />
      <AppliedChargeModal
        charges={chargesApplied}
        open={openChargeApplied}
        handleClose={() => {
          setOpenChargeApplied(false);
        }}
      />
      <CashPaymentModal
        open={openCashModal}
        handleClose={() => {
          setOpenCashModal(false);
        }}
        handleSubmit={handleComplete}
        totalAmount={totalAmount}
      />
      <CardPaymentModal
        open={openCardModal}
        totalPaidAmount={totalPaidAmount}
        totalAmount={totalAmount}
        handleClose={() => {
          setOpenCardModal(false);
        }}
        handleSubmit={handleComplete}
      />
      <WalletPaymentModal
        open={openWalletModal}
        totalPaidAmount={totalPaidAmount}
        totalAmount={totalAmount}
        company={company}
        handleClose={() => {
          setOpenWalletModal(false);
        }}
        handleSubmit={handleComplete}
      />
      <CreditPaymentModal
        open={openCreditModal}
        totalPaidAmount={totalPaidAmount}
        totalAmount={totalAmount}
        company={company}
        handleClose={() => {
          setOpenCreditModal(false);
        }}
        handleSubmit={handleComplete}
      />
      <SplitPaymentModal
        open={openSplitModal}
        company={company}
        device={device}
        totalPaidAmount={totalPaidAmount}
        total={totalAmount}
        handleSubmit={(data: any) => {
          if (data.method === "card") {
            setOpenCardModal(true);
          } else if (data.method === "cash") {
            setOpenCashModal(true);
          } else if (data.method === "credit") {
            setOpenCreditModal(true);
          } else if (data.method === "wallet") {
            setOpenWalletModal(true);
          } else
            handleComplete({
              providerName: data?.method,
              cardType: data?.method,
              transactionNumber: data?.method,
              amount: Number(
                totalPaidAmount
                  ? `${(totalAmount - totalPaidAmount).toFixed(2) || "0"}`
                  : `${totalAmount.toFixed(2) || "0"}`
              ),
              change: 0,
              name: capitalize(data?.method),
            });
        }}
      />
      <SuccessModal
        data={completedOrder.current}
        open={openSuccessModal}
        company={company}
        device={device}
        printTemplate={printtemplates?.results?.[0]}
        handleClose={() => {
          completedOrder.current = null;
          setOpenSuccessModal(false);
          cart.clearCart();

          if (xsDown) {
            handleBack();
          }
        }}
      />
      <SpecialInstructionModal
        data={specialInstructions}
        open={openSpecialInstModal}
        handleClose={() => {
          setOpenSpecialInstModal(false);
        }}
        handleSuccess={(data: string) => {
          setSpecialInstructions(data);
          setOpenSpecialInstModal(false);
        }}
      />
      {openModifiersModal && (
        <CartModifiersModal
          data={itemData}
          index={itemIndex}
          location={location}
          open={openModifiersModal}
          handleClose={() => {
            setOpenModifersModal(false);
            setItemData(null);
            setItemIndex(-1);
          }}
          onChange={(changedObject: any, index: number) => {
            cart.updateCartItem(index, changedObject, (updatedItems: any) => {
              trigger("itemUpdated", null, updatedItems, null, null);
            });
          }}
          onDelete={(index: number) => {
            handleDeleteItem(index);
          }}
        />
      )}
      <ConfirmationDialog
        show={showDialogPrinterCheck}
        toggle={() => setShowDialogPrinterCheck(!showDialogPrinterCheck)}
        onOk={() => {
          if (!canCreate) {
            return toast.error(t("You don't have access"));
          }

          if (!selectedButton) {
            toast.error(t("Please select payment type"));
            return;
          }

          if (complete) {
            setCompleteWithPrint(false);
          }

          if (selectedButton == "Cash") {
            if (device?.configuration?.quickAmount) {
              setOpenCashModal(true);
            } else {
              handleComplete({
                providerName: "cash",
                cardType: "Cash",
                transactionNumber: "Cash",
                amount: Number(totalAmount.toFixed(2)),
              });
            }
          } else if (selectedButton == "Card") {
            setOpenCardModal(true);
          } else if (selectedButton === "Credit") {
            if (!navigator.onLine) {
              toast.error(t("Please connect with internet"));
              return;
            }
            setOpenCreditModal(true);
          } else {
            if (!navigator.onLine) {
              toast.error(t("Please connect with internet"));
              return;
            }
            setOpenWalletModal(true);
          }
          setShowDialogPrinterCheck(!showDialogPrinterCheck);
        }}
        okButtonText={`${t("Yes")}, ${t("Complete")}`}
        cancelButtonText={t("No")}
        title={t("Confirmation")}
        text={t(
          "The printer is not attached, do you want to complete the billing without print?"
        )}
      />
      <ConfirmationDialog
        show={showDialogOutOfStock}
        toggle={() => setShowDialogOutOfStock(!showDialogOutOfStock)}
        onOk={() => {
          if (completeBtnTap) {
            if (selectedButton) {
              handleCompleteBtn();
            }
          } else {
            handlePrint(
              device?.configuration?.defaultComplete == "with-print"
                ? false
                : true
            );
          }
          setShowDialogOutOfStock(!showDialogOutOfStock);
        }}
        okButtonText={`${t("Yes")}, ${t("Complete")}`}
        cancelButtonText={t("No")}
        title={t("Confirmation")}
        text={`${t("Some products are out of stock")}. ${t(
          "Do you want to continue?"
        )}`}
      />
    </>
  );
};
