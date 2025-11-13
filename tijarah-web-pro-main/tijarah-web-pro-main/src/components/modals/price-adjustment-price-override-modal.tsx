import { LoadingButton } from "@mui/lab";
import DeleteOutlineTwoToneIcon from "@mui/icons-material/DeleteOutlineTwoTone";
import {
  Autocomplete,
  Button,
  Card,
  Divider,
  IconButton,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useRouter } from "next/router";
import * as React from "react";
import { FormikErrors, FormikProps, useFormik } from "formik";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useEntity } from "src/hooks/use-entity";
import { useAuth } from "src/hooks/use-auth";
import TextFieldWrapper from "../text-field-wrapper";
import * as Yup from "yup";
import { useCurrency } from "src/utils/useCurrency";

const customTest = Yup.mixed().test(
  "custom",
  "Price must be a positive number.",
  function (value) {
    if (value <= 0) {
      return false;
    }
    return true;
  }
);

interface PriceAdjustmentPriceOverrideMoadlProps {
  open?: boolean;
  handleClose?: () => void;
  modalData?: any;
  id: any;
  companyRef: string;
  filteredVariants?: any;
  updateFormikValues: any;
}

let priceAndLocation = {
  price: 0,
  costPrice: 0,
  locationRef: "",
  overriden: true,
  location: {
    name: "",
  },
};

interface PriceData {
  locationRef?: string;
  costPrice?: any;
  price?: any;
  location?: any;
}

interface FeatureProps {
  prices?: PriceData[];
  basePrice?: number;
}

const validationSchema = Yup.object().shape({
  prices: Yup.array().of(
    Yup.object().shape({
      locationRef: Yup.string().required("Location is required"),
      price: Yup.number()
        .positive("Selling Price must be a positive number")
        .required("Selling Price is required"),
    })
  ),
});

export const PriceAdjustmentPriceOverrideMoadl: React.FC<
  PriceAdjustmentPriceOverrideMoadlProps
