import { LoadingButton } from "@mui/lab";
import {
  Button,
  Card,
  Divider,
  MenuItem,
  Switch,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { FormikProps, useFormik } from "formik";
import * as React from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import TaxDropdown from "../input/tax-auto-complete";
import TextFieldWrapper from "../text-field-wrapper";
import { useCurrency } from "src/utils/useCurrency";

interface CreateModifierModalProps {
  open: boolean;
  modifier: any;
  handleClose: () => void;
  handleAddEditModifier: any;
}

interface ModifierOptions {
  name: string;
  contains: string;
  kitchenName: string;
  price: number;
  taxRef: string;
  tax: number;
  status: boolean;
}

const containsOptions = [
  {
    label: "Veg",
    value: "veg",
  },
  {
    label: "Non-Veg",
    value: "non-veg",
  },
  {
    label: "Egg",
    value: "egg",
  },
];

export const CreateModifierModal: React.FC<CreateModifierModalProps> = ({
  open,
  modifier,
  handleClose,
  handleAddEditModifier,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const currency = useCurrency();

  const formik: FormikProps<ModifierOptions> = useFormik<ModifierOptions>({
    initialValues: {
      name: "",
      contains: "",
      kitchenName: "",
      price: null,
      taxRef: "",
      tax: null,
      status: true,
    },

    onSubmit: async (values) => {
      const data = {
        name: values.name,
        contains: values.contains,
        kitchenName: values.kitchenName,
        price: values.price,
        taxRef: values.taxRef,
        tax: { percentage: values.tax },
        status: values.status ? "active" : "inactive",
      };

      handleAddEditModifier(data);
      formik.resetForm();
    },

    validationSchema: Yup.object({
      name: Yup.string()
        .matches(
          /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
          t("Enter valid option name")
        )
        .required(`${t("Option Name is required")}`)
        .max(30, t("option name must not be greater than 30 characters")),
      contains: Yup.string().required(`${t("Please Select Contains")}`),
      kitchenName: Yup.string()
        .matches(
          /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
          t("Enter valid kitchen name")
        )
        .max(30, t("Kitchen name must not be greater than 30 characters")),
      price: Yup.number()
        .required(t("Price is required"))
        .moreThan(-1, t("Price must be positive number"))
        .nullable(),
      taxRef: Yup.string().required(`${t("Please Select VAT")}`),
    }),
  });

  useEffect(() => {
    formik.resetForm();

    if (modifier) {
      formik.setValues({
        name: modifier.name,
        contains: modifier?.contains || "",
        kitchenName: modifier.kitchenName,
        price: modifier.price,
        taxRef: modifier.taxRef,
        tax: modifier.tax.percentage,
        status: modifier.status === "active",
      });
    }
  }, [open, modifier]);

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
              pt: 2,
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
                  {modifier
                    ? t("Update Modifier Option")
                    : t("Add Modifier Option")}
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
                <TextFieldWrapper
                  required
                  fullWidth
                  name="name"
                  label={t("Option Name")}
                  value={formik.values.name}
                  error={Boolean(formik.touched.name && formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                />

                <TextFieldWrapper
                  select
                  required
                  fullWidth
                  sx={{ mt: 3 }}
                  error={!!(formik.touched.contains && formik.errors.contains)}
                  helperText={formik.touched.contains && formik.errors.contains}
                  label={t("Contains")}
                  name="contains"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.contains}
                >
                  {containsOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextFieldWrapper>

                <TextFieldWrapper
                  fullWidth
                  sx={{ mt: 3 }}
                  name="kitchenName"
                  label={t("Kitchen Name")}
                  value={formik.values.kitchenName}
                  error={Boolean(
                    formik.touched.kitchenName && formik.errors.kitchenName
                  )}
                  helperText={
                    formik.touched.kitchenName && formik.errors.kitchenName
                  }
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                />

                <Box sx={{ mt: 3 }}>
                  <TextFieldWrapper
                    required
                    fullWidth
                    autoComplete="off"
                    label={t("Price") + ` (in ${currency})`}
                    name="price"
                    error={Boolean(formik.touched.price && formik.errors.price)}
                    helperText={
                      (formik.touched.price && formik.errors.price) as any
                    }
                    onWheel={(event: any) => {
                      event.preventDefault();
                      event.target.blur();
                    }}
                    onBlur={formik.handleBlur}
                    onChange={(e) => {
                      formik.handleChange(e);
                    }}
                    value={formik.values.price}
                    onKeyPress={(event): void => {
                      const ascii = event.charCode;
                      const value = (event.target as HTMLInputElement).value;
                      const decimalCheck = value.indexOf(".") !== -1;

                      if (decimalCheck) {
                        const decimalSplit = value.split(".");
                        const decimalLength = decimalSplit[1].length;
                        if (decimalLength > 1 || ascii === 46) {
                          event.preventDefault();
                        } else if (ascii < 48 || ascii > 57) {
                          event.preventDefault();
                        }
                      } else if (value.length > 5 && ascii !== 46) {
                        event.preventDefault();
                      } else if ((ascii < 48 || ascii > 57) && ascii !== 46) {
                        event.preventDefault();
                      }
                    }}
                  />
                  <Typography variant="body2" color={"#ff9100"} sx={{ mt: 2 }}>
                    {Number(formik.values.price) > 9999.99
                      ? `${t("Amount exceeds 4 digits")}`
                      : ""}
                  </Typography>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <TaxDropdown
                    required
                    id="tax"
                    label={t("VAT")}
                    error={formik?.touched?.taxRef && formik?.errors?.taxRef}
                    onChange={(id, name) => {
                      if (id && name >= 0) {
                        formik.setFieldValue("taxRef", id);
                        formik.setFieldValue("tax", name);
                      }
                    }}
                    selectedId={formik?.values?.taxRef}
                  />
                </Box>

                {modifier && (
                  <Box
                    sx={{
                      mt: 3,
                      display: "flex",
                      paddingLeft: "8px",
                      borderRadius: "8px",
                      alignItems: "center",
                      justifyContent: "space-between",
                      border: `1px solid ${
                        theme.palette.mode !== "dark" ? "#E5E7EB" : "#2D3748"
                      }`,
                    }}
                  >
                    <Typography>
                      {formik.values.status ? t("In stock") : t("Sold out")}
                    </Typography>

                    <Box sx={{ p: 1, display: "flex", alignItems: "center" }}>
                      <Switch
                        edge="end"
                        color="primary"
                        name="enabledBatching"
                        checked={formik.values.status}
                        onChange={(e) => {
                          formik.setFieldValue("status", e.target.checked);
                        }}
                        sx={{ mr: 0.2 }}
                      />
                    </Box>
                  </Box>
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
              size="large"
              type="submit"
              variant="contained"
              loading={formik.isSubmitting}
              onClick={() => formik.handleSubmit()}
            >
              {modifier ? t("Update") : t("Add")}
            </LoadingButton>
          </Box>
        </Card>
      </Modal>
    </Box>
  );
};
