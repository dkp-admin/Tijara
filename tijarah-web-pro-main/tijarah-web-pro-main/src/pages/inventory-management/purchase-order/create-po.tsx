import { ArrowDropDownCircleOutlined } from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckIcon from "@mui/icons-material/Check";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import ShareIcon from "@mui/icons-material/Share";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  InputAdornment,
  Link,
  Menu,
  MenuItem,
  Radio,
  Select,
  Stack,
  SvgIcon,
  Tab,
  Tabs,
  TextFieldProps,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useReactToPrint } from "react-to-print";
import serviceCaller from "src/api/serviceCaller";
import ConfirmationDialog from "src/components/confirmation-dialog";
import AddProductTextInput from "src/components/input/add-product-auto-complete";
import LocationSingleSelect from "src/components/input/location-singleSelect";
import VendorSingleSelect from "src/components/input/vendor-singleSelect";
import { SendPoReceiptModal } from "src/components/modals/po-send-receipt";
import { ReceiveModal } from "src/components/modals/purchase-order-receive-modal";
import { ProductCreateModal } from "src/components/modals/quick-create/product-create-modal";
import { VendorCreateModal } from "src/components/modals/quick-create/vendor-create-modal";
import { PropertyList } from "src/components/property-list";
import { PropertyListItem } from "src/components/property-list-item";
import { ImportProductSkuForPO } from "src/components/purchase-order/import-product-sku-for-po";
import { NotFoundSku } from "src/components/purchase-order/not-found-sku-modal";
import { PaymentModal } from "src/components/purchase-order/payment-modal";
import { PoGrnLog } from "src/components/purchase-order/po-qgrn-log";
import { PurchaseOrderAddCard } from "src/components/purchase-order/purchase-order-add-card";
import { Seo } from "src/components/seo";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import i18n from "src/i18n";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import { PO_GRN_STATUS } from "src/utils/constants";
import { Screens } from "src/utils/screens-names";
import { toFixedNumber } from "src/utils/toFixedNumber";
import useActiveTabs from "src/utils/use-active-tabs";
import * as Yup from "yup";
import POPrintReceipt from "./po-print-receipt";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import { green } from "src/theme/colors";
import { PurchaseOrderReturnTable } from "src/components/purchase-order/purchase-order-return-table";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import UpgradePackage from "src/pages/upgrade-package";
import { useCurrency } from "src/utils/useCurrency";
interface Product {
  pid: string;
  name: any;
  varient: string;
  sku: string;
  price: string;
  expiry: Date;
}

interface PurchaseOrder {
  orderType: any;
  orderNum: string;
  orderDate: Date;
  expectedDate: Date;
  vendorRef: string;
  vendor: string;
  billToRef: string;
  shipToRef: string;
  billTo: string;
  shipTo: string;
  orderStatus: string;
  discountValue: number;
  discountType: string;
  paymentStatus: boolean;
  items: any;
  message: string;
  fee: string;
  freight: string;
  total: string;
  subTotal: string;
  vatAmount: string;
  vatPercentage: string;
  discountAmount: number;
  discountPercentage: string;
  paymentBreakup: any;
  paymentamount: number;
  paymentnote: string;
  paymenttype: string;
  forceCompleted: boolean;
  vendorInvoiceNumber?: string;
}

const itemSchema = Yup.object().shape({
  productRef: Yup.string().required("Product Reference is required"),
  categoryRef: Yup.string().required("Category Reference is required"),
  sku: Yup.string().required("SKU is required"),
  name: Yup.object().shape({
    en: Yup.string().required("Name (en) is required"),
    ar: Yup.string().required("Name (ar) is required"),
  }),
  quantity: Yup.number()
    .min(1, "Must be greater than 0")
    .required("required")
    .nullable(),
  cost: Yup.number().min(0.01, "Must be greater than 0").required("required"),
  discount: Yup.number().min(0, "0 or greater").nullable(),
  vatRef: Yup.string().required("VAT % required").nullable(),
  total: Yup.number()
    .min(0, "Cannot be negative")
    .required("Total is required"),

  received: Yup.number(),
  expiry: Yup.date()
    .nullable()
    .when(["orderType", "batching"], {
      is: (orderType: string, batching: boolean) =>
        orderType === "grn" && batching,
      then: Yup.date().required("Expiry Date is required").default(null),
    }),
});

const validationSchema = Yup.object({
  items: Yup.array().of(itemSchema).required("Required"),
  shipToRef: Yup.string().required(`${i18n.t("Ship To is required")}`),
  vendorRef: Yup.string().required(`${i18n.t("Vendor is required")}`),
  orderDate: Yup.date()
    .nullable()
    .required(`${i18n.t("Order Date is required")}`),
  expectedDate: Yup.date()
    .nullable()
    .required(`${i18n.t("Expected Date is required")}`),
  totalAmount: Yup.number().min(0, "Cannot be negative"),
  message: Yup.string().max(250, "Maximum 250 character "),
});

