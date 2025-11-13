import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Link,
  Stack,
  SvgIcon,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  TextFieldProps,
  Tooltip,
  Typography,
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
import { PurchaseOrderAddCard } from "src/components/internal-transfer/internal-transfer-add-card";
import { InternalTransReceiveModal } from "src/components/modals/internal-transfer-receive-modal";
import { SendPoReceiptModal } from "src/components/modals/po-send-receipt";
import { PropertyList } from "src/components/property-list";
import { PropertyListItem } from "src/components/property-list-item";
import { Seo } from "src/components/seo";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import i18n from "src/i18n";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import { PO_GRN_STATUS } from "src/utils/constants";
import { Screens } from "src/utils/screens-names";
import { toFixedNumber } from "src/utils/toFixedNumber";
import useActiveTabs from "src/utils/use-active-tabs";
import * as Yup from "yup";
import POPrintReceipt from "./transfer-print-receipt";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import UpgradePackage from "src/pages/upgrade-package";
import LocationSkipAutoCompleteDropdown from "src/components/input/location-skip-singleSelect";
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
  billToRef: string;
  shipToRef: string;
  shipFromRef: string;
  billTo: string;
  shipTo: string;
  shipFrom: string;
  isTransfer: boolean;

  orderStatus: string;
  discountValue: string;
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
  discountAmount: string;
  discountPercentage: string;
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
  discount: Yup.number().min(0, "0 or greater"),
  total: Yup.number()
    .min(0, "Cannot be negative")
    .required("Total is required"),

  received: Yup.number(),
});

