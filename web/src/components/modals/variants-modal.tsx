import { LoadingButton } from "@mui/lab";
import { Card, Divider, Tab, Tabs, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { FormikProps, useFormik } from "formik";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Scrollbar } from "src/components/scrollbar";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import i18n from "src/i18n";
import { MoleculeType } from "src/permissionManager";
import { Screens } from "src/utils/screens-names";
import useActiveTabs from "src/utils/use-active-tabs";
import * as Yup from "yup";
import ConfirmationDialog from "../confirmation-dialog";
import { StockDetails } from "./variant-tabs/stockDetails";
import { VariantDetails } from "./variant-tabs/variantDetails";

interface VariantModalProps {
  isSaptco?: boolean;
  productData: any;
  handleActionsSubmit: any;
  companyRef?: string;
  multipleVariantsHandleSubmit?: any;
  handleBoxesSubmit?: any;
  open?: boolean;
  handleClose?: () => void;
  modalData?: any;
  modalDataBoxes?: any;
  modalDataActions?: any;
  onSuccess?: any;
  editStock?: boolean;
  createNew?: boolean;
  tabToOpen?: string;
}
interface FeatureProps {
  assignedToAll: boolean;
  locationRefs?: string[];
  locations?: string[];
  variantImageFile: any[];
  variantImageUrl: string;
  variantNameEn?: string;
  variantNameAr?: string;
  sku: string;
  code: string;
  unit: string;
  type: string;
  defaultPrice: string;
  costPrice: string;
  oldDefaultPrice: string;
  oldCostPrice: string;
  // locationPrices: string;
  variantStatus: boolean;
  nonSaleable: boolean;
  prices: any[];
  selectedLocations: any[];
  stocks: any[];
  boxes: any[];
  actions: any[];
}

const TabContents: any = {
  details: VariantDetails,
  stock: StockDetails,
  // boxespack: BoxesDetails,
};

const validationSchema = Yup.object({
  variantNameEn: Yup.string()
    .required(`${i18n.t("Variant Name is required")}`)
    .max(60, "Variant name must not be greater than 60 characters"),
  variantNameAr: Yup.string()
    .required(`${i18n.t("Variant Name is required")}`)
    .max(60, "Variant name must not be greater than 60 characters"),
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
    .max(30, i18n.t("Product Code should be maximum 30 digits")),
  defaultPrice: Yup.number()
    .typeError(i18n.t("Price must be a number"))
    .nullable(),
  costPrice: Yup.number()
    .typeError(i18n.t("Price must be a number"))
    .nullable(),

  unit: Yup.string().required(`${i18n.t("Unit is required")}`),
  locationRefs: Yup.array().when("assignedToAll", {
    is: true,
    then: Yup.array().optional(),
    otherwise: Yup.array()
      .required(i18n.t("Locations is required"))
      .min(1, i18n.t("Locations is required")),
  }),
});

