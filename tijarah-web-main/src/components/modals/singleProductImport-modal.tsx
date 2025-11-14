import { LoadingButton } from "@mui/lab";
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { FormikProps, useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { useAuth } from "src/hooks/use-auth";
import * as Yup from "yup";
import LocationMultiSelect from "../input/location-multiSelect";
import { PropertyList } from "../property-list";
import { PropertyListItem } from "../property-list-item";
import { useImportGlobalProduct } from "src/hooks/use-import-global-product";
import { useImportUpdatedProduct } from "src/hooks/use-import-updated-product";
import { toast } from "react-hot-toast";
import { useEffect } from "react";
import { useEntity } from "src/hooks/use-entity";
import CloseIcon from "@mui/icons-material/Close";
import { useCurrency } from "src/utils/useCurrency";

interface ImportProductProps {
  locationsRef: string[];
  locations: string[];
  assignedToAll: boolean;
}

interface SingleProductImportModalProps {
  open?: boolean;
  handleClose?: () => void;
  product?: any;
  isNewUpdated?: boolean;
  companyRef?: string;
  companyName?: string;
}

export const SingleProductImportModal: React.FC<
  SingleProductImportModalProps
> = ({ open, handleClose, product, companyRef, companyName, isNewUpdated }) => {
  const { t } = useTranslation();
  const currency = useCurrency();
  const theme = useTheme();
  const { importGlobalProduct, isLoading } = useImportGlobalProduct();
  const { importUpdateProduct, isLoadingUpdate } = useImportUpdatedProduct();
  const { deleteEntity } = useEntity("updated-product");

  const formik: FormikProps<ImportProductProps> = useFormik<ImportProductProps>(
    {
      initialValues: {
        assignedToAll: false,
        locationsRef: [],
        locations: [],
      },

      validationSchema: Yup.object({
        locationsRef: Yup.array()
          .required(`${t("Locations is required")}`)
          .min(1, `${t("Locations is required")}`),
      }),

      onSubmit: async (values) => {
        if (values?.assignedToAll === true) {
          formik.setFieldValue("locationsRef", [""]);

          formik.setFieldValue("locations", [""]);
        }

        const data = {
          assignedToAll: values.assignedToAll,
          locationRefs: values.assignedToAll ? [] : values.locationsRef,
          locations: values.assignedToAll ? [] : values.locations,
          companyRef: companyRef,
          company: {
            name: companyName,
          },
          productIds: [product?._id],
          importType: "selected",
        };

        try {
          if (isNewUpdated) {
            await importUpdateProduct({ ...data });
          } else {
            await importGlobalProduct({ ...data });
          }

          toast.success(`${t("Global Product Imported")}`);
          if (isNewUpdated) {
            await deleteEntity(product?._id);
          }

          handleClose();
        } catch (error) {
          toast.error(error.message);
        }
      },
    }
  );

  const getPrice = () => {
    if (product?.variants?.length > 1) {
      return `${product?.variants?.length} Variants`;
    } else if (product?.variants?.length == 1) {
      return `${currency} ${product?.variants[0]?.price || 0}`;
    } else {
      return "NA";
    }
  };

  useEffect(() => {
    formik.resetForm();
  }, [open]);

  return (
    <Box>
      <Dialog
        fullWidth
        maxWidth="sm"
        open={open}
        onClose={() => {
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
            {t("Import Product")}
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
        <DialogContent>
          <Box>
            <>
              <Box>
                <Box
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    overflow: "auto",
                  }}
                >
                  <PropertyList>
                    <PropertyListItem
                      align="horizontal"
                      divider
                      label={t("Product Name")}
                      value={product?.name?.en || "NA"}
                    />
                    <PropertyListItem
                      align="horizontal"
                      divider
                      label={t("Brand")}
                      value={product?.brand?.name || "NA"}
                    />
                    <PropertyListItem
                      align="horizontal"
                      divider
                      label={t("Category")}
                      value={product?.category?.name || "NA"}
                    />
                    <PropertyListItem
                      align="horizontal"
                      divider
                      label={t("Price")}
                      value={getPrice()}
                    />
                  </PropertyList>
                </Box>
              </Box>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2">{t("Locations")}</Typography>
                <Typography
                  variant="body2"
                  color="gray"
                  align="left"
                  sx={{ ml: 0.15, fontSize: "13px" }}
                >
                  {t(
                    "Please select the location(s) where you wish to import this product"
                  )}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <LocationMultiSelect
                    showAllLocation={formik.values?.assignedToAll}
                    companyRef={companyRef}
                    selectedIds={formik?.values?.locationsRef}
                    required
                    id={"locations"}
                    error={
                      formik?.touched?.locationsRef &&
                      formik?.errors?.locationsRef
                    }
                    onChange={(option: any, total: number) => {
                      formik.setFieldValue("selectedLocations", option);
                      if (option?.length > 0) {
                        const ids = option?.map((option: any) => {
                          return option?._id;
                        });

                        const names = option?.map((option: any) => {
                          return option?.name?.en;
                        });

                        if (ids.length == total) {
                          formik.setFieldValue("assignedToAll", true);
                        } else {
                          formik.setFieldValue("assignedToAll", false);
                        }

                        formik.setFieldValue("locationsRef", ids);
                        formik.setFieldValue("locations", names);
                      } else {
                        formik.setFieldValue("locationsRef", []);
                        formik.setFieldValue("locations", []);
                      }
                    }}
                  />
                </Box>
              </Box>
            </>
          </Box>

          <Box sx={{ display: "flex", mt: 3 }}>
            <Typography
              variant="body2"
              color="gray"
              sx={{ fontWeight: "bold", fontSize: "13px" }}
            >
              {t("Note: ")}
            </Typography>
            <Typography
              variant="body2"
              color="gray"
              sx={{ display: "flex", fontSize: "13px", ml: 0.5 }}
            >
              {t(
                "When you import a global product, all of its variants and their prices will be imported to the location(s) you've chosen"
              )}
            </Typography>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "end",
            p: 2,
          }}
        >
          <LoadingButton
            sx={{ borderRadius: 1 }}
            size="medium"
            disabled={isLoading || isLoadingUpdate}
            onClick={() => {
              formik.handleSubmit();
            }}
            variant="contained"
            type="submit"
          >
            {t("Import")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