const validationSchema = Yup.object({
  items: Yup.array().of(itemSchema).required("Required"),
  shipToRef: Yup.string().required(`${i18n.t("Ship To is required")}`),
  shipFromRef: Yup.string().required(`${i18n.t("Ship From is required")}`),
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
  const { user } = useAuth();

  const { userType } = useUserType();

  const router = useRouter();
  const { id, newid, companyRef, companyName, origin } = router.query;
  const canAccess = usePermissionManager();
  const componentRef = useRef();

  const canUpdate = canAccess(MoleculeType["internal-transfer:update"]);
  const canCreate = canAccess(MoleculeType["internal-transfer:create"]);

  usePageView();
  const { changeTab } = useActiveTabs();
  const [showError, setShowError] = useState(false);
  const [openDatePickerOrder, setOpenDatePickerOrder] = useState(false);
  const [openDatePickerExpected, setOpenDatePickerExpected] = useState(false);
  const [selectedOption, setSelectedOption] = useState("transfer");
  const [itemsID, setItemsID] = useState(-1);
  const [showDialogCustomerEvent, setShowDialogCustomerEvent] = useState(false);
  const [showDialogForceComplete, setShowDialogForceComplete] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [openReceiveModal, setOpenReceiveModal] = useState(false);
  const [dependFormik, setdependFormik] = useState(true);
  const [productloading, setProductLoading] = useState(false);
  const [openSendReceiptModal, setOpenSendReceiptModal] = useState(false);
  const { canAccessModule } = useFeatureModuleManager();
  const lng = localStorage.getItem("currentLanguage");

  usePageView();

  const { findOne, create, updateEntity, entity, loading } =
    useEntity("internal-transfer");
  const currency = useCurrency();

  const { find: findlocation, entities: locationsData } = useEntity("location");

  const fetchData = async () => {
    console.log("fetchData call");

    if (
      formik.values.isTransfer &&
      (formik.values.orderStatus === "open" ||
        formik.values.orderStatus === "partiallyReceived") &&
      formik.values.items.length > 0
    ) {
      console.log("fetchData in");
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
              console.log("error", error);
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
                  console.log("Box data from API", res);
                }
              } catch (error: any) {
                console.log("error", error);
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
                  console.log("Box data from API for crate", res);
                }
              } catch (error: any) {
                console.log("error", error);
                toast.error("Failed to fetch associated box data for crate.");
                router.back();
                return; // Exit the function
              }
            }
          }

          setProductLoading(false);
        } catch (error: any) {
          console.log("error", error);
          toast.error("An error occurred while fetching data.");
          router.back();
          return; // Exit the function
        }
      }
      console.log("fetchData mid", data, boxData);

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
              console.log(matchingVariant, "matchingVariant");
              console.log(box, "box");

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
            console.log("fetchData elseeeeeeeeeeeeeeeeeeeeeee");
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
          console.log("fetchData out");
        }
      });
    }
  };

  const handleButtonClick = () => {
    setOpenReceiveModal(true);
    setdependFormik(false);
  };

  const getPrintPreview = () => {
    let billToObj = {};
    let shipToObj = {};
    const locationbillToObj = locationsData?.results?.find(
      (location) => location._id === formik.values?.billToRef
    );
    const locationshipToObj = locationsData?.results?.find(
      (location) => location._id === formik.values?.shipToRef
    );

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

    return POPrintReceipt(billToObj, shipToObj, entity);
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
    const updatedItems = formik.values.items.filter(
      (item: any, index: any) => index !== indexToRemove
    );
    formik.setFieldValue("items", updatedItems);
  };

  const handleDeleteCustomerEvent = () => {
    formik.setFieldValue("orderStatus", "cancelled");
    setShowDialogCustomerEvent(false);
    formik.handleSubmit();
  };

  const handleAcceptCustomerEvent = () => {
    formik.setFieldValue("orderStatus", "open");
    // setSelectedOption("transfer");
    formik.setFieldValue("isTransfer", true);
    formik.handleSubmit();
  };

  const handleDeleteForceComplete = () => {
    formik.setFieldValue("orderStatus", "completed");
    setShowDialogForceComplete(false);
    formik.handleSubmit();
  };
  const initialValues: PurchaseOrder = {
    orderType: "",
    orderNum: "",
    orderDate: null,
    expectedDate: null,
    isTransfer: true,

    billToRef: "",
    shipToRef: "",
    shipFromRef: "",
    billTo: "",
    shipTo: "",
    shipFrom: "",
    discountValue: "",
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
    discountAmount: "",
    discountPercentage: "",
  };

  const formik: any = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      if (id && entity.isTransfer) {
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

      if (!id) {
        let showError = false;
        let name = "";

        formik.values.items.forEach((item: any) => {
          const matchingLocation = item.stockConfiguration.find(
            (config: any) => config.locationRef === formik.values.shipFromRef
          );

          if (item.quantity > matchingLocation.count) {
            showError = true;
            name = item.name.en;
            return;
          }
        });

        if (showError) {
          toast.error(`Item ${name} stock count is low `);
          return;
        }
      }

      console.log("dsdsd");

      if (values.items.length === 0) {
        toast.error(t("Add atleast one item").toString());
      } else if (
        billing.totalAmount +
          Number(formik.values.fee || 0) +
          Number(formik.values.freight || 0) <
        0.1
      ) {
        toast.error(t("Total should not be negative or zero").toString());
      } else if (
        userType !== "app:admin" &&
        userType !== "app:super-admin" &&
        user.locationRef !== values.shipToRef &&
        user.locationRef !== values.shipFromRef
      ) {
        toast.error(
          t("You don't have access to selected locations").toString()
        );
      } else {
        const data = {
          orderNum: values.orderNum,
          orderType: selectedOption,
          companyRef: companyRef,
          companyName: { name: companyName },
          orderDate: new Date(values.orderDate),
          expectedDate: new Date(values.expectedDate),
          shipToRef: values.shipToRef,
          shipFromRef: values.shipFromRef,
          shipTo: values.shipTo,
          shipFrom: values.shipFrom,
          deliveryStatus: values.orderStatus,
          action: "stock-transfer",
          isTransfer: values.isTransfer,

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
              ...(item.boxCrateRef ? { boxCrateRef: item.boxCrateRef } : {}),
              ...(item.type === "crate"
                ? {
                    crateCount: Number(item.quantity),
                  }
                : {}),
              ...(item.type !== "item"
                ? {
                    boxCount:
                      item.type === "box"
                        ? Number(item.quantity)
                        : Number(Number(item.boxQuantity) * item.quantity),
                  }
                : {}),

              ...(item.type === "crate" ? { boxSku: item.boxSku } : {}),
              boxQuantity: item.boxQuantity,
              categoryRef: item.categoryRef,
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
                Number(item.receiveditem || 0) * Number(item.unitCount),

              count:
                Number(stockForShipTo?.count || 0) +
                Number(item.receiveditem || 0) * Number(item.unitCount),
              tracking: stockForShipTo?.tracking,
              discount: item.discount,
              vatRef: item.vatRef,
              type: item.type,
              unitCount: item.unitCount,
              vat: item.vat,
              vatAmount: Number(item.vatAmount),
              total: Number(item.total),
              remaining: values.isTransfer
                ? item.quantity * item.unitCount -
                  Number(item.received * item.unitCount || 0)
                : 0,
              received: values.isTransfer
                ? Number(item.received * item.unitCount || 0)
                : 0,
              receiving:
                Number(item.receiveditem || 0) * Number(item.unitCount),
              note: item.note || "-",
              status: item.status,
            };
          }),

          vendorMessage: values?.message,
          billing: {
            fee: values.fee || 0,
            freight: values.freight || 0,
            total: toFixedNumber(
              billing.totalAmount +
                Number(formik.values.fee || 0) +
                Number(formik.values.freight || 0)
            ),
            subTotal: toFixedNumber(billing.subTotal),
            vatAmount: toFixedNumber(billing.totalTax),
            vatPercentage: toFixedNumber(billing.totalTax * 100),
          },
        };

        try {
          if (id) {
            await updateEntity(id?.toString(), { ...data });
            toast.success(t("Order updated").toString());
          } else {
            await create({ ...data });
            toast.success(t("New order placed").toString());
          }
          if (origin == "company") {
            changeTab("inventoryManagement", Screens?.companyDetail);
          }

          router.back();
        } catch (err) {
          toast.error(err.message);
        }
      }
    },
  });

  useEffect(() => {
    if (id == null) {
      setSelectedOption(
        formik.values?.shipFromRef !== user?.locationRef
          ? "request"
          : "transfer"
      );
      formik.setFieldValue(
        "orderStatus",
        formik.values?.shipFromRef !== user?.locationRef ? "pending" : "open"
      );
      formik.setFieldValue(
        "isTransfer",
        formik.values?.shipFromRef !== user?.locationRef ? false : true
      );
    }
  }, [formik.values?.shipFromRef]);

  useEffect(() => {
    if (id == null) {
      if (userType === "app:admin" || userType === "app:super-admin") {
        setSelectedOption("transfer");
        formik.setFieldValue("orderStatus", "open");
        formik.setFieldValue("isTransfer", true);
      } else {
        setSelectedOption(
          formik.values?.shipFromRef !== user?.locationRef
            ? "request"
            : "transfer"
        );
        formik.setFieldValue(
          "orderStatus",
          formik.values?.shipFromRef !== user?.locationRef ? "pending" : "open"
        );
        formik.setFieldValue(
          "isTransfer",
          formik.values?.shipFromRef !== user?.locationRef ? false : true
        );
      }
    }
  }, [formik.values?.shipFromRef, userType]);

  useEffect(() => {
    if (id != null) {
      findOne(id?.toString());
    }
  }, [id]);

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
    if (!id) {
      formik.setFieldValue("items", []);
    }
  }, [formik.values.shipFromRef]);

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
        orderNum: entity.orderNum,
        orderDate: entity.orderDate,
        companyRef: entity.companyRef,
        companyName: entity?.companyName?.name,
        expectedDate: entity.expectedDate,
        billToRef: entity?.billToRef,
        shipToRef: entity?.shipToRef,
        shipFromRef: entity?.shipFromRef,
        orderStatus: entity.deliveryStatus,
        orderType: entity.orderType,
        billTo: entity.billTo,
        shipTo: entity.shipTo,
        shipFrom: entity.shipFrom,
        discountValue: entity.billing?.discountAmount,
        discountType: entity.billing?.discountType,

        items: entity.items.map((item: any) => ({
          productRef: item.productRef,
          boxCrateRef: item.boxCrateRef || null,
          boxCrateCount: item.boxCrateCount || null,
          crateCount: item.crateCount || null,
          boxCount: item.boxCount || null,
          boxQuantity: item.boxQuantity || null,
          boxSku: item.boxSku,
          categoryRef: item.categoryRef,
          sku: item.sku,
          code: item.code,
          hasMultipleVariants: item.hasMultipleVariants,
          selling: item.selling || 0,
          expiry: null as Date | null,
          batching: item.batching,
          available: item.available,
          name: {
            en: item.name.en,
            ar: item.name.ar,
          },
          variant: {
            name: {
              en: item.variant.en,
              ar: item.variant.ar,
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
          remaining:
            Number(item.quantity) / Number(item.unitCount) -
            Number(item.received || 0) / item.unitCount,
          remainingitem:
            Number(item.quantity) / Number(item.unitCount) -
            Number(item.received || 0) / item.unitCount,
          received: Number(item.received || 0) / item.unitCount,
          receiving: Number(0),
          receivedold: Number(item.received || 0) / item.unitCount,
          note: item.note || "-",
          status: item.status,
        })),
        fee: entity?.billing?.fee,
        freight: entity?.billing?.freight,
        totalAmount:
          entity.billing?.total -
          entity?.billing?.fee -
          entity?.billing?.freight,
        subTotal: entity.billing?.subTotal,
        vatAmount: entity.billing?.vatAmount,
        paymentStatus: entity?.billing?.paymentStatus === "paid" ? true : false,
        vatPercentage: entity.billing?.vatPercentage / 100,
        discountAmount: entity.discountAmount,
        discountPercentage: entity.discountPercentage / 100,

        message: entity?.vendorMessage,
        isTransfer: entity?.isTransfer,
      });
      setSelectedOption(entity?.orderType);
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

  if (loading || productloading) {
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

  if (!canAccessModule("internal_transfer")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["po:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo
        title={id != null ? t("Transfer Details") : t("Create New Transfer")}
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
                      {t("Internal Transfer")}
                    </Typography>
                  </Link>
                </Box>
              </Stack>
            </Stack>
            <Stack>
              <Typography variant="h4">
                {id != null
                  ? `${t("Internal Transfer")} (#${formik.values.orderNum})`
                  : t("New")}
              </Typography>
            </Stack>

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
                                onClick={() =>
                                  setOpenDatePickerOrder(!openDatePickerOrder)
                                }
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
                            label={t("Expected Date")}
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
                                onClick={() =>
                                  setOpenDatePickerExpected(
                                    !openDatePickerExpected
                                  )
                                }
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
                              formik.values?.isTransfer
                                ? `${t(
                                    "The date on which the transfer is made"
                                  )}`
                                : `${t(
                                    "The date on which the transfer is made"
                                  )}`
                            }
                            style={{ marginLeft: "6px" }}
                          >
                            <SvgIcon color="action">
                              <InfoCircleIcon />
                            </SvgIcon>
                          </Tooltip>
                        </Grid>

                        <Grid item md={6} xs={12}>
                          <LocationSkipAutoCompleteDropdown
                            allowAll={true}
                            showAllLocation={false}
                            companyRef={companyRef}
                            required
                            error={
                              formik?.touched?.shipFromRef &&
                              formik?.errors?.shipFromRef
                            }
                            onChange={(id, name) => {
                              formik.handleChange("shipFromRef")(id || "");
                              formik.handleChange("shipFrom.name.en")(
                                name?.en || ""
                              );
                              formik.handleChange("shipFrom.name.ar")(
                                name?.ar || ""
                              );
                            }}
                            selectedId={formik?.values?.shipFromRef}
                            skip={formik.values.shipToRef}
                            label={t("Ship From")}
                            id="shipFromRef"
                            disabled={id != null}
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <LocationSkipAutoCompleteDropdown
                            allowAll={true}
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
                            skip={formik.values.shipFromRef}
                            label={t("Ship To")}
                            id="shipToRef"
                            disabled={id != null}
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <TextFieldWrapper
                            type="number"
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
                          />
                        </Grid>

                        <Grid item md={6} xs={12}>
                          <TextFieldWrapper
                            type="number"
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
                          />
                        </Grid>
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
                      <Grid xs={12} md={12}>
                        <Stack
                          spacing={1}
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="h6">
                            {id != null ? t("Order") : t("Add product")}
                          </Typography>
                          {!id && (
                            <Tooltip
                              title={t(
                                "To enable add product first select Ship from Location"
                              )}
                              style={{ marginLeft: "6px", maxWidth: "50px" }}
                            >
                              <SvgIcon color="action">
                                <InfoCircleIcon />
                              </SvgIcon>
                            </Tooltip>
                          )}
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
                                selectedLocationFrom={{
                                  locationRef: formik?.values?.shipFromRef,
                                  location: formik?.values?.shipFrom,
                                }}
                                label={t("Search using Product/SKU or Box SKU")}
                                disabled={
                                  !formik.values.shipFromRef ||
                                  !formik.values.shipToRef
                                }
                                id="Products"
                                userType={userType}
                                orderType="Internal"
                              />
                            </Box>
                          </Stack>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>

                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t("Product")}</TableCell>
                        {selectedOption === "grn" && (
                          <TableCell>{t("Expiry")}</TableCell>
                        )}
                        <TableCell>{t("Quantity")}</TableCell>
                        {!id && <TableCell>{t("Available Count")}</TableCell>}
                        <TableCell>{t("Unit Cost Excluding VAT")}</TableCell>
                        <TableCell>{t("VAT Amount")}</TableCell>

                        <TableCell>{t("Estimated  Total")}</TableCell>
                        {(id == null || !entity?.isTransfer) && (
                          <TableCell>{t("Action")}</TableCell>
                        )}
                      </TableRow>
                    </TableHead>

                    <PurchaseOrderAddCard
                      setItemsID={setItemsID}
                      products={selectedProducts}
                      poid={id}
                      formik={formik}
                      onRemoveItem={handleRemoveItem}
                      selectedOption={entity?.isTransfer}
                      selectedLocationFrom={formik.values?.shipFromRef}
                    />
                  </Table>
                </Card>

                <Card>
                  <CardContent>
                    <Grid item container spacing={1}>
                      <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                          <Box sx={{ mt: 1 }}>
                            <TextFieldWrapper
                              label={t("Message")}
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
                      (entity?.deliveryStatus === "open" ||
                        entity?.deliveryStatus === "overdue" ||
                        entity?.deliveryStatus === "pending") &&
                      !newid &&
                      (user.locationRef === formik.values.shipToRef ||
                      user.locationRef === formik.values.shipFromRef ||
                      userType === "app:admin" ||
                      userType === "app:super-admin" ? (
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
                          {formik.values?.isTransfer
                            ? t("Cancel Transfer")
                            : t("Cancel Request")}
                        </LoadingButton>
                      ) : (
                        ""
                      ))}
                    {id !== null &&
                      entity?.deliveryStatus === "partiallyReceived" &&
                      (user.locationRef === formik.values.shipToRef ||
                      user.locationRef === formik.values.shipFromRef ||
                      userType === "app:admin" ||
                      userType === "app:super-admin" ? (
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
                      ) : (
                        ""
                      ))}
                    {id &&
                      entity?.deliveryStatus !== "cancelled" &&
                      entity?.deliveryStatus !== "pending" && (
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
                            : userType === "app:admin" ||
                              userType === "app:super-admin" ||
                              user.locationRef === formik.values.shipToRef
                            ? t("Receive Goods")
                            : t("View Received")}
                        </Button>
                      )}

                    {id &&
                      entity?.deliveryStatus !== "cancelled" &&
                      !newid &&
                      (user.locationRef === formik.values.shipFromRef ||
                      userType === "app:admin" ||
                      userType === "app:super-admin" ? (
                        <LoadingButton
                          type="submit"
                          onClick={(e) => {
                            if (entity?.deliveryStatus === "pending") {
                              handleAcceptCustomerEvent();
                            } else {
                              e.preventDefault();

                              setShowError(true);
                              formik.handleSubmit();
                            }
                          }}
                          loading={formik.isSubmitting}
                          sx={{ m: 1 }}
                          variant="contained"
                        >
                          {formik.values?.isTransfer
                            ? t("Update")
                            : t("Accept")}
                        </LoadingButton>
                      ) : (
                        ""
                      ))}

                    {!id && !newid && (
                      <LoadingButton
                        type="submit"
                        onClick={(e) => {
                          if (entity?.deliveryStatus === "pending") {
                            handleAcceptCustomerEvent();
                          } else {
                            e.preventDefault();
                            if (id != null && !canUpdate) {
                              return toast.error(t("You don't have access"));
                            } else if (!id && !canCreate) {
                              return toast.error(t("You don't have access"));
                            }
                            setShowError(true);
                            formik.handleSubmit();
                          }
                        }}
                        loading={formik.isSubmitting}
                        sx={{ m: 1 }}
                        variant="contained"
                      >
                        {formik.values?.isTransfer ||
                        userType === "app:admin" ||
                        userType === "app:super-admin"
                          ? t("Transfer")
                          : t("Request")}
                      </LoadingButton>
                    )}

                    {newid && (
                      <LoadingButton
                        type="submit"
                        onClick={(e) => {
                          e.preventDefault();
                          if (!canUpdate) {
                            return toast.error(t("You don't have access"));
                          }
                          setShowError(true);
                          formik.handleSubmit();
                        }}
                        loading={formik.isSubmitting}
                        sx={{ m: 1 }}
                        variant="contained"
                      >
                        {t("Duplicate")}
                      </LoadingButton>
                    )}
                  </Stack>
                </Stack>

                <InternalTransReceiveModal
                  onSuccess={handleUpdateReceive}
                  formik={formik}
                  open={openReceiveModal}
                  handleClose={() => {
                    setOpenReceiveModal(false);
                  }}
                  matchLocation={
                    user?.locationRef === formik.values.shipToRef ? true : false
                  }
                  selectedOption={formik.values.isTransfer}
                  userType={userType}
                />

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
                    `You'll not be able to receive any remaining goods on this transfer once you mark it as completed. Do you want to proceed?`
                  )}
                />
                <SendPoReceiptModal
                  modalData={entity}
                  open={openSendReceiptModal}
                  handleClose={() => {
                    setOpenSendReceiptModal(false);
                  }}
                />
              </Stack>
            </form>
          </Stack>
          <Stack>{/* <PoGrnLog /> */}</Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
