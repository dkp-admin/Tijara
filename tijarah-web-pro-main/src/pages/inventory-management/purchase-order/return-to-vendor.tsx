import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Link,
  Stack,
  SvgIcon,
  TextField,
  TextFieldProps,
  Tooltip,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import serviceCaller from "src/api/serviceCaller";
import AddReturnProductTextInput from "src/components/input/add-return-product-auto-complete";
import LocationSingleSelect from "src/components/input/location-singleSelect";
import VendorSingleSelect from "src/components/input/vendor-singleSelect";
import { PropertyList } from "src/components/property-list";
import { PropertyListItem } from "src/components/property-list-item";
import { PurchaseOrderReturnAddCard } from "src/components/purchase-order/purchase-order-return-add-card";
import { Seo } from "src/components/seo";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import i18n from "src/i18n";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import { Screens } from "src/utils/screens-names";
import { toFixedNumber } from "src/utils/toFixedNumber";
import useActiveTabs from "src/utils/use-active-tabs";
import { useCurrency } from "src/utils/useCurrency";
import * as Yup from "yup";

interface PurchaseOrder {
  orderType: any;
  orderNum: string;
  returnDate: Date;
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
  returnItems: any;
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
  returnQty: Yup.number()
    .min(1, "Must be greater than 0")
    .required("Return qty. is required")
    .test(
      "is-less-than-received",
      "Return qty. cannot exceed received qty.",
      function (value) {
        const receivedQty: number = this.resolve(Yup.ref("received"));
        return value <= receivedQty;
      }
    )
    .nullable(),
  cost: Yup.number().min(0.01, "Must be greater than 0").required("required"),
  discount: Yup.number().min(0, "0 or greater").nullable(),
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
  returnItems: Yup.array().of(itemSchema).required("Required"),
  returnDate: Yup.date()
    .nullable()
    .required(`${i18n.t("Order Date is required")}`),
  totalAmount: Yup.number().min(0, "Cannot be negative"),
  returnMessage: Yup.string().max(250, "Maximum 250 character "),
});

