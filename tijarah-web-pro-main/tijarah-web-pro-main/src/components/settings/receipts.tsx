import {
  Box,
  Button,
  Card,
  CardContent,
  FormHelperText,
  Stack,
  Switch,
  TextField,
  Typography,
  Unstable_Grid2 as Grid,
} from "@mui/material";
import { useFormik } from "formik";
import React, { FC, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { getUploadedDocName } from "../../utils/get-uploaded-file-name";
import * as Yup from "yup";
import { FileDropzone } from "../file-dropzone";
import { QuillEditor } from "../quill-editor";
import { LoadingButton } from "@mui/lab";
import { t } from "i18next";

interface Values {
  logoFile: any[];
  logoUrl: string;
  storeNameEng: string;
  storeNameAr: string;
  vatNumber: string;
  address: string;
  invoiceFooter: string;
  noOfBillPrints: number;
  returnPolicy: string;
  customText: string;
  receiptBarcode: boolean;
}

const initialValues: Values = {
  logoFile: [],
  logoUrl: "",
  storeNameEng: "",
  storeNameAr: "",
  vatNumber: "",
  address: "",
  invoiceFooter: "",
  noOfBillPrints: 0,
  returnPolicy: "",
  customText: "",
  receiptBarcode: false,
};

const validationSchema = Yup.object({
  logoUrl: Yup.string().required("Please Upload the Logo"),
  storeNameEng: Yup.string().required("Store Name is required"),
  storeNameAr: Yup.string().required("Store Name is required"),
  vatNumber: Yup.string()
    .required(`${t("VAT Registartion Number is required")}`)
    .matches(
      /^3\d{13}3$/,
      t("VAT Registartion Number must start and end with 3 and have 15 numbers")
    ),
  address: Yup.string().required("Address is required"),
  invoiceFooter: Yup.string().required("Invoice Footer is required"),
  noOfBillPrints: Yup.string()
    .required("No of bill prints is required")
    .min(1, "No of bill prints must be grater than 0")
    .max(5, "No of bill prints must be less than or equal to 5"),
  returnPolicy: Yup.string().max(500),
  customText: Yup.string().max(500),
});

export const ReceiptsSettings: FC = (props) => {
  const { t } = useTranslation();

  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      try {
        // NOTE: Make API request
        toast.success("Settings Saved");
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong!");
      }
    },
  });

  const logoFileDrop = (newFiles: any): void => {
    formik.setFieldValue("logoFile", newFiles);
  };

  const logoFileRemove = (): void => {
    formik.setFieldValue("logoFile", []);
    formik.setFieldValue("logoUrl", "");
  };

  const logoFileRemoveAll = (): void => {
    formik.setFieldValue("logoFile", []);
  };

  const onSuccess = (fileName: string | undefined) => {
    formik.setFieldValue("logoUrl", fileName);
  };

  const handleUpload = async (files: any) => {
    setIsUploading(true);
    try {
      //@ts-ignore
      const url = await upload(files, namespace);
      onSuccess(url);
      setIsUploaded(true);
      setIsUploading(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={formik.handleSubmit} {...props}>
      <Stack spacing={4}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid xs={12} md={4}>
                <Stack spacing={1}>
                  <Typography variant="h6">{t("Logo")}</Typography>

                  <Typography color="text.secondary" variant="body2">
                    {t("Logo will appear in the receipt")}
                  </Typography>
                </Stack>
              </Grid>

              <Grid xs={12} md={8}>
                <FileDropzone
                  accept={{
                    "image/*": [],
                    "application/pdf": [],
                  }}
                  caption="(SVG, JPG, PNG, PDF, or gif)"
                  files={formik.values.logoFile}
                  imageName={getUploadedDocName(formik.values.logoUrl)}
                  uploadedImageUrl={formik.values.logoUrl}
                  onDrop={logoFileDrop}
                  //@ts-ignore
                  onUpload={handleUpload}
                  onRemove={logoFileRemove}
                  onRemoveAll={logoFileRemoveAll}
                  maxFiles={1}
                  isUploaded={isUploaded}
                  setIsUploaded={setIsUploaded}
                  isUploading={isUploading}
                />
                {!!(formik.touched.logoUrl && formik.errors.logoUrl) && (
                  <Box sx={{ mt: 2 }}>
                    <FormHelperText error>
                      {formik.errors.logoUrl}
                    </FormHelperText>
                  </Box>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid xs={12} md={4}>
                <Typography variant="h6">{t("Location Details")}</Typography>
              </Grid>

              <Grid xs={12} md={8}>
                <Stack spacing={3}>
                  <TextField
                    error={
                      !!(
                        formik.touched.storeNameEng &&
                        formik.errors.storeNameEng
                      )
                    }
                    fullWidth
                    helperText={
                      formik.touched.storeNameEng && formik.errors.storeNameEng
                    }
                    label={t("Store Name (English)")}
                    name="storeNameEng"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.storeNameEng}
                    required
                  />

                  <TextField
                    error={
                      !!(
                        formik.touched.storeNameAr && formik.errors.storeNameAr
                      )
                    }
                    fullWidth
                    helperText={
                      formik.touched.storeNameAr && formik.errors.storeNameAr
                    }
                    label={t("Store Name (Arabic)")}
                    name="storeNameAr"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.storeNameAr}
                    required
                  />

                  <TextField
                    error={
                      !!(formik.touched.vatNumber && formik.errors.vatNumber)
                    }
                    fullWidth
                    helperText={
                      formik.touched.vatNumber && formik.errors.vatNumber
                    }
                    label={t("VAT Number")}
                    name="vatNumber"
                    onBlur={formik.handleBlur}
                    onChange={(e) => {
                      formik.handleChange("vatNumber")(e.target.value?.trim());
                    }}
                    value={formik.values.vatNumber
                      ?.replace(/[^A-Za-z0-9]/, "")
                      ?.trim()}
                    required
                  />

                  <TextField
                    error={!!(formik.touched.address && formik.errors.address)}
                    fullWidth
                    helperText={formik.touched.address && formik.errors.address}
                    label={t("Address")}
                    name="address"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.address}
                    required
                  />
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid xs={12} md={4}>
                <Typography variant="h6">{t("Invoice Details")}</Typography>
              </Grid>

              <Grid xs={12} md={8}>
                <TextField
                  error={
                    !!(
                      formik.touched.invoiceFooter &&
                      formik.errors.invoiceFooter
                    )
                  }
                  fullWidth
                  helperText={
                    formik.touched.invoiceFooter && formik.errors.invoiceFooter
                  }
                  label={t("Invoice Footer")}
                  name="invoiceFooter"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.invoiceFooter}
                  required
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid xs={12} md={4}>
                <Typography variant="h6">{t("Bill Details")}</Typography>
              </Grid>

              <Grid xs={12} md={8}>
                <TextField
                  error={
                    !!(
                      formik.touched.noOfBillPrints &&
                      formik.errors.noOfBillPrints
                    )
                  }
                  fullWidth
                  type="number"
                  helperText={
                    formik.touched.noOfBillPrints &&
                    formik.errors.noOfBillPrints
                  }
                  label={t("No of bill prints")}
                  name="noOfBillPrints"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.noOfBillPrints}
                  required
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid xs={12} md={4}>
                <Typography variant="h6">{t("Other Details")}</Typography>
              </Grid>

              <Grid xs={12} md={8}>
                <Stack spacing={4}>
                  <div>
                    <Typography sx={{ mb: 2 }} variant="subtitle2">
                      {t("Return Policy")}
                    </Typography>

                    <QuillEditor
                      onChange={(value: string): void => {
                        formik.setFieldValue("returnPolicy", value);
                      }}
                      placeholder={t("Write something").toString()}
                      sx={{ height: 160 }}
                      value={formik.values.returnPolicy}
                    />
                  </div>

                  <div>
                    <Typography sx={{ mb: 2 }} variant="subtitle2">
                      {t("Custom Text")}
                    </Typography>

                    <QuillEditor
                      onChange={(value: string): void => {
                        formik.setFieldValue("customText", value);
                      }}
                      placeholder={t("Write something").toString()}
                      sx={{ height: 160 }}
                      value={formik.values.customText}
                    />
                  </div>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid xs={12} md={4}>
                <Typography variant="h6">{t("Barcode Details")}</Typography>
              </Grid>

              <Grid xs={12} md={8}>
                <Stack spacing={3}>
                  <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                    spacing={3}>
                    <Stack spacing={1}>
                      <Typography gutterBottom variant="subtitle1">
                        {t("Barcodes")}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        {t(
                          "Enabling this would show the barcode at the bottom of receipt"
                        )}
                      </Typography>
                    </Stack>

                    <Switch
                      checked={formik.values.receiptBarcode}
                      color="primary"
                      edge="start"
                      name="receiptBarcode"
                      onChange={formik.handleChange}
                      value={formik.values.receiptBarcode}
                    />
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Stack
          alignItems="center"
          direction="row"
          justifyContent="flex-end"
          spacing={1}
          style={{
            marginRight: "10px",
            marginLeft: "10px",
          }}
          sx={{ mx: 6 }}>
          <LoadingButton
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              formik.handleSubmit();
            }}
            loading={formik.isSubmitting}
            sx={{ m: 1 }}
            variant="contained">
            {t("Save")}
          </LoadingButton>
        </Stack>
      </Stack>
    </form>
  );
};
