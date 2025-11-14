import { ArrowRight } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { FormikProps, useFormik } from "formik";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import endpoint from "src/api/endpoints";
import serviceCaller from "src/api/serviceCaller";
import { AttachmentDropzone } from "src/components/attachment-dropzone";
import { ImageCropModal } from "src/components/modals/image-crop-modal";
import ChangePricingModal from "src/components/modals/pricing-modal";
import { StyledCurrencyFormatter } from "src/components/styled-currency-formatter";
import { useAuth } from "src/hooks/use-auth";
import i18n from "src/i18n";
import { LanguageSwitch } from "src/layouts/dashboard/language-switch";
import { gtm } from "src/libs/gtm";
import { tijarahPaths } from "src/paths";
import { DropdownOptions } from "src/types/dropdown";
import { getUploadedDocName } from "src/utils/get-uploaded-file-name";
import { toFixedNumber } from "src/utils/toFixedNumber";
import upload, { FileUploadNamespace } from "src/utils/uploadToS3";
import * as Yup from "yup";
import usePackageStore from "./package";
import useSubscriptionStore from "./subscriptionData";
import { useCurrency } from "src/utils/useCurrency";
import { useSubscription } from "src/hooks/use-subscription";

interface AddonPrice {
  type: string;
  price: number;
  discountPercentage: number;
}

interface Addon {
  key: string;
  name: string;
  qty?: number;
  prices: AddonPrice[];
}

const paymentOptions: DropdownOptions[] = [
  { label: i18n.t("Cash"), value: "cash" },
  { label: i18n.t("Card"), value: "card" },
  { label: i18n.t("Account Transfer"), value: "accountTransfer" },
];

interface MakePaymentProps {
  transactionId: string;
  paymentType: string;
  note: string;
  paymentProofFile: any[];
  paymentProofUrl: string;
  paymentMethod: string;
  referral: string;
  salesPerson: string;
  isTrial: boolean;
}

const validationSchema = Yup.object({
  paymentMethod: Yup.string().when("isTrial", {
    is: false,
    then: Yup.string().required(i18n.t("Select a payment method")),
  }),
  transactionId: Yup.string().max(
    40,
    i18n.t(
      "Reference No. / Transaction ID must not be greater than 40 characters"
    )
  ),
  salesPerson: Yup.string().max(
    60,
    i18n.t("Sales person name must not be greater than 60 characters")
  ),
  note: Yup.string().max(
    70,
    i18n.t("Note must not be greater than 70 characters")
  ),
});

