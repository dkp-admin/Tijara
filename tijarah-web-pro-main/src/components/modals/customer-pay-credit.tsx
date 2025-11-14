import { LoadingButton } from "@mui/lab";
import {
  Button,
  Card,
  Divider,
  Grid,
  Radio,
  Stack,
  TextField,
  TextFieldProps,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { FormikProps, useFormik } from "formik";
import * as React from "react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import serviceCaller from "src/api/serviceCaller";
import { getUploadedDocName } from "src/utils/get-uploaded-file-name";
import { toFixedNumber } from "src/utils/toFixedNumber";
import upload, { FileUploadNamespace } from "src/utils/uploadToS3";
import * as Yup from "yup";
import { AttachmentDropzone } from "../attachment-dropzone";
import { ImageCropModal } from "./image-crop-modal";
import { useCurrency } from "src/utils/useCurrency";

interface CustomerPayCreditModalProps {
  open?: boolean;
  handleClose?: () => void;
  modalData?: any;
  onSuccess?: any;
}

interface FeatureProps {
  type: string;
  amount: number;
  cardNum: string;
  transferNum: string;
  date: Date;
  attachmentFile: any[];
  attachmentUrl: string;
  note: string;
}

export const CustomerPayCreditModal: React.FC<CustomerPayCreditModalProps> = ({
  open,
  handleClose,
  modalData,
  onSuccess,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const currency = useCurrency();

  const [isUploaded, setIsUploaded] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [openCropModal, setOpenCropModal] = React.useState(false);
  const [imgSrc, setImgSrc] = React.useState("");

  const formik: FormikProps<FeatureProps> = useFormik<FeatureProps>({
    initialValues: {
      type: "",
      amount: null,
      cardNum: "",
      transferNum: "",
      date: null,
      attachmentFile: [],
      attachmentUrl: "",
      note: "",
    },

    onSubmit: async (values) => {
      try {
        const res = await serviceCaller(`/credit/receive-payment`, {
          method: "POST",
          body: {
            customerRef: modalData?.customerRef,
            customer: {
              name: modalData?.customerName,
            },
            companyRef: modalData?.companyRef,
            company: {
              name: modalData?.companyName,
            },
            paymentMethod: values.type,
            amount: values.amount,
            dueAmount: Number(modalData?.payableAmount) - values.amount,
            payableAmount: modalData?.payableAmount,
            transactionType: "credit",
            cardNumber:
              values.type === "accountTransfer"
                ? values.transferNum
                : values.type === "card"
                ? values.cardNum
                : "",
            transferDate: values.date || "",
            fileUrl: values.attachmentUrl,
            description: values.note,
          },
        });

        queryClient.invalidateQueries("find-one-customer");
        queryClient.invalidateQueries("find-credit");

        if (res) {
          toast.success(t("Payment received successfully"));
        }

        handleClose();
      } catch (err) {
        toast.error(err.message);
      }
    },

    validationSchema: Yup.object({
      type: Yup.string().required(t("Payment type selection is required")),
      amount: Yup.number()
        .required(t("Amount is required"))
        .test(
          t("Greater than 0?"),
          t("Amount must be greater than 0"),
          (value) => value > 0
        )
        .test(
          t("Is valid amount?"),
          t("Amount should be less than payable amount"),
          (value) => value <= Number(modalData?.payableAmount)
        )
        .nullable(),
      note: Yup.string().max(
        70,
        t("Note must not be greater than 70 characters")
      ),
    }),
  });

  const handleUploadAttachment = async (files: any) => {
    setIsUploading(true);

    try {
      if (files[0].type === "application/pdf") {
        const url = await upload(
          files,
          FileUploadNamespace["customer-pay-credit-images"]
        );
        formik.setFieldValue("attachmentUrl", url);
      } else {
        const file = files[0];
        const tempUrl = URL.createObjectURL(file);
        setImgSrc(tempUrl);
      }

      setIsUploaded(true);
      setIsUploading(false);
    } catch (error) {
      toast.error(error.message);
      setIsUploading(false);
    }
  };

  const docFileDrop = async (newFiles: any) => {
    if (newFiles?.length > 1) {
      toast.error(t("Please select one image to upload"));
      return;
    }

    formik.setFieldValue("attachmentFile", newFiles);

    if (newFiles[0]) {
      if (newFiles[0].type !== "application/pdf") {
        setOpenCropModal(true);
      }
    } else {
      toast.error(
        `${t("File type not supported or limit the image size within 1 MB")}`
      );
    }
  };

  const docFileRemove = (): void => {
    formik.setFieldValue("attachmentFile", []);
    formik.setFieldValue("attachmentUrl", "");
  };

  const docFileRemoveAll = (): void => {
    formik.setFieldValue("attachmentFile", []);
  };

  const handleCroppedImage = (croppedImageUrl: any) => {
    formik.setFieldValue("attachmentUrl", croppedImageUrl);
  };

  const showMargin = (): string => {
    const payableAmount = Number(modalData?.payableAmount);
    const amount = formik.values.amount;

    if (payableAmount && amount) {
      const marginAmount = payableAmount - amount;

      return `${currency} ${marginAmount.toFixed(2)}`;
    } else {
      return `${currency} ${payableAmount.toFixed(2)}`;
    }
  };

  useEffect(() => {
    formik.resetForm();
    formik.setFieldValue("amount", modalData?.payableAmount || null);
  }, [open]);

  return (
    <Box>
      <Modal open={open}>
        <Card
          sx={{
            visibility: "visible",
            scrollbarColor: "transparent",
            scrollBehavior: "auto",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "100vw",
              sm: "100vw",
              md: "70vw",
              lg: "50vw",
            },
            maxHeight: {
              xs: "100vh",
              sm: "100vh",
              md: "90vh",
              lg: "90vh",
            },
            borderRadius: {
              xs: "0px",
              sm: "0px",
              md: "20px",
              lg: "20px",
            },
            py: 2,
          }}
        >
          <Box
            sx={{
              py: 1.5,
              pl: 2.5,
              pr: 2.5,
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1,
              height: "50px",
              flex: "0 0 auto",
              position: "fixed",
              background: theme.palette.mode !== "dark" ? `#fff` : "#111927",
            }}
          >
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-evenly",
              }}
            >
              <XCircle
                fontSize="small"
                onClick={handleClose}
                style={{ cursor: "pointer" }}
              />

              <Box style={{ flex: 1 }}>
                <Typography variant="h5" align="center" sx={{ mr: 4 }}>
                  {t("Receive Credit Payment")}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ mt: 5 }} />

          <Box
            sx={{
              px: 3,
              pt: 3,
              pb: 3,
              maxHeight: {
                xs: "calc(100vh - 75px)",
                sm: "calc(100vh - 75px)",
                md: "calc(90vh - 75px)",
                lg: "calc(90vh - 75px)",
              },
              width: "100%",
              flex: "1 1 auto",
              overflow: "scroll",
              overflowX: "hidden",
            }}
          >
            <form noValidate onSubmit={formik.handleSubmit}>
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  pb: 4,
                  mb: 5,
                }}
              >
                <TextField
                  disabled
                  fullWidth
                  label={t("Customer")}
                  name="name"
                  onChange={() => {}}
                  value={modalData?.customerName}
                />

                <TextField
                  sx={{ mt: 3 }}
                  disabled
                  fullWidth
                  label={t("Payable Amount")}
                  name="name"
                  onChange={() => {}}
                  value={`${currency} ${toFixedNumber(
                    modalData?.payableAmount
                  )}`}
                />

                <Grid container spacing={1} sx={{ mt: 1.5 }}>
                  <Grid item md={3} xs={4}>
                    <Box
                      sx={{
                        alignItems: "center",
                        cursor: "pointer",
                        display: "flex",
                      }}
                      onClick={() => {
                        formik.resetForm();
                        formik.setFieldValue("type", "cash");
                        formik.setFieldValue(
                          "amount",
                          modalData?.payableAmount || null
                        );
                      }}
                    >
                      <Stack
                        direction="row"
                        sx={{ alignItems: "center" }}
                        spacing={2}
                      >
                        <Radio
                          color="primary"
                          checked={formik.values.type === "cash"}
                        />
                        <div>
                          <Typography variant="subtitle1">
                            {t("Cash")}
                          </Typography>
                        </div>
                      </Stack>
                    </Box>
                  </Grid>

                  <Grid item md={3} xs={4}>
                    <Box
                      sx={{
                        alignItems: "center",
                        cursor: "pointer",
                        display: "flex",
                      }}
                      onClick={() => {
                        formik.resetForm();
                        formik.setFieldValue("type", "card");
                        formik.setFieldValue(
                          "amount",
                          modalData?.payableAmount || null
                        );
                      }}
                    >
                      <Stack
                        direction="row"
                        sx={{ alignItems: "center" }}
                        spacing={2}
                      >
                        <Radio
                          color="primary"
                          checked={formik.values.type === "card"}
                        />
                        <div>
                          <Typography variant="subtitle1">
                            {t("Card")}
                          </Typography>
                        </div>
                      </Stack>
                    </Box>
                  </Grid>

                  <Grid item md={3} xs={4}>
                    <Box
                      sx={{
                        alignItems: "center",
                        cursor: "pointer",
                        display: "flex",
                      }}
                      onClick={() => {
                        formik.resetForm();
                        formik.setFieldValue("type", "accountTransfer");
                        formik.setFieldValue(
                          "amount",
                          modalData?.payableAmount || null
                        );
                      }}
                    >
                      <Stack
                        direction="row"
                        sx={{ alignItems: "center" }}
                        spacing={2}
                      >
                        <Radio
                          color="primary"
                          checked={formik.values.type === "accountTransfer"}
                        />
                        <div>
                          <Typography variant="subtitle1">
                            {t("A/C Transfer")}
                          </Typography>
                        </div>
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>

                {Boolean(formik.touched.type) && (
                  <Typography
                    color="error.main"
                    sx={{
                      fontSize: "12px",
                      fontWeight: 500,
                      margin: "5px 14px 0 14px",
                    }}
                  >
                    {formik.errors.type}
                  </Typography>
                )}

                {formik.values.type === "card" && (
                  <TextField
                    sx={{
                      mt: 2.5,
                      "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                        {
                          display: "none",
                        },
                      "& input[type=number]": {
                        MozAppearance: "textfield",
                      },
                    }}
                    fullWidth
                    name="cardNum"
                    label={t("Card Number")}
                    onBlur={formik.handleBlur}
                    onChange={(e) => {
                      const val = e.target.value;

                      if (val === "" || /^[0-9\b]+$/.test(val)) {
                        formik.setFieldValue("cardNum", val);
                      }
                    }}
                    value={formik.values.cardNum}
                  />
                )}

                {formik.values.type === "accountTransfer" && (
                  <TextField
                    sx={{
                      mt: 2.5,
                      "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                        {
                          display: "none",
                        },
                      "& input[type=number]": {
                        MozAppearance: "textfield",
                      },
                    }}
                    fullWidth
                    name="transferNum"
                    label={t("Transfer Number")}
                    onBlur={formik.handleBlur}
                    onChange={(e) => {
                      const val = e.target.value;

                      if (val === "" || /^[0-9\b]+$/.test(val)) {
                        formik.setFieldValue("transferNum", val);
                      }
                    }}
                    value={formik.values.transferNum}
                  />
                )}

                {formik.values.type &&
                  formik.values.type !== "accountTransfer" && (
                    <Box>
                      <TextField
                        sx={{
                          mt: formik.values.type === "cash" ? 2.5 : 3,
                          "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                            {
                              display: "none",
                            },
                          "& input[type=number]": {
                            MozAppearance: "textfield",
                          },
                        }}
                        fullWidth
                        required
                        label={t(`Amount (in ${currency})`)}
                        name="amount"
                        error={Boolean(
                          formik.touched.amount && formik.errors.amount
                        )}
                        helperText={
                          (formik.touched.amount && formik.errors.amount) as any
                        }
                        onChange={(e) => {
                          const val = e.target.value;

                          if (
                            val === "" ||
                            /^[0-9]*(\.[0-9]{0,2})?$/.test(val)
                          ) {
                            formik.setFieldValue("amount", val);
                          }
                        }}
                        value={formik.values.amount}
                      />

                      <Box sx={{ mt: 3 }}>
                        <TextField
                          fullWidth
                          label={t("Due Amount")}
                          disabled
                          value={showMargin()}
                          onChange={formik.handleChange}
                        />
                      </Box>
                    </Box>
                  )}

                {formik.values.type === "accountTransfer" && (
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
                        sx={{
                          mt: 1,
                          "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                            {
                              display: "none",
                            },
                          "& input[type=number]": {
                            MozAppearance: "textfield",
                          },
                        }}
                        fullWidth
                        required
                        label={t(`Amount (in ${currency})`)}
                        name="amount"
                        error={Boolean(
                          formik.touched.amount && formik.errors.amount
                        )}
                        helperText={
                          (formik.touched.amount && formik.errors.amount) as any
                        }
                        onChange={(e) => {
                          const val = e.target.value;

                          if (
                            val === "" ||
                            /^[0-9]*(\.[0-9]{0,2})?$/.test(val)
                          ) {
                            formik.setFieldValue("amount", val);
                          }
                        }}
                        value={formik.values.amount}
                      />

                      <Box sx={{ mt: 3 }}>
                        <TextField
                          fullWidth
                          label={t("Due Amount")}
                          disabled
                          value={showMargin()}
                          onChange={formik.handleChange}
                        />
                      </Box>

                      <Box sx={{ mt: 3 }}>
                        <DatePicker
                          //@ts-ignore
                          inputProps={{ disabled: true }}
                          label={t("Transfer Date")}
                          inputFormat="dd/MM/yyyy"
                          onChange={(date: Date | null): void => {
                            formik.setFieldValue("date", date);
                          }}
                          maxDate={new Date()}
                          value={formik.values.date}
                          renderInput={(
                            params: JSX.IntrinsicAttributes & TextFieldProps
                          ) => (
                            <TextField
                              fullWidth
                              {...params}
                              onBlur={formik.handleBlur("date")}
                            />
                          )}
                        />
                      </Box>
                    </Box>

                    <Box>
                      <Typography
                        color="textSecondary"
                        sx={{ mt: 1 }}
                        variant="body2"
                      >
                        {t("Please upload the attachment")}
                      </Typography>

                      <Box
                        sx={{
                          mt: 2,
                          display: "flex",
                          flex: 0.2,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <AttachmentDropzone
                          accept={{
                            "image/*": [],
                            "application/pdf": [],
                          }}
                          files={formik.values.attachmentFile}
                          imageName={getUploadedDocName(
                            formik?.values?.attachmentUrl
                          )}
                          uploadedImageUrl={formik?.values?.attachmentUrl}
                          onDrop={docFileDrop}
                          onUpload={handleUploadAttachment}
                          onRemove={docFileRemove}
                          onRemoveAll={docFileRemoveAll}
                          maxFiles={1}
                          maxSize={999999}
                          isUploaded={isUploaded}
                          setIsUploaded={setIsUploaded}
                          isUploading={isUploading}
                        />
                      </Box>
                    </Box>
                  </Box>
                )}

                {formik.values.type && (
                  <TextField
                    sx={{ mt: 3 }}
                    autoComplete="off"
                    label={t("Note")}
                    name="note"
                    multiline
                    rows={4}
                    fullWidth
                    error={Boolean(formik.touched.note && formik.errors.note)}
                    helperText={
                      (formik.touched.note && formik.errors.note) as any
                    }
                    onChange={(e) => {
                      formik.handleChange(e);
                    }}
                    value={formik.values.note}
                  />
                )}
              </Box>
            </form>
          </Box>

          <Box
            sx={{
              py: 3,
              px: 3,
              bottom: 0,
              width: "100%",
              position: "absolute",
              display: "flex",
              height: "95px",
              zIndex: 999,
              justifyContent: "flex-end",
              background: theme.palette.mode !== "dark" ? `#fff` : "#111927",
            }}
          >
            <Button onClick={handleClose} variant="outlined" sx={{ mr: 3 }}>
              {t("Cancel")}
            </Button>

            <LoadingButton
              loading={formik.isSubmitting}
              size="large"
              variant="contained"
              type="submit"
              onClick={() => formik.handleSubmit()}
            >
              {t("Receive Payment")}
            </LoadingButton>
          </Box>
        </Card>
      </Modal>

      <ImageCropModal
        open={openCropModal}
        handleClose={() => {
          setOpenCropModal(false);
          setImgSrc(null);
        }}
        handleCroppedImage={handleCroppedImage}
        imgSrcUrl={imgSrc}
        fileUploadNameSpace={FileUploadNamespace["customer-pay-credit-images"]}
      />
    </Box>
  );
};