> = ({
  open,
  handleClose,
  modalData,
  id,
  companyRef,
  filteredVariants,
  updateFormikValues,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [showError, setShowError] = useState(false);
  const [showAddBtn, setShowAddBtn] = useState(false);
  const currency = useCurrency();
  const { find, entities: locations } = useEntity("location");

  useEffect(() => {
    find({
      page: 0,
      limit: 100,
      _q: "",
      activeTab: "active",
      sort: "asc",
      companyRef: user?.company?._id || companyRef,
    });
  }, [user]);

  const addLocationPrice = async () => {
    if (formik.values.prices?.length !== 0) {
      const PriceSchema = Yup.object({
        price: customTest,
      });
      const index = formik.values.prices?.length - 1;

      try {
        await PriceSchema?.validate({
          price: formik.values.prices[index]?.price,
        });
      } catch (error: any) {
        formik.setErrors({
          prices: "Please enter valid price",
        });
        return;
      }
    }

    formik.setFieldValue("prices", [...formik.values.prices, priceAndLocation]);
  };

  const removeLocationPrice = (index: any) => {
    const filteredLocationPrices = [...formik.values.prices];
    filteredLocationPrices.splice(index, 1);
    formik.setFieldValue("prices", [...filteredLocationPrices]);
  };

  const initialValues: FeatureProps = {
    prices: [],
    basePrice: null,
  };

  const formik: FormikProps<FeatureProps> = useFormik<FeatureProps>({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      const data = values.prices;

      updateFormikValues(data);

      formik.resetForm();
    },
  });

  const getLocationOptions = () => {
    const data = locations?.results?.map((loc) => {
      const locData = formik.values.prices?.filter(
        (price: any) => price?.locationRef == loc?._id
      );

      if (locData?.length > 0) {
        return;
      } else {
        return { label: loc?.name?.en, value: loc?._id };
      }
    });

    return data?.filter((element) => element !== undefined) || [];
  };

  useEffect(() => {
    const pricesLength = formik.values.prices?.length;
    if (pricesLength == locations.total) {
      setShowAddBtn(true);
    } else if (pricesLength > 0) {
      const data = formik.values.prices;
      const index = data?.length - 1;
      const visible = Boolean(
        data[index]?.price && data[index]?.location?.name
      );

      setShowAddBtn(!visible);
    } else {
      setShowAddBtn(false);
    }
  }, [formik.values.prices]);

  useEffect(() => {
    if (modalData) {
      formik.setValues({
        prices: modalData?.prices.filter(
          (price: any) => price?.price != modalData?.sellingPrice
        ),
        basePrice: modalData?.sellingPrice,
      });
    }
  }, [modalData, id]);

  return (
    <Box>
      <Modal open={open}>
        <form noValidate onSubmit={formik.handleSubmit}>
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
                    handleClose();
                  }}
                  style={{ cursor: "pointer" }}
                />

                <Box sx={{ flex: 1, pl: "20px" }}>
                  <Typography variant="h6" align="center" sx={{ mr: 4, mb: 2 }}>
                    {t("Price Override")}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Divider sx={{ mt: 5, mb: 1 }} />

            <Stack alignItems="center" direction="row" gap={2} sx={{ p: 1 }}>
              <Box sx={{ mt: 3, mx: 0.5, width: "100%" }}>
                {formik.values.prices?.length > 0 &&
                  formik.values.prices.map((data: any, index: any) => {
                    return (
                      <Box
                        key={index}
                        sx={{
                          mt: 3,
                          display: "flex",
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        <Box sx={{ mr: 2, width: "50%" }}>
                          <Autocomplete
                            options={getLocationOptions()}
                            disabled={Boolean(id)}
                            renderInput={(params) => (
                              <TextField
                                inputProps={{
                                  style: { textTransform: "capitalize" },
                                }}
                                disabled={Boolean(id)}
                                required
                                autoComplete="off"
                                {...params}
                                label="Location"
                                name={`prices.${index}.locationRef`}
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={
                                  formik.values.prices?.[index]?.locationRef
                                }
                                error={
                                  formik.touched.prices?.[index]?.locationRef &&
                                  typeof formik.errors.prices === "object" &&
                                  typeof formik.errors.prices[index] ===
                                    "object" &&
                                  Boolean(
                                    (
                                      formik.errors.prices[
                                        index
                                      ] as FormikErrors<PriceData>
                                    )?.locationRef
                                  )
                                }
                              />
                            )}
                            value={
                              formik.values.prices?.[index]?.location?.name
                            }
                            onChange={(e, option) => {
                              formik.setFieldValue(
                                `prices.${index}.locationRef`,
                                option?.value
                              );

                              formik.setFieldValue(
                                `prices.${index}.location.name`,
                                option?.label
                              );
                            }}
                          />
                        </Box>
                        <TextFieldWrapper
                          inputProps={{
                            style: { textTransform: "capitalize" },
                          }}
                          autoComplete="off"
                          fullWidth
                          required
                          disabled={Boolean(id)}
                          label="Selling Price"
                          name={`prices.${index}.price`}
                          onWheel={(event: any) => {
                            event.preventDefault();
                            event.target.blur();
                          }}
                          onBlur={formik.handleBlur}
                          onChange={(e) => {
                            formik.handleChange(e);
                          }}
                          value={formik.values.prices?.[index]?.price}
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
                          sx={{ mr: 2, width: "50%" }}
                          error={
                            formik.touched.prices?.[index]?.price &&
                            typeof formik.errors.prices === "object" &&
                            typeof formik.errors.prices[index] === "object" &&
                            Boolean(
                              (
                                formik.errors.prices[
                                  index
                                ] as FormikErrors<PriceData>
                              )?.price
                            )
                          }
                        />

                        {!id && (
                          <IconButton
                            color="error"
                            onClick={() => {
                              removeLocationPrice(index);
                            }}
                          >
                            <DeleteOutlineTwoToneIcon />
                          </IconButton>
                        )}
                      </Box>
                    );
                  })}

                {!id && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      mt: 1,
                    }}
                  >
                    <Button disabled={showAddBtn} onClick={addLocationPrice}>
                      {t("Add Other Location")}
                    </Button>
                  </Box>
                )}
              </Box>
            </Stack>

            <Box
              sx={{
                mt: 1,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Button
                onClick={() => {
                  handleClose();
                }}
                variant="outlined"
                sx={{ m: 1 }}
              >
                {t("Cancel")}
              </Button>

              <LoadingButton
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  setShowError(true);
                  formik.handleSubmit();
                }}
                disabled={Boolean(id)}
                loading={formik.isSubmitting}
                sx={{ m: 1 }}
                variant="contained"
              >
                {modalData != null ? t("Update") : t("Done")}
              </LoadingButton>
            </Box>
          </Card>
        </form>
      </Modal>
    </Box>
  );
};
