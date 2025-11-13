import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Stack,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import { FC, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FileDropzone } from "src/components/file-dropzone";
import BrandDropdown from "src/components/input/brand-auto-complete";
import BusinessTypeMultiSelect from "src/components/input/business-type-multiSelect";
import GlobalCategoriesDropdown from "src/components/input/global-category-auto-complete";
import TaxDropdown from "src/components/input/tax-auto-complete";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { industryOptions } from "src/utils/constants";
import { getUploadedDocName } from "src/utils/get-uploaded-file-name";
import * as Yup from "yup";
import { VariantLists } from "./variant-list";
import { useRouter } from "next/router";

interface ViewProductProps {
  id: string;
}
interface ViewProduct {
  industry: string;
  businessTypeRef: string[];
  productImageFile?: any[];
  productImageUrl?: string;
  productNameEng: string;
  productNameAr?: string;
  productDescription?: string;
  brandRef?: string;
  categoryRef: string;
  taxRef: string;
  productStatus: boolean;
  variants: any[];
}

export const ViewGlobalProduct: FC<ViewProductProps> = (props) => {
  const { t } = useTranslation();
  usePageView();
  const router = useRouter();
  const { type } = router.query;
  const { id } = props;

  const { findOne, entity, loading } = useEntity("global-products");
  const {
    findOne: findOneUpdate,
    entity: entityUpdate,
    loading: loadingUpdate,
  } = useEntity("updated-product");

  const initialValues: ViewProduct = {
    industry: "retail",
    businessTypeRef: [],
    productImageFile: [],
    productImageUrl: "",
    productNameEng: "",
    productNameAr: "",
    productDescription: "",
    brandRef: "",
    categoryRef: "",
    taxRef: "",
    productStatus: true,
    variants: [],
  };

  const validationSchema = Yup.object({});

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: () => {},
  });

  useEffect(() => {
    if (id != null) {
      if (type === "updated-product") {
        findOneUpdate(id?.toString());
      } else {
        findOne(id?.toString());
      }
    }
  }, [id]);

  useEffect(() => {
    if (entity != null) {
      formik.setFieldValue("businessTypeRef", entity?.businessTypeRefs);
      formik.setFieldValue("productImageUrl", entity?.image || "");
      formik.setFieldValue("productNameEng", entity?.name?.en);
      formik.setFieldValue("productNameAr", entity?.name?.ar);
      formik.setFieldValue("productDescription", entity?.description);
      formik.setFieldValue("brandRef", entity?.brandRef);
      formik.setFieldValue("categoryRef", entity?.categoryRef);
      formik.setFieldValue("taxRef", entity?.taxRef);
      formik.setFieldValue("variants", entity?.variants || []);
      formik.setFieldValue("productStatus", entity?.variants[0]?.status);
    }
  }, [entity]);

  useEffect(() => {
    if (entityUpdate != null) {
      formik.setFieldValue("businessTypeRef", entityUpdate?.businessTypeRefs);
      formik.setFieldValue("productImageUrl", entityUpdate?.image || "");
      formik.setFieldValue("productNameEng", entityUpdate?.name?.en);
      formik.setFieldValue("productNameAr", entityUpdate?.name?.ar);
      formik.setFieldValue("productDescription", entityUpdate?.description);
      formik.setFieldValue("brandRef", entityUpdate?.brandRef);
      formik.setFieldValue("categoryRef", entityUpdate?.categoryRef);
      formik.setFieldValue("taxRef", entityUpdate?.taxRef);
      formik.setFieldValue("variants", entityUpdate?.variants || []);
      formik.setFieldValue("productStatus", entityUpdate?.variants[0]?.status);
    }
  }, [entityUpdate]);

  if (loading || loadingUpdate) {
    return (
      <Box
        sx={{
          height: "100vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <form noValidate onSubmit={formik.handleSubmit}>
      <Stack spacing={4} sx={{ mt: 3 }}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={4} xs={12}>
                <Typography variant="h6">{t("Basic Details")}</Typography>
              </Grid>
              <Grid item md={8} xs={12}>
                <Box sx={{ mt: 3 }}>
                  <TextField
                    autoComplete="off"
                    inputProps={{ style: { textTransform: "capitalize" } }}
                    fullWidth
                    label={t("Industry")}
                    name="industry"
                    select
                    disabled
                    value={formik.values.industry}
                  >
                    {industryOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
                <Box sx={{ mt: 3 }}>
                  <BusinessTypeMultiSelect
                    selectedIds={formik?.values?.businessTypeRef}
                    id={"business-multi-select"}
                    onChange={() => {}}
                    disabled
                  />
                </Box>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6">{t("Product Image")}</Typography>
                  <Typography
                    color="textSecondary"
                    sx={{ mt: 1 }}
                    variant="body2"
                  >
                    {t("Please upload the product image")}
                  </Typography>

                  <Box sx={{ my: 2 }}>
                    <FileDropzone
                      accept={{
                        "image/*": [],
                        "application/pdf": [],
                      }}
                      caption="(SVG, JPG, PNG, PDF, or gif)"
                      files={formik.values.productImageFile}
                      imageName={getUploadedDocName(
                        formik.values.productImageUrl
                      )}
                      uploadedImageUrl={formik.values.productImageUrl}
                      onDrop={() => {}}
                      onUpload={() => {}}
                      onRemove={() => {}}
                      onRemoveAll={() => {}}
                      maxFiles={1}
                      isUploaded={false}
                      setIsUploaded={false}
                      isUploading={false}
                      disabled={true}
                    />
                  </Box>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    label={t("Product Name (English)")}
                    name="productNameEng"
                    value={formik.values.productNameEng}
                    disabled
                  />
                </Box>

                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    label={t("Product Name (Arabic)")}
                    name="productNameAr"
                    value={formik.values.productNameAr}
                    disabled
                  />
                </Box>

                <Box sx={{ mt: 3 }}>
                  <TextField
                    label={t("Description")}
                    name="productDescription"
                    multiline
                    rows={4}
                    fullWidth
                    value={formik.values.productDescription}
                    disabled
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={4} xs={12}>
                <Typography variant="h6">
                  {t("Brand, Category & VAT Details")}
                </Typography>
              </Grid>
              <Grid item md={8} xs={12}>
                <Box>
                  <BrandDropdown
                    onChange={() => {}}
                    selectedId={formik?.values?.brandRef}
                    label={t("Brands")}
                    id="Brands"
                    disabled
                  />
                </Box>

                <Box sx={{ mt: 3 }}>
                  <GlobalCategoriesDropdown
                    onChange={() => {}}
                    selectedId={formik?.values?.categoryRef}
                    label={t("Global Categories")}
                    id="categoryRef"
                    disabled
                  />
                </Box>

                <Box sx={{ mt: 3 }}>
                  <TaxDropdown
                    onChange={() => {}}
                    selectedId={formik?.values?.taxRef}
                    label={t("Tax")}
                    id="tax"
                    disabled
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ my: 4 }}>
          <CardContent>
            <Grid container>
              <Grid sm={8} xs={6}>
                <Stack spacing={1}>
                  <Typography variant="h6">{t("Variants List")}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {t("You can find all the variants of this product here")}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>

          <Divider />
          <Divider />

          <Card>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("Variant Name")}</TableCell>
                  <TableCell>{t("SKU")}</TableCell>
                  <TableCell>{t("Unit")}</TableCell>
                  <TableCell>{t("Price")}</TableCell>
                  <TableCell>{t("Cost Price")}</TableCell>
                  <TableCell>{t("Status")}</TableCell>
                </TableRow>
              </TableHead>

              <VariantLists variants={formik.values.variants} />
            </Table>
          </Card>
        </Card>
      </Stack>
    </form>
  );
};
