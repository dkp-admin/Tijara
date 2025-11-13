import React, { FC } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  Stack,
  Table,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import { id } from "date-fns/locale";
import * as Yup from "yup";
import router from "next/router";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import AddProductTextInput from "src/components/input/add-product-auto-complete";
import { Seo } from "src/components/seo";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import { USER_TYPES, sortOptions } from "src/utils/constants";
import { BarcodePrintAddCard } from "src/components/barcode-print/barcode-print-add-card";
import { LoadingButton } from "@mui/lab";
import { useReactToPrint } from "react-to-print";
import { useEntity } from "src/hooks/use-entity";
import Barcode from "react-barcode";
import { PrintableItem } from "src/components/barcode-print/print-item-template";
import { PrintableItemTwo } from "src/components/barcode-print/print-item-template-two";

import withPermission from "src/components/permissionManager/restrict-page";
import { useCurrency } from "src/utils/useCurrency";

interface Product {
  pid: string;
  name: any;
  varient: string;
  sku: string;
  price: string;
  expiry: Date;
}
interface BarcodePrintInit {
  selectedOptions: string[];
  templateType: string;
  paperSize: string;
  items: any;
}

interface BarcodePrintProps {
  companyRef?: string;
  companyName?: string;
  origin?: string;
}

const itemSchema = Yup.object().shape({
  quantity: Yup.number()
    .min(1, "Must be greater than 0")
    .required("required")
    .nullable(),
});

const validationSchema = Yup.object({
  items: Yup.array().of(itemSchema).required("Required"),
});

