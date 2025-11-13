import { ArrowRight } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { AttachmentDropzone } from "src/components/attachment-dropzone";
import { ImageCropModal } from "src/components/modals/image-crop-modal";
import LoaderAnimation from "src/components/widgets/animations/loader";
import { useEntity } from "src/hooks/use-entity";
import { getBilling } from "src/utils/get-billing";
import { getUploadedDocName } from "src/utils/get-uploaded-file-name";
import { toFixedNumber } from "src/utils/toFixedNumber";
import upload, { FileUploadNamespace } from "src/utils/uploadToS3";
import { useCurrency } from "src/utils/useCurrency";
import * as Yup from "yup";

const paymentOptions = [
  { label: "Cash", value: "cash" },
  { label: "Card", value: "card" },
  { label: "Account Transfer", value: "accountTransfer" },
];

interface Addon {
  key: string;
  name: string;
  prices: Array<{
    type: string;
    price: number;
    discountPercentage: number;
  }>;
}

interface Hardware {
  key: string;
  name: { en: string; ar: string };
  price: number;
}

const ProvisionUpdatePayment = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { findOne: findSubscription, entity: subscriptionData } = useEntity(
    "subscription/ownerRef"
  );
  const currency = useCurrency();
  const { findOne: findPackage, entity: packageData } = useEntity("package");
  const { updateEntity } = useEntity("subscription/merchant-update");
  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openCropModal, setOpenCropModal] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const subscriptionUpdateData = JSON.parse(
    localStorage.getItem("subscriptionUpdateData")
  );

  useEffect(() => {
    if (subscriptionUpdateData?.ownerRef) {
      findSubscription(subscriptionUpdateData.ownerRef);
      findPackage(subscriptionUpdateData.packageRef);
    }
  }, [subscriptionUpdateData]);

  const formik = useFormik({
    initialValues: {
      paymentMethod: "cash",
      transactionId: "",
      paymentProofFile: [],
      paymentProofUrl: "",
      note: "",
    },
    validationSchema: Yup.object({
      paymentMethod: Yup.string().required(t("Select a payment method")),
      transactionId: Yup.string().max(
        40,
        t("Reference No. must not exceed 40 characters")
      ),
      note: Yup.string().max(70, t("Note must not exceed 70 characters")),
    }),
    onSubmit: async (values) => {
      try {
        const updateSubscriptionPayload = {
          package: subscriptionUpdateData.packageRef,
          billingCycle: subscriptionUpdateData.billingCycle,
          hardwares: subscriptionUpdateData.hardwares || [],
          addons: subscriptionUpdateData.addons || [],
          paymentStatus: "unpaid",
          paymentMethod: values.paymentMethod,
          transactionId: values.transactionId,
          paymentProofUrl: values.paymentProofUrl,
          note: values.note,
          // Pass the trial conversion flag to the backend
          renewPackage: subscriptionData.isTrial || false,
          isTrialConversion: subscriptionData.isTrial || false,
        };

        await updateEntity(
          subscriptionData.ownerRef,
          updateSubscriptionPayload
        );

        toast.success(t("Payment successful"));

        router.back();
      } catch (error) {
        toast.error(error.message || "Failed to process payment");
      } finally {
        setIsSubmitting(false);
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
    setIsUploaded(false);
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

  if (!subscriptionData || !packageData) {
    return <LoaderAnimation />;
  }

  const locationAddon = subscriptionData.addons.find(
    (addon: any) => addon.key === "location_addon"
  );
  const deviceAddon = subscriptionData.addons.find(
    (addon: any) => addon.key === "device_addon"
  );

  const currentLocationLimit =
    packageData?.locationLimit + locationAddon?.qty || 1;

  const currentDeviceLimit = packageData?.deviceLimit + deviceAddon?.qty || 1;

  const billing = getBilling({
    currentLocationLimit: currentLocationLimit,
    currentDeviceLimit: currentDeviceLimit,
    currentAddons: subscriptionData.addons,
    newAddons: subscriptionUpdateData.addons,
    packageAddons: packageData.addons,
    currentHardwares: subscriptionData.hardwares || [],
    newHardwares: subscriptionUpdateData.hardwares || [],
    packageHardwares: packageData.hardwares || [],
    packagePrices: packageData.prices || [],
    subscriptionEndDate: subscriptionData.subscriptionEndDate,
    billingCycle:
      subscriptionUpdateData.billingCycle || subscriptionData.billingCycle,
    isTrialConversion: subscriptionData.isTrial || false,
    renewPackage: subscriptionData.isTrial || false,
  });

  return (
    <>
      <Head>
        <title>{t("Make a payment | Tijarah360")}</title>
      </Head>
      <ImageCropModal
        open={openCropModal}
        handleClose={() => setOpenCropModal(false)}
        handleCroppedImage={handleCroppedImage}
        imgSrcUrl={imgSrc}
        fileUploadNameSpace={FileUploadNamespace["payment-gateway"]}
      />
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ mb: 4 }}>
            {t("Make a Payment")}
          </Typography>

          <Grid container spacing={5}>
            {/* Payment Form Section */}
            <Grid item md={7} xs={12}>
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  {t("Payment Details")}
                </Typography>

                <TextField
                  fullWidth
                  label={t("Payment Method")}
                  name="paymentMethod"
                  select
                  value={formik.values.paymentMethod}
                  onChange={formik.handleChange}
                  error={
                    !!(
                      formik.touched.paymentMethod &&
                      formik.errors.paymentMethod
                    )
                  }
                  helperText={
                    formik.touched.paymentMethod && formik.errors.paymentMethod
                  }
                  sx={{ mb: 3 }}
                >
                  {paymentOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  label={t("Reference No. / Transaction ID")}
                  name="transactionId"
                  value={formik.values.transactionId}
                  onChange={formik.handleChange}
                  error={
                    !!(
                      formik.touched.transactionId &&
                      formik.errors.transactionId
                    )
                  }
                  helperText={
                    formik.touched.transactionId && formik.errors.transactionId
                  }
                  sx={{ mb: 3 }}
                />

                <AttachmentDropzone
                  accept={{ "image/*": [], "application/pdf": [] }}
                  files={formik.values.paymentProofFile}
                  imageName={getUploadedDocName(formik.values.paymentProofUrl)}
                  maxSize={999999}
                  onDrop={paymentProofFileDrop}
                  onUpload={handleUpload}
                  onRemove={paymentProofFileRemove}
                  onRemoveAll={paymentProofFileRemoveAll}
                  maxFiles={1}
                  isUploaded={isUploaded}
                  setIsUploaded={setIsUploaded}
                  isUploading={isUploading}
                  uploadedImageUrl={formik.values.paymentProofUrl}
                />

                <TextField
                  fullWidth
                  label={t("Note")}
                  name="note"
                  multiline
                  rows={4}
                  value={formik.values.note}
                  onChange={formik.handleChange}
                  error={!!(formik.touched.note && formik.errors.note)}
                  helperText={formik.touched.note && formik.errors.note}
                  sx={{ mt: 3 }}
                />

                <Button
                  variant="contained"
                  onClick={() => formik.handleSubmit()}
                  endIcon={<ArrowRight />}
                  disabled={isSubmitting}
                  sx={{ mt: 3 }}
                >
                  {isSubmitting ? t("Processing...") : t("Make Payment")}
                </Button>
              </Box>
            </Grid>

            {/* Payment Summary Section */}
            <Grid item md={5} xs={12}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  overflow: "hidden", // Ensures the header doesn't overflow the border radius
                }}
              >
                <Box
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    py: 2.5,
                    px: 3,
                    borderBottom: "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {t("Subscription Update Summary")}
                  </Typography>
                </Box>
                <CardContent sx={{ p: 1.5 }}>
                  <>
                    <Box
                      sx={{
                        mb: 3,
                        p: 2,
                        bgcolor: "background.default",
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight="600"
                        mb={1}
                        color="text.primary"
                      >
                        {t("Current Subscription")}
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={12}>
                          <Typography
                            variant="body2"
                            sx={{
                              display: "flex",
                              mb: 0.5,
                            }}
                          >
                            <span
                              style={{
                                color: "text.secondary",
                                width: "100px",
                              }}
                            >
                              {t("Package")}:
                            </span>
                            <span style={{ fontWeight: 500 }}>
                              {packageData?.name?.en || "N/A"}
                            </span>
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography
                            variant="body2"
                            sx={{
                              display: "flex",
                              mb: 0.5,
                            }}
                          >
                            <span
                              style={{
                                color: "text.secondary",
                                width: "100px",
                              }}
                            >
                              {t("Billing Cycle")}:
                            </span>
                            <span style={{ fontWeight: 500 }}>
                              {t(subscriptionData?.billingCycle || "N/A")}
                            </span>
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
                              {t("Locations")}
                            </span>
                            <span style={{ fontWeight: 500 }}>
                              {subscriptionData?.currentLocationLimit || 1}
                            </span>
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
                            <span style={{ fontWeight: 500 }}>
                              {subscriptionData?.currentDeviceLimit || 1}
                            </span>
                          </Typography>
                        </Grid>

                        {/* Display current hardware items */}
                        {subscriptionData.hardwares &&
                          subscriptionData.hardwares.length > 0 && (
                            <Grid item xs={12} sx={{ mt: 0.5 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: "0.75rem", mb: 0.5 }}
                              >
                                {t("Current Hardware")}
                              </Typography>
                              <Box
                                sx={{
                                  bgcolor: "background.paper",
                                  borderRadius: 1,
                                  border: "1px solid",
                                  borderColor: "divider",
                                  fontSize: "0.85rem",
                                }}
                              >
                                {subscriptionData.hardwares.map(
                                  (hw: any, index: number) => {
                                    return (
                                      <Box
                                        key={hw.key}
                                        sx={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          px: 1,
                                          py: 0.5,
                                          ...(index <
                                          subscriptionData.hardwares.length - 1
                                            ? {
                                                borderBottom: "1px dashed",
                                                borderColor: "divider",
                                              }
                                            : {}),
                                        }}
                                      >
                                        <Typography
                                          variant="body2"
                                          sx={{ fontSize: "inherit" }}
                                        >
                                          {hw.name?.en || hw.key}
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            fontSize: "inherit",
                                            fontWeight: 500,
                                          }}
                                        >
                                          {hw.qty || 1} {t("units")}
                                        </Typography>
                                      </Box>
                                    );
                                  }
                                )}
                              </Box>
                            </Grid>
                          )}
                      </Grid>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Updated Subscription */}
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
                        {t("Updated Subscription")}
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={12}>
                          <Typography
                            variant="body2"
                            sx={{
                              display: "flex",
                              mb: 0.5,
                            }}
                          >
                            <span
                              style={{
                                color: "text.secondary",
                                width: "100px",
                              }}
                            >
                              {t("Package")}:
                            </span>
                            <span style={{ fontWeight: 500 }}>
                              {packageData?.name?.en || "N/A"}
                            </span>
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography
                            variant="body2"
                            sx={{
                              display: "flex",
                              mb: 0.5,
                            }}
                          >
                            <span
                              style={{
                                color: "text.secondary",
                                width: "100px",
                              }}
                            >
                              {t("Billing Cycle")}:
                            </span>
                            <span style={{ fontWeight: 500 }}>
                              {t(subscriptionUpdateData.billingCycle || "N/A")}
                            </span>
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
                              {t("Locations")}
                            </span>
                            <Box
                              sx={{ display: "flex", alignItems: "baseline" }}
                            >
                              <span style={{ fontWeight: 500 }}>
                                {subscriptionUpdateData.newLocationLimit}
                              </span>
                              {subscriptionUpdateData.newLocationLimit >
                                subscriptionData.currentLocationLimit && (
                                <span
                                  style={{
                                    color: "green",
                                    marginLeft: "4px",
                                    fontWeight: 500,
                                    fontSize: "0.85rem",
                                  }}
                                >
                                  (+
                                  {subscriptionUpdateData.newLocationLimit -
                                    subscriptionData.currentLocationLimit}
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
                                {subscriptionUpdateData.newDeviceLimit}
                              </span>
                              {subscriptionUpdateData.newDeviceLimit >
                                subscriptionData.currentDeviceLimit && (
                                <span
                                  style={{
                                    color: "green",
                                    marginLeft: "4px",
                                    fontWeight: 500,
                                    fontSize: "0.85rem",
                                  }}
                                >
                                  (+
                                  {subscriptionUpdateData.newDeviceLimit -
                                    subscriptionData.currentDeviceLimit}
                                  )
                                </span>
                              )}
                            </Box>
                          </Typography>
                        </Grid>

                        {/* Display hardware items */}
                        {subscriptionUpdateData.hardwares &&
                          subscriptionUpdateData.hardwares.length > 0 && (
                            <Grid item xs={12} sx={{ mt: 0.5 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: "0.75rem", mb: 0.5 }}
                              >
                                {t("Hardware")}
                              </Typography>
                              <Box
                                sx={{
                                  bgcolor: "background.paper",
                                  borderRadius: 1,
                                  border: "1px solid",
                                  borderColor: "divider",
                                  fontSize: "0.85rem",
                                }}
                              >
                                {subscriptionUpdateData.hardwares.map(
                                  (hw: any, index: number) => {
                                    const originalQty =
                                      subscriptionData?.hardwares?.find(
                                        (h: any) => h.key === hw.key
                                      )?.qty || 0;
                                    return (
                                      <Box
                                        key={hw.key}
                                        sx={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          px: 1,
                                          py: 0.5,
                                          ...(index <
                                          subscriptionUpdateData.hardwares
                                            .length -
                                            1
                                            ? {
                                                borderBottom: "1px dashed",
                                                borderColor: "divider",
                                              }
                                            : {}),
                                        }}
                                      >
                                        <Typography
                                          variant="body2"
                                          sx={{ fontSize: "inherit" }}
                                        >
                                          {hw.name?.en || hw.key}
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            fontSize: "inherit",
                                            fontWeight: 500,
                                          }}
                                        >
                                          {hw.qty || 1} {t("units")}
                                        </Typography>
                                      </Box>
                                    );
                                  }
                                )}
                              </Box>
                            </Grid>
                          )}
                      </Grid>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Billing Summary */}

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
                        {t("Billing Summary")}
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
                        {/* Show package amount first when converting from trial */}
                        {subscriptionData.isTrial && (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              py: 1,
                              borderBottom: "1px dashed",
                              borderColor: "divider",
                            }}
                          >
                            <Typography variant="body2" fontWeight={500}>
                              {t("Package Amount")}
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {currency}{" "}
                              {toFixedNumber(
                                billing.items.find(
                                  (item) => item.name === "Package Amount"
                                )?.amount || 0
                              )}
                            </Typography>
                          </Box>
                        )}

                        {(subscriptionUpdateData.newLocationLimit >
                          subscriptionData.currentLocationLimit ||
                          subscriptionData?.isTrial) && (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              py: 1,
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
                                }}
                              >
                                (
                                {subscriptionData?.isTrial
                                  ? subscriptionData?.addons?.find(
                                      (addon: any) =>
                                        addon.key === "location_addon"
                                    )?.qty || 0
                                  : subscriptionUpdateData.newLocationLimit -
                                    subscriptionData.currentLocationLimit}
                                )
                              </span>
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {currency}{" "}
                              {toFixedNumber(
                                billing.items.find(
                                  (item) => item.name === "Additional Locations"
                                )?.amount || 0
                              )}
                            </Typography>
                          </Box>
                        )}

                        {(subscriptionUpdateData.newDeviceLimit >
                          subscriptionData.currentDeviceLimit ||
                          subscriptionData?.isTrial) && (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              py: 1,
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
                                }}
                              >
                                (
                                {subscriptionData?.isTrial
                                  ? subscriptionData?.addons?.find(
                                      (addon: any) =>
                                        addon.key === "device_addon"
                                    )?.qty || 0
                                  : subscriptionUpdateData.newDeviceLimit -
                                    subscriptionData.currentDeviceLimit}
                                )
                              </span>
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {currency}{" "}
                              {toFixedNumber(
                                billing.items.find(
                                  (item) => item.name === "Additional Devices"
                                )?.amount || 0
                              )}
                            </Typography>
                          </Box>
                        )}

                        {/* Show other billing items (excluding locations and devices which we handled above) */}
                        {billing.items
                          .filter(
                            (item) =>
                              item.name !== "Additional Locations" &&
                              item.name !== "Additional Devices" &&
                              (subscriptionData.isTrial
                                ? item.name !== "Package Amount"
                                : true)
                          )
                          .map((item, index, array) => (
                            <Box
                              key={item.name}
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                py: 1,
                                ...(index < array.length - 1
                                  ? {
                                      borderBottom: "1px dashed",
                                      borderColor: "divider",
                                    }
                                  : {}),
                              }}
                            >
                              <Typography variant="body2" fontWeight={500}>
                                {t(item.name)}
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {currency} {toFixedNumber(item.amount)}
                              </Typography>
                            </Box>
                          ))}

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
                            {subscriptionData.isTrial
                              ? t("Total Charges")
                              : t("Total Additional Charges")}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            fontWeight="600"
                            color="success.dark"
                          >
                            {currency} {toFixedNumber(billing.total)}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          display: "block",
                          textAlign: "center",
                          fontSize: "0.7rem",
                        }}
                      >
                        {subscriptionData.isTrial
                          ? t(
                              "Note: As you are converting from a trial, full charges for the selected billing cycle will apply. This includes the package amount, all addons, and hardware."
                            )
                          : t(
                              "Note: All charges are calculated on a prorated basis based on the remaining days until your subscription end date"
                            )}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Total */}
                    <Box
                      sx={{
                        border: "1px solid green",
                        p: 2,
                        mb: 2,
                        borderRadius: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {subscriptionData.isTrial
                          ? t("Total Payment")
                          : t("Additional Payment")}
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, color: "primary.dark" }}
                      >
                        {currency} {toFixedNumber(billing.total)}
                      </Typography>
                    </Box>
                  </>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default ProvisionUpdatePayment;