const Page: PageType = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id, newid, companyRef, companyName, origin } = router.query;
  const canAccess = usePermissionManager();
  const currency = useCurrency();

  usePageView();
  const { changeTab } = useActiveTabs();
  const [showError, setShowError] = useState(false);
  const [openDatePickerOrder, setOpenDatePickerOrder] = useState(false);
  const [selectedOption, setSelectedOption] = useState("po");
  const [dependFormik, setdependFormik] = useState(true);
  const [productloading, setProductLoading] = useState(false);

  usePageView();

  const { findOne, create, updateEntity, entity, loading } =
    useEntity("purchase-order");
  const {
    findOne: returnFindone,
    create: createReturn,
    updateEntity: updateReturn,
    entity: entityReturn,
    loading: loadingReturn,
  } = useEntity("purchase-order/return");

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

  const fetchData = async () => {
    console.log("fetchData call");

    if (formik.values.items.length > 0) {
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

  const handleRemoveItem = (indexToRemove: any) => {
    const updatedItems = formik.values.returnItems.filter(
      (item: any, index: any) => index !== indexToRemove
    );
    formik.setFieldValue("returnItems", updatedItems);
  };

  const totalAmount = entity?.billing?.paymentBreakup.reduce(
    (acc: any, payment: any) => {
      return acc + payment.amount;
    },
    0
  );

  const initialValues: PurchaseOrder = {
    orderType: "",
    orderNum: "",
    returnDate: null,
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
    returnItems: [],
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
  };

  const formik: any = useFormik({
    initialValues,
    validationSchema,

    onSubmit: async (values): Promise<void> => {
      if (values.orderType === "grn") {
        for (let i = 0; i < values.returnItems.length; i++) {
          if (values.returnItems[i].batching && !values.returnItems[i].expiry) {
            formik.setFieldError(
              `returnItems[${i}].expiry`,
              "Expiry Date is required"
            );
            return;
          }
        }
      }

      if (values.returnItems.length === 0) {
        toast.error(t("Add atleast one item for return").toString());
        return;
      } else if (
        billing.totalAmount +
          Number(formik.values.fee || 0) +
          Number(formik.values.freight || 0) <
        0.1
      ) {
        toast.error(t("Total should not be negative or zero").toString());
        return;
      } else {
        const data = {
          orderNum: values.orderNum,
          returnedFromPoRef: values.orderNum,
          type: selectedOption,
          companyRef: companyRef,
          companyName: { name: companyName },
          orderDate: new Date(values.returnDate),
          expectedDate: new Date(values.expectedDate),
          billToRef: values.billToRef,
          shipToRef: values.shipToRef,
          vendorRef: values.vendorRef,
          billTo: values.billTo,
          shipTo: values.shipTo,
          forceCompleted: values.forceCompleted,
          vendor: { name: values.vendor },
          status: values.orderStatus,
          action: "received-grn",
          items: values.returnItems.map((item: any) => {
            const priceForShipTo = item?.prices?.find(
              (price: any) => price.locationRef === values.shipToRef
            );
            const stockForShipTo = item?.stockConfiguration?.find(
              (stock: any) => stock.locationRef === values.shipToRef
            );

            const productstockForShipTo = item?.productstockConfiguration?.find(
              (stock: any) => stock.locationRef === values.shipToRef
            );

            return {
              productRef: item.productRef,
              categoryRef: item.categoryRef,
              ...(item.boxCrateRef ? { boxCrateRef: item.boxCrateRef } : {}),
              ...(item.type === "crate"
                ? { crateCount: Number(item.returnQty) }
                : {}),

              ...(item.type !== "item"
                ? {
                    boxCount:
                      item.type === "box"
                        ? Number(item.returnQty)
                        : Number(item.boxQuantity * item.returnQty),
                  }
                : {}),

              ...(item.type === "crate" ? { boxSku: item.boxSku } : {}),
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
                  ? Number(Number(item.returnQty) * item.unitCount || 0)
                  : Number(item.quantity) * Number(item.unitCount),
              ...(item.type === "item"
                ? {
                    count:
                      selectedOption === "po"
                        ? Number(Number(item.returnQty) * item.unitCount || 0)
                        : Number(item.returnQty) * Number(item.unitCount),
                  }
                : {}),

              ...(item.type !== "item"
                ? {
                    count:
                      Number(item.returnQty || 0) *
                      Number(item.unitCount) *
                      (item.type === "box" ? 1 : Number(item.boxQuantity || 0)),
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
                  ? Number(item.received * item.unitCount || 0) -
                    Number(Number(item.returnQty) * item.unitCount || 0)
                  : Number(item.quantity) * Number(item.unitCount),
              returnQty: Number(item.returnQty || 0),
              note: item.note || "-",
              status: item.status,
            };
          }),
          message: values?.message,
          billing: {
            paymentStatus: entity?.billing.total
              ? values.paymentamount + totalAmount === entity?.billing.total
                ? "paid"
                : totalAmount === 0
                ? "unpaid"
                : "partiallyPaid"
              : "unpaid",
            fee: values.fee || 0,
            freight: values.freight || 0,
            paymentBreakup: entity?.billing?.paymentBreakup,
            total: toFixedNumber(
              billing.totalAmount +
                Number(formik.values.fee || 0) +
                Number(formik.values.freight || 0)
            ),
            subTotal: toFixedNumber(billing.subTotal),
            vatAmount: toFixedNumber(billing.totalTax),
            vatPercentage: toFixedNumber(billing.totalTax * 100),
            discountPercentage: toFixedNumber(billing.totalTax * 100),
            discountAmount: Number(values.discountValue) || 0,
            discountType: values.discountType,
          },
        };

        try {
          const res = await serviceCaller(`/purchase-order/return/${id}`, {
            method: "POST",
            body: {
              ...data,
            },
          });
          toast.success(t("Order return placed").toString());

          router.back();
        } catch (err) {
          toast.error(err.message);
        }
      }
    },
  });

  console.log(formik, "formmiikkkkkk");

  useEffect(() => {
    if (id != null) {
      findOne(id?.toString());
    }
  }, [id]);

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
  }, [dependFormik, formik.values.returnItems]);

  useEffect(() => {
    if (entity != null) {
      formik.setValues({
        orderNum: newid ? "" : entity.orderNum,
        returnDate: null,
        companyRef: entity.companyRef,
        companyName: entity?.companyName?.name,
        billToRef: entity?.billToRef,
        shipToRef: entity?.shipToRef,
        vendorRef: entity?.vendorRef,
        vendor: entity?.vendor?.name,
        billTo: entity.billTo,
        shipTo: entity.shipTo,
        discountValue: entity.billing.discountAmount,
        discountType: entity.billing.discountType,

        items: entity.items.map((item: any) => ({
          productRef: item.productRef,
          boxCrateRef: item.boxCrateRef || null,
          boxCrateCount: item.boxCrateCount || null,
          crateCount: item.crateCount || null,
          boxCount: item.boxCount || null,
          boxSku: item.boxSku,
          categoryRef: item.categoryRef,
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
              en: item.variant?.en || "",
              ar: item.variant?.ar || "",
            },
          },
          quantity: Number(item.quantity) / Number(item.unitCount),
          cost: item.cost,
          discount: item.discount,
          vatRef: item.vatRef,
          type: item.type,
          unitCount: item.unitCount,
          vat: item.vat,
          oldTotal:
            item.total / (Number(item.quantity) / Number(item.unitCount)),
          vatAmount: 0,
          total: 0,
          remaining: newid
            ? Number(item.quantity) / Number(item.unitCount)
            : Number(item.quantity) / Number(item.unitCount) -
              Number(item.received || 0) / item.unitCount,
          remainingitem: newid
            ? Number(item.quantity) / Number(item.unitCount)
            : Number(item.quantity) / Number(item.unitCount) -
              Number(item.received || 0) / item.unitCount,
          received: newid
            ? 0
            : Number(item.received || 0) / item.unitCount -
              (item.returnQty || 0),
          receivedold: newid ? 0 : Number(item.received || 0) / item.unitCount,
          note: newid ? "-" : item.note || "-",

          status: newid ? "pending" : item.status,
        })),
        returnItems: [],
        fee: 0,
        freight: 0,
        totalAmount: 0,
        subTotal: 0,
        vatAmount: 0,
        paymentStatus: newid
          ? false
          : entity?.billing.paymentStatus === "paid"
          ? true
          : false,
        vatPercentage: 0,
        discountAmount: 0,
        discountPercentage: 0,
        paymentamount: 0,
        returnMessage: entity?.returnMessage,
      });
    }
  }, [entity]);

  const billing = useMemo(() => {
    const { returnItems, discountValue, discountType } = formik.values;

    if (returnItems?.length === 0) {
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

    returnItems?.forEach((item: any) => {
      totalQty += Number(item.returnQty);
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
    formik.values.returnItems,
    formik.values.discountValue,
    formik.values.discountType,
  ]);
  //
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
                    <Typography variant="subtitle2">{t("Back")}</Typography>
                  </Link>
                </Box>
              </Stack>
            </Stack>
            <Stack
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h4">
                {`${t("Return To Vendor")} (#${formik.values.orderNum})`}
              </Typography>
            </Stack>
            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4} sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Grid item container spacing={3}>
                      <Grid item md={12} xs={12}>
                        <Typography variant="h6">
                          {t("Return Information")}
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
                            label={t("Return Date")}
                            inputFormat="dd/MM/yyyy"
                            minDate={new Date(entity?.orderDate)}
                            onChange={(date: Date | null): void => {
                              formik.setFieldValue("returnDate", date);
                            }}
                            //{/*
                            // @ts-ignore */}
                            inputProps={{ disabled: true }}
                            value={formik.values.returnDate}
                            renderInput={(
                              params: JSX.IntrinsicAttributes & TextFieldProps
                            ) => (
                              <TextField
                                required
                                fullWidth
                                onClick={() =>
                                  setOpenDatePickerOrder(!openDatePickerOrder)
                                }
                                {...params}
                                error={Boolean(
                                  formik.touched.returnDate &&
                                    formik.errors.returnDate
                                )}
                                helperText={
                                  (formik.touched.returnDate &&
                                    formik.errors.returnDate) as any
                                }
                                onBlur={formik.handleBlur("returnDate")}
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
                            disabled
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <LocationSingleSelect
                            showAllLocation={false}
                            companyRef={companyRef}
                            required
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
                            disabled
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
                            disabled
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
                            {t("Add return product")}
                          </Typography>
                        </Stack>
                        <Stack
                          alignItems="center"
                          direction="row"
                          spacing={1}
                        ></Stack>
                      </Grid>

                      <Grid xs={12} md={12}>
                        <Stack spacing={1}>
                          <Box sx={{ mt: 2, p: 1 }}>
                            <AddReturnProductTextInput
                              error={
                                formik?.touched?.products &&
                                formik.errors.products
                              }
                              onChange={(id, name) => {
                                formik.handleChange("productRef")(id || "");
                                formik.handleChange("products")(name || "");
                              }}
                              onProductSelect={(selectedProduct: any) => {
                                // Check if returnItems is initialized, if not, initialize it as an empty array
                                const returnItems =
                                  formik.values.returnItems || [];
                                formik.setFieldValue("returnItems", [
                                  ...returnItems,
                                  selectedProduct,
                                ]);
                              }}
                              formik={formik}
                              selectedId={formik?.values?.productRef}
                              label={t("Search using Product/SKU or Box SKU")}
                              id="Products"
                            />
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>

                  <PurchaseOrderReturnAddCard
                    formik={formik}
                    onRemoveItem={handleRemoveItem}
                    selectedOption={selectedOption}
                  />
                </Card>

                <Card>
                  <CardContent>
                    <Grid item container spacing={1}>
                      <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                          <Box sx={{ mt: 1 }}>
                            <TextField
                              label={t("Message to Vendor")}
                              name="returnMessage"
                              multiline
                              rows={5}
                              fullWidth
                              error={Boolean(
                                formik.touched.returnMessage &&
                                  formik.errors.returnMessage
                              )}
                              helperText={
                                (formik.touched.returnMessage &&
                                  formik.errors.returnMessage) as any
                              }
                              onChange={formik.handleChange}
                              value={formik.values.returnMessage}
                            />
                          </Box>
                        </Stack>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <PropertyList>
                          <PropertyListItem
                            align="horizontal"
                            label={t("Item/Qty")}
                            value={` ${formik.values.returnItems?.length} / ${billing.totalQty}`}
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
                  justifyContent="end"
                  spacing={1}
                >
                  <LoadingButton
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowError(true);
                      formik.handleSubmit();
                    }}
                    loading={formik.isSubmitting}
                    sx={{ m: 1 }}
                    variant="contained"
                  >
                    {t("Return")}
                  </LoadingButton>
                </Stack>
              </Stack>
            </form>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
