import { LoadingButton } from "@mui/lab";
import {
  Card,
  Grid,
  MenuItem,
  Modal,
  Stack,
  TextField,
  TextFieldProps,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useFormik } from "formik";
import { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import VendorSingleSelect from "src/components/input/vendor-singleSelect";
import ExpirySingleSelect from "src/components/modals/variant-tabs/stocks/expire-dateSelect";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useUserType } from "src/hooks/use-user-type";
import { MoleculeType } from "src/permissionManager";
import { USER_TYPES } from "src/utils/constants";
import { toFixedNumber } from "src/utils/toFixedNumber";
import * as Yup from "yup";
import { VendorCreateModal } from "../../quick-create/vendor-create-modal";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { useCurrency } from "src/utils/useCurrency";

interface StockActionProps {
  selectedAction: any;
  open: boolean;
  handleClose: any;
  handleAddEditAction: any;
  data: any;
  selectedIndex?: any;
}

interface FeatureProps {
  productRef: string;
  productNameEn: string;
  productNameAr: string;
  company: string;
  companyRef: string;
  locationRef: string;
  location: string;
  variantNameEn: string;
  variantNameAr: string;
  variantSKU: string;
  variantType: string;
  batching: boolean;
  hasMultipleVariants: boolean;
  stockAction: string;
  selectedReceivingItem: string;
  quantityAvailDest: number;
  quantityAvailSource: number;
  item: any;
  quantity: number;
  vendorRef: string;
  sku: string;
  vendor: string;
  price: number;
  expiry: Date;
  count: number;
  sourceRef: string;
  destRef: string;
  unitCount: number;
  prevValue: number;
  available: number;
  transfer: number;
  received: number;
  receivedDest: number;
  transferDest: number;
  unitSellingPrice: number;
  unitCostPrice: number;
  availableSource: number;
  transferSource: number;
  receivedSource: number;
  receivedSourcetaken: number;
  transferSourcetaken: number;
}

const validationSchema = Yup.object({
  sourceRef: Yup.string().when("stockAction", {
    is: "transfer",
    then: Yup.string()
      .required("Source is required")
      .test(
        "check-quantity",
        "'Stock shift' count should not be more than 'From batch' count",
        function (value) {
          const { quantity, quantityAvailSource } = this.parent;
          return quantity <= quantityAvailSource;
        }
      ),
  }),

  expiry: Yup.date()
    .nullable()
    .when(["batching", "stockAction"], {
      is: (batching: any, stockAction: any) =>
        batching === true && stockAction === "received",
      then: Yup.date().nullable().required("Expiry is enabled"),
    }),
  destRef: Yup.string()
    .when(["batching", "stockAction"], {
      is: (batching: any, stockAction: any) =>
        batching === true &&
        ["damaged", "loss", "theft", "inventory-re-count"].includes(
          stockAction
        ),
      then: Yup.string().required(
        "Expiry is required when batching is enabled"
      ),
    })
    .when("stockAction", {
      is: "transfer",
      then: Yup.string()
        .required("Destination is required")
        .test(
          "notSameRef",
          "From batch and To batch cannot be the same",
          function (value) {
            const { sourceRef } = this.parent;
            return value !== sourceRef;
          }
        ),
    }),
  selectedReceivingItem: Yup.string().when("stockAction", {
    is: "received",
    then: Yup.string().required("Item is required"),
    otherwise: Yup.string().notRequired(),
  }),
  vendorRef: Yup.string().when("stockAction", {
    is: "received",
    then: Yup.string().required("Vendor is required"),
    otherwise: Yup.string().notRequired(),
  }),
  price: Yup.number().when("stockAction", {
    is: "received",
    then: Yup.number()
      .min(1, "Cost cannot be zero")
      .required("Price is required"),
  }),

  quantity: Yup.number().when("stockAction", {
    is: (value: any) =>
      ["received", "damaged", "loss", "theft", "transfer"].includes(value),
    then: Yup.number()
      .required("Stock Count is required")
      .positive("Stock Count greater then 0")
      .test(
        "maxDigits",
        "Quantity must have a maximum of 10 digits",
        (value) => {
          if (value) {
            const stringValue = String(value);
            return stringValue.length <= 10;
          }
          return true;
        }
      ),
  }),
});

