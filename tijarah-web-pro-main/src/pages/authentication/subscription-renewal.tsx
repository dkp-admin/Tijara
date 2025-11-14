import { ArrowRight } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
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
import { AttachmentDropzone } from "src/components/attachment-dropzone";
import { ImageCropModal } from "src/components/modals/image-crop-modal";
import { StyledCurrencyFormatter } from "src/components/styled-currency-formatter";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { useSubscription } from "src/hooks/use-subscription";
import i18n from "src/i18n";
import { LanguageSwitch } from "src/layouts/dashboard/language-switch";
import { gtm } from "src/libs/gtm";
import { tijarahPaths } from "src/paths";
import { DropdownOptions } from "src/types/dropdown";
import { getUploadedDocName } from "src/utils/get-uploaded-file-name";
import { toFixedNumber } from "src/utils/toFixedNumber";
import upload, { FileUploadNamespace } from "src/utils/uploadToS3";
import { useCurrency } from "src/utils/useCurrency";
import * as Yup from "yup";

const paymentOptions: DropdownOptions[] = [
  { label: i18n.t("Cash"), value: "cash" },
  { label: i18n.t("Card"), value: "card" },
  { label: i18n.t("Account Transfer"), value: "accountTransfer" },
];

interface RenewSubscriptionProps {
  transactionId: string;
  paymentType: string;
  note: string;
  paymentProofFile: any[];
  paymentProofUrl: string;
  paymentMethod: string;
  referral: string;
  salesPerson: string;
  billingCycle: "quarterly" | "annually";
}

const validationSchema = Yup.object({
  paymentMethod: Yup.string().required(i18n.t("Select a payment method")),
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
  billingCycle: Yup.string().when([], {
    is: () => true,
    then: (schema) => schema.required(i18n.t("Select a billing cycle")),
  }),
});

