import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import { DatePicker } from "@mui/x-date-pickers";
import { MuiTextFieldProps } from "@mui/x-date-pickers/internals";
import { FormikProps, useFormik } from "formik";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { OgFileDropzone } from "src/components/original-File-dropzone";
import { useEntity } from "src/hooks/use-entity";
import i18n from "src/i18n";
import { getUploadedDocName } from "src/utils/get-uploaded-file-name";
import upload, { FileUploadNamespace } from "src/utils/uploadToS3";
import * as Yup from "yup";

interface CompanyDocsProps {
  open?: boolean;
  handleClose?: () => void;
  modalData?: any;
}

interface DocumentDataProps {
  docFile?: any[];
  docFileUrl?: string;
  documentNumber: string;
  vatRegistrationNumber?: string;
  commercialRegistrationNumber?: string;
  vatExpiryDate: Date;
  crnExpiryDate: Date;
  isVAT: boolean;
}

const validationSchema = Yup.object({
  isVAT: Yup.boolean(),
  // docFileUrl: Yup.string().required(i18n.t("Please Upload Document")),
  commercialRegistrationNumber: Yup.string().when("isVAT", (isVAT, field) =>
    !isVAT
      ? field.required(i18n.t("Commercial Registration number is required"))
      : field
  ),
  vatRegistrationNumber: Yup.string().when("isVAT", (isVAT, field) =>
    isVAT
      ? field
          .required(i18n.t("Document Number is required"))
          .matches(
            /^3.{13}3$/,
            i18n.t(
              "VAT Registartion Number must start and end with 3 and have 15 characters"
            )
          )
      : field
  ),
});