const Page: PageType = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    id,
    newid,
    companyRef,
    companyName,
    industry,
    origin,
    isReturn,
    isSaptco,
  } = router.query;
  const { canAccessModule } = useFeatureModuleManager();
  const theme = useTheme();
  const canAccess = usePermissionManager();
  const componentRef = useRef();
  const canUpdate = canAccess(MoleculeType["po:update"]);
  const canCreate = canAccess(MoleculeType["po:create"]);
  const { changeTab } = useActiveTabs();
  const [paymentType, setPaymentType] = useState("");
  const [showError, setShowError] = useState(false);
  const [openDatePickerOrder, setOpenDatePickerOrder] = useState(false);
  const [openDatePickerExpected, setOpenDatePickerExpected] = useState(false);
  const [selectedOption, setSelectedOption] = useState("po");
  const [showDialogCustomerEvent, setShowDialogCustomerEvent] = useState(false);
  const [showDialogForceComplete, setShowDialogForceComplete] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [openReceiveModal, setOpenReceiveModal] = useState(false);
  const [openVendorCreateModal, setOpenVendorCreateModal] = useState(false);
  const [openProductCreateModal, setOpenProductCreateModal] = useState(false);
  const [dependFormik, setdependFormik] = useState(true);
  const [productloading, setProductLoading] = useState(false);
  const [openSendReceiptModal, setOpenSendReceiptModal] = useState(false);
  const [openNotFound, setOpenNotFound] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [modalPaymentOpen, setModalPaymentOpen] = useState(false);
  const [notFoundSku, setNotFoundSku] = useState([]);
  const currency = useCurrency();

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (event: any, newValue: any) => {
    setTabValue(newValue);
  };

  const { findOne, create, updateEntity, entity, loading } =
    useEntity("purchase-order");
  const { updateEntity: updatePaymentEntity } = useEntity(
    "purchase-order/partial-payment"
  );
  const {
    findOne: findVendor,
    entity: vendorData,
    loading: vendorLoading,
  } = useEntity("vendor");

  const {
    find: findlocation,
    entities: locationsData,
    refetch,
  } = useEntity("location");

  usePageView();

  const fetchData = async () => {
    if (
      (formik.values.type === "po" || formik.values.type === "grn" || newid) &&
      (formik.values.orderStatus === "open" ||
        formik.values.orderStatus === "partiallyReceived" ||
        formik.values.orderStatus === "completed") &&
      formik.values.items.length > 0
    ) {
      const itemIdsSet = new Set<string>();
      formik.values.items.forEach((item: any) => {
        if (!itemIdsSet.has(item.productRef)) {
          itemIdsSet.add(item.productRef);
        }
      });

      const hasStockConfiguration = formik.values.items.some((item: any) => {
        return item.stockConfiguration !== undefined;
      });

      let data: (typeof entity)[] = [];
      let boxData: any[] = [];

      if (!hasStockConfiguration) {
        setProductLoading(true);

        try {
          // Fetch product data for all items
          for (let id of itemIdsSet) {
            try {
              const res = await serviceCaller(`/product/${id}`, {
                method: "GET",
              });

              if (res) {
                data.push(res);
              }
            } catch (error: any) {
              toast.error("Failed to fetch product data.");
              router.back(); // Exit the function
            }
          }

          // Fetch box or crate data separately
          for (let item of formik.values.items) {
            if (item.type === "box" || item.type === "crate") {
              try {
                const res = await serviceCaller(
                  `/boxes-crates/${item.boxCrateRef}`,
                  {
                    method: "GET",
                  }
                );

                if (res) {
                  boxData.push(res);
                }
              } catch (error: any) {
                toast.error("Failed to fetch box or crate data.");
                router.back();
                return; // Exit the function
              }
            }
          }

          // If item type is crate, fetch the associated box data using boxRef
          for (let crate of boxData) {
            if (crate.type === "crate" && crate.boxRef) {
              try {
                const res = await serviceCaller(
                  `/boxes-crates/${crate.boxRef}`,
                  {
                    method: "GET",
                  }
                );

                if (res) {
                  const boxQuantity = res.qty;
                  // Set the boxQuantity in Formik
                  const itemIndex = formik.values.items.findIndex(
                    (item: any) => item.boxCrateRef === crate._id
                  );
                  if (itemIndex !== -1) {
                    formik.setFieldValue(
                      `items.${itemIndex}.boxQuantity`,
                      boxQuantity
                    );
                  }
                }
              } catch (error: any) {
                toast.error("Failed to fetch associated box data for crate.");
                router.back();
                return;
              }
            }
          }

          setProductLoading(false);
        } catch (error: any) {
          toast.error("An error occurred while fetching data.");
          router.back();
          return; // Exit the function
        }
      }

      formik.values.items.forEach((item: any, index: number) => {
        const product = data.find((entity) => entity._id === item.productRef);
        if (product) {
          if (item.type === "box" || item.type === "crate") {
            const box = boxData.find((box) => box._id === item.boxCrateRef);
            if (box) {
              formik.setFieldValue(
                `items.${index}.stockConfiguration`,
                box.stockConfiguration
              );

              const matchingVariant = product.variants.find(
                (variant: any) => variant.sku === box.productSku
              );

              if (matchingVariant) {
                formik.setFieldValue(
                  `items.${index}.productstockConfiguration`,
                  matchingVariant.stockConfiguration
                );
              }
            }
          } else {
            const matchingVariant = product.variants.find(
              (variant: any) => variant.sku === item.sku
            );
            if (matchingVariant) {
              formik.setFieldValue(
                `items.${index}.stockConfiguration`,
                matchingVariant.stockConfiguration
              );
              formik.setFieldValue(
                `items.${index}.productstockConfiguration`,
                matchingVariant.stockConfiguration
              );
            }
          }
        }
      });
    }
  };

  const totalAmount = entity?.billing?.paymentBreakup.reduce(
    (acc: any, payment: any) => {
      return acc + payment.amount;
    },
    0
  );

  const handleCardClick = (option: any) => {
    setSelectedOption(option);
    formik.setFieldValue("orderType", option);
  };

  const handleButtonClick = () => {
    setOpenReceiveModal(true);
    setdependFormik(false);
  };

  const getPrintPreview = () => {
    let vendorObj = {};
    let billToObj = {};
    let shipToObj = {};
    const locationbillToObj = locationsData?.results?.find(
      (location) => location._id === formik.values?.billToRef
    );
    const locationshipToObj = locationsData?.results?.find(
      (location) => location._id === formik.values?.shipToRef
    );

    vendorObj = {
      phone: vendorData?.phone,
      email: vendorData?.orderEmail,
    };

    billToObj = {
      address: locationbillToObj?.address,
      phone: locationbillToObj?.phone,
      email: locationbillToObj?.email,
    };

    shipToObj = {
      address: locationshipToObj?.address,
      phone: locationshipToObj?.phone,
      email: locationshipToObj?.email,
    };

    return POPrintReceipt(vendorObj, billToObj, shipToObj, entity);
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleUpdateReceive = () => {
    const { items } = formik.values;

    const pendingItems = formik.values.items.filter(
      (product: any) => product.status === PO_GRN_STATUS.PENDING
    );

    if (pendingItems?.length === items.length) {
      formik.setFieldValue("orderStatus", PO_GRN_STATUS.OPEN);
    } else {
      const completedItems = formik.values.items.filter(
        (product: any) => product.status === PO_GRN_STATUS.COMPLETED
      );

      if (items?.length === completedItems?.length) {
        formik.setFieldValue("orderStatus", PO_GRN_STATUS.COMPLETED);
      } else {
        formik.setFieldValue("orderStatus", PO_GRN_STATUS.PARTIALLY_RECEIVED);
      }
    }

    setOpenReceiveModal(false);
    formik.handleSubmit();
  };

  const handleRemoveItem = (indexToRemove: any) => {
    const updatedItems = [...formik.values.items];
    updatedItems.splice(indexToRemove, 1);
    formik.setFieldValue("items", updatedItems);
  };

  const handleDeleteCustomerEvent = () => {
    formik.setFieldValue("orderStatus", "cancelled");
    setShowDialogCustomerEvent(false);
    formik.handleSubmit();
  };

  const handleDeleteForceComplete = () => {
    formik.setFieldValue("orderStatus", "completed");
    formik.setFieldValue("forceCompleted", true);
    setShowDialogForceComplete(false);
    formik.handleSubmit();
  };
  const initialValues: PurchaseOrder = {
    orderType: "",
    orderNum: "",
    orderDate: null,
    expectedDate: null,
    vendorRef: "",
    vendor: "",
    billToRef: "",
    shipToRef: "",
    billTo: "",
    shipTo: "",
    discountValue: null,
    discountType: "percentage",
    orderStatus: "",
    items: [],
    paymentStatus: false,
    message: "",
    fee: "",
    freight: "",
    total: "",
    subTotal: "",
    vatAmount: "",
    vatPercentage: "",
    discountAmount: 0,
    discountPercentage: "",
    paymentBreakup: [],
    paymentamount: 0,
    paymentnote: "",
    paymenttype: "",
    forceCompleted: false,
    vendorInvoiceNumber: "",
  };

  const formik: any = useFormik({
    initialValues,
    validationSchema,

    onSubmit: async (values): Promise<void> => {
      if (values.orderType === "grn") {
        for (let i = 0; i < values.items.length; i++) {
          if (values.items[i].batching && !values.items[i].expiry) {
            formik.setFieldError(
              `items[${i}].expiry`,
              "Expiry Date is required"
            );
            return;
          }
        }
      }
      if (values.items.length === 0) {
        toast.error(t("Add atleast one item").toString());
      } else if (
        billing.totalAmount +
          Number(formik.values.fee || 0) +
          Number(formik.values.freight || 0) <
        0.1
      ) {
        toast.error(t("Total should not be negative or zero").toString());
      } else {
        const data = {
          orderNum: values.orderNum,
          type: selectedOption,
          companyRef: companyRef,
          company: { name: companyName },
          orderDate: new Date(values.orderDate),
          expectedDate: new Date(values.expectedDate),
          billToRef: values.billToRef || null,
          shipToRef: values.shipToRef,
          vendorRef: values.vendorRef,
          vendorInvoiceNumber: values?.vendorInvoiceNumber,
          billTo: values.billTo || {},
          shipTo: values.shipTo,
          forceCompleted: values.forceCompleted,
          vendor: { name: values.vendor },
          status: values.orderStatus,
          action: "received-grn",
          items: formik.values.items.map((item: any) => {
            const priceForShipTo = item?.prices?.find(
              (price: any) => price.locationRef === values.shipToRef
            );
            const stockForShipTo = item?.stockConfiguration?.find(
              (stock: any) => stock.locationRef === values.shipToRef
            );

            const productstockForShipTo = item?.productstockConfiguration?.find(
              (stock: any) => stock?.locationRef === values?.shipToRef
            );

            return {
              productRef: item.productRef,
              categoryRef: item.categoryRef,
              ...(item.boxCrateRef ? { boxCrateRef: item.boxCrateRef } : {}),
              ...(item.type === "crate"
                ? {
                    crateCount:
                      selectedOption === "po"
                        ? Number(item.receiveditem || 0)
                        : Number(item.quantity),
                  }
                : {}),
              ...(item.type !== "item"
                ? {
                    boxCount:
                      item.type === "box"
                        ? selectedOption === "po"
                          ? Number(item.receiveditem || 0)
                          : Number(item.quantity)
                        : selectedOption === "po"
                        ? Number(
                            Number(item.boxQuantity) *
                              Number(item.receiveditem || 0)
                          )
                        : Number(Number(item.boxQuantity) * item.quantity),
                  }
                : {}),

              ...(item.type === "crate" ? { boxSku: item.boxSku } : {}),
              category: { name: item.category.name },
              boxQuantity: item.boxQuantity,
              sku: item.sku,
              code: item.code,
              hasMultipleVariants: item.hasMultipleVariants,
              selling: priceForShipTo?.price || 0,
              expiry: item.expiry || "",
              name: {
                en: item.name.en,
                ar: item.name.ar,
              },
              variant: {
                en: item.variant.name.en,
                ar: item.variant.name.ar,
              },
              batching: item.batching,
              quantity: item.quantity * item.unitCount,
              cost: Number(item.cost),
              available:
                selectedOption === "po"
                  ? Number(item.receiveditem || 0) * Number(item.unitCount)
                  : Number(item.quantity) * Number(item.unitCount),
              ...(item.type === "item"
                ? {
                    count:
                      selectedOption === "po"
                        ? Number(stockForShipTo?.count || 0) +
                          Number(item.receiveditem || 0) *
                            Number(item.unitCount)
                        : id
                        ? Number(stockForShipTo?.count || 0) +
                          Number(item.receiveditem || 0)
                        : Number(item.quantity || 0) * Number(item.unitCount),
                  }
                : {}),
              ...(item.type !== "item"
                ? {
                    count:
                      selectedOption === "po"
                        ? Number(productstockForShipTo?.count || 0) +
                          Number(item.receiveditem || 0) *
                            Number(item.unitCount) *
                            (item.type === "box"
                              ? 1
                              : Number(item.boxQuantity || 0))
                        : id
                        ? Number(productstockForShipTo?.count || 0) +
                          (Number(stockForShipTo?.count || 0) +
                            Number(item.receiveditem || 0))
                        : Number(item.quantity || 0) *
                          Number(item.unitCount) *
                          (item.type === "box"
                            ? 1
                            : Number(item.boxQuantity || 0)),
                  }
                : {}),

              tracking: stockForShipTo?.tracking,
              discount: item.discount,
              vatRef: item.vatRef,
              type: item.type,

              unitCount: item.unitCount,
              vat: item.vat,
              vatAmount: Number(item.vatAmount),
              total: Number(item.total),
              remaining:
                selectedOption === "po"
                  ? item.quantity * item.unitCount -
                    Number(item.received * item.unitCount || 0)
                  : 0,
              received:
                selectedOption === "po"
                  ? Number(item.received * item.unitCount || 0)
                  : Number(item.quantity) * Number(item.unitCount),
              returnQty: 0,
              note: item.note || "-",
              status: item.status,
            };
          }),

          message: values?.message.trim(),
          billing: {
            ...(newid ? { paymentStatus: "unpaid" } : {}),
            ...(!newid
              ? {
                  paymentStatus: entity?.billing.total
                    ? values.paymentamount + totalAmount ===
                      entity?.billing.total
                      ? "paid"
                      : totalAmount === 0
                      ? "unpaid"
                      : "partiallyPaid"
                    : "unpaid",
                }
              : {}),
            fee: values.fee || 0,
            freight: values.freight || 0,
            paymentBreakup: newid ? [] : entity?.billing?.paymentBreakup,
            total: toFixedNumber(
              billing.totalAmount +
                Number(formik.values.fee || 0) +
                Number(formik.values.freight || 0)
            ),
            subTotal: toFixedNumber(billing.subTotal),
            vatAmount: toFixedNumber(billing.totalTax),
            vatPercentage: toFixedNumber(billing.totalTax * 100),
            discountPercentage:
              values.discountType === "percentage"
                ? Number(values.discountValue)
                : 0,
            discountAmount:
              values.discountType === "percentage"
                ? Number(billing.totalDiscount) || 0
                : Number(values.discountValue),
            discountType: values.discountType,
          },
        };

        const paymentdata = {
          amount: Number(values.paymentamount),
          note: values.paymentnote,
          providerName: values.paymenttype,
        };

        try {
          if (id) {
            await updateEntity(id?.toString(), { ...data });
            toast.success(t("Purchase order updated").toString());
          } else {
            await create({ ...data });
            toast.success(t("New order placed").toString());
          }

          if (id != null && values.paymentamount > 0) {
            await updatePaymentEntity(id?.toString(), { ...paymentdata });
          }
          if (origin == "company") {
            changeTab("inventoryManagement", Screens?.companyDetail);
          }
          setModalPaymentOpen(false);

          // localStorage.setItem("shouldReload", "true");

          router.back();
        } catch (err) {
          toast.error(err.message);
        }
      }
    },
  });

  useEffect(() => {
    if (id != null) {
      findOne(id?.toString());
    }
  }, [id]);

  useEffect(() => {
    if (id != null) {
      findOne(id?.toString());
    }
  }, [id]);

  useEffect(() => {
    formik.setFieldValue(
      "orderStatus",
      selectedOption === "po" ? "open" : "completed"
    );
  }, [selectedOption]);

  useEffect(() => {
    if (notFoundSku.length > 0) {
      setOpenNotFound(true);
    }
  }, [notFoundSku]);

  useEffect(() => {
    if (id != null && formik.values.vendorRef) {
      findVendor(formik?.values?.vendorRef);
    }
  }, [formik.values.vendorRef]);

  useEffect(() => {
    if (id != null) {
      findlocation({
        page: 0,
        limit: 50,
        _q: "",
        activeTab: "active",
        sort: "asc",
        companyRef: companyRef.toString(),
      });
    }
  }, [id]);

  useEffect(() => {
    if (dependFormik) {
      fetchData();
    }
  }, [dependFormik, formik.values.items]);

  useEffect(() => {
    if (newid != null) {
      findOne(newid?.toString());
    }
  }, [newid]);

  useEffect(() => {
    if (entity != null) {
      formik.setValues({
        orderNum: newid ? "" : entity.orderNum,
        orderDate: entity.orderDate,
        returnedFromPoRef: entity.returnedFromPoRef,
        companyRef: entity.companyRef,
        companyName: entity?.companyName?.name,
        expectedDate: entity.expectedDate,
        billToRef: entity?.billToRef || null,
        shipToRef: entity?.shipToRef,
        orderStatus: newid ? "open" : entity.status,
        type: entity.type,
        vendorRef: entity?.vendorRef,
        vendor: entity?.vendor?.name,
        billTo: entity.billTo || {},
        vendorInvoiceNumber: entity?.vendorInvoiceNumber,
        shipTo: entity.shipTo,
        forceCompleted: entity.forceCompleted,
        discountValue:
          entity.billing.discountType === "percentage"
            ? entity.billing.discountPercentage
            : entity.billing.discountValue,
        discountType: entity.billing.discountType,

        items: entity.items.map((item: any) => ({
          productRef: item.productRef,
          boxCrateRef: item.boxCrateRef || null,
          boxCrateCount: item.boxCrateCount || null,
          crateCount: item.crateCount || null,
          boxCount: item.boxCount || null,
          boxQuantity: item.boxQuantity || null,
          boxSku: item.boxSku,
          categoryRef: item.categoryRef,
          category: { name: item?.category?.name || "na" },
          sku: item.sku,
          code: item.code,
          hasMultipleVariants: item.hasMultipleVariants,
          selling: item.selling || 0,
          expiry: null as Date | null,
          batching: item.batching,
          available: newid ? 0 : item.available,
          name: {
            en: item.name.en,
            ar: item.name.ar,
          },
          variant: {
            name: {
              en: item?.variant?.en,
              ar: item?.variant?.ar,
            },
          },
          quantity: Number(item.quantity) / Number(item.unitCount),
          cost: item.cost,
          discount: item.discount,
          vatRef: item.vatRef,
          type: item.type,
          unitCount: item.unitCount,
          vat: item.vat,
          oldTotal: item.total,
          vatAmount: item.vatAmount,
          total: item.total,
          remaining: newid
            ? Number(item.quantity) / Number(item.unitCount)
            : Number(item.quantity) / Number(item.unitCount) -
              Number(item.received || 0) / item.unitCount -
              Number(item.returnQty || 0) / Number(item.unitCount),
          remainingitem: newid
            ? Number(item.quantity) / Number(item.unitCount)
            : Number(item.quantity) / Number(item.unitCount) -
              Number(item.received || 0) / item.unitCount,
          received: newid ? 0 : Number(item.received || 0) / item.unitCount,
          receivedold: newid ? 0 : Number(item.received || 0) / item.unitCount,
          returnQty: item.returnQty || 0,
          note: newid ? "-" : item.note || "-",
          status: newid ? "pending" : item.status,
        })),
        fee: entity?.billing.fee,
        freight: entity?.billing.freight,
        totalAmount:
          entity.billing.total - entity?.billing.fee - entity?.billing.freight,
        subTotal: entity.billing.subTotal,
        vatAmount: entity.billing.vatAmount,
        paymentStatus: newid
          ? false
          : entity?.billing.paymentStatus === "paid"
          ? true
          : false,
        vatPercentage: entity.billing.vatPercentage / 100,
        discountAmount: entity.discountAmount || 0,
        discountPercentage: entity.discountPercentage / 100,
        paymentamount: 0,
        paymentnote: "",
        paymenttype: "card",
        paymentBreakup: newid ? [] : entity?.billing?.paymentBreakup,
        message: entity?.message,
      });
      setSelectedOption(entity.type);
    }
  }, [entity]);

  const billing = useMemo(() => {
    const { items, discountValue, discountType } = formik.values;

    if (items?.length === 0) {
      return {
        totalQty: 0,
        totalAmount: 0,
        subTotal: 0,
        totalTax: 0,
        totalDiscount: 0,
        discountPercent: 0,
      };
    }

    let totalQty = 0;
    let totalAmount = 0;
    let subTotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    items?.forEach((item: any) => {
      totalQty += Number(item.quantity);
      totalAmount += Number(item.total);
      totalTax += Number(item.vatAmount);
      subTotal = totalAmount - totalTax;
      totalDiscount += Number(item.discount);
    });

    if (discountType === "percentage") {
      const discount = (totalAmount * Number(discountValue)) / 100;
      totalDiscount += discount;
      totalAmount -= discount;
      totalTax -= (totalTax * Number(discountValue)) / 100;
    } else {
      const disPercent = (Number(discountValue) * 100) / totalAmount;
      totalDiscount += Number(discountValue);
      totalAmount -= Number(discountValue);
      totalTax -= (totalTax * disPercent) / 100;
    }

    const discountPercent = (totalDiscount * 100) / totalAmount;

    return {
      totalQty,
      totalAmount,
      subTotal,
      totalTax,
      totalDiscount,
      discountPercent,
    };
  }, [
    formik.values.items,
    formik.values.discountValue,
    formik.values.discountType,
  ]);

  if (loading || productloading || vendorLoading) {
    return (
      <Box
        sx={{
          height: "100vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!canAccessModule("purchase_order")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["po:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo
        title={
          id != null
            ? t("Purchase Order Details")
            : t("Create New Purchase Order")
        }
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
          mb: 4,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Box sx={{ cursor: "pointer" }}>
                  <Link
                    color="textPrimary"
                    component="a"
                    sx={{
                      alignItems: "center",
                      display: "flex",
                    }}
                    onClick={() => {
                      if (origin == "company") {
                        changeTab(
                          "inventoryManagement",
                          Screens?.companyDetail
                        );
                      }
                      router.back();
                    }}
                  >
                    <ArrowBackIcon
                      fontSize="small"
                      sx={{ mr: 1, color: "#6B7280" }}
                    />
                    <Typography variant="subtitle2">
                      {t("Purchase Order")}
                    </Typography>
                  </Link>
                </Box>
              </Stack>
              {id != null && (
                <Box sx={{ display: "flex" }}>
                  <ShareIcon
                    onClick={() => {
                      setOpenSendReceiptModal(true);
                    }}
                    fontSize="medium"
                    sx={{ mr: 2, cursor: "pointer", color: "#6B7280" }}
                  />
                  <div id="printablediv">
                    <LocalPrintshopIcon
                      onClick={() => {
                        handlePrint();
                      }}
                      fontSize="medium"
                      sx={{ mr: 3, ml: 1, cursor: "pointer", color: "#6B7280" }}
                    />
                    <div style={{ display: "none" }}>
                      <div
                        ref={componentRef}
                        style={{
                          width: "100%",
                          maxWidth: "100%",
                          margin: "0",
                        }}
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: getPrintPreview(),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Box>
              )}
            </Stack>
            <Stack
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {isReturn === "true" && (
                <Box>
                  <Typography variant="h4">
                    {`${t("Return Order")} (#${formik.values.orderNum})`}
                  </Typography>
                </Box>
              )}

              {id != null && isReturn === "false" && (
                <Typography variant="h4">
                  {`${t("Purchase Order")} (#${formik.values.orderNum})`}
                </Typography>
              )}

              {id == null && isReturn === "false" && (
                <Typography variant="h4">{t("New")}</Typography>
              )}

              {(id ? entity?.status !== "return" : false) && (
                <Button
                  onClick={() => {
                    router.push({
                      pathname:
                        tijarahPaths.inventoryManagement.purchaseOrder.returnPo,
                      query: {
                        id: id,
                        companyRef: companyRef,
                        companyName: companyName,
                      },
                    });
                  }}
                  variant="contained"
                  disabled={
                    entity?.status !== "completed" &&
                    entity?.status !== "partiallyReceived"
                  }
                >
                  {t("Return")}
                </Button>
              )}
            </Stack>
            {id == null && (
              <>
                <Grid container spacing={1}>
                  <Grid item md={12} xs={12}>
                    <Typography
                      variant="body2"
                      style={{ display: "flex", gap: 5, alignItems: "center" }}
                    >
                      {t("What would you like to do today?")}
                    </Typography>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <Card
                      sx={{
                        alignItems: "center",
                        cursor: "pointer",
                        display: "flex",
                        p: 2,
                        backgroundColor:
                          selectedOption === "po"
                            ? "primary.alpha12"
                            : "transparent",
                        boxShadow:
                          selectedOption === "po"
                            ? (theme) =>
                                `${theme.palette.primary.main} 0 0 0 1px`
                            : "none",
                      }}
                      onClick={() => handleCardClick("po")}
                      variant="outlined"
                    >
                      <Stack direction="row" spacing={2}>
                        <Radio
                          color="primary"
                          checked={selectedOption === "po"}
                        />
                        <div>
                          <Typography variant="subtitle1">
                            {t("Purchase Order")}
                          </Typography>
                          <Typography color="text.secondary" variant="body2">
                            {t("po description")}
                          </Typography>
                        </div>
                      </Stack>
                    </Card>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <Card
                      sx={{
                        alignItems: "center",
                        cursor: "pointer",
                        display: "flex",
                        p: 2,
                        backgroundColor:
                          selectedOption === "grn"
                            ? "primary.alpha12"
                            : "transparent",
                        boxShadow:
                          selectedOption === "grn"
                            ? (theme) =>
                                `${theme.palette.primary.main} 0 0 0 1px`
                            : "none",
                      }}
                      onClick={() => handleCardClick("grn")}
                      variant="outlined"
                    >
                      <Stack direction="row" spacing={2}>
                        <Radio
                          color="primary"
                          checked={selectedOption === "grn"}
                        />
                        <div>
                          <Typography variant="subtitle1">
                            {t("Receive goods without purchase order")}
                          </Typography>
                          <Typography color="text.secondary" variant="body2">
                            {t("grn description")}
                          </Typography>
                        </div>
                      </Stack>
                    </Card>
                  </Grid>
                </Grid>
              </>
            )}

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4} sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Grid item container spacing={3}>
                      <Grid item md={12} xs={12}>
                        <Typography variant="h6">
                          {t("Order Information")}
                        </Typography>
                      </Grid>
                      <Grid item container spacing={3}>
                        <Grid
                          item
                          md={6}
                          xs={12}
                          alignItems="center"
                          style={{ display: "inline-flex" }}
                        >
                          <DatePicker
                            open={openDatePickerOrder}
                            onOpen={() => setOpenDatePickerOrder(true)}
                            onClose={() => setOpenDatePickerOrder(false)}
                            label={t("Order Date")}
                            inputFormat="dd/MM/yyyy"
                            disabled={id != null}
                            onChange={(date: Date | null): void => {
                              formik.setFieldValue("orderDate", date);
                              formik.setFieldValue("expectedDate", null);
                            }}
                            //{/*
                            // @ts-ignore */}
                            inputProps={{ disabled: true }}
                            maxDate={new Date()}
                            value={formik.values.orderDate}
                            renderInput={(
                              params: JSX.IntrinsicAttributes & TextFieldProps
                            ) => (
                              <TextFieldWrapper
                                required
                                fullWidth
                                onClick={() => {
                                  if (id == null) {
                                    setOpenDatePickerOrder(
                                      !openDatePickerOrder
                                    );
                                  }
                                }}
                                {...params}
                                error={Boolean(
                                  formik.touched.orderDate &&
                                    formik.errors.orderDate
                                )}
                                helperText={
                                  (formik.touched.orderDate &&
                                    formik.errors.orderDate) as any
                                }
                                onBlur={formik.handleBlur("orderDate")}
                              />
                            )}
                          />
                          <Tooltip
                            title={t("Info order date")}
                            style={{ marginLeft: "6px" }}
                          >
                            <SvgIcon color="action">
                              <InfoCircleIcon />
                            </SvgIcon>
                          </Tooltip>
                        </Grid>
                        <Grid
                          item
                          md={6}
                          xs={12}
                          alignItems="center"
                          style={{ display: "inline-flex" }}
                        >
                          <DatePicker
                            open={openDatePickerExpected}
                            onOpen={() => setOpenDatePickerExpected(true)}
                            onClose={() => setOpenDatePickerExpected(false)}
                            label={
                              selectedOption === "po"
                                ? `${t("Expected Date")}`
                                : `${t("Delivery Date")}`
                            }
                            inputFormat="dd/MM/yyyy"
                            onChange={(date: Date | null): void => {
                              formik.setFieldValue("expectedDate", date);
                            }}
                            //{/*
                            // @ts-ignore */}
                            inputProps={{ disabled: true }}
                            minDate={formik.values.orderDate}
                            value={formik.values.expectedDate}
                            disabled={!(formik.values.orderDate && !id)}
                            renderInput={(
                              params: JSX.IntrinsicAttributes & TextFieldProps
                            ) => (
                              <TextFieldWrapper
                                required
                                fullWidth
                                onClick={() => {
                                  if (id == null) {
                                    setOpenDatePickerExpected(
                                      !openDatePickerExpected
                                    );
                                  }
                                }}
                                {...params}
                                error={Boolean(
                                  formik.touched.expectedDate &&
                                    formik.errors.expectedDate
                                )}
                                helperText={
                                  (formik.touched.expectedDate &&
                                    formik.errors.expectedDate) as any
                                }
                                onBlur={formik.handleBlur("expectedDate")}
                              />
                            )}
                          />
                          <Tooltip
                            title={
                              selectedOption === "po"
                                ? `${t("Info expected date")}`
                                : `${t("Info delivery date")}`
                            }
                            style={{ marginLeft: "6px" }}
                          >
                            <SvgIcon color="action">
                              <InfoCircleIcon />
                            </SvgIcon>
                          </Tooltip>
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <VendorSingleSelect
                            showAllVendor={false}
                            companyRef={companyRef}
                            required
                            error={
                              formik?.touched?.vendorRef &&
                              formik?.errors?.vendorRef
                            }
                            onChange={(id, name) => {
                              formik.handleChange("vendorRef")(id || "");
                              formik.handleChange("vendor")(name || "");
                            }}
                            selectedId={formik?.values?.vendorRef}
                            label={t("Vendor")}
                            id="vendor"
                            disabled={id != null}
                            handleModalOpen={() => {
                              setOpenVendorCreateModal(true);
                            }}
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <LocationSingleSelect
                            showAllLocation={false}
                            companyRef={companyRef}
                            allowAll={true}
                            required={false}
                            error={
                              formik?.touched?.billToRef &&
                              formik?.errors?.billToRef
                            }
                            onChange={(id, name) => {
                              formik.handleChange("billToRef")(id || "");
                              formik.handleChange("billTo.name.en")(
                                name?.en || ""
                              );
                              formik.handleChange("billTo.name.ar")(
                                name?.ar || ""
                              );
                            }}
                            selectedId={formik?.values?.billToRef}
                            label={t("Bill To")}
                            id="billToRef"
                            disabled={id != null}
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <LocationSingleSelect
                            showAllLocation={false}
                            companyRef={companyRef}
                            required
                            error={
                              formik?.touched?.shipToRef &&
                              formik?.errors?.shipToRef
                            }
                            onChange={(id, name) => {
                              formik.handleChange("shipToRef")(id || "");
                              formik.handleChange("shipTo.name.en")(
                                name?.en || ""
                              );
                              formik.handleChange("shipTo.name.ar")(
                                name?.ar || ""
                              );
                            }}
                            selectedId={formik?.values?.shipToRef}
                            label={t("Ship To")}
                            id="shipToRef"
                            disabled={id != null}
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <TextFieldWrapper
                            onChange={formik.handleChange}
                            fullWidth
                            label="PO Discount"
                            name="discountValue"
                            value={formik.values.discountValue}
                            error={Boolean(
                              formik.touched.discountValue &&
                                formik.errors.discountValue
                            )}
                            helperText={
                              (formik.touched.discountValue &&
                                formik.errors.discountValue) as any
                            }
                            onKeyPress={(event): void => {
                              const ascii = event.charCode;
                              const value = (event.target as HTMLInputElement)
                                .value;
                              const decimalCheck = value.indexOf(".") !== -1;

                              if (decimalCheck) {
                                const decimalSplit = value.split(".");
                                const decimalLength = decimalSplit[1].length;
                                if (decimalLength > 1 || ascii === 46) {
                                  event.preventDefault();
                                } else if (ascii < 48 || ascii > 57) {
                                  event.preventDefault();
                                }
                              } else if (value.length > 9 && ascii !== 46) {
                                event.preventDefault();
                              } else if (
                                (ascii < 48 || ascii > 57) &&
                                ascii !== 46
                              ) {
                                event.preventDefault();
                              }
                            }}
                            disabled={
                              entity?.billing?.paymentStatus === "paid" ||
                              entity?.status === "return" ||
                              entity?.status === "cancelled"
                            }
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Select
                                    value={formik.values.discountType}
                                    disabled={
                                      entity?.billing?.paymentStatus ===
                                      "partiallyPaid"
                                    }
                                    onChange={(e) => {
                                      formik.handleChange(e);
                                      formik.setFieldValue(
                                        "discountType",
                                        e.target.value
                                      );
                                    }}
                                    style={{ marginRight: "-12px" }}
                                  >
                                    <MenuItem value="percentage">% </MenuItem>
                                    <MenuItem value="SAR">{currency}</MenuItem>
                                  </Select>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid item md={6} xs={12}>
                          <TextFieldWrapper
                            fullWidth
                            label={t("Fee")}
                            name="fee"
                            error={Boolean(
                              formik.touched.fee && formik.errors.fee
                            )}
                            helperText={
                              (formik.touched.fee && formik.errors.fee) as any
                            }
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (value >= 0 || e.target.value === "") {
                                formik.handleChange(e);
                              }
                            }}
                            disabled={id != null}
                            value={formik.values.fee}
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
                            placeholder="0.00"
                            onKeyPress={(event): void => {
                              const ascii = event.charCode;
                              const value = (event.target as HTMLInputElement)
                                .value;
                              const decimalCheck = value.indexOf(".") !== -1;

                              if (decimalCheck) {
                                const decimalSplit = value.split(".");
                                const decimalLength = decimalSplit[1].length;
                                if (decimalLength > 1 || ascii === 46) {
                                  event.preventDefault();
                                } else if (ascii < 48 || ascii > 57) {
                                  event.preventDefault();
                                }
                              } else if (value.length > 9 && ascii !== 46) {
                                event.preventDefault();
                              } else if (
                                (ascii < 48 || ascii > 57) &&
                                ascii !== 46
                              ) {
                                event.preventDefault();
                              }
                            }}
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <TextFieldWrapper
                            fullWidth
                            label={t("Vendor Invoice Number")}
                            name="vendorInvoiceNumber"
                            error={Boolean(
                              formik.touched.vendorInvoiceNumber &&
                                formik.errors.vendorInvoiceNumber
                            )}
                            helperText={
                              (formik.touched.vendorInvoiceNumber &&
                                formik.errors.vendorInvoiceNumber) as any
                            }
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            disabled={id != null}
                            value={formik.values.vendorInvoiceNumber}
                            placeholder="Vendor Invoice Number"
                          />
                        </Grid>

                        <Grid item md={6} xs={12}>
                          <TextFieldWrapper
                            fullWidth
                            label={t("Freight")}
                            name="freight"
                            error={Boolean(
                              formik.touched.freight && formik.errors.freight
                            )}
                            helperText={
                              (formik.touched.freight &&
                                formik.errors.freight) as any
                            }
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            disabled={id != null}
                            value={formik.values.freight}
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
                            placeholder="0.00"
                            onKeyPress={(event): void => {
                              const ascii = event.charCode;
                              const value = (event.target as HTMLInputElement)
                                .value;
                              const decimalCheck = value.indexOf(".") !== -1;

                              if (decimalCheck) {
                                const decimalSplit = value.split(".");
                                const decimalLength = decimalSplit[1].length;
                                if (decimalLength > 1 || ascii === 46) {
                                  event.preventDefault();
                                } else if (ascii < 48 || ascii > 57) {
                                  event.preventDefault();
                                }
                              } else if (value.length > 9 && ascii !== 46) {
                                event.preventDefault();
                              } else if (
                                (ascii < 48 || ascii > 57) &&
                                ascii !== 46
                              ) {
                                event.preventDefault();
                              }
                            }}
                          />
                        </Grid>
                        {isReturn === "true" && (
                          <Grid item md={6} xs={12}>
                            <TextFieldWrapper
                              fullWidth
                              label={t("Po Reference No.")}
                              name="poRefNo"
                              onChange={(e) => {
                                formik.handleChange(e);
                              }}
                              disabled
                              value={formik.values?.returnedFromPoRef || "NA"}
                            />
                          </Grid>
                        )}
                        {id != null && isReturn === "false" && (
                          <Grid item md={12} xs={12}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center",
                              }}
                            >
                              <Typography sx={{ pr: 1 }}>{` ${t(
                                `Amount: ${currency}`
                              )} ${toFixedNumber(
                                billing.totalAmount +
                                  Number(formik.values.fee || 0) +
                                  Number(formik.values.freight || 0)
                              )}, ${t(`Balance: ${currency}`)} ${toFixedNumber(
                                billing.totalAmount +
                                  Number(formik.values.fee || 0) +
                                  Number(formik.values.freight || 0) -
                                  totalAmount
                              )}`}</Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  alignItems: "center",
                                }}
                              >
                                {billing.totalAmount +
                                  Number(formik.values.fee || 0) +
                                  Number(formik.values.freight || 0) -
                                  totalAmount >
                                0 ? (
                                  <>
                                    <Button
                                      variant="outlined"
                                      onClick={handleClick}
                                      endIcon={<ArrowDropDownCircleOutlined />}
                                      disabled={
                                        entity?.status === "return" ||
                                        entity?.status === "cancelled"
                                      }
                                    >
                                      {t(" Make Payment")}
                                    </Button>
                                    <Menu
                                      anchorEl={anchorEl}
                                      open={Boolean(anchorEl)}
                                      onClose={handleClose}
                                    >
                                      <MenuItem
                                        onClick={() => {
                                          setPaymentType("partial");
                                          setModalPaymentOpen(true);
                                          handleClose();
                                        }}
                                      >
                                        {t("Make Partially Payment")}
                                      </MenuItem>
                                      {totalAmount == 0 && (
                                        <MenuItem
                                          onClick={() => {
                                            setPaymentType("full");
                                            setModalPaymentOpen(true);
                                            handleClose();
                                          }}
                                        >
                                          {t("Make Full Payment")}
                                        </MenuItem>
                                      )}
                                    </Menu>
                                  </>
                                ) : (
                                  <Button
                                    variant="outlined"
                                    endIcon={<CheckIcon />}
                                    disabled
                                  >
                                    {t("  Paid")}
                                  </Button>
                                )}
                              </Box>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    mt: 4,
                    overflow: "auto",
                  }}
                >
                  <CardContent>
                    <Grid container>
                      <Grid
                        xs={12}
                        md={12}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Stack spacing={1}>
                          <Typography variant="h6">
                            {id != null ? t("Order") : t("Add product")}
                          </Typography>
                        </Stack>
                        <Stack alignItems="center" direction="row" spacing={1}>
                          {notFoundSku.length > 0 && (
                            <Button
                              sx={{ flex: 1, py: 1.5 }}
                              color="inherit"
                              onClick={() => {
                                setOpenNotFound(true);
                              }}
                            >
                              {t("View missing product's")}
                            </Button>
                          )}
                          {!id && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                flexDirection: "row",
                              }}
                            >
                              <Link
                                target="_blank"
                                href="https://docs.google.com/spreadsheets/d/1SPuGXBsX4oO7stmTJG7L2-8Khptn7YWrhDwFd6OVVNA/edit?usp=sharing"
                                variant="body2"
                                color="InfoText"
                                sx={{ fontSize: "13px", pl: 0.5 }}
                              >
                                {t("View sample File")}
                              </Link>
                              {/* <Typography
                                  variant="body2"
                                  color="gray"
                                  sx={{ fontSize: "13px", pl: 0.5 }}
                                >
                                  {t("the sample File")}
                                </Typography> */}
                            </Box>
                          )}
                          {!id && (
                            <ImportProductSkuForPO
                              companyRef={companyRef?.toString()}
                              onProductSelect={(selectedProduct: any) => {
                                const updatedItems = [...formik.values.items];

                                selectedProduct.forEach((product: any) => {
                                  product.cost = product.price;
                                  const existingItemIndex =
                                    updatedItems.findIndex(
                                      (item: any) => item.sku === product.sku
                                    );

                                  if (existingItemIndex !== -1) {
                                    updatedItems[existingItemIndex] = product;
                                  } else {
                                    updatedItems.push(product);
                                  }
                                });

                                formik.setFieldValue("items", updatedItems);
                              }}
                              notFoundSKUsonImport={(notfoundSKu: any) => {
                                setNotFoundSku(notfoundSKu);
                              }}
                              shipToRef={formik.values.shipToRef}
                            />
                          )}
                          <Tooltip
                            title={t("PO import message")}
                            style={{ marginLeft: "6px" }}
                          >
                            <SvgIcon color="action">
                              <InfoCircleIcon />
                            </SvgIcon>
                          </Tooltip>
                        </Stack>
                      </Grid>
                      {id == null && (
                        <Grid xs={12} md={12}>
                          <Stack spacing={1}>
                            <Box sx={{ mt: 2, p: 1 }}>
                              <AddProductTextInput
                                error={
                                  formik?.touched?.products &&
                                  formik.errors.products
                                }
                                onChange={(id, name) => {
                                  formik.handleChange("productRef")(id || "");
                                  formik.handleChange("products")(name || "");
                                }}
                                onProductSelect={(selectedProduct: any) => {
                                  formik.setFieldValue("items", [
                                    ...formik.values.items,
                                    selectedProduct,
                                  ]);
                                }}
                                companyRef={companyRef?.toString()}
                                formik={formik.values.items}
                                selectedId={formik?.values?.productRef}
                                label={t("Search using Product/SKU or Box SKU")}
                                id="Products"
                                handleModalOpen={() => {
                                  setOpenProductCreateModal(true);
                                }}
                                orderType={"POGRN"}
                              />
                            </Box>
                          </Stack>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                  {isReturn === "false" && (
                    <PurchaseOrderAddCard
                      poid={id}
                      formik={formik}
                      isReturn={isReturn}
                      onRemoveItem={handleRemoveItem}
                      selectedOption={selectedOption}
                    />
                  )}
                  {isReturn === "true" && (
                    <PurchaseOrderReturnTable
                      poid={id}
                      formik={formik}
                      onRemoveItem={handleRemoveItem}
                      selectedOption={selectedOption}
                    />
                  )}
                </Card>

                <Card>
                  <CardContent>
                    <Grid item container spacing={1}>
                      <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                          <Box sx={{ mt: 1 }}>
                            <TextFieldWrapper
                              label={t("Message to Vendor")}
                              name="message"
                              multiline
                              rows={5}
                              fullWidth
                              error={Boolean(
                                formik.touched.message && formik.errors.message
                              )}
                              helperText={
                                (formik.touched.message &&
                                  formik.errors.message) as any
                              }
                              onChange={formik.handleChange}
                              value={formik.values.message}
                              disabled={
                                entity?.status === "completed" ||
                                entity?.status === "cancelled" ||
                                entity?.status === "return"
                              }
                            />
                          </Box>
                        </Stack>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <PropertyList>
                          <PropertyListItem
                            align="horizontal"
                            label={t("Item/Qty")}
                            value={` ${formik.values.items?.length} / ${billing.totalQty}`}
                            sx={{ py: 0.4, px: 3 }}
                            body2varient={true}
                          />
                          <PropertyListItem
                            align="horizontal"
                            label={t("Fee")}
                            value={`${currency} ${toFixedNumber(
                              formik.values.fee || 0
                            )}`}
                            sx={{ py: 0.4, px: 3 }}
                            body2varient={true}
                          />
                          <PropertyListItem
                            align="horizontal"
                            label={t("Freight")}
                            value={`${currency} ${toFixedNumber(
                              formik.values.freight || 0
                            )}`}
                            sx={{ py: 0.4, px: 3 }}
                            body2varient={true}
                          />
                          <PropertyListItem
                            align="horizontal"
                            label={t("Sub Total")}
                            value={`${currency} ${toFixedNumber(
                              billing.subTotal
                            )}`}
                            sx={{ py: 0.4, px: 3 }}
                            body2varient={true}
                          />
                          <PropertyListItem
                            align="horizontal"
                            label={t("Discount")}
                            value={`${currency} ${toFixedNumber(
                              billing.totalDiscount
                            )}`}
                            sx={{ py: 0.4, px: 3 }}
                            body2varient={true}
                          />
                          <PropertyListItem
                            align="horizontal"
                            divider
                            label={t("VAT")}
                            value={`${currency} ${toFixedNumber(
                              billing.totalTax
                            )}`}
                            sx={{ py: 0.4, px: 3 }}
                            body2varient={true}
                          />
                          <PropertyListItem
                            align="horizontal"
                            label={t("Total")}
                            value={`${currency} ${toFixedNumber(
                              billing.totalAmount +
                                Number(formik.values.fee || 0) +
                                Number(formik.values.freight || 0)
                            )}`}
                          />
                        </PropertyList>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Stack
                  alignItems="center"
                  direction="row"
                  justifyContent="space-between"
                  spacing={1}
                  style={{
                    marginRight: "10px",
                    marginLeft: "10px",
                  }}
                  sx={{ mx: 6 }}
                >
                  <Stack alignItems="center" direction="row" spacing={1}>
                    <Button
                      color="inherit"
                      onClick={() => {
                        if (origin == "company") {
                          changeTab(
                            "inventoryManagement",
                            Screens?.companyDetail
                          );
                        }
                        router.back();
                      }}
                    >
                      {t("Cancel")}
                    </Button>
                  </Stack>
                  <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    {id !== null &&
                      (entity?.status === "open" ||
                        entity?.status === "overdue") &&
                      !newid && (
                        <LoadingButton
                          type="submit"
                          onClick={(e) => {
                            e.preventDefault();
                            if (!canUpdate) {
                              return toast.error(t("You don't have access"));
                            }
                            setShowError(true);
                            setShowDialogCustomerEvent(true);
                          }}
                          loading={formik.isSubmitting}
                          sx={{ m: 1 }}
                          color="error"
                          variant="outlined"
                        >
                          {t("Cancel PO")}
                        </LoadingButton>
                      )}
                    {newid
                      ? ""
                      : id !== null &&
                        entity?.status === "partiallyReceived" && (
                          <LoadingButton
                            type="submit"
                            onClick={(e) => {
                              e.preventDefault();
                              if (!canUpdate) {
                                return toast.error(t("You don't have access"));
                              }
                              setShowError(true);
                              setShowDialogForceComplete(true);
                            }}
                            color="error"
                            loading={formik.isSubmitting}
                            sx={{ m: 1 }}
                          >
                            {t("Force Complete")}
                          </LoadingButton>
                        )}
                    {id &&
                      entity?.status !== "return" &&
                      entity?.status !== "cancelled" && (
                        <Button
                          variant="outlined"
                          onClick={() => {
                            if (!canUpdate) {
                              return toast.error(t("You don't have access"));
                            }
                            handleButtonClick();
                          }}
                          sx={{ m: 1 }}
                        >
                          {formik.values.orderStatus === "completed"
                            ? t("View Received")
                            : t("Receive Goods")}
                        </Button>
                      )}

                    {entity?.status !== "return" &&
                      entity?.status !== "cancelled" && (
                        <LoadingButton
                          type="submit"
                          onClick={(e) => {
                            e.preventDefault();
                            if (id != null && !canUpdate) {
                              return toast.error(t("You don't have access"));
                            } else if (!id && !canCreate) {
                              return toast.error(t("You don't have access"));
                            }

                            if (Object.keys(formik.errors).length > 0) {
                              if (formik?.errors?.items?.length > 0) {
                                const idx = formik.errors.items.findIndex(
                                  (i: any) =>
                                    i !== null && typeof i === "object"
                                );
                                if (idx !== -1) {
                                  return toast.error(
                                    t(
                                      `Please check row number ${
                                        idx + 1
                                      } for errors`
                                    )
                                  );
                                }
                              }
                              return toast.error(
                                t("Please check the form for errors")
                              );
                            }
                            setShowError(true);
                            formik.handleSubmit();
                          }}
                          loading={formik.isSubmitting}
                          sx={{ m: 1 }}
                          variant="contained"
                        >
                          {id != null
                            ? t("Update")
                            : selectedOption === "po"
                            ? t("Create")
                            : t("Receive goods")}
                        </LoadingButton>
                      )}
                  </Stack>
                </Stack>

                {openReceiveModal && (
                  <ReceiveModal
                    onSuccess={handleUpdateReceive}
                    formik={formik}
                    open={openReceiveModal}
                    handleClose={() => {
                      setOpenReceiveModal(false);
                    }}
                    selectedOption={formik.values.type}
                  />
                )}
                {openVendorCreateModal && (
                  <VendorCreateModal
                    open={openVendorCreateModal}
                    handleClose={() => {
                      setOpenVendorCreateModal(false);
                    }}
                  />
                )}
                {openProductCreateModal && (
                  <ProductCreateModal
                    isSaptco={isSaptco == "true" ? true : false}
                    open={openProductCreateModal}
                    industry={industry}
                    handleClose={() => {
                      setOpenProductCreateModal(false);
                    }}
                  />
                )}

                {showDialogCustomerEvent && (
                  <ConfirmationDialog
                    show={showDialogCustomerEvent}
                    toggle={() => {
                      setShowDialogCustomerEvent(!showDialogCustomerEvent);
                    }}
                    onOk={() => {
                      handleDeleteCustomerEvent();
                    }}
                    okButtonText={`${t("Yes")}, ${t("Cancel")}`}
                    cancelButtonText={t("Back")}
                    title={t("Confirmation")}
                    text={t(`Are you sure you want to cancel this order?`)}
                  />
                )}
                {showDialogForceComplete && (
                  <ConfirmationDialog
                    show={showDialogForceComplete}
                    toggle={() => {
                      setShowDialogForceComplete(!showDialogForceComplete);
                    }}
                    onOk={() => {
                      handleDeleteForceComplete();
                    }}
                    okButtonText={`${t("Yes")}, ${t("Complete")}`}
                    cancelButtonText={t("Cancel")}
                    title={t("Confirmation")}
                    text={t(
                      `You'll not be able to receive any remaining goods on this purchase order once you mark it as completed. Do you want to proceed?`
                    )}
                  />
                )}
                {openSendReceiptModal && (
                  <SendPoReceiptModal
                    modalData={entity}
                    open={openSendReceiptModal}
                    handleClose={() => {
                      setOpenSendReceiptModal(false);
                    }}
                  />
                )}

                {modalPaymentOpen && (
                  <PaymentModal
                    open={modalPaymentOpen}
                    handleClose={() => {
                      setModalPaymentOpen(false);
                      setPaymentType("");
                      // refetch();
                    }}
                    paymentType={paymentType}
                    total={Number(entity?.billing?.total) - totalAmount}
                    fullAmount={Number(entity?.billing?.total)}
                    ordertype={entity?.type}
                    companyRef={companyRef?.toString()}
                  />
                )}

                {openNotFound && (
                  <NotFoundSku
                    modalData={notFoundSku}
                    open={openNotFound}
                    handleClose={() => {
                      setOpenNotFound(false);
                    }}
                    handleClear={() => {
                      setOpenNotFound(false);
                      formik.setFieldValue("items", []);
                      setNotFoundSku([]);
                    }}
                  />
                )}
              </Stack>
            </form>
          </Stack>

          {id && entity?.status !== "return" && (
            <Card sx={{ mt: 3 }}>
              <Tabs
                value={tabValue}
                onChange={handleChange}
                aria-label="Log Tabs"
                sx={{ px: 1 }}
              >
                <Tab label="Action Log" />
              </Tabs>
              <Divider />

              <Box>
                {tabValue === 0 && (
                  <Box>
                    <PoGrnLog />
                  </Box>
                )}
              </Box>
            </Card>
          )}
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
