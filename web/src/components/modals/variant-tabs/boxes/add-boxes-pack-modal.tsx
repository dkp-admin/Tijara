import { LoadingButton } from "@mui/lab";
import {
  Button,
  Card,
  Modal,
  SvgIcon,
  Switch,
  TextField,
  Tooltip,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { useEntity } from "src/hooks/use-entity";
import i18n from "src/i18n";
import { XCircle } from "src/icons/x-circle";
import { useCurrency } from "src/utils/useCurrency";
import * as Yup from "yup";

interface AddBoxesPackModalProps {
  existingSKU: any;
  selectedItem: any;
  open: boolean;
  handleClose: any;
  parentSku: string;
  variantNameEn: string;
  variantNameAr: string;
  handleAddEditBoxes: any;
  companyRef: string;
  existing?: boolean;
}

interface FeatureProps {
  assignedToAll?: boolean;
  locations?: any;
  locationRefs?: any;
  name?: any;
  parentName?: any;
  parentSku?: string;
  sku: string;
  code: string;
  unit: string;
  type: string;
  unitCount: number;
  costPrice: number;
  price: number;
  prices: any;
  status: string;
  nonSaleable: boolean;
}

const validationSchema = Yup.object({
  sku: Yup.string()
    .matches(
      /^[0-9]+$/,
      i18n.t(
        "Special characters, alphabets and spaces are not allowed. Only numeric values are allowed."
      )
    )
    .required(`${i18n.t("SKU is required")}`)
    .min(3, i18n.t("SKU should be minimum 3 digits"))
    .max(16, i18n.t("SKU should be maximum 16 digits")),
  code: Yup.string()
    .matches(
      /^[A-Za-z0-9]+$/,
      i18n.t(
        "Special characters and spaces are not allowed. Only alpha-numeric values are allowed."
      )
    )
    .max(6, i18n.t("Product Code should be maximum 6 digits")),
  unitCount: Yup.number()
    .required(`${i18n.t("Number of unit is required")}`)
    .positive(`${i18n.t("Number of unit should be greater than 0")}`)
    .nullable(),
  costPrice: Yup.number()
    .required(`${i18n.t("Price is required")}`)
    .positive(`${i18n.t("Price should be greater than 0")}`)
    .nullable(),
  price: Yup.number()
    .required(`${i18n.t("Price is required")}`)
    .positive(`${i18n.t("Price should be greater than 0")}`)
    .nullable(),
});

export const AddBoxesPackModal: React.FC<AddBoxesPackModalProps> = ({
  existingSKU,
  selectedItem,
  open = false,
  handleClose,
  parentSku,
  variantNameEn,
  variantNameAr,
  handleAddEditBoxes,
  companyRef,
  existing,
}) => {
  const { t } = useTranslation();
  const [showError, setShowError] = useState(false);
  const resetForm = () => {
    formik.resetForm();
  };
  const theme = useTheme();
  const [generateApi, setGenerateApi] = useState(false);

  const queryClient = useQueryClient();
  const currency = useCurrency();

  const { find: sku, entities } = useEntity("product/sku");
  const { find, entities: locations } = useEntity("location");

  useEffect(() => {
    find({
      page: 0,
      limit: 100,
      _q: "",
      activeTab: "active",
      sort: "asc",
      companyRef: companyRef,
    });
  }, [companyRef]);

  const initialValues: FeatureProps = {
    assignedToAll: true,
    locations: [],
    locationRefs: [],
    name: { en: variantNameEn, ar: variantNameAr },
    parentName: { en: variantNameEn, ar: variantNameAr },
    parentSku: parentSku,
    sku: "",
    code: "",
    type: "box",
    unit: "perItem",
    unitCount: null,
    costPrice: null,
    price: null,
    prices: [],
    status: "active",
    nonSaleable: false,
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      const data = {
        image: "",
        name: values?.parentName,
        parentName: values?.parentName,
        type: values?.type,
        parentSku: values.parentSku,
        sku: values?.sku,
        code: values?.code || "",
        unit: values?.unit,
        unitCount: values?.unitCount,
        costPrice: values?.costPrice,
        price: values?.price,
        prices: locations.results?.map((ref) => {
          return {
            price: values.price,
            costPrice: values.costPrice,
            locationRef: ref._id,
            location: {
              name: ref.name.en,
            },
          };
        }),
        status: values?.status,
        nonSaleable: values?.nonSaleable,
      };
      formik.resetForm();

      handleAddEditBoxes(data);
    },
  });

  useEffect(() => {
    if (generateApi === true) {
      sku({
        limit: 1,
      });
    }
  }, [generateApi, open]);
  useEffect(() => {
    if (entities.sku && open && formik.values.sku === "") {
      formik.setFieldValue("sku", entities.sku);
    }
  }, [entities, open]);

  useEffect(() => {
    formik.resetForm();

    if (selectedItem != null) {
      formik.setFieldValue("sku", selectedItem.sku);
      formik.setFieldValue("code", selectedItem?.code || "");
      formik.setFieldValue("unitCount", selectedItem.unitCount);
      formik.setFieldValue("costPrice", selectedItem.costPrice);
      formik.setFieldValue("price", selectedItem.price);
      formik.setFieldValue("nonSaleable", selectedItem.nonSaleable);
    }
  }, [open, selectedItem]);

  return (
    <Box>
      <Modal
        open={open}
        onClose={() => {
          handleClose();
          resetForm();
        }}
      >
        <Card
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "95vw",
              sm: "70vw",
              md: "55vw",
              lg: "45vw",
            },
            bgcolor: "background.paper",
            overflowY: "auto",
            p: 4,
          }}
        >
          <form noValidate onSubmit={formik.handleSubmit}>
            <Box style={{ width: "100%" }}>
              <Box style={{ display: "flex", justifyContent: "space-between" }}>
                <XCircle
                  fontSize="small"
                  onClick={() => {
                    handleClose();
                    resetForm();
                  }}
                  style={{ cursor: "pointer" }}
                />
                <Typography variant="h6" style={{ textAlign: "center" }}>
                  {t(" Add Boxes/Pack")}
                </Typography>

                <LoadingButton
                  onClick={(e) => {
                    e.preventDefault();
                    if (formik?.values?.parentSku === formik?.values?.sku) {
                      return toast.error(t("SKU already exist"));
                    }
                    if (!existing && existingSKU?.includes(formik.values.sku)) {
                      return toast.error(t("SKU already exist"));
                    }
                    formik.handleSubmit();
                  }}
                  size="small"
                  variant="contained"
                  type="submit"
                >
                  {selectedItem != null ? t("Save") : t("Add")}
                </LoadingButton>
              </Box>

              <Box sx={{ mt: 3, mx: 0.5 }}>
                <TextFieldWrapper
                  inputProps={{ style: { textTransform: "capitalize" } }}
                  autoComplete="off"
                  fullWidth
                  label={t("SKU")}
                  name="sku"
                  error={Boolean(formik.touched.sku && formik.errors.sku)}
                  helperText={(formik.touched.sku && formik.errors.sku) as any}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                    }
                  }}
                  disabled={selectedItem?.sku}
                  required
                  value={formik.values.sku}
                />
                {formik.values.sku === "" && (
                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
                  >
                    <Button
                      onClick={async () => {
                        if (open && !formik.values.sku) {
                          setGenerateApi(true);
                          await queryClient.invalidateQueries();
                        }
                      }}
                    >
                      {t("Generate SKU")}
                    </Button>
                  </Box>
                )}
              </Box>

              <Box sx={{ mt: 3, mx: 0.5 }}>
                <TextFieldWrapper
                  fullWidth
                  label={t("Product Code")}
                  name="code"
                  error={Boolean(formik.touched.code && formik.errors.code)}
                  helperText={
                    (formik.touched.code && formik.errors.code) as any
                  }
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.code}
                />
              </Box>

              <Box sx={{ mt: 3, mx: 0.5 }}>
                <TextFieldWrapper
                  inputProps={{ style: { textTransform: "capitalize" } }}
                  autoComplete="off"
                  fullWidth
                  label={t("No. of unit in the box")}
                  name="unitCount"
                  onWheel={(event: any) => {
                    event.preventDefault();
                    event.target.blur();
                  }}
                  onBlur={formik.handleBlur}
                  error={
                    !!(formik.touched.unitCount && formik.errors.unitCount)
                  }
                  helperText={
                    (formik.touched.unitCount && formik.errors.unitCount) as any
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      const cleanedNumber = e.target.value.replace(/\D/g, "");
                      e.target.value = cleanedNumber
                        ? (Number(cleanedNumber) as any)
                        : "";
                    }
                    formik.handleChange(e);
                  }}
                  required
                  value={formik.values.unitCount}
                />
              </Box>
              <Box sx={{ mt: 3, mx: 0.5 }}>
                <TextFieldWrapper
                  autoComplete="off"
                  fullWidth
                  required
                  label={t("Cost price of the Box")}
                  name="costPrice"
                  error={Boolean(
                    formik.touched.costPrice && formik.errors.costPrice
                  )}
                  helperText={
                    (formik.touched.costPrice && formik.errors.costPrice) as any
                  }
                  onWheel={(event: any) => {
                    event.preventDefault();
                    event.target.blur();
                  }}
                  onBlur={formik.handleBlur}
                  onChange={(e) => {
                    formik.handleChange(e);
                  }}
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
                  value={formik.values.costPrice}
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
                />

                <Typography variant="body2" color={"#ff9100"} sx={{ mt: 2 }}>
                  {Number(formik.values.costPrice) > 9999.99
                    ? `${t("Amount exceeds 4 digits")}`
                    : ""}
                </Typography>
              </Box>
              <Box sx={{ mt: 3, mx: 0.5 }}>
                <TextFieldWrapper
                  autoComplete="off"
                  fullWidth
                  required
                  label={t("Selling price of the Box")}
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
                />
                <Typography variant="body2" color={"#ff9100"} sx={{ mt: 2 }}>
                  {Number(formik.values.price) > 9999.99
                    ? `${t("Amount exceeds 4 digits")}`
                    : ""}
                </Typography>
              </Box>

              <Box
                sx={{
                  mt: 3,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: `1px solid ${
                    theme.palette.mode !== "dark" ? "#E5E7EB" : "#2D3748"
                  }`,
                  borderRadius: "8px",
                  paddingLeft: "8px",
                }}
              >
                <Typography color="textSecondary">
                  {t("Non Saleable")}
                </Typography>

                <Box sx={{ p: 1, display: "flex", alignItems: "center" }}>
                  <Switch
                    color="primary"
                    edge="end"
                    name="nonSaleable"
                    // disabled={id != null}
                    checked={formik.values.nonSaleable}
                    onChange={(e) => {
                      // if (!canUseBatching) {
                      //   return toast.error(t("You don't have access"));
                      // }
                      if (formik.values.nonSaleable) {
                        toast(`${t("Product set as saleable")}`);
                      } else {
                        toast(`${t("Product set as non-saleable")}`);
                      }
                      formik.handleChange(e);
                    }}
                    value={formik.values.nonSaleable}
                    sx={{
                      mr: 0.2,
                    }}
                  />

                  <Tooltip
                    title={t(
                      "You can change this non-saleable status of this box when you update this"
                    )}
                  >
                    <SvgIcon color="action">
                      <InfoCircleIcon />
                    </SvgIcon>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          </form>
        </Card>
      </Modal>
    </Box>
  );
};