const stockActionOptions = [
  { label: "Stock Received", value: "received" },
  { label: "Inventory Re-count", value: "inventory-re-count" },
  { label: "Damaged", value: "damaged" },
  { label: "Theft", value: "theft" },
  { label: "Loss", value: "loss" },
  { label: "Batch Shift", value: "transfer" },
];

export const StockAction: React.FC<StockActionProps> = ({
  selectedAction,
  open = false,
  handleClose,
  handleAddEditAction,
  data,
  selectedIndex,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { userType } = useUserType();
  const selectedCardData = data?.variantFormik?.stocks[selectedIndex];
  const theme = useTheme();
  const canAccess = usePermissionManager();
  const canUpdate =
    // canAccess(MoleculeType["product:update"]) ||
    canAccess(MoleculeType["product:manage"]);

  const selectedVariantData = data?.variantFormik;

  const resetForm = () => {
    formik.resetForm();
  };

  const [selectedStockAction, setSelectedStockAction] = useState<string | null>(
    null
  );
  const [presentStockDetail, setPresentStockDetail] = useState<
    string | number | null
  >(null);
  const [showError, setShowError] = useState(false);
  const [storePrice, setStorePrice] = useState(0);
  const currency = useCurrency();

  const [openDatePickerExpiry, setOpenDatePickerExpiry] = useState(false);
  const [openVendorCreateModal, setOpenVendorCreateModal] = useState(false);
  const newcount = Number(selectedCardData?.count);

  const filteredStockActionOptions = data.productData.enabledBatching
    ? stockActionOptions
    : stockActionOptions.filter((option) => option.value !== "transfer");

  const handleStockActionChange = (event: ChangeEvent<{ value: string }>) => {
    setSelectedStockAction(event.target.value as string);
  };

  const initialValues: FeatureProps = {
    productRef: data?.productId,
    productNameEn: data?.productData?.productNameEn,
    productNameAr: data?.productData?.productNameAr,
    companyRef: data?.productData?.companyRef,
    batching: data.productData.enabledBatching,
    hasMultipleVariants: data?.productData?.hasMultipleVariants,
    company: data?.productData?.companyName,
    locationRef: data?.variantFormik?.stocks[selectedIndex]?.locationRef,
    location: data?.variantFormik?.stocks[selectedIndex]?.location?.name,
    variantNameEn: data?.variantFormik?.variantNameEn,
    variantNameAr: data?.variantFormik?.variantNameAr,
    variantSKU: data?.variantFormik?.sku,
    variantType: data?.variantFormik?.type,
    sku: data?.variantFormik?.sku,
    stockAction: selectedStockAction,
    unitCount: 1,
    item: null,
    quantityAvailDest: null,
    quantityAvailSource: null,
    quantity: 0,
    selectedReceivingItem: "",
    unitSellingPrice: null,
    unitCostPrice: null,
    vendorRef: "",
    vendor: "",
    price: data?.variantFormik?.costPrice,
    expiry: null,
    count: 0,
    sourceRef: "",
    destRef: "",
    available: 0,
    transfer: 0,
    received: 0,
    receivedDest: null,
    transferDest: null,
    availableSource: 0,
    transferSource: 0,
    receivedSource: 0,
    receivedSourcetaken: null,
    transferSourcetaken: null,
    prevValue: 0,
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      const data = {
        productRef: values.productRef,
        product: {
          name: {
            en: values.productNameEn,
            ar: values.productNameAr,
          },
        },
        companyRef: values.companyRef,
        company: {
          name: values.company,
        },
        locationRef: values.locationRef,
        location: {
          name: values.location,
        },
        variant: {
          name: {
            en: values.variantNameEn,
            ar: values.variantNameAr,
          },
          type: values.variantType,
          unit: values.unitCount,
          qty: Number(values.quantity) * Number(values.unitCount),
          sku: values.variantSKU,
          costPrice:
            values.unitCostPrice ||
            Number(
              toFixedNumber(
                values.price /
                  (Number(values.quantity) * Number(values.unitCount))
              )
            ),
          sellingPrice: values.unitSellingPrice,
        },
        sku: values.sku,
        batching: values.batching,
        hasMultipleVariants: values.hasMultipleVariants,
        action: values.stockAction,

        expiry: values.expiry,
        vendorRef: values.vendorRef,
        vendor: {
          name: values.vendor,
        },
        price: Number(
          toFixedNumber(
            values.price / (Number(values.quantity) * Number(values.unitCount))
          )
        ),
        count: Number(values.count),

        sourceRef: values.sourceRef,
        destRef: values.destRef,
        received: values.received,
        available: values.available,
        transfer: values.transfer,
        availableSource: values.availableSource,
        transferSource: values.transferSource,
        receivedSource: values.receivedSource,
        prevValue: values.prevValue,
        previousStockCount: values.prevValue,
      };

      handleAddEditAction(data, values.count);
      setSelectedStockAction(null);
      formik.resetForm();
    },
  });

  const handleSelect = (event: any) => {
    const selectedItem = event.target.value;

    const isVariant = selectedItem === data.variantFormik.variantNameEn;
    const selectedData = isVariant
      ? data.variantFormik
      : data.variantFormik.boxes.find((box: any) => box.sku === selectedItem);

    const price =
      selectedData.type === "box"
        ? selectedData.costPrice
        : selectedData.costPrice;
    const sellingPrice =
      selectedData.type === "box"
        ? selectedData.price
        : selectedData.defaultPrice;
    const unitCount =
      selectedData.type === "box" ? Number(selectedData.unitCount) : 1;
    const variantNameEn =
      selectedData.type === "box"
        ? selectedData.name.en
        : selectedData.variantNameEn;
    const variantNameAr =
      selectedData.type === "box"
        ? selectedData.name.ar
        : selectedData.variantNameAr;

    formik.setFieldValue("variantNameEn", variantNameEn);
    formik.setFieldValue("variantNameAr", variantNameAr);
    formik.setFieldValue(
      "variantType",
      isVariant ? data.variantFormik.type : selectedData.type
    );
    formik.setFieldValue(
      "variantSKU",
      isVariant ? data.variantFormik.sku : selectedData.parentSku
    );
    formik.setFieldValue("sku", selectedData.sku);
    formik.setFieldValue("selectedReceivingItem", selectedItem);
    setStorePrice(price);
    formik.setFieldValue("unitCount", unitCount);
    formik.setFieldValue("quantity", 0);
    formik.setFieldValue(
      "unitCostPrice",
      Number((price / unitCount).toFixed(2))
    );
    formik.setFieldValue(
      "unitSellingPrice",
      Number((sellingPrice / unitCount).toFixed(2))
    );
  };

  function calculatePresentStock(
    selectedCardData: { count: number },
    quantity: number,
    selectedStockAction: string | null
  ) {
    if (!selectedCardData) {
      return null;
    }

    if (!selectedStockAction) {
      return selectedCardData.count;
    }

    const unitCount = formik.values.unitCount || 1;
    const parsedQuantity = Number(quantity);

    if (isNaN(parsedQuantity)) {
      return "Invalid count";
    }

    const count = newcount;

    if (selectedStockAction === "inventory-re-count") {
      if (formik.values.batching) {
        return count - formik.values.quantityAvailDest + parsedQuantity;
      } else {
        return quantity;
      }
    }

    if (selectedStockAction === "transfer") {
      return quantity;
    }
    if (isNaN(count)) {
      return "Invalid count";
    }

    return `${count} ${selectedStockAction === "received" ? "+" : "-"} ${
      parsedQuantity * unitCount
    } = ${
      selectedStockAction === "received"
        ? count + parsedQuantity * unitCount
        : count - parsedQuantity
    }`;
  }

  useEffect(() => {
    const newPresentStockDetail = calculatePresentStock(
      selectedCardData,
      formik.values.quantity,
      selectedStockAction
    );
    setPresentStockDetail(newPresentStockDetail);

    const unitCount = Number(formik.values?.unitCount) || 1;
    const parsedQuantity = Number(formik.values?.quantity) || 0;
    const quantityAvailSource = Number(formik.values?.quantityAvailSource) || 0;
    const quantityAvailDest = Number(formik.values?.quantityAvailDest) || 0;
    const receivedest = Number(formik.values?.receivedDest) || 0;
    const receivesource = Number(formik.values?.receivedSourcetaken) || 0;
    const prveiousValue = Number(formik.values?.prevValue);
    const transferdest = Number(formik.values?.transferDest) || 0;
    const transfersource = Number(formik.values?.transferSourcetaken) || 0;
    const cost = Number(storePrice) || 0;
    const batchingOn = formik.values.batching;
    const costPrice = data?.variantFormik?.costPrice || 0;

    const count = newcount;

    if (!isNaN(parsedQuantity) && !isNaN(count)) {
      let totalStockCount,
        totalReceived,
        totalTransfer,
        totalStockCountSource,
        totalReceivedSource,
        totalTransferSource,
        prevValue,
        availableCount,
        updatedCost;

      if (selectedStockAction === "received") {
        totalStockCount = count + parsedQuantity * unitCount;
        prevValue = totalStockCount - parsedQuantity * unitCount;
        totalReceived = parsedQuantity * unitCount;
        availableCount = parsedQuantity * unitCount;
        totalTransfer = 0;
        updatedCost = parsedQuantity * cost;
      } else if (
        selectedStockAction === "damaged" ||
        selectedStockAction === "theft" ||
        selectedStockAction === "loss"
      ) {
        totalStockCount = count - parsedQuantity;
        prevValue = totalStockCount + parsedQuantity;
        availableCount = quantityAvailDest - parsedQuantity;
        totalReceived = receivedest;
        updatedCost = parsedQuantity * costPrice;
      } else if (selectedStockAction === "transfer") {
        totalStockCount = prveiousValue;
        prevValue = prveiousValue;
        updatedCost = parsedQuantity * costPrice;
        totalTransfer = transferdest + parsedQuantity;
        totalReceived = receivedest;
        totalReceivedSource = receivesource;
        availableCount = quantityAvailDest + parsedQuantity;
        totalStockCountSource = quantityAvailSource - parsedQuantity;
        totalTransferSource = transfersource - parsedQuantity;
      } else {
        totalStockCount = batchingOn
          ? count - quantityAvailDest + parsedQuantity
          : parsedQuantity;
        prevValue = count;
        availableCount = parsedQuantity;
        totalReceived = receivedest;
        updatedCost = parsedQuantity * costPrice;
      }

      formik.setFieldValue("count", totalStockCount);
      formik.setFieldValue("prevValue", prevValue);
      formik.setFieldValue("available", availableCount);
      formik.setFieldValue("transfer", totalTransfer);
      formik.setFieldValue("received", totalReceived);
      formik.setFieldValue("receivedSource", totalReceivedSource);
      formik.setFieldValue("availableSource", totalStockCountSource);
      formik.setFieldValue("transferSource", totalTransferSource);
      formik.setFieldValue("price", updatedCost);
    }
    formik.setFieldValue("stockAction", selectedStockAction);
  }, [
    selectedCardData,
    formik.values.quantity,
    selectedStockAction,
    formik.values.destRef,
    formik.values.quantityAvailDest,
    formik.values.receivedSourcetaken,
    formik.values.receivedDest,
    formik.values.quantityAvailSource,
  ]);

  useEffect(() => {
    if (selectedCardData != null) {
      formik.setFieldValue("locationRef", selectedCardData?.locationRef || "");
      formik.setFieldValue("location", selectedCardData?.location?.name);
      formik.setFieldValue("variantNameEn", selectedVariantData?.variantNameEn);
      formik.setFieldValue("variantNameAr", selectedVariantData?.variantNameAr);
      formik.setFieldValue("variantSKU", selectedVariantData?.sku);
      formik.setFieldValue("variantType", selectedVariantData?.type);
      formik.setFieldValue("sku", selectedVariantData?.sku);
      formik.setFieldValue("price", selectedVariantData?.costPrice);
      formik.setFieldValue(
        "unitCostPrice",
        selectedVariantData?.costPrice || 0
      );
      formik.setFieldValue(
        "unitSellingPrice",
        selectedVariantData?.defaultPrice || 0
      );
    }
  }, [open, selectedCardData]);

  return (
    <>
      <Box>
        <Modal
          open={open}
          onClose={() => {
            if (!selectedStockAction) {
              setSelectedStockAction(null);
              handleClose();
              resetForm();
            }
          }}
        >
          <Card
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: {
                xs: "95vw",
                sm: "60vw",
                md: "60vw",
                lg: "60vw",
              },
              maxHeight: "90%",
              bgcolor: "background.paper",
              overflow: "inherit",
              display: "flex",
              flexDirection: "column",
              p: 4,
            }}
          >
            <Box
              style={{
                flex: "0 0 auto",
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1,
                background: theme.palette.mode !== "dark" ? `#fff` : "#111927",
                padding: "30px",
                paddingBottom: "12px",
                borderRadius: "20px",
              }}
            >
              <Box
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <XCircle
                  fontSize="small"
                  onClick={() => {
                    setSelectedStockAction(null);
                    handleClose();
                    resetForm();
                  }}
                  style={{ cursor: "pointer" }}
                />
                <Box sx={{ flex: 1, pl: "20px" }}>
                  <Typography variant="h6" style={{ textAlign: "center" }}>
                    {t("Update Stock")}
                  </Typography>
                  <Typography variant="body2" style={{ textAlign: "center" }}>
                    {`${data.productData.productNameEn}, ${data?.variantFormik?.variantNameEn}`}
                  </Typography>
                </Box>
                <LoadingButton
                  onClick={(e) => {
                    e.preventDefault();
                    setShowError(true);
                    formik.handleSubmit();
                  }}
                  loading={formik.isSubmitting}
                  sx={{ mb: 1 }}
                  disabled={!selectedStockAction}
                  variant="contained"
                  type="submit"
                >
                  {t("Done")}
                </LoadingButton>
              </Box>
            </Box>
            <Box
              style={{
                flex: "1 1 auto",
                overflowY: "scroll",
                padding: 3,
                height: "100%",
                paddingTop: "50px",
              }}
            >
              <Stack spacing={1} sx={{ mt: 2, mb: 1 }}>
                <Grid container>
                  <Grid item md={12} xs={12}>
                    <Box sx={{ p: 1 }}>
                      <TextFieldWrapper
                        select
                        fullWidth
                        label={t("Stock Action")}
                        InputLabelProps={{
                          style: {
                            zIndex: -1,
                          },
                        }}
                        name="stockAction"
                        value={selectedStockAction || ""}
                        onChange={handleStockActionChange}
                      >
                        {filteredStockActionOptions.map((action) => (
                          <MenuItem key={action.value} value={action.value}>
                            {action.label}
                          </MenuItem>
                        ))}
                      </TextFieldWrapper>
                    </Box>
                  </Grid>
                </Grid>
                {selectedStockAction === "received" && (
                  <>
                    <Grid container>
                      <Grid item md={12} xs={12}>
                        <Box sx={{ p: 1 }}>
                          <TextFieldWrapper
                            value={formik.values.selectedReceivingItem}
                            onChange={handleSelect}
                            fullWidth
                            label={t("Select the receiving item SKU")}
                            InputLabelProps={{
                              style: {
                                zIndex: -1,
                              },
                            }}
                            error={Boolean(
                              formik.touched.selectedReceivingItem &&
                                formik.errors.selectedReceivingItem
                            )}
                            helperText={
                              (formik.touched.selectedReceivingItem &&
                                formik.errors.selectedReceivingItem) as any
                            }
                            name="selectedReceivingItem"
                            id="selectedReceivingItem"
                            required={
                              formik.values.selectedReceivingItem === ""
                            }
                            select
                          >
                            {data.variantFormik.variantNameEn && (
                              <MenuItem
                                value={data.variantFormik.variantNameEn}
                              >
                                {`${data.variantFormik.variantNameEn}, ${
                                  data.variantFormik.sku
                                }${
                                  data.variantFormik.costPrice
                                    ? `, ${currency} ${data.variantFormik.costPrice}`
                                    : ""
                                }`}
                              </MenuItem>
                            )}
                            {data.variantFormik.boxes
                              .filter(
                                (box: any) =>
                                  box.parentSku === selectedVariantData.sku
                              )
                              .map((box: any, index: number) => (
                                <MenuItem key={index} value={box.sku}>
                                  {`${data.variantFormik.variantNameEn}, Box ${box.unitCount} Units , ${box.sku}, ${currency} ${box.costPrice}`}
                                </MenuItem>
                              ))}
                          </TextFieldWrapper>
                        </Box>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item md={12} xs={12}>
                        <Box sx={{ p: 1 }}>
                          <TextFieldWrapper
                            fullWidth
                            label={t("Enter the receiving SKU quantity")}
                            name="quantity"
                            required
                            InputLabelProps={{
                              style: {
                                zIndex: -1,
                              },
                            }}
                            error={Boolean(
                              formik.touched.quantity && formik.errors.quantity
                            )}
                            helperText={
                              (formik.touched.quantity &&
                                formik.errors.quantity) as any
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value) {
                                const cleanedNumber = e.target.value.replace(
                                  /\D/g,
                                  ""
                                );
                                e.target.value = cleanedNumber
                                  ? (Number(cleanedNumber) as any)
                                  : "";
                              }
                              formik.handleChange(e);
                            }}
                            value={formik.values.quantity}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item md={12} xs={12}>
                        <Box sx={{ p: 1 }}>
                          <VendorSingleSelect
                            showAllVendor={false}
                            companyRef={
                              userType == USER_TYPES.ADMIN
                                ? user.company?._id
                                : data.productData.companyRef
                            }
                            error={
                              formik?.touched?.vendorRef &&
                              formik?.errors?.vendorRef
                            }
                            required={true}
                            onChange={(id, name) => {
                              formik.handleChange("vendorRef")(id || "");
                              formik.handleChange("vendor")(name || "");
                            }}
                            selectedId={formik?.values?.vendorRef}
                            label={t("Vendor Name")}
                            id="vendor"
                            handleModalOpen={() => {
                              setOpenVendorCreateModal(true);
                            }}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item md={12} xs={12}>
                        <Box sx={{ p: 1 }}>
                          <TextFieldWrapper
                            fullWidth
                            label={t("Total cost of the receiving SKU")}
                            name="price"
                            id="price"
                            InputLabelProps={{
                              style: {
                                zIndex: -2,
                              },
                            }}
                            required
                            error={Boolean(
                              formik.touched.price && formik.errors.price
                            )}
                            helperText={
                              (formik.touched.price &&
                                formik.errors.price) as any
                            }
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            value={formik.values.price}
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
                            placeholder="0.00"
                          />
                        </Box>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item md={12} xs={12}>
                        <Box sx={{ p: 1 }}>
                          <DatePicker
                            open={openDatePickerExpiry}
                            onOpen={() => setOpenDatePickerExpiry(true)}
                            onClose={() => setOpenDatePickerExpiry(false)}
                            label={t("Expiry Date")}
                            inputFormat="dd/MM/yyyy"
                            onChange={(date: Date | null): void => {
                              formik.setFieldValue("expiry", date);
                            }}
                            //{/*
                            // @ts-ignore */}
                            inputProps={{ disabled: true }}
                            InputLabelProps={{
                              style: {
                                zIndex: -2,
                              },
                            }}
                            minDate={new Date()}
                            disablePast
                            value={formik.values.expiry}
                            renderInput={(
                              params: JSX.IntrinsicAttributes & TextFieldProps
                            ) => (
                              <TextFieldWrapper
                                required={formik.values.batching}
                                fullWidth
                                onClick={() =>
                                  setOpenDatePickerExpiry(!openDatePickerExpiry)
                                }
                                {...params}
                                error={Boolean(
                                  formik.touched.expiry && formik.errors.expiry
                                )}
                                helperText={
                                  (formik.touched.expiry &&
                                    formik.errors.expiry) as any
                                }
                                onBlur={formik.handleBlur("expiry")}
                              />
                            )}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item md={12} xs={12}>
                        <Box sx={{ p: 1 }}>
                          <TextFieldWrapper
                            type="number"
                            fullWidth
                            label={t("Per Unit Cost")}
                            name="perunitcost"
                            InputLabelProps={{
                              style: {
                                zIndex: -2,
                              },
                            }}
                            disabled
                            value={
                              toFixedNumber(
                                Number(formik.values.price) /
                                  Number(formik.values.quantity)
                              ) || 0
                            }
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </>
                )}
                {selectedStockAction === "inventory-re-count" && (
                  <>
                    <Grid container>
                      <Grid item md={12} xs={12}>
                        <Box sx={{ p: 1 }}>
                          <TextFieldWrapper
                            fullWidth
                            label={t("Recount stock")}
                            name="quantity"
                            required
                            error={Boolean(
                              formik.touched.quantity && formik.errors.quantity
                            )}
                            helperText={
                              (formik.touched.quantity &&
                                formik.errors.quantity) as any
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value) {
                                const cleanedNumber = e.target.value.replace(
                                  /\D/g,
                                  ""
                                );
                                e.target.value = cleanedNumber
                                  ? (Number(cleanedNumber) as any)
                                  : "";
                              }
                              formik.handleChange(e);
                            }}
                            onKeyDown={(event) => {
                              if (
                                event.key == "." ||
                                event.key === "+" ||
                                event.key === "-"
                              ) {
                                event.preventDefault();
                              }
                            }}
                            onKeyPress={(event): void => {
                              const ascii = event.charCode;
                              const value = (event.target as HTMLInputElement)
                                .value;
                              // const decimalCheck = value.indexOf(".") !== -1;

                              // if (decimalCheck) {
                              //   const decimalSplit = value.split(".");
                              //   const decimalLength = decimalSplit[1].length;
                              //   if (decimalLength > 1 || ascii === 46) {
                              //     event.preventDefault();
                              //   } else if (ascii < 48 || ascii > 57) {
                              //     event.preventDefault();
                              //   }
                              // } else
                              if (value.length > 5 && ascii !== 46) {
                                event.preventDefault();
                              } else if (
                                (ascii < 48 || ascii > 57) &&
                                ascii !== 46
                              ) {
                                event.preventDefault();
                              }
                            }}
                            value={formik.values.quantity}
                            inputProps={{ maxLength: 10 }}
                          />
                        </Box>
                      </Grid>
                      {formik.values.batching && (
                        <Grid item md={12} xs={12}>
                          <Box sx={{ p: 1 }}>
                            <ExpirySingleSelect
                              showAllExpiry={false}
                              companyRef={
                                userType == USER_TYPES.ADMIN
                                  ? user.company?._id
                                  : data.productData.companyRef
                              }
                              required={formik.values.batching}
                              error={
                                formik?.touched?.destRef &&
                                formik?.errors?.destRef
                              }
                              onChange={(id, expiry, available, received) => {
                                formik.handleChange("destRef")(id || "");
                                formik.setFieldValue(
                                  "quantityAvailDest",
                                  available
                                );
                                formik.setFieldValue("receivedDest", received);
                              }}
                              selectedId={formik?.values?.destRef}
                              id="expiry"
                              label={t("Select batch")}
                              sku={data.variantFormik.sku}
                              locationRef={selectedCardData?.locationRef}
                            />
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </>
                )}
                {["damaged", "theft", "loss"].includes(selectedStockAction) && (
                  <>
                    <Grid container>
                      <Grid item md={12} xs={12}>
                        <Box sx={{ p: 1 }}>
                          <TextFieldWrapper
                            fullWidth
                            label={t("Reduce stock")}
                            name="quantity"
                            required
                            error={Boolean(
                              formik.touched.quantity && formik.errors.quantity
                            )}
                            helperText={
                              (formik.touched.quantity &&
                                formik.errors.quantity) as any
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value) {
                                const cleanedNumber = e.target.value.replace(
                                  /\D/g,
                                  ""
                                );
                                e.target.value = cleanedNumber
                                  ? (Number(cleanedNumber) as any)
                                  : "";
                              }
                              formik.handleChange(e);
                            }}
                            value={formik.values.quantity}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                    {formik.values.batching && (
                      <Grid container>
                        <Grid item md={12} xs={12}>
                          <Box sx={{ p: 1 }}>
                            <ExpirySingleSelect
                              showAllExpiry={false}
                              companyRef={
                                userType == USER_TYPES.ADMIN
                                  ? user.company?._id
                                  : data.productData.companyRef
                              }
                              required={formik.values.batching}
                              error={
                                formik?.touched?.destRef &&
                                formik?.errors?.destRef
                              }
                              onChange={(id, expiry, available, received) => {
                                formik.handleChange("destRef")(id || "");
                                formik.setFieldValue(
                                  "quantityAvailDest",
                                  available
                                );
                                formik.setFieldValue("receivedDest", received);
                              }}
                              selectedId={formik?.values?.destRef}
                              id="expiry"
                              label={t("Select batch")}
                              sku={data.variantFormik.sku}
                              locationRef={selectedCardData?.locationRef}
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    )}
                  </>
                )}
                {selectedStockAction === "transfer" && (
                  <>
                    <Grid container>
                      <Grid item md={12} xs={12}>
                        <Box sx={{ p: 1 }}>
                          <TextFieldWrapper
                            fullWidth
                            label="Shift Stock"
                            name="quantity"
                            required
                            error={Boolean(
                              formik.touched.quantity && formik.errors.quantity
                            )}
                            helperText={
                              (formik.touched.quantity &&
                                formik.errors.quantity) as any
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value) {
                                const cleanedNumber = e.target.value.replace(
                                  /\D/g,
                                  ""
                                );
                                e.target.value = cleanedNumber
                                  ? (Number(cleanedNumber) as any)
                                  : "";
                              }
                              formik.handleChange(e);
                            }}
                            value={formik.values.quantity}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item md={12} xs={12}>
                        <Box sx={{ p: 1 }}>
                          <ExpirySingleSelect
                            showAllExpiry={false}
                            companyRef={
                              userType == USER_TYPES.ADMIN
                                ? user.company?._id
                                : data.productData.companyRef
                            }
                            required={data.batching}
                            error={
                              formik?.touched?.sourceRef &&
                              formik?.errors?.sourceRef
                            }
                            onChange={(
                              id,
                              expiry,
                              available,
                              received,
                              transfer
                            ) => {
                              formik.handleChange("sourceRef")(id || "");
                              formik.setFieldValue(
                                "quantityAvailSource",
                                available
                              );
                              formik.setFieldValue(
                                "receivedSourcetaken",
                                received
                              );
                              formik.setFieldValue(
                                "transferSourcetaken",
                                transfer
                              );
                            }}
                            selectedId={formik?.values?.sourceRef}
                            skip={formik.values.destRef}
                            id="sourceRef"
                            label={t("From batch")}
                            sku={data.variantFormik.sku}
                            locationRef={selectedCardData?.locationRef}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item md={12} xs={12}>
                        <Box sx={{ p: 1 }}>
                          <ExpirySingleSelect
                            showAllExpiry={false}
                            companyRef={
                              userType == USER_TYPES.ADMIN
                                ? user.company?._id
                                : data.productData.companyRef
                            }
                            required={data.batching}
                            error={
                              formik?.touched?.destRef &&
                              formik?.errors?.destRef
                            }
                            onChange={(
                              id,
                              expiry,
                              available,
                              received,
                              transfer
                            ) => {
                              formik.handleChange("destRef")(id || "");
                              formik.setFieldValue(
                                "quantityAvailDest",
                                available
                              );
                              formik.setFieldValue("receivedDest", received);
                              formik.setFieldValue("transferDest", transfer);
                            }}
                            selectedId={formik?.values?.destRef}
                            skip={formik.values.sourceRef}
                            id="destRef"
                            label={t("To batch")}
                            sku={data.variantFormik.sku}
                            locationRef={selectedCardData?.locationRef}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </>
                )}

                {selectedStockAction !== "transfer" && (
                  <Stack spacing={2} sx={{ mt: 2, mb: 1 }}>
                    <Grid container>
                      <Grid item md={12} xs={12}>
                        <Box sx={{ p: 1 }}>
                          <Typography variant="body2">
                            <TextFieldWrapper
                              fullWidth
                              label={t("Stock in hand")}
                              value={`${presentStockDetail}`}
                              disabled
                            />
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Stack>
                )}
                {selectedStockAction === "transfer" && (
                  <>
                    <Stack spacing={2} sx={{ mt: 2, mb: 1 }}>
                      <Grid container>
                        <Grid item md={12} xs={12}>
                          <Box sx={{ p: 1 }}>
                            <Typography variant="body2">
                              <TextFieldWrapper
                                fullWidth
                                label={t("Stock on hand(From Batch)")}
                                value={
                                  formik.values.quantity
                                    ? `${formik.values.quantityAvailSource} - ${
                                        formik.values.quantity
                                      } = ${
                                        formik.values.quantityAvailSource -
                                        formik.values.quantity
                                      }`
                                    : ` ${
                                        formik.values.quantityAvailSource -
                                        formik.values.quantity
                                      }`
                                }
                                disabled
                              />
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Stack>
                    <Stack spacing={2} sx={{ mt: 2, mb: 1 }}>
                      <Grid container>
                        <Grid item md={12} xs={12}>
                          <Box sx={{ p: 1 }}>
                            <Typography variant="body2">
                              <TextFieldWrapper
                                fullWidth
                                label={t("Stock on hand(To batch)")}
                                value={
                                  formik.values.quantity
                                    ? `${formik.values.quantityAvailDest} + ${
                                        formik.values.quantity
                                      } = ${
                                        Number(
                                          formik.values.quantityAvailDest
                                        ) + Number(formik.values.quantity)
                                      }`
                                    : ` ${
                                        formik.values.quantityAvailDest +
                                        formik.values.quantity
                                      }`
                                }
                                disabled
                              />
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Stack>
                  </>
                )}
              </Stack>
            </Box>
          </Card>
        </Modal>
      </Box>

      {openVendorCreateModal && (
        <VendorCreateModal
          open={openVendorCreateModal}
          handleClose={() => {
            setOpenVendorCreateModal(false);
          }}
        />
      )}
    </>
  );
};