const SubscriptionRenewal: NextPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const subscription = useSubscription();
  const { updateEntity } = useEntity("subscription/renewal");
  const { findOne, entity: selectedPlan } = useEntity("package");
  const currency = useCurrency();

  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [openCropModal, setOpenCropModal] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const [selectedBillingCycle, setSelectedBillingCycle] = useState<
    "quarterly" | "annually"
  >(subscription?.billingCycle || "annually");
  const billingCycle = selectedBillingCycle;

  useEffect(() => {
    if (subscription?.packageRef) {
      findOne(subscription?.packageRef);
    }
  }, [subscription]);

  const getPriceInfo = (
    pricesArray: any[],
    billingCycle: "quarterly" | "annually"
  ) => {
    const priceObj = pricesArray?.find((p: any) => p.type === billingCycle);
    if (!priceObj) return { originalPrice: 0, discountedPrice: 0 };
    const originalPrice = priceObj.price;
    const discountedPrice =
      originalPrice * (1 - (priceObj.discountPercentage || 0) / 100);
    return { originalPrice, discountedPrice };
  };

  const packagePriceInfo = getPriceInfo(selectedPlan?.prices, billingCycle);
  const packagePrice = packagePriceInfo.discountedPrice;

  const getAddonsTotal = () => {
    return (
      subscription?.addons?.reduce((total: number, addon: any) => {
        const addonInPkg = selectedPlan?.addons?.find(
          (a: any) => a.key === addon.key
        );
        const addonPriceInfo = getPriceInfo(addonInPkg?.prices, billingCycle);
        return total + addonPriceInfo.discountedPrice * addon.qty;
      }, 0) || 0
    );
  };

  const getHardwareTotal = () => {
    return (
      subscription?.hardwares?.reduce(
        (total: number, hardware: any) => total + hardware.price * hardware.qty,
        0
      ) || 0
    );
  };

  const getSubtotal = () => {
    const hardwareTotal = subscription?.isTrial ? getHardwareTotal() : 0;
    return Number(packagePrice) + getAddonsTotal() + hardwareTotal;
  };

  const getAnnualDiscountPercentage = () => {
    const annualPrice = selectedPlan?.prices?.find(
      (p: any) => p.type === "annually"
    );
    return annualPrice?.discountPercentage || 0;
  };

  const annualDiscountPercentage = getAnnualDiscountPercentage();

  const initialValues: RenewSubscriptionProps = {
    transactionId: "",
    paymentType: "offline",
    note: "",
    paymentProofFile: [],
    paymentProofUrl: "",
    paymentMethod: "cash",
    referral: "",
    salesPerson: "",
    billingCycle: subscription?.billingCycle || "annually",
  };

  const formik: FormikProps<RenewSubscriptionProps> =
    useFormik<RenewSubscriptionProps>({
      initialValues,
      validationSchema,
      onSubmit: async (values: any) => {
        const subscriptionData = {
          transactionId: values.transactionId,
          paymentProofUrl: values.paymentProofUrl,
          note: values.note,
          paymentMethod: values.paymentMethod,
          salesPerson: values.salesPerson,
          paymentType: values.paymentType,
          billingCycle: values.billingCycle,
          isTrialConversion: subscription?.isTrial || false,
        };

        try {
          const subscriptionRes = await updateEntity(
            subscription.ownerRef,
            subscriptionData
          );

          localStorage.setItem("subscription", JSON.stringify(subscriptionRes));

          toast.success(t("Subscription renewed successfully"));
          router.push(tijarahPaths.dashboard.salesDashboard);
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

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  return (
    <>
      <Head>
        <title>{t("Renew Subscription | Tijarah360")}</title>
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
              {t("Renew Subscription")}
            </Typography>
            <LanguageSwitch />
          </Box>

          <Grid container spacing={5}>
            <Grid item md={7} xs={12}>
              <>
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
                    {t("Select Billing Cycle")}
                  </Typography>
                </Box>

                <Box sx={{ my: 2.5, ml: 1 }}>
                  <FormControl
                    fullWidth
                    error={
                      !!(
                        formik.touched.billingCycle &&
                        formik.errors.billingCycle
                      )
                    }
                  >
                    <RadioGroup
                      name="billingCycle"
                      onChange={(e) => {
                        const value = e.target.value as
                          | "quarterly"
                          | "annually";
                        formik.setFieldValue("billingCycle", value);
                        setSelectedBillingCycle(value);
                      }}
                      value={formik.values.billingCycle}
                      row
                    >
                      <FormControlLabel
                        value="quarterly"
                        control={<Radio />}
                        label={t("Quarterly")}
                      />
                      <FormControlLabel
                        value="annually"
                        control={<Radio />}
                        label={
                          <>
                            {t("Annually")}
                            {annualDiscountPercentage > 0 && (
                              <Typography
                                component="span"
                                variant="caption"
                                color="success.main"
                                sx={{ ml: 1, fontWeight: "medium" }}
                              >
                                ({t("SAVE")} {annualDiscountPercentage}%)
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </RadioGroup>
                    {formik.touched.billingCycle &&
                      formik.errors.billingCycle && (
                        <Typography color="error" variant="caption">
                          {formik.errors.billingCycle as string}
                        </Typography>
                      )}
                  </FormControl>
                </Box>
              </>

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
                  2
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
                      if (value === "online") {
                        toast.success(t("Coming Soon"));
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
                  </RadioGroup>
                </FormControl>
              </Box>

              {formik.values.paymentType === "offline" ? (
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
                        {t("Renew Subscription")}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              ) : (
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
                    {t("Renewal Summary")}
                  </Typography>
                </Box>
                <CardContent sx={{ px: 3, py: 2 }}>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {t("Package")}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {isRTL
                            ? selectedPlan?.name?.ar
                            : selectedPlan?.name?.en}
                          {" / "}
                          {billingCycle?.charAt(0).toUpperCase() +
                            billingCycle?.slice(1)}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {`${currency} ${toFixedNumber(packagePrice)}`}
                        </Typography>
                      </Box>
                    </Box>
                    {subscription?.addons?.length > 0 && (
                      <Box sx={{ p: 2, borderRadius: 1 }}>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          {t("Addons")}
                        </Typography>
                        {subscription?.addons?.map(
                          (addon: any, index: number) => {
                            const addonInPkg = selectedPlan?.addons?.find(
                              (a: any) => a.key === addon.key
                            );
                            const addonPriceInfo = getPriceInfo(
                              addonInPkg?.prices,
                              billingCycle
                            );

                            let addonNameWithQty;

                            if (
                              addon.key === "location_addon" ||
                              addon.key === "device_addon"
                            ) {
                              addonNameWithQty = `${addon.name} x ${addon.qty}`;
                            } else {
                              addonNameWithQty = addon.name;
                            }

                            return (
                              <Box
                                key={index}
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  mb: 1,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  color="text.primary"
                                >
                                  {addonNameWithQty}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.primary"
                                >
                                  {`${currency} ${toFixedNumber(
                                    addonPriceInfo.discountedPrice * addon.qty
                                  )}`}
                                </Typography>
                              </Box>
                            );
                          }
                        )}
                        <Divider sx={{ my: 1 }} />
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600 }}
                          >
                            {t("Total Addons")}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600 }}
                          >
                            {`${currency} ${toFixedNumber(getAddonsTotal())}`}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {subscription?.isTrial &&
                      subscription?.hardwares?.length > 0 && (
                        <Box sx={{ p: 2, borderRadius: 1 }}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            {t("Hardware")}
                          </Typography>
                          {subscription?.hardwares?.map(
                            (hardware: any, index: number) => (
                              <Box
                                key={index}
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  mb: 1,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  color="text.primary"
                                >
                                  {isRTL
                                    ? hardware.name?.ar
                                    : hardware.name?.en}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.primary"
                                >
                                  {`${currency} ${toFixedNumber(
                                    hardware.price
                                  )}`}
                                </Typography>
                              </Box>
                            )
                          )}
                          <Divider sx={{ my: 1 }} />
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600 }}
                            >
                              {t("Total Hardware")}
                            </Typography>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600 }}
                            >
                              {`${currency} ${toFixedNumber(
                                getHardwareTotal()
                              )}`}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    <Divider sx={{ my: 1 }} />
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="subtitle1" color="text.secondary">
                          {t("Subtotal")}
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 500 }}
                        >
                          {`${currency} ${toFixedNumber(getSubtotal())}`}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        border: "1px solid green",
                        p: 2,
                        borderRadius: 1,
                        mt: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {t("Total")}
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, color: "primary.dark" }}
                      >
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

export default SubscriptionRenewal;