const BarcodePrint: FC<BarcodePrintProps> = (props) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { userType } = useUserType();
  const componentRef = useRef();
  const canAccess = usePermissionManager();
  const [selectedOption, setSelectedOption] = useState("po");
  const [itemsID, setItemsID] = useState(-1);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [showError, setShowError] = useState(false);
  const currency = useCurrency();

  const { findOne, entity } = useEntity("company");

  usePageView();

  if (!canAccess(MoleculeType["order:read"])) {
    return <NoPermission />;
  }

  const handleCheckboxChange = (event: any) => {
    const { value, checked } = event.target;
    const newSelectedOptions = [...formik.values.selectedOptions];

    if (checked) {
      newSelectedOptions.push(value);
    } else {
      const index = newSelectedOptions.indexOf(value);
      if (index > -1) {
        newSelectedOptions.splice(index, 1);
      }
    }

    // Uncheck "All" if any checkbox is unchecked
    if (newSelectedOptions.length !== 5) {
      const allIndex = newSelectedOptions.indexOf("All");
      if (allIndex > -1) {
        newSelectedOptions.splice(allIndex, 1);
      }
    }

    formik.setFieldValue("selectedOptions", newSelectedOptions);
  };

  const handleAllCheckboxChange = (event: any) => {
    const isChecked = event.target.checked;
    formik.setFieldValue(
      "selectedOptions",
      isChecked ? ["companyName", "productName", "price", "barCode"] : []
    );
  };

  const handleTemplateChange = (event: any) => {
    formik.setFieldValue("templateType", event.target.value);
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleRemoveItem = (indexToRemove: any) => {
    const updatedItems = formik.values.items.filter(
      (item: any, index: any) => index !== indexToRemove
    );
    formik.setFieldValue("items", updatedItems);
  };

  const initialValues: BarcodePrintInit = {
    selectedOptions: ["productName", "barCode"],
    paperSize: "half",
    templateType: "first",
    items: [],
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const formik: any = useFormik({
    initialValues,
    validationSchema,

    onSubmit: async (values): Promise<void> => {
      if (values.items.length > 0) {
        for (let i = 0; i < values.items.length; i++) {
          if (values.items[i].batching && !values.items[i].expiry) {
            formik.setFieldError(
              `items[${i}].expiry`,
              "Expiry Date is required"
            );
            return;
          }
        }
      }
      if (values.items.length === 0) {
        toast.error(t("Add atleast one item").toString());
      } else {
        const data = {
          items: formik.values.items.map((item: any) => {
            const priceForShipTo = item?.prices?.find(
              (price: any) =>
                price.locationRef === "dfgdfg556556locationrefcurrent"
            );

            return {
              productRef: item.productRef,
              categoryRef: item.categoryRef,
              sku: item.sku,
              hasMultipleVariants: item.hasMultipleVariants,
              selling: priceForShipTo?.price || 0,
              expiry: item.expiry || "",
              name: {
                en: item.name.en,
                ar: item.name.ar,
              },
              variant: {
                en: item.variant.name.en,
                ar: item.variant.name.ar,
              },
              batching: item.batching,
              quantity: item.quantity * item.unitCount,
              cost: Number(item.cost),

              discount: item.discount,
              vatRef: item.vatRef,
              type: item.type,
              unitCount: item.unitCount,
              vat: item.vat,
              vatAmount: Number(item.vatAmount),

              status: item.status,
            };
          }),
        };

        try {
          if (origin == "company") {
            // changeTab("inventoryManagement", Screens?.companyDetail);
          }
          handlePrint();
          // router.back();
        } catch (err) {
          toast.error(err.message);
        }
      }
    },
  });

  const isAllSelected = formik.values.selectedOptions.length === 4;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (userType == USER_TYPES.SUPERADMIN && user.company._id) {
      findOne(user.company._id);
    }
  }, [user.company._id]);

  return (
    <>
      <Seo title={`${t("Barcode Print")}`} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">{t("Barcode Print")}</Typography>
              </Stack>
            </Stack>

            <Stack spacing={4} sx={{ mt: 3 }}>
              <Card>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item md={8} xs={12}>
                      <Grid item md={12} xs={12}>
                        <Typography variant="h6">
                          {t("Select what you like to print")}
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                          <Box
                            sx={{ width: "auto", flexGrow: 0, flexShrink: 0 }}
                          >
                            <FormControlLabel
                              value="All"
                              control={
                                <Checkbox
                                  checked={isAllSelected}
                                  onChange={handleAllCheckboxChange}
                                />
                              }
                              label="All"
                              labelPlacement="end"
                            />
                          </Box>
                          <Box
                            sx={{ width: "auto", flexGrow: 0, flexShrink: 0 }}
                          >
                            <FormControlLabel
                              checked={formik.values.selectedOptions.includes(
                                "companyName"
                              )}
                              onChange={handleCheckboxChange}
                              value="companyName"
                              control={<Checkbox />}
                              label="Company Name"
                              labelPlacement="end"
                            />
                          </Box>
                          <Box
                            sx={{ width: "auto", flexGrow: 0, flexShrink: 0 }}
                          >
                            <FormControlLabel
                              checked={formik.values.selectedOptions.includes(
                                "productName"
                              )}
                              onChange={handleCheckboxChange}
                              value="productName"
                              control={<Checkbox />}
                              label="Product Name"
                              labelPlacement="end"
                            />
                          </Box>
                          <Box
                            sx={{ width: "auto", flexGrow: 0, flexShrink: 0 }}
                          >
                            <FormControlLabel
                              checked={formik.values.selectedOptions.includes(
                                "price"
                              )}
                              onChange={handleCheckboxChange}
                              value="price"
                              control={<Checkbox />}
                              label="Price"
                              labelPlacement="end"
                            />
                          </Box>

                          <Box
                            sx={{ width: "auto", flexGrow: 0, flexShrink: 0 }}
                          >
                            <FormControlLabel
                              checked={formik.values.selectedOptions.includes(
                                "barCode"
                              )}
                              onChange={handleCheckboxChange}
                              value="barCode"
                              control={<Checkbox />}
                              label="Barcode"
                              labelPlacement="end"
                            />
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item md={12} xs={12} sx={{ mt: 2 }}>
                        <Typography variant="h6">
                          {t("Select paper size")}
                        </Typography>
                        <RadioGroup
                          row
                          aria-labelledby="demo-row-radio-buttons-group-label"
                          name="row-radio-buttons-group"
                          value={formik.values.paperSize}
                          onChange={(e) =>
                            formik.setFieldValue("paperSize", e.target.value)
                          }
                          onBlur={formik.handleBlur}
                        >
                          <FormControlLabel
                            value="half"
                            control={<Radio />}
                            label="2/1"
                          />
                          <FormControlLabel
                            value="box"
                            control={<Radio />}
                            label="2/1.5"
                          />
                          <FormControlLabel
                            value="square"
                            control={<Radio />}
                            label="2/2"
                          />
                        </RadioGroup>
                      </Grid>
                      <Grid item md={12} xs={12} sx={{ mt: 2 }}>
                        <Typography variant="h6">{t("Template")}</Typography>
                        <Select
                          value={formik.values.templateType}
                          onChange={handleTemplateChange}
                          displayEmpty
                          fullWidth
                          sx={{ mt: 1, mb: 2, maxWidth: "200px" }}
                        >
                          <MenuItem value="first">{t("First")}</MenuItem>
                          <MenuItem value="second">{t("Second")}</MenuItem>
                        </Select>
                      </Grid>
                    </Grid>
                    <Grid item md={4} xs={12}>
                      <Typography variant="h6">{t("Print Preview")}</Typography>

                      <Box
                        sx={{
                          borderRadius: 1,
                          p: 2,
                          m: 1,
                          bgcolor: "background.paper",
                        }}
                      >
                        {formik.values.templateType === "first" ? (
                          <Paper
                            elevation={3}
                            sx={{
                              p: 1,
                              textAlign: "center",
                              height: "fitt-content",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              flexDirection: "column",
                            }}
                          >
                            {formik.values.selectedOptions.includes(
                              "companyName"
                            ) && (
                              <Typography variant="h6" gutterBottom>
                                {t("Company Name")}
                              </Typography>
                            )}
                            {formik.values.selectedOptions.includes(
                              "price"
                            ) && (
                              <Typography variant="subtitle1">
                                {`${currency} 0.00`}
                              </Typography>
                            )}
                            {formik.values.selectedOptions.includes(
                              "productName"
                            ) && (
                              <Typography variant="body1">
                                {t("Product Name")}
                              </Typography>
                            )}
                            {formik.values.selectedOptions.includes(
                              "barCode"
                            ) && (
                              <Box
                                sx={{
                                  width: "100%",
                                  height: 50,
                                  bgcolor: "lightgray",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {t("Barcode")}
                              </Box>
                            )}
                            <Typography variant="body2">
                              {t("SKU00000000")}
                            </Typography>
                            <Typography variant="caption">
                              {t("Exp. Date 12 April 2024")}
                            </Typography>
                          </Paper>
                        ) : (
                          <Paper elevation={3} sx={{ p: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                my: 1,
                              }}
                            >
                              {formik.values.selectedOptions.includes(
                                "companyName"
                              ) && (
                                <Typography variant="h6" gutterBottom>
                                  {t("Company Name")}
                                </Typography>
                              )}
                              {formik.values.selectedOptions.includes(
                                "type"
                              ) && (
                                <Typography variant="body1">
                                  {t("BAG 1118454")}
                                </Typography>
                              )}
                            </Box>

                            {formik.values.selectedOptions.includes(
                              "barCode"
                            ) && (
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  textAlign: "center",
                                  my: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: "60%",
                                    height: 50,
                                    bgcolor: "lightgray",
                                  }}
                                >
                                  {t("Barcode")}
                                </Box>
                              </Box>
                            )}
                            <Typography
                              sx={{
                                textAlign: "center",
                              }}
                              variant="body2"
                            >
                              {t("SKU000000000")}
                            </Typography>
                            <Box
                              style={{
                                display: "flex",
                              }}
                            >
                              {formik.values.selectedOptions.includes(
                                "productName"
                              ) && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    flex: 1,
                                    flexDirection: "column",
                                  }}
                                >
                                  <Typography variant="caption">
                                    {t("Product Name")}
                                  </Typography>
                                </Box>
                              )}
                              {formik.values.selectedOptions.includes(
                                "price"
                              ) && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    flex: 1,
                                    flexDirection: "column",
                                  }}
                                >
                                  <Typography variant="caption">
                                    {`${currency}: `}
                                  </Typography>
                                  <Typography variant="caption">
                                    {t("0.00")}
                                  </Typography>
                                </Box>
                              )}
                              <Box
                                sx={{
                                  display: "flex",
                                  flex: 1,
                                  flexDirection: "column",
                                }}
                              >
                                <Typography variant="caption">
                                  {t("Expiry Date:")}
                                </Typography>
                                <Typography variant="caption">
                                  {t("dd MM YYYY")}
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              <Card
                sx={{
                  mt: 4,
                  overflow: "auto",
                }}
              >
                <CardContent>
                  <Grid container>
                    <Grid xs={12} md={12}>
                      <Stack spacing={1}>
                        <Typography variant="h6">{t("Add product")}</Typography>
                      </Stack>
                    </Grid>

                    <Grid xs={12} md={12}>
                      <Stack spacing={1}>
                        <Box sx={{ mt: 2, p: 1 }}>
                          <AddProductTextInput
                            error={
                              formik?.touched?.products &&
                              formik.errors.products
                            }
                            onChange={(id, name) => {
                              formik.handleChange("productRef")(id || "");
                              formik.handleChange("products")(name || "");
                            }}
                            onProductSelect={(selectedProduct: any) => {
                              formik.setFieldValue("items", [
                                ...formik.values.items,
                                selectedProduct,
                              ]);
                            }}
                            companyRef={""}
                            formik={formik.values.items}
                            selectedId={formik?.values?.productRef}
                            label={t("Search using Product/SKU or Box SKU")}
                            id="Products"
                            orderType={"POGRN"}
                          />
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>

                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("Product")}</TableCell>
                      {selectedOption === "grn" && (
                        <TableCell>{t("Expiry")}</TableCell>
                      )}
                      <TableCell>{t("Quantity")}</TableCell>
                      <TableCell>{t("Action")}</TableCell>
                    </TableRow>
                  </TableHead>

                  <BarcodePrintAddCard
                    setItemsID={setItemsID}
                    products={selectedProducts}
                    poid={id}
                    formik={formik}
                    onRemoveItem={handleRemoveItem}
                    selectedOption={selectedOption}
                  />
                </Table>
              </Card>
              <Stack
                alignItems="center"
                direction="row"
                justifyContent="space-between"
                spacing={1}
                style={{
                  marginRight: "10px",
                  marginLeft: "10px",
                }}
                sx={{ mx: 6 }}
              >
                <Stack alignItems="center" direction="row" spacing={1}>
                  <Button
                    color="inherit"
                    onClick={() => {
                      if (origin == "company") {
                        // changeTab(
                        //   "inventoryManagement",
                        //   Screens?.companyDetail
                        // );
                      }
                      router.back();
                    }}
                  >
                    {t("Cancel")}
                  </Button>
                </Stack>
                <Stack
                  alignItems="center"
                  direction="row"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <LoadingButton
                    type="submit"
                    onClick={() => {
                      setShowError(true);
                      formik.handleSubmit();
                    }}
                    loading={formik.isSubmitting}
                    sx={{ m: 1 }}
                    variant="contained"
                  >
                    {t("Print")}
                  </LoadingButton>

                  {formik.values.templateType === "first" && (
                    <div style={{ display: "none" }}>
                      <div ref={componentRef}>
                        {formik.values.items.map((item: any, index: number) => (
                          <PrintableItem
                            key={index}
                            item={item}
                            user={
                              user.userType === USER_TYPES.SUPERADMIN
                                ? entity?.name
                                : user.company.name
                            }
                            selectedOptions={formik.values.selectedOptions}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {formik.values.templateType === "second" && (
                    <div style={{ display: "none" }}>
                      <div ref={componentRef}>
                        {formik.values.items.map((item: any, index: number) => (
                          <PrintableItemTwo
                            key={index}
                            item={item}
                            user={
                              user.userType === USER_TYPES.SUPERADMIN
                                ? entity?.name
                                : user.company.name
                            }
                            selectedOptions={formik.values.selectedOptions}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default withPermission(BarcodePrint, MoleculeType["stock-history:read"]);