export const CompanyDocsModal = (props: CompanyDocsProps) => {
  const { t } = useTranslation();

  const { open, modalData, handleClose } = props;

  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { updateEntity } = useEntity("company");

  const theme = useTheme();

  const initialValues: DocumentDataProps = {
    docFileUrl: "",
    documentNumber: "",
    vatRegistrationNumber: "",
    commercialRegistrationNumber: "",
    vatExpiryDate: null,
    crnExpiryDate: null,
    isVAT: false,
  };

  const formik: FormikProps<DocumentDataProps> = useFormik<DocumentDataProps>({
    initialValues,
    validationSchema,

    onSubmit: async (values) => {
      const vatData = {
        vat: {
          docNumber: values.vatRegistrationNumber,
          url: values.docFileUrl,
          vatRef: modalData.document.vatRef,
          percentage: modalData.document.percentage,
          expiry: values.vatExpiryDate,
        },
      };
      const crnData = {
        commercialRegistrationNumber: {
          docNumber: values.commercialRegistrationNumber,
          url: values.docFileUrl,
          expiry: values.crnExpiryDate,
        },
      };

      try {
        if (formik.values.isVAT) {
          await updateEntity(modalData.companyId.toString(), {
            ...vatData,
          });
        } else {
          await updateEntity(modalData.companyId.toString(), {
            ...crnData,
          });
        }

        toast.success("Document Updated");
        handleClose();
      } catch (error) {
        toast.error(error.message);
      }
    },
  });

  const handleUploadLogo = async (files: any) => {
    setIsUploading(true);

    const namespace =
      modalData?.document?.label === "vat"
        ? FileUploadNamespace["vat-certificates"]
        : FileUploadNamespace["company-registrations"];

    try {
      const url = await upload(files, namespace);
      formik.setFieldValue("docFileUrl", url);

      setIsUploaded(true);
      setIsUploading(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const docFileDrop = (newFiles: any): void => {
    const sizes: any[] = newFiles?.map((op: any) => op?.size);

    if (sizes.find((o: any) => o > 999999)) {
      toast.error("File size cannot be greater than 1MB");
      return;
    }
    formik.setFieldValue("docFile", newFiles);
  };

  const docFileRemove = (): void => {
    formik.setFieldValue("docFile", []);
    formik.setFieldValue("docFileUrl", "");
  };

  const docFileRemoveAll = (): void => {
    formik.setFieldValue("docFile", []);
  };

  useEffect(() => {
    if (open) {
      formik.resetForm();

      if (modalData?.document?.label === "vat") {
        formik.setFieldValue(
          "vatRegistrationNumber",
          modalData.document.docNumber
        );
        formik.setFieldValue("vatExpiryDate", modalData.document.expiry);

        formik.setFieldValue("isVAT", true);
      } else {
        formik.setFieldValue(
          "commercialRegistrationNumber",
          modalData.document.docNumber
        );
        formik.setFieldValue("crnExpiryDate", modalData.document.expiry);
      }

      formik.setFieldValue("docFileUrl", modalData.document.url || "");
    }
  }, [open]);

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="sm"
        open={open}
        onClose={() => {
          formik.resetForm();
          handleClose();
        }}
      >
        {/* header */}

        <Box
          sx={{
            display: "flex",
            p: 2,
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor:
              theme.palette.mode === "light" ? "#fff" : "#111927",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          ></Box>

          <Typography sx={{ ml: 2 }} variant="h6">
            {modalData?.document?.name}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": {
                backgroundColor: "action.hover",
                cursor: "pointer",
                opacity: 0.5,
              },
            }}
          >
            <CloseIcon fontSize="medium" onClick={handleClose} />
          </Box>
        </Box>

        <Divider />

        {/* body */}
        <DialogContent>
          <form onSubmit={() => formik.handleSubmit()}>
            <Stack spacing={2}>
              <Box>
                <Typography color="textSecondary" variant="body2">
                  {t("Please upload the document")}
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <OgFileDropzone
                    accept={{
                      "image/*": [],
                      "application/pdf": [],
                    }}
                    caption="(SVG, JPG, PNG, PDF, or gif)"
                    files={formik.values.docFile}
                    imageName={getUploadedDocName(formik.values.docFileUrl)}
                    uploadedImageUrl={formik.values.docFileUrl}
                    onDrop={docFileDrop}
                    onUpload={handleUploadLogo}
                    onRemove={docFileRemove}
                    onRemoveAll={docFileRemoveAll}
                    maxFiles={1}
                    isUploaded={isUploaded}
                    setIsUploaded={setIsUploaded}
                    isUploading={isUploading}
                  />

                  {Boolean(formik.touched.docFileUrl) && (
                    <Typography
                      color="error.main"
                      sx={{
                        fontSize: "12px",
                        fontWeight: 500,
                        margin: "5px 14px 0 14px",
                      }}
                    >
                      {formik.errors.docFileUrl}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ mt: 2 }}>
                {modalData?.document?.label === "vat" ? (
                  <TextField
                    inputProps={{
                      minLength: 15,
                      maxLength: 15,
                      style: { textTransform: "uppercase" },
                    }}
                    error={
                      !!(
                        formik.touched.vatRegistrationNumber &&
                        formik.errors.vatRegistrationNumber
                      )
                    }
                    fullWidth
                    helperText={
                      formik.touched.vatRegistrationNumber &&
                      formik.errors.vatRegistrationNumber
                    }
                    label={t("VAT Registration Number")}
                    name="vatRegistrationNumber"
                    onBlur={formik.handleBlur}
                    onChange={(e) => {
                      formik.handleChange("vatRegistrationNumber")(
                        e.target.value.trim()
                      );
                    }}
                    value={formik.values.vatRegistrationNumber
                      .replace(/[^A-Za-z0-9]/, "")
                      .trim()}
                    required
                  />
                ) : (
                  <TextField
                    inputProps={{
                      minLength: 15,
                      maxLength: 15,
                      style: { textTransform: "uppercase" },
                    }}
                    error={
                      !!(
                        formik.touched.commercialRegistrationNumber &&
                        formik.errors.commercialRegistrationNumber
                      )
                    }
                    fullWidth
                    helperText={
                      formik.touched.commercialRegistrationNumber &&
                      formik.errors.commercialRegistrationNumber
                    }
                    label={t("Commercial Registration Number")}
                    name="commercialRegistrationNumber"
                    onBlur={formik.handleBlur}
                    onChange={(e) => {
                      formik.handleChange("commercialRegistrationNumber")(
                        e.target.value.trim()
                      );
                    }}
                    value={formik.values.commercialRegistrationNumber
                      .replace(/[^A-Za-z0-9]/, "")
                      .trim()}
                    required
                  />
                )}
              </Box>

              <Box sx={{ mt: 3 }}>
                {formik.values.isVAT ? (
                  <DatePicker
                    label={t("Expiry Date")}
                    inputFormat="dd/MM/yyyy"
                    onChange={(date: Date | null): void => {
                      formik.setFieldValue("vatExpiryDate", date);
                    }}
                    minDate={new Date()}
                    value={formik.values.vatExpiryDate || null}
                    renderInput={(
                      params: JSX.IntrinsicAttributes & MuiTextFieldProps
                    ) => (
                      <TextField
                        required
                        fullWidth
                        {...params}
                        helperText={
                          (formik.touched.vatExpiryDate &&
                            formik.errors.vatExpiryDate) as any
                        }
                        error={Boolean(
                          formik.touched.vatExpiryDate &&
                            formik.errors.vatExpiryDate
                        )}
                        onBlur={formik.handleBlur("expiryDate")}
                      />
                    )}
                  />
                ) : (
                  <DatePicker
                    label={t("Expiry Date")}
                    inputFormat="dd/MM/yyyy"
                    onChange={(date: Date | null): void => {
                      formik.setFieldValue("crnExpiryDate", date);
                    }}
                    minDate={new Date()}
                    value={formik.values.crnExpiryDate || null}
                    renderInput={(
                      params: JSX.IntrinsicAttributes & MuiTextFieldProps
                    ) => (
                      <TextField
                        required
                        fullWidth
                        {...params}
                        helperText={
                          (formik.touched.crnExpiryDate &&
                            formik.errors.crnExpiryDate) as any
                        }
                        error={Boolean(
                          formik.touched.crnExpiryDate &&
                            formik.errors.crnExpiryDate
                        )}
                        onBlur={formik.handleBlur("expiryDate")}
                      />
                    )}
                  />
                )}
              </Box>
            </Stack>
          </form>
        </DialogContent>

        <Divider />
        {/* footer */}

        <DialogActions sx={{ p: 2 }}>
          <LoadingButton
            sx={{ borderRadius: 1 }}
            onClick={() => {
              formik.handleSubmit();
            }}
            size="medium"
            variant="contained"
            type="submit"
          >
            {t("Submit")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};
