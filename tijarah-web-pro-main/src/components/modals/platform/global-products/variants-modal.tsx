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
import ConfirmationDialog from "src/components/confirmation-dialog";
import { Scrollbar } from "src/components/scrollbar";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import i18n from "src/i18n";
import { MoleculeType } from "src/permissionManager";
import { Screens } from "src/utils/screens-names";
import useActiveTabs from "src/utils/use-active-tabs";
import * as Yup from "yup";
import { BoxesDetails } from "./variant-tabs/boxesDetails";
import { VariantDetails } from "./variant-tabs/variantDetails";

interface VariantModalProps {
  productData: any;
  companyRef?: string;
  multipleVariantsHandleSubmit?: any;
  handleBoxesSubmit?: any;
  open?: boolean;
  handleClose?: () => void;
  pushNotify: boolean;
  modalData?: any;
  modalDataBoxes?: any;
  onSuccess?: any;
  createNew?: boolean;
}
interface FeatureProps {
  variantImageFile: any[];
  variantImageUrl: string;
  variantNameEn?: string;
  variantNameAr?: string;
  sku: string;
  unit: string;
  type: string;
  costPrice: string;
  defaultPrice: string;
  oldDefaultPrice: string;
  oldCostPrice: string;
  variantStatus: boolean;
  nonSaleable: boolean;
  boxes: any[];
  pushNotify: boolean;
}

const TabContents: any = {
  details: VariantDetails,
  boxespack: BoxesDetails,
};

const validationSchema = Yup.object({
  variantNameEn: Yup.string()
    .matches(
      /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
      i18n.t("Enter valid variant name")
    )
    .required(`${i18n.t("Variant Name is required")}`)
    .max(60, "Variant name must not be greater than 60 characters"),
  variantNameAr: Yup.string()
    .matches(
      /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
      i18n.t("Enter valid variant name")
    )
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
  defaultPrice: Yup.number()
    .typeError(i18n.t("Price must be a number"))
    .moreThan(0, i18n.t("Price must be greater than 0"))
    .nullable(),
  costPrice: Yup.number()
    .typeError(i18n.t("Price must be a number"))
    .moreThan(0, i18n.t("Price must be greater than 0"))
    .nullable(),
  unit: Yup.string().required(`${i18n.t("Unit is required")}`),
  nonSaleable: Yup.boolean(),
});

export const VariantModal: React.FC<VariantModalProps> = ({
  productData,
  multipleVariantsHandleSubmit,
  handleBoxesSubmit,
  open,
  handleClose,
  pushNotify,
  modalData,
  modalDataBoxes,
  createNew,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { id, companyRef } = router.query;
  const [showDirtyDialogEvent, setShowDirtyDialogEvent] = useState(false);
  const canAccess = usePermissionManager();
  const canUpdate =
    canAccess(MoleculeType["global-product:update"]) ||
    canAccess(MoleculeType["global-product:manage"]);

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

  const Component = TabContents[getTab(Screens?.variantTabs) || "details"];

  const tabs = [
    {
      label: t("Details"),
      value: "details",
    },
    {
      label: t("Boxes/Packs"),
      value: "boxespack",
    },
  ];

  const initialValues: FeatureProps = {
    variantImageFile: [],
    variantImageUrl: "",
    variantNameEn: "",
    variantNameAr: "",
    sku: "",
    unit: "",
    defaultPrice: "",
    costPrice: "",
    oldDefaultPrice: "",
    oldCostPrice: "",
    type: "item",
    variantStatus: true,
    nonSaleable: false,
    boxes: [],
    pushNotify: false,
  };

  const formik: FormikProps<FeatureProps> = useFormik<FeatureProps>({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      const data = {
        image: values?.variantImageUrl,
        name: {
          en: values?.variantNameEn,
          ar: values?.variantNameAr,
        },
        sku: values?.sku,
        unit: values?.unit,
        type: values?.type,
        price: values?.defaultPrice,
        oldPrice: values?.oldDefaultPrice,
        costPrice: values?.costPrice,
        oldCostPrice: values?.oldCostPrice,
        status: values.variantStatus ? "active" : "inactive",
        nonSaleable: values.nonSaleable,
      };

      multipleVariantsHandleSubmit(data, values.pushNotify);
      handleBoxesSubmit([...values.boxes]);
      formik.resetForm();
    },
  });

  const handleTabsChange = (event: ChangeEvent<any>, value: string): void => {
    changeTab(value, Screens.variantTabs);
  };

  useEffect(() => {
    if (productData) {
      changeTab(productData?.activeTab, Screens.variantTabs);
    }
  }, []);

  useEffect(() => {
    formik.resetForm();
    if (modalData != null) {
      formik.setFieldValue("variantImageUrl", modalData.image);
      formik.setFieldValue("variantNameEn", modalData?.name?.en);
      formik.setFieldValue("variantNameAr", modalData?.name?.ar);
      formik.setFieldValue("sku", modalData.sku);
      formik.setFieldValue("unit", modalData.unit);
      formik.setFieldValue("defaultPrice", modalData.price);
      formik.setFieldValue("oldDefaultPrice", modalData.price);
      formik.setFieldValue("costPrice", modalData.costPrice);
      formik.setFieldValue("oldCostPrice", modalData.costPrice);
      formik.setFieldValue("variantStatus", modalData.status === "active");
      formik.setFieldValue("nonSaleable", modalData.nonSaleable);
      formik.setFieldValue("boxes", modalDataBoxes || []);
      formik.setFieldValue("pushNotify", pushNotify);
    } else {
      formik.setFieldValue("boxes", modalDataBoxes || []);
      formik.setFieldValue("pushNotify", pushNotify);
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
            <Tabs
              style={{
                maxWidth: "800px",
                marginRight: "auto",
                marginLeft: "auto",
              }}
              indicatorColor="primary"
              onChange={handleTabsChange}
              scrollButtons="auto"
              textColor="primary"
              value={getTab(Screens.variantTabs)}
              variant="scrollable"
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.value}
                  label={tab.label}
                  value={tab.value}
                  style={{ flex: "1" }}
                />
              ))}
            </Tabs>
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
                  lg: "80vh",
                  sm: "90vh",
                },
              }}
            >
              <Component
                formik={formik}
                open={open}
                productId={id}
                productData={productData}
                companyRef={companyRef}
                createNew={createNew}
              />
            </Scrollbar>
            <Box sx={{ position: "absolute", right: "32px", top: "32px" }}>
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
                  if (!formik.values.sku) {
                    toast.error(`${t("Fill the Details first")}`);
                  } else {
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