const MakePayment: NextPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const currency = useCurrency();
  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [openCropModal, setOpenCropModal] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [openPlanModal, setOpenPlanModal] = useState(false);
  const { selectedPlan } = usePackageStore() as any;
  const { setSubscriptionData } = useSubscriptionStore() as any;
  const subscription = useSubscription();
  // const [discountApplied, setDiscountApplied] = useState(false);
  // const [newSubtotal, setNewSubtotal] = useState<number>();
  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const getPriceInfo = (
    pricesArray: any[],
    billingCycle: "monthly" | "quarterly" | "annually"
  ) => {
    const priceObj = pricesArray?.find((p: any) => p.type === billingCycle);
    if (!priceObj) return { originalPrice: 0, discountedPrice: 0 };
    const originalPrice = priceObj.price;
    const discountedPrice =
      originalPrice * (1 - (priceObj.discountPercentage || 0) / 100);

    return { originalPrice, discountedPrice };
  };

  const packagePriceInfo = getPriceInfo(
    selectedPlan?.prices,
    selectedPlan?.billingCycle
  );
  const packagePrice = packagePriceInfo.discountedPrice;

  const getAddonsTotal = () => {
    return (
      selectedPlan?.addons?.reduce((total: number, addon: Addon) => {
        if (addon.key === "location_addon") {
          const adp = getPriceInfo(addon.prices, selectedPlan?.billingCycle);
          return total + adp.discountedPrice * addon.qty;
        }

        if (addon.key === "device_addon") {
          const adp = getPriceInfo(addon.prices, selectedPlan?.billingCycle);
          return total + adp.discountedPrice * addon.qty;
        }

        const addonPriceInfo = getPriceInfo(
          addon.prices,
          selectedPlan?.billingCycle
        );
        return total + addonPriceInfo.discountedPrice;
      }, 0) || 0
    );
  };

  const getHardwareTotal = () => {
    return (
      selectedPlan?.hardwares?.reduce(
        (total: number, hardware: any) =>
          total + hardware.price * (hardware.qty || 1),
        0
      ) || 0
    );
  };

  const getSubtotal = () => {
    return Number(packagePrice) + getAddonsTotal() + getHardwareTotal();
  };

  const getSubscriptionEndDate = () => {
    const now = new Date();
    switch (selectedPlan?.billingCycle) {
      case "monthly":
        now.setMonth(now.getMonth() + 1);
        break;
      case "quarterly":
        now.setMonth(now.getMonth() + 3);
        break;
      case "annually":
        now.setMonth(now.getMonth() + 12);
        break;
    }
    return now;
  };
  const initialValues: MakePaymentProps = {
    transactionId: "",
    paymentType: "offline",
    note: "",
    paymentProofFile: [],
    paymentProofUrl: "",
    paymentMethod: "cash",
    referral: "",
    salesPerson: "",
    isTrial: false,
  };

  const formik: FormikProps<MakePaymentProps> = useFormik<MakePaymentProps>({
    initialValues,
    validationSchema,
    onSubmit: async (values: any) => {
      const data = {
        packageRef: selectedPlan?._id,
        paymentType: values.paymentType,
        paymentMethod: values.paymentMethod,
        transactionId: values.transactionId,
        note: values.note,
        paymentProofUrl: values.paymentProofUrl,
        referral: values.referral,
        salesPerson: values.salesPerson,
        ownerRef: user?._id,
        isTrial: values.isTrial,
        billingCycle: selectedPlan?.billingCycle,
        addons: selectedPlan.addons,
        hardwares: selectedPlan.hardwares,
      };

      try {
        const res = await serviceCaller(endpoint.subscribe.path, {
          method: endpoint.subscribe.method,
          body: data,
        });

        if (res?.code === "success") {
          setSubscriptionData({ subscription: res?.subscription });
          if (res?.subscription?.modules.length > 0) {
            localStorage.setItem(
              "modulePermission",
              JSON.stringify([
                ...res.subscription.modules.flatMap((module: any) =>
                  module.subModules?.length
                    ? module.subModules.map((subModule: any) => ({
                        key: subModule.key,
                        name: subModule.name,
                      }))
                    : [
                        {
                          key: module.key,
                          name: module.name,
                        },
                      ]
                ),
                ...(res.subscription.addons?.length
                  ? res.subscription.addons.flatMap((addon: any) =>
                      addon.subModules?.length
                        ? addon.subModules.map((subModule: any) => ({
                            key: subModule.key,
                            name: subModule.name,
                          }))
                        : [
                            {
                              key: addon.key,
                              name: addon.name,
                            },
                          ]
                    )
                  : []),
              ])
            );
          }
          toast.success(
            t(
              values.isTrial
                ? "Trial started successfully"
                : "Payment received successfully"
            )
          );
          router.push(tijarahPaths.signup.steps);
        }
      } catch (error) {
        toast.error(error.message);
      }
    },
  });

  const paymentProofFileDrop = (newFiles: any): void => {
    if (newFiles?.length > 1) {
      toast.error(t("Please select one image to upload"));
      return;
    }
    formik.setFieldValue("paymentProofFile", newFiles);
    if (newFiles[0]) {
      if (newFiles[0].type !== "application/pdf") setOpenCropModal(true);
    } else {
      toast.error(
        `${t("File type not supported or limit the image size within 1 MB")}`
      );
    }
  };

  const paymentProofFileRemove = (): void => {
    formik.setFieldValue("paymentProofFile", []);
    formik.setFieldValue("paymentProofUrl", "");
  };

  const paymentProofFileRemoveAll = (): void => {
    formik.setFieldValue("paymentProofFile", []);
  };

  const handleCroppedImage = (croppedImageUrl: any) => {
    formik.setFieldValue("paymentProofUrl", croppedImageUrl);
  };

  const handleUpload = async (files: any) => {
    setIsUploading(true);
    try {
      if (files[0].type === "application/pdf") {
        const url = await upload(files, FileUploadNamespace["payment-gateway"]);
        formik.setFieldValue("paymentProofUrl", url);
      } else {
        const file = files[0];
        const tempUrl = URL.createObjectURL(file);
        setImgSrc(tempUrl);
      }
      setIsUploaded(true);
      setIsUploading(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // const handleApplyDiscountCode = () => {
  //   setDiscountApplied(true);
  //   if (CouponCodes.COUPON10 == formik.values.referral) {
  //     setNewSubtotal(getSubtotal() - (getSubtotal() * 10) / 100);
  //   } else if (CouponCodes.COUPON20 == formik.values.referral) {
  //     setNewSubtotal(getSubtotal() - (getSubtotal() * 20) / 100);
  //   } else if (CouponCodes.COUPON30 == formik.values.referral) {
  //     setNewSubtotal(getSubtotal() - (getSubtotal() * 30) / 100);
  //   }
  // };

  // const handleRemoveDiscountCode = () => {
  //   setDiscountApplied(false);
  //   formik.setFieldValue("referral", "");
  // };

  // const getDiscountAmount = () => {
  //   if (CouponCodes.COUPON10 == formik.values.referral)
  //     return (getSubtotal() * 10) / 100;
  //   if (CouponCodes.COUPON20 == formik.values.referral)
  //     return (getSubtotal() * 20) / 100;
  //   if (CouponCodes.COUPON30 == formik.values.referral)
  //     return (getSubtotal() * 30) / 100;
  // };

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  return (
    <>
      <Head>
        <title>{t("Make a payment | Tijarah360")}</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h4" sx={{ my: 2 }}>
              {t("Make a Payment")}
            </Typography>
            <LanguageSwitch />
          </Box>

          <Grid container spacing={5}>
            <Grid item md={7} xs={12}>
              <Box sx={{ mt: 3, display: "flex", alignItems: "center" }}>
                <Typography
                  variant="h6"
                  sx={{
                    py: 0.5,
                    px: 1.5,
                    border: 1,
                    borderColor: "neutral.300",
                    borderRadius: "50%",
                  }}
                >
                  1
                </Typography>
                <Typography variant="h6" sx={{ px: 1, ml: 1 }}>
                  {t("Select Payment Method")}
                </Typography>
              </Box>

              <Box sx={{ my: 2.5, ml: 1 }}>
                <FormControl>
                  <RadioGroup
                    name="paymentType"
                    onChange={(e) => {
                      const value = e.target.value;
                      formik.setFieldValue("paymentType", value);
                      if (value === "offline") {
                        formik.setFieldValue("isTrial", false);
                      }
                      if (value === "online") {
                        toast.success(t("Coming Soon"));
                      } else if (value === "trial") {
                        formik.setFieldValue("isTrial", true);
                      }
                    }}
                    value={formik.values.paymentType}
                    row
                  >
                    <FormControlLabel
                      value="offline"
                      control={<Radio />}
                      label={t("Offline ")}
                    />
                    <FormControlLabel
                      value="online"
                      control={<Radio />}
                      label={t("Online ")}
                    />
                    {selectedPlan?.trialDays && (
                      <FormControlLabel
                        value="trial"
                        control={<Radio />}
                        label={t("Trial")}
                        disabled={!selectedPlan?.trialDays}
                      />
                    )}
                  </RadioGroup>
                </FormControl>
              </Box>

              {formik.values.paymentType === "trial" ? (
                <Box sx={{ mx: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ my: 1 }}>
                    {t(`Free Trial for ${selectedPlan?.trialDays} days`)}
                  </Typography>
                  <Button
                    onClick={() => formik.handleSubmit()}
                    variant="contained"
                    endIcon={<ArrowRight />}
                    sx={{ mt: 2 }}
                  >
                    {t("Start Trial")}
                  </Button>
                </Box>
              ) : formik.values.paymentType === "offline" ? (
                <Box>
                  <Typography variant="h6" sx={{ my: 1 }}>
                    {t("Offline Transfer Details")}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      error={
                        !!(
                          formik.touched.paymentMethod &&
                          formik.errors.paymentMethod
                        )
                      }
                      fullWidth
                      label={t("Payment Method")}
                      name="paymentMethod"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      select
                      value={formik.values.paymentMethod}
                      required
                    >
                      {paymentOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ flex: 0.9, pr: 1 }}>
                      <TextField
                        fullWidth
                        label={t("Reference No. / Transaction ID")}
                        value={formik.values.transactionId}
                        name="transactionId"
                        error={Boolean(
                          formik.touched.transactionId &&
                            formik.errors.transactionId
                        )}
                        helperText={
                          formik.touched.transactionId &&
                          formik.errors.transactionId
                        }
                        onBlur={formik.handleBlur}
                        onChange={(e: any) =>
                          formik.setFieldValue(
                            "transactionId",
                            e.target.value?.replace(/[^A-Za-z0-9]/, "")
                          )
                        }
                        sx={{ mt: 2, mb: 2 }}
                        size="medium"
                      />
                      <TextField
                        fullWidth
                        label={t("Sales person")}
                        value={formik.values.salesPerson}
                        name="salesPerson"
                        error={Boolean(
                          formik.touched.salesPerson &&
                            formik.errors.salesPerson
                        )}
                        helperText={
                          formik.touched.salesPerson &&
                          formik.errors.salesPerson
                        }
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        sx={{ mt: 2, mb: 1 }}
                        size="medium"
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <AttachmentDropzone
                        accept={{ "image/*": [], "application/pdf": [] }}
                        files={formik.values.paymentProofFile}
                        imageName={getUploadedDocName(
                          formik.values.paymentProofUrl
                        )}
                        maxSize={999999}
                        uploadedImageUrl={formik.values.paymentProofUrl}
                        onDrop={paymentProofFileDrop}
                        onUpload={handleUpload}
                        onRemove={paymentProofFileRemove}
                        onRemoveAll={paymentProofFileRemoveAll}
                        maxFiles={1}
                        isUploaded={isUploaded}
                        setIsUploaded={setIsUploaded}
                        isUploading={isUploading}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <TextField
                      sx={{ mt: 0.5 }}
                      autoComplete="off"
                      label={t("Note")}
                      name="note"
                      multiline
                      rows={4}
                      fullWidth
                      error={Boolean(formik.touched.note && formik.errors.note)}
                      helperText={formik.touched.note && formik.errors.note}
                      onChange={formik.handleChange("note")}
                      value={formik.values.note}
                    />
                    <Box
                      sx={{
                        my: 3,
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                      }}
                    >
                      <Button
                        onClick={() => formik.handleSubmit()}
                        variant="contained"
                        endIcon={<ArrowRight fontSize="small" />}
                        sx={{ px: { sm: 5 }, my: 1, mr: { sm: 3 } }}
                      >
                        {t("Submit")}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              ) : formik.values.paymentType === "online" ? (
                <Box>
                  <Box sx={{ mx: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ my: 1 }}>
                      {t("Secured Payment")}
                    </Typography>
                    <Button
                      onClick={() => toast.success(t("Coming Soon..."))}
                      variant="contained"
                      endIcon={<ArrowRight />}
                      sx={{ mt: 3 }}
                    >
                      {t("Make Payment")}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <></>
              )}
            </Grid>

            <Grid item md={5} xs={12}>
              <Card
                sx={{
                  mt: 4,
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <Box
                  sx={{ bgcolor: "primary.main", color: "white", py: 2, px: 3 }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {t("Payment Summary")}
                  </Typography>
                </Box>
                <CardContent sx={{ px: 3, py: 2 }}>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600, mb: 0.5 }}
                          >
                            {isRTL
                              ? selectedPlan?.name?.ar
                              : selectedPlan?.name?.en}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formik.values.isTrial
                              ? `${selectedPlan?.trialDays} ${t("Day Trial")}`
                              : `${
                                  selectedPlan?.billingCycle
                                    ?.charAt(0)
                                    .toUpperCase() +
                                  selectedPlan?.billingCycle?.slice(1)
                                } ${t("billing")}`}
                          </Typography>
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, color: "primary.main" }}
                        >
                          {`${currency} ${toFixedNumber(packagePrice)}`}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          mt: 2,
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Button
                          onClick={() => setOpenPlanModal(true)}
                          variant="outlined"
                          size="small"
                          sx={{ color: "primary.main" }}
                        >
                          {t("Change Plan")}
                        </Button>
                      </Box>
                    </Box>
                    {/* All Addons (Locations, Devices, and Regular Addons) */}
                    <Box
                      sx={{
                        mb: 2,
                        p: 1.5,
                        bgcolor: "warning.lighter",
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight="600"
                        mb={1}
                        color="warning.dark"
                      >
                        {t("Addons")}
                      </Typography>
                      <Box
                        sx={{
                          bgcolor: "background.paper",
                          p: 1.5,
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        {/* Locations and Devices Summary */}
                        <Grid container spacing={1} sx={{ mb: 1.5 }}>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              <span
                                style={{
                                  color: "text.secondary",
                                  display: "block",
                                  fontSize: "0.75rem",
                                }}
                              >
                                {t("Locations")}
                              </span>
                              <Box
                                sx={{ display: "flex", alignItems: "baseline" }}
                              >
                                <span style={{ fontWeight: 500 }}>
                                  {(selectedPlan?.locationLimit || 0) +
                                    (selectedPlan?.addons?.find(
                                      (addon: Addon) =>
                                        addon.key === "location_addon"
                                    )?.qty || 0)}
                                </span>
                                {selectedPlan?.addons?.some(
                                  (addon: Addon) =>
                                    addon.key === "location_addon"
                                ) && (
                                  <span
                                    style={{
                                      color: "green",
                                      marginLeft: "4px",
                                      fontWeight: 500,
                                      fontSize: "0.85rem",
                                    }}
                                  >
                                    (+
                                    {selectedPlan.addons.find(
                                      (addon: Addon) =>
                                        addon.key === "location_addon"
                                    )?.qty || 0}
                                    )
                                  </span>
                                )}
                              </Box>
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              <span
                                style={{
                                  color: "text.secondary",
                                  display: "block",
                                  fontSize: "0.75rem",
                                }}
                              >
                                {t("Devices")}
                              </span>
                              <Box
                                sx={{ display: "flex", alignItems: "baseline" }}
                              >
                                <span style={{ fontWeight: 500 }}>
                                  {(selectedPlan?.deviceLimit || 0) +
                                    (selectedPlan?.addons?.find(
                                      (addon: Addon) =>
                                        addon.key === "device_addon"
                                    )?.qty || 0)}
                                </span>
                                {selectedPlan?.addons?.some(
                                  (addon: Addon) => addon.key === "device_addon"
                                ) && (
                                  <span
                                    style={{
                                      color: "green",
                                      marginLeft: "4px",
                                      fontWeight: 500,
                                      fontSize: "0.85rem",
                                    }}
                                  >
                                    (+
                                    {selectedPlan.addons.find(
                                      (addon: Addon) =>
                                        addon.key === "device_addon"
                                    )?.qty || 0}
                                    )
                                  </span>
                                )}
                              </Box>
                            </Typography>
                          </Grid>
                        </Grid>

                        {/* Addon Line Items */}
                        {/* Location Addon */}
                        {selectedPlan?.addons?.some(
                          (addon: Addon) => addon.key === "location_addon"
                        ) && (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              py: 0.5,
                              borderBottom: "1px dashed",
                              borderColor: "divider",
                            }}
                          >
                            <Typography variant="body2" fontWeight={500}>
                              {t("Additional Locations")}
                              <span
                                style={{
                                  fontWeight: "normal",
                                  color: "text.secondary",
                                  marginLeft: "4px",
                                }}
                              >
                                (
                                {selectedPlan.addons.find(
                                  (addon: Addon) =>
                                    addon.key === "location_addon"
                                )?.qty || 0}
                                )
                              </span>
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {currency}{" "}
                              {toFixedNumber(
                                getPriceInfo(
                                  selectedPlan.addons.find(
                                    (addon: Addon) =>
                                      addon.key === "location_addon"
                                  )?.prices,
                                  selectedPlan?.billingCycle
                                ).discountedPrice *
                                  (selectedPlan.addons.find(
                                    (addon: Addon) =>
                                      addon.key === "location_addon"
                                  )?.qty || 0)
                              )}
                            </Typography>
                          </Box>
                        )}

                        {/* Device Addon */}
                        {selectedPlan?.addons?.some(
                          (addon: Addon) => addon.key === "device_addon"
                        ) && (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              py: 0.5,
                              borderBottom: "1px dashed",
                              borderColor: "divider",
                            }}
                          >
                            <Typography variant="body2" fontWeight={500}>
                              {t("Additional Devices")}
                              <span
                                style={{
                                  fontWeight: "normal",
                                  color: "text.secondary",
                                  marginLeft: "4px",
                                }}
                              >
                                (
                                {selectedPlan.addons.find(
                                  (addon: Addon) => addon.key === "device_addon"
                                )?.qty || 0}
                                )
                              </span>
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {currency}{" "}
                              {toFixedNumber(
                                getPriceInfo(
                                  selectedPlan.addons.find(
                                    (addon: Addon) =>
                                      addon.key === "device_addon"
                                  )?.prices,
                                  selectedPlan?.billingCycle
                                ).discountedPrice *
                                  (selectedPlan.addons.find(
                                    (addon: Addon) =>
                                      addon.key === "device_addon"
                                  )?.qty || 0)
                              )}
                            </Typography>
                          </Box>
                        )}

                        {/* Regular Addons */}
                        {selectedPlan?.addons?.some(
                          (addon: Addon) =>
                            addon.key !== "location_addon" &&
                            addon.key !== "device_addon"
                        ) && (
                          <>
                            {selectedPlan.addons
                              .filter(
                                (addon: Addon) =>
                                  addon.key !== "location_addon" &&
                                  addon.key !== "device_addon"
                              )
                              .map((addon: Addon, index: number) => {
                                const addonPriceInfo = getPriceInfo(
                                  addon.prices,
                                  selectedPlan?.billingCycle
                                );
                                const totalPrice =
                                  addonPriceInfo.discountedPrice;
                                const regularAddons =
                                  selectedPlan.addons.filter(
                                    (a: Addon) =>
                                      a.key !== "location_addon" &&
                                      a.key !== "device_addon"
                                  );
                                const isLast =
                                  index === regularAddons.length - 1;

                                return (
                                  <Box
                                    key={index}
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      py: 0.5,
                                      ...(!isLast
                                        ? {
                                            borderBottom: "1px dashed",
                                            borderColor: "divider",
                                          }
                                        : {}),
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      fontWeight={500}
                                    >
                                      {addon.name}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight={500}
                                    >
                                      {`${currency} ${toFixedNumber(
                                        totalPrice
                                      )}`}
                                    </Typography>
                                  </Box>
                                );
                              })}
                          </>
                        )}

                        {/* Total Addons */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mt: 1.5,
                            pt: 1.5,
                            borderTop: "1px solid",
                            borderColor: "warning.main",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            fontWeight="600"
                            color="warning.dark"
                          >
                            {t("Total Addons")}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            fontWeight="600"
                            color="warning.dark"
                          >
                            {`${currency} ${toFixedNumber(getAddonsTotal())}`}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    {selectedPlan?.hardwares?.length > 0 && (
                      <Box
                        sx={{
                          mb: 2,
                          p: 1.5,
                          bgcolor: "success.lighter",
                          borderRadius: 1,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight="600"
                          mb={1}
                          color="success.dark"
                        >
                          {t("Hardware")}
                        </Typography>
                        <Box
                          sx={{
                            bgcolor: "background.paper",
                            p: 1.5,
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          {selectedPlan.hardwares.map(
                            (hardware: any, index: number) => (
                              <Box
                                key={index}
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  py: 0.5,
                                  ...(index < selectedPlan.hardwares.length - 1
                                    ? {
                                        borderBottom: "1px dashed",
                                        borderColor: "divider",
                                      }
                                    : {}),
                                }}
                              >
                                <Typography variant="body2" fontWeight={500}>
                                  {isRTL
                                    ? hardware.name?.ar
                                    : hardware.name?.en}
                                  <span
                                    style={{
                                      fontWeight: "normal",
                                      color: "text.secondary",
                                      marginLeft: "4px",
                                    }}
                                  >
                                    ({hardware.qty || 1} unit)
                                  </span>
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                  {`${currency} ${toFixedNumber(
                                    hardware.price * (hardware.qty || 1)
                                  )}`}
                                </Typography>
                              </Box>
                            )
                          )}

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mt: 1.5,
                              pt: 1.5,
                              borderTop: "1px solid",
                              borderColor: "success.main",
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              fontWeight="600"
                              color="success.dark"
                            >
                              {t("Total Hardware")}
                            </Typography>
                            <Typography
                              variant="subtitle2"
                              fontWeight="600"
                              color="success.dark"
                            >
                              {`${currency} ${toFixedNumber(
                                getHardwareTotal()
                              )}`}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                    {/* Commented out Discount Section */}
                    {/* <Box sx={{ mt: 1 }}>
                      <TextField
                        fullWidth
                        label={t("Referral / Discount Code")}
                        name="referral"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.referral}
                        disabled={discountApplied}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Button
                        disabled={!formik.values.referral}
                        onClick={() => {
                          if (!discountApplied) {
                            if (
                              formik.values.referral == CouponCodes.COUPON10 ||
                              formik.values.referral == CouponCodes.COUPON20 ||
                              formik.values.referral == CouponCodes.COUPON30
                            ) {
                              handleApplyDiscountCode();
                            } else {
                              toast.error(t("Please enter a valid referral"));
                            }
                          } else {
                            handleRemoveDiscountCode();
                          }
                        }}
                        variant="outlined"
                        size="small"
                        sx={{ width: "100%" }}
                      >
                        {discountApplied ? t("Remove") : t("Apply")}
                      </Button>
                      {discountApplied &&
                        formik.values.referral?.length != 0 && (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mt: 1,
                            }}
                          >
                            <Typography variant="body2" color="success.main">
                              {`${t("Discount")} @${
                                formik.values.referral == CouponCodes.COUPON10
                                  ? "10%"
                                  : formik.values.referral ==
                                    CouponCodes.COUPON20
                                  ? "20%"
                                  : "30%"
                              }`}
                            </Typography>
                            <Typography variant="body2" color="success.main">
                              {`- ${currency} ${toFixedNumber(
                                getDiscountAmount()
                              )}`}
                            </Typography>
                          </Box>
                        )}
                    </Box> */}
                    <Box
                      sx={{
                        mb: 2,
                        p: 1.5,
                        bgcolor: "primary.lighter",
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight="600"
                        mb={1}
                        color="primary.dark"
                      >
                        {t("Payment Summary")}
                      </Typography>
                      <Box
                        sx={{
                          bgcolor: "background.paper",
                          p: 1.5,
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            py: 0.5,
                            borderBottom: "1px dashed",
                            borderColor: "divider",
                          }}
                        >
                          <Typography variant="body2" fontWeight={500}>
                            {t("Subtotal")}
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {`${currency} ${toFixedNumber(getSubtotal())}`}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mt: 1.5,
                            pt: 1.5,
                            borderTop: "1px solid",
                            borderColor: "primary.main",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            fontWeight="600"
                            color="primary.dark"
                          >
                            {t("Total")}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            fontWeight="600"
                            color="primary.dark"
                          >
                            {`${currency} ${toFixedNumber(getSubtotal())}`}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        p: 2,
                        borderRadius: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {t("Grand Total")}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {StyledCurrencyFormatter(getSubtotal())}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <ChangePricingModal
        openPlanModal={openPlanModal}
        setOpenPlanModal={(val: any) => {
          setOpenPlanModal(val);
          formik.setFieldValue("referral", "");
        }}
      />

      <ImageCropModal
        open={openCropModal}
        handleClose={() => {
          setOpenCropModal(false);
          setImgSrc(null);
        }}
        handleCroppedImage={handleCroppedImage}
        imgSrcUrl={imgSrc}
        fileUploadNameSpace={FileUploadNamespace["payment-gateway"]}
      />
    </>
  );
};

export default MakePayment;