export const VariantModal: React.FC<VariantModalProps> = ({
  isSaptco,
  productData,
  multipleVariantsHandleSubmit,
  handleBoxesSubmit,
  handleActionsSubmit,
  open,
  handleClose,
  modalData,
  modalDataBoxes,
  modalDataActions,
  editStock,
  createNew,
  tabToOpen = "details",
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { id, companyRef } = router.query;
  const [showDirtyDialogEvent, setShowDirtyDialogEvent] = useState(false);
  const canAccess = usePermissionManager();
  const canUpdate =
    canAccess(MoleculeType["product:update"]) ||
    canAccess(MoleculeType["product:manage"]);

  const { find, entities: locations } = useEntity("location");

  const handleDirtyConfirmation = () => {
    localStorage.setItem("isChangeinVariant", "false");
    setShowDirtyDialogEvent(false);
    handleClose();
    formik.resetForm();
  };

  useEffect(() => {
    find({
      page: 0,
      limit: 100,
      _q: "",
      activeTab: "active",
      sort: "asc",
      companyRef: companyRef?.toString(),
    });
  }, [companyRef]);

  const { changeTab, getTab } = useActiveTabs();

  const Component = TabContents[tabToOpen];

  const initialValues: FeatureProps = {
    assignedToAll: true,
    locations: [],
    locationRefs: [],
    variantImageFile: [],
    variantImageUrl: "",
    variantNameEn: "",
    variantNameAr: "",
    sku: "",
    code: "",
    unit: "",
    defaultPrice: "",
    costPrice: "",
    oldDefaultPrice: "",
    oldCostPrice: "",
    type: "item",
    // locationPrices: "",
    variantStatus: true,
    nonSaleable: false,
    prices: [],
    selectedLocations: [],
    stocks: [],
    boxes: [],
    actions: [],
  };

  const formik: FormikProps<FeatureProps> = useFormik<FeatureProps>({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      const data = {
        assignedToAll: values.assignedToAll,
        locations: values.assignedToAll
          ? locations.results?.map((loc) => {
              return { name: loc.name.en };
            })
          : values?.locations.map((loc) => {
              return { name: loc };
            }),
        locationRefs: values.assignedToAll
          ? locations.results?.map((loc) => {
              return loc._id;
            })
          : values?.locationRefs,
        image: values?.variantImageUrl,
        name: {
          en: values?.variantNameEn?.trim(),
          ar: values?.variantNameAr?.trim(),
        },
        sku: values?.sku,
        code: values?.code || "",
        unit: values?.unit,
        type: values?.type,
        price: values?.defaultPrice,
        oldPrice: values?.oldDefaultPrice,
        costPrice: values?.costPrice,
        oldCostPrice: values?.oldCostPrice,
        status: values.variantStatus ? "active" : "inactive",
        nonSaleable: values.nonSaleable,
        prices: locations.results?.map((ref, index) => {
          const idx = values.prices.findIndex(
            (price) => price.locationRef == ref._id
          );

          if (idx == -1) {
            return {
              price: values.defaultPrice,
              costPrice: values.costPrice,
              locationRef: ref._id,
              location: {
                name: ref.name.en,
              },
            };
          } else {
            const data: any = {
              price: values.prices[idx].price,
              costPrice: values.costPrice,
              locationRef: values.prices[idx].locationRef,
              location: {
                name: values.prices[idx].location.name,
              },
            };

            return values.prices[idx].price == values.defaultPrice
              ? data
              : { ...data, overriden: true };
          }
        }),
        stockConfiguration: formik.values.stocks.map((item: any) => ({
          availability: item.availability,
          tracking: item.tracking,
          count: Number(item.count || 0),
          lowStockAlert: item.lowStockAlert,
          lowStockCount: Number(item.lowStockCount || 0),
          locationRef: item.locationRef,
          location: item.location,
        })),
      };

      if (createNew && id) {
        formik.values.stocks.forEach((stock) => {
          if (stock.tracking && productData.enabledBatching) {
            const dataaction = {
              productRef: id,
              product: {
                name: {
                  en: productData.productNameEn,
                  ar: productData.productNameAr,
                },
              },
              companyRef: productData.companyRef,
              company: {
                name: productData.companyName,
              },
              locationRef: stock.locationRef,
              location: {
                name: stock.location.name,
              },
              variant: {
                name: {
                  en: values.variantNameEn,
                  ar: values.variantNameAr,
                },
                type: values.type,
                unit: Number(values.unit),
                qty: Number(stock.count),
                sku: values.sku,
              },
              sku: values.sku,
              batching: productData.enabledBatching,
              action: "received",
              expiry: stock.expiry,

              price: values.costPrice || 0,
              count: Number(stock.count),
              sourceRef: "",
              destRef: stock.locationRef,
              available: Number(stock.count),
              received: Number(stock.count),
              transfer: 0,
              availableSource: 0,
              receivedSource: 0,
              transferSource: 0,
            };
            formik.values.actions.push(dataaction);
          }
        });
      }

      multipleVariantsHandleSubmit(data);
      handleBoxesSubmit([...values.boxes]);

      handleActionsSubmit(values.actions);

      formik.resetForm();
    },
  });
  console.log("formik.error", formik.errors);
  console.log("formik.values", formik.values);

  const handleTabsChange = (event: ChangeEvent<any>, value: string): void => {
    changeTab(value, Screens.variantTabs);
  };

  useEffect(() => {
    if (editStock) {
      changeTab("stock", Screens.variantTabs);
    } else {
      changeTab("details", Screens.variantTabs);
    }
  }, [open, editStock]);

  // dummy comment

  useEffect(() => {
    formik.resetForm();
    if (modalData != null) {
      const locations: any = modalData.locationRefs?.map(
        (ref: any, index: number) => {
          return { _id: ref, name: { en: modalData.locations[index]?.name } };
        }
      );

      const pricesData = modalData.prices?.filter(
        (priceObj: any) => priceObj.price !== modalData.price
      );

      const names = modalData.locations.map((loc: any) => loc.name);

      formik.setFieldValue("assignedToAll", modalData.assignedToAll);
      formik.setFieldValue("selectedLocations", locations);
      formik.setFieldValue("locationRefs", modalData.locationRefs || []);
      formik.setFieldValue("locations", names);
      formik.setFieldValue("variantImageUrl", modalData.image);
      formik.setFieldValue("variantNameEn", modalData.name.en);
      formik.setFieldValue("variantNameAr", modalData.name.ar);
      formik.setFieldValue("sku", modalData.sku);
      formik.setFieldValue(
        "code",
        modalData?.code === "undefined" ? "" : modalData?.code || ""
      );
      formik.setFieldValue("unit", modalData.unit);
      formik.setFieldValue("defaultPrice", modalData.price);
      formik.setFieldValue("oldDefaultPrice", modalData.price);
      formik.setFieldValue("costPrice", modalData.costPrice);
      formik.setFieldValue("oldCostPrice", modalData.costPrice);
      formik.setFieldValue("variantStatus", modalData.status == "active");
      formik.setFieldValue("nonSaleable", modalData.nonSaleable);
      formik.setFieldValue("prices", pricesData || []);
      const transformedStocks = modalData.stockConfiguration?.map(
        (item: any) => ({
          availability: item.availability,
          tracking: item.tracking,
          count: Number(item.count || 0),
          lowStockAlert: item.lowStockAlert,
          lowStockCount: Number(item.lowStockCount || 0),
          locationRef: item.locationRef,
          location: item.location,
        })
      );
      formik.setFieldValue("stocks", transformedStocks);

      formik.setFieldValue("boxes", modalDataBoxes || []);
      formik.setFieldValue("actions", modalDataActions || []);
    } else {
      formik.setFieldValue("boxes", modalDataBoxes || []);
    }
  }, [open, modalData]);

  return (
    <Box>
      <Modal
        open={open}
        onClose={() => {
          handleClose();
          formik.resetForm();
        }}
      >
        <Card
          sx={{
            visibility: "visible",
            scrollbarColor: "transpatent",
            scrollBehavior: "auto",
            position: "fixed ",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            borderRadius: "0",
            bgcolor: theme.palette.mode !== "dark" ? `#f8f9fa` : "#0B0F19",
            overflowY: "hidden",

            p: 4,
          }}
        >
          <Box
            style={{
              width: "100%",
              display: "flex",

              padding: "5px",
            }}
          >
            <XCircle
              fontSize="small"
              onClick={() => {
                if (localStorage.getItem("isChangeinVariant") === "true") {
                  setShowDirtyDialogEvent(true);
                } else {
                  handleClose();
                  formik.resetForm();
                }
              }}
              style={{ cursor: "pointer" }}
            />

            <Box style={{ flex: 1 }}>
              <Typography variant="h6" align="center">
                {createNew ? t("Add a Variant") : t("Edit Variant")}
              </Typography>
              <Typography
                variant="body2"
                align="center"
                sx={{ pt: 1, textTransform: "capitalize" }}
              >
                {`${productData?.productNameEn || "Add Product Name"} , ${
                  formik.values?.variantNameEn || "Add Variant Name"
                }`}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ width: "100%" }}>
            <Divider sx={{ maxWidth: "800px", m: "auto" }} />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100%",
            }}
          >
            <Scrollbar
              sx={{
                overflowY: "auto",
                height: {
                  lg: "75vh",
                  md: "75vh",
                  sm: "75vh",
                  xs: "75vh",
                },
              }}
            >
              <Component
                isSaptco={isSaptco}
                formik={formik}
                open={open}
                productId={id}
                productData={productData}
                companyRef={companyRef}
                createNew={createNew}
              />
            </Scrollbar>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "end",
                mt: 2,
              }}
            >
              <LoadingButton
                onClick={() => {
                  if (!canUpdate) {
                    return toast.error(t("You don't have access"));
                  }
                  if (
                    createNew &&
                    productData?.existingSKU?.includes(formik.values.sku)
                  ) {
                    return toast.error(t("SKU already exist"));
                  }
                  if (
                    !formik.values.sku ||
                    !formik.values.unit ||
                    !formik.values.variantNameEn ||
                    !formik.values.variantNameAr ||
                    (formik.values.assignedToAll === false &&
                      (!formik.values.locationRefs ||
                        formik.values.locationRefs.length === 0))
                  ) {
                    formik.handleSubmit();
                    changeTab("details", Screens.variantTabs);
                    toast.error(`${t("Fill the Details first")}`);
                  } else {
                    if (productData.enabledBatching && createNew) {
                      for (let i = 0; i < formik.values.stocks.length; i++) {
                        const stockDetail = formik.values.stocks[i];

                        if (stockDetail.tracking && !stockDetail.expiry && id) {
                          toast.error(
                            `${t("Please add the Expiry date for")} ${
                              stockDetail.location.name
                            }`
                          );
                          return;
                        }
                        if (stockDetail.tracking && stockDetail.count < 1) {
                          toast.error(
                            `${t("Please add stock count for")} ${
                              stockDetail.location.name
                            } ${t("it cannot be zero")}`
                          );
                          return;
                        }
                      }
                    }
                    if (
                      productData?.hasMultipleVariants &&
                      isSaptco &&
                      Number(formik.values.defaultPrice) <= 0
                    ) {
                      return toast.error(
                        `${t(
                          "selling price should not be less than or equal to 0"
                        )}  `
                      );
                    }
                    if (
                      productData?.hasMultipleVariants &&
                      isSaptco &&
                      Number(formik.values.code) <= 0
                    ) {
                      return toast.error(
                        `${t(
                          "kilometers should not be less than or equal to 0"
                        )}  `
                      );
                    }

                    for (let i = 0; i < formik.values.stocks?.length; i++) {
                      if (
                        Boolean(formik.values.stocks?.[i]?.lowStockAlert) &&
                        Number(formik.values.stocks?.[i]?.lowStockCount) < 1
                      ) {
                        toast.error(
                          `Low stock count is required for ${formik.values.stocks?.[i]?.location?.name}`
                        );
                        return;
                      }
                    }

                    formik.handleSubmit();
                  }
                }}
                variant="contained"
                type="submit"
              >
                {t("Submit")}
              </LoadingButton>
            </Box>
          </Box>
          <ConfirmationDialog
            show={showDirtyDialogEvent}
            toggle={() => setShowDirtyDialogEvent(!showDirtyDialogEvent)}
            onOk={handleDirtyConfirmation}
            okButtonText={`${t("Yes")}`}
            cancelButtonText={t("Cancel")}
            title={t("Confirmation")}
            text={t(`Changes are made are you sure want to go back`)}
          />
        </Card>
      </Modal>
    </Box>
  );
};
