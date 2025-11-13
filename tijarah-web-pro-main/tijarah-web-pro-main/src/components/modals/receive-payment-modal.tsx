import {
  Box,
  Button,
  Card,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/system";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useFormik } from "formik";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { AttachmentDropzone } from "src/components/attachment-dropzone";
import { ImageCropModal } from "src/components/modals/image-crop-modal";
import { useEntity } from "src/hooks/use-entity";
import upload, { FileUploadNamespace } from "src/utils/uploadToS3";
import * as Yup from "yup";

const paymentOptions = [
  { label: "Cash", value: "cash" },
  { label: "Card", value: "card" },
  { label: "Account Transfer", value: "accountTransfer" },
];

const validationSchema = Yup.object({
  paymentMethod: Yup.string().required("Select a payment method"),
  transactionId: Yup.string().max(
    40,
    "Reference No. / Transaction ID must not be greater than 40 characters"
  ),
  salesPerson: Yup.string().max(
    60,
    "Sales person name must not be greater than 60 characters"
  ),
  note: Yup.string().max(70, "Note must not be greater than 70 characters"),
  amount: Yup.number()
    .required("Payment amount is required")
    .positive("Amount must be positive"),
});

interface ReceivePaymentProps {
  paymentMethod: string;
  transactionId: string;
  salesPerson: string;
  note: string;
  paymentProofFile: any[];
  paymentProofUrl: string;
  amount: number;
}

const ReceivePaymentModal = ({
  openPaymentModal,
  setOpenPaymentModal,
  subscription,
  invoice,
}: any) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [openCropModal, setOpenCropModal] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";
  const { create } = useEntity("subscription/payment");

  const createFileFromUrl = (url: string) => {
    if (!url) return [];
    const fileName = url.split("/").pop() || "payment-proof";
    const fileType = fileName.endsWith(".pdf") ? "application/pdf" : "image/*";
    return [new File([], fileName, { type: fileType })];
  };

  const formik = useFormik<ReceivePaymentProps>({
    initialValues: {
      paymentMethod: invoice?.paymentMethod,
      transactionId: "",
      salesPerson: subscription?.salesPerson || "",
      note: `Payment for Invoice #${invoice?.invoiceNum} `,
      paymentProofFile: createFileFromUrl(invoice?.paymentProofUrl),
      paymentProofUrl: invoice?.paymentProofUrl || "",
      amount: invoice?.billing?.total,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const payload = {
        subscriptionId: subscription?._id,
        paymentMethod: values.paymentMethod,
        amount: values.amount,
        paymentDate: new Date(),
        transactionId: values.transactionId,
        salesPerson: values.salesPerson,
        note: values.note,
        paymentProofUrl: values.paymentProofUrl,
        companyRef: subscription?.companyRef,
        invoiceId: invoice?._id,
      };

      try {
        await create(payload);
        toast.success(t("Payment received successfully"));
        setOpenPaymentModal(false);
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
        t("File type not supported or limit the image size within 1 MB")
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
    // Update the file list with a new placeholder file based on the cropped URL
    formik.setFieldValue(
      "paymentProofFile",
      createFileFromUrl(croppedImageUrl)
    );
  };

  const handleUpload = async (files: any) => {
    setIsUploading(true);
    try {
      if (files[0].type === "application/pdf") {
        const url = await upload(files, FileUploadNamespace["payment-gateway"]);
        formik.setFieldValue("paymentProofUrl", url);
        formik.setFieldValue("paymentProofFile", files); // Keep the uploaded file in the dropzone
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

  return (
    <Modal open={openPaymentModal}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Card
          sx={{
            width: { xs: "95%", sm: "85%", md: "600px" },
            maxHeight: "95vh",
            overflowY: "auto",
            borderRadius: 3,
            boxShadow: 4,
            bgcolor: "background.paper",
            p: 4,
            direction: isRTL ? "rtl" : "ltr",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
              borderBottom: `1px solid ${theme.palette.divider}`,
              pb: 2,
            }}
          >
            <Typography variant="h5" fontWeight="700">
              {t("Receive Payment for Invoice #")}
              {invoice?.invoiceNum}
            </Typography>
            <XCircle
              fontSize="medium"
              onClick={() => setOpenPaymentModal(false)}
            />
          </Box>

          <Container disableGutters>
            <form onSubmit={formik.handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>{t("Payment Method")}</InputLabel>
                  <Select
                    name="paymentMethod"
                    value={formik.values.paymentMethod}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label={t("Payment Method")}
                    error={
                      !!(
                        formik.touched.paymentMethod &&
                        formik.errors.paymentMethod
                      )
                    }
                  >
                    {paymentOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {t(option.label)}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.paymentMethod &&
                    formik.errors.paymentMethod && (
                      <Typography color="error" variant="caption">
                        {formik.errors.paymentMethod}
                      </Typography>
                    )}
                </FormControl>
              </Box>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label={t("Amount")}
                  name="amount"
                  type="number"
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={!!(formik.touched.amount && formik.errors.amount)}
                  helperText={formik.touched.amount && formik.errors.amount}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label={t("Reference No. / Transaction ID")}
                  name="transactionId"
                  value={formik.values.transactionId}
                  onChange={(e) =>
                    formik.setFieldValue(
                      "transactionId",
                      e.target.value.replace(/[^A-Za-z0-9]/, "")
                    )
                  }
                  onBlur={formik.handleBlur}
                  error={
                    !!(
                      formik.touched.transactionId &&
                      formik.errors.transactionId
                    )
                  }
                  helperText={
                    formik.touched.transactionId && formik.errors.transactionId
                  }
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label={t("Sales Person")}
                  name="salesPerson"
                  value={formik.values.salesPerson}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    !!(formik.touched.salesPerson && formik.errors.salesPerson)
                  }
                  helperText={
                    formik.touched.salesPerson && formik.errors.salesPerson
                  }
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label={t("Note")}
                  name="note"
                  multiline
                  rows={4}
                  value={formik.values.note}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={!!(formik.touched.note && formik.errors.note)}
                  helperText={formik.touched.note && formik.errors.note}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <AttachmentDropzone
                  accept={{ "image/*": [], "application/pdf": [] }}
                  files={formik.values.paymentProofFile}
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
                  imageName=""
                />
              </Box>

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setOpenPaymentModal(false)}
                  sx={{ textTransform: "none", px: 3, py: 0.75 }}
                >
                  {t("Cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ textTransform: "none", px: 3, py: 0.75 }}
                >
                  {t("Submit Payment")}
                </Button>
              </Box>
            </form>
          </Container>
        </Card>

        <ImageCropModal
          open={openCropModal}
          handleClose={() => {
            setOpenCropModal(false);
            setImgSrc("");
          }}
          handleCroppedImage={handleCroppedImage}
          imgSrcUrl={imgSrc}
          fileUploadNameSpace={FileUploadNamespace["payment-gateway"]}
        />
      </Box>
    </Modal>
  );
};

export default ReceivePaymentModal;
