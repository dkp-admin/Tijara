import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Radio,
  Stack,
  SvgIcon,
  Switch,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import endpoint from "src/api/endpoints";
import serviceCaller from "src/api/serviceCaller";
import ConfirmationDialog from "src/components/confirmation-dialog";
import BrandDropdown from "src/components/input/brand-auto-complete";
import BusinessTypeMultiSelect from "src/components/input/business-type-multiSelect";
import GlobalCategoriesDropdown from "src/components/input/global-category-auto-complete";
import TaxDropdown from "src/components/input/tax-auto-complete";
import { ImageCropModal } from "src/components/modals/image-crop-modal";
import { VariantModal } from "src/components/modals/platform/global-products/variants-modal";
import { ProductDropzone } from "src/components/product-dropzone";
import { RouterLink } from "src/components/router-link";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import {
  industryOptions,
  unitOptions,
  unitOptionsRestaurant,
} from "src/utils/constants";
import { getUploadedDocName } from "src/utils/get-uploaded-file-name";
import * as Yup from "yup";
import { VariantLists } from "./variant-list";
import { ProductUpdateModalComponent } from "src/components/modals/platform/global-products/product-update-modal";
import { toFixedNumber } from "src/utils/toFixedNumber";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { FileUploadNamespace } from "src/utils/uploadToS3";
import { useCurrency } from "src/utils/useCurrency";
import { useAuth } from "src/hooks/use-auth";

interface CreateGlobalProductProps {
  id: string;
}

interface CreateGlobalProduct {
  industry: string;
  init: boolean;
  productImageFile?: any[];
  productImageUrl?: string;
  productNameEn: string;
  productNameAr?: string;
  globalCategories: string;
  globalCategoriesRef: string;
  productDescription?: string;
  brandRef: string;
  brands: string;
  taxRef: string;
  tax: number;
  enabledBatching: boolean;
  businessTypeRef: string[];
  businessType: string[];
  variantType?: string;
  variantNameEn?: string;
  variantNameAr?: string;
  sku: string;
  unit: string;
  defaultPrice: string;
  productStatus: string;
  dynamicLocationPrice: any[];
  locations?: string;
  variants: any[];
  boxes: any[];
  singleVsku: string;
  singleVunit: string;
  singleVtype: string;
  singleVdefaultPrice: string;
  singleVcostPrice: string;
  singleVOldDefaultPrice: string;
  singleVOldCostPrice: string;
  singleVNonSaleable: boolean;
  singleVStatus: boolean;
  notify: boolean;
  pushedDate: Date;
  pushNotify: boolean;
}

const newVariant = {
  image: "",
  name: {
    en: "regular",
    ar: "regular.ar",
  },
  type: "item",
  sku: "",
  unit: "perItem",
  unitCount: 1,
  costPrice: "",
  oldCostPrice: "",
  price: "",
  oldPrice: "",
  status: "active",
};

export const GlobalProductCreateForm: FC<CreateGlobalProductProps> = (
  props
): any => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  usePageView();
  const theme = useTheme();
  const currency = useCurrency();
  const units =
    user?.company?.industry === "restaurant"
      ? unitOptionsRestaurant
      : unitOptions;
  const { id } = props;
  const { newid, type } = router.query;

  const { findOne, create, updateEntity, entity, loading } =
    useEntity("global-products");
  const {
    findOne: findOneUpdate,
    deleteEntity,
    entity: entityUpdate,
  } = useEntity("updated-product");
  const [pendingVariantOption, setPendingVariantOption] = useState(null);
  const [showError, setShowError] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isSwitchEnabled, setIsSwitchEnabled] = useState(false);
  const [existingSKU, setExistingSKU] = useState([]);
  const [showDialogEvent, setShowDialogEvent] = useState(false);
  const canAccess = usePermissionManager();
  const canEdit = canAccess(MoleculeType["global-product:update"]);
  const canCreate = canAccess(MoleculeType["global-product:create"]);
  const canUseBatching = canAccess(MoleculeType["product:batching"]);
  const [selectedVariantOption, setSelectedVariantOption] =
    useState("singleVariant");
  const [editStock, setEditStock] = useState(false);
  const [createNew, setCreateNew] = useState(false);
  const isDisabled = id != null && !canEdit;
  const [generateApi, setGenerateApi] = useState(true);
  const [generateSkuHide, setGenerateSkuHide] = useState(false);
  const [showDirtyDialogEvent, setShowDirtyDialogEvent] = useState(false);
  const [ischangedProduct, setIschangedProduct] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [variantIndex, setVariantIndex] = useState(-1);
  const [openVariantModal, setOpenVariantModal] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [openCropModal, setOpenCropModal] = useState(false);

  const validationSchema = Yup.object({
    productNameEn: Yup.string()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid product name")
      )
      .required(`${t("Product Name is required")}`)
      .max(60, t("Product name must not be greater than 60 characters")),
    productNameAr: Yup.string()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid product name")
      )
      .required(`${t("Product Name is required")}`)
      .max(60, t("Product name must not be greater than 60 characters")),
    globalCategories: Yup.string().required(`${t("Category is required")}`),
    brands: Yup.string().required(`${t("Brands is required")}`),
    enabledBatching: Yup.boolean(),
    businessTypeRef: Yup.array()
      .required(`${t("Business Type is required")}`)
      .min(1, `${t("Business Type is required")}`),
    taxRef: Yup.string().required(`${t("Tax is required")}`),
    singleVsku: Yup.string()
      .matches(
        /^[0-9]+$/,
        t(
          "Special characters, alphabets and spaces are not allowed. Only numeric values are allowed."
        )
      )
      .required(`${t("SKU is required")}`)
      .min(3, t("SKU should be minimum 3 digits"))
      .max(16, t("SKU should be maximum 16 digits")),
  });

  const initialValues: CreateGlobalProduct = {
    productImageFile: [],
    locations: "",
    industry: "retail",
    productImageUrl: "",
    productNameEn: "",
    productNameAr: "",
    productDescription: "",
    brandRef: "",
    brands: "",
    globalCategoriesRef: "",
    globalCategories: "",
    taxRef: "",
    tax: 0,
    enabledBatching: false,
    businessType: [],
    businessTypeRef: [],
    variantType: "single-variant",
    variantNameEn: "",
    variantNameAr: "",
    sku: "",
    unit: "",
    pushedDate: new Date(),
    defaultPrice: "",
    productStatus: "active",
    dynamicLocationPrice: [],
    variants: [],
    boxes: [],
    init: false,
    singleVsku: "",
    singleVunit: "",
    singleVtype: "",
    singleVdefaultPrice: "",
    singleVcostPrice: "",
    singleVOldDefaultPrice: "",
    singleVOldCostPrice: "",
    singleVStatus: true,
    singleVNonSaleable: false,
    notify: false,
    pushNotify: false,
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      if (!values.sku && values.variants?.length == 0) {
        toast.error(`${t("SKU is required")}`);
        return;
      }

      const data: any = {
        image: values.productImageUrl,
        name: {
          en: values?.productNameEn.trim(),
          ar: values?.productNameAr.trim(),
        },
        description: values?.productDescription.trim(),
        brandRef: values?.brandRef,
        brand: {
          name: values?.brands,
        },
        categoryRef: values?.globalCategoriesRef,
        category: {
          name: values.globalCategories,
        },
        taxRef: values?.taxRef,
        tax: {
          percentage: values?.tax,
        },
        batching: values?.enabledBatching,
        businessTypeRefs: values?.businessTypeRef,
        businessTypes: values.businessType,
        type: id ? "UPDATED" : "NEW",
        variants: values?.variants?.map((variant: any) => {
          return {
            image: variant.image,
            name: {
              en: variant.name.en.trim(),
              ar: variant.name.ar.trim(),
            },
            type: variant.type,
            sku: variant.sku,
            unit: variant.unit,
            unitCount: 1,
            price: variant.price,
            oldPrice: variant.oldPrice,
            costPrice: variant.costPrice,
            oldCostPrice: variant.oldCostPrice,
            sellingPrice: variant.price,
            oldSellingPrice: variant.oldPrice,
            status: variant.status,
            nonSaleable: variant.nonSaleable,
          };
        }),
        boxes: values?.boxes?.map((box: any) => {
          return {
            image: "",
            name: box.parentName,
            type: box.type,
            parentSku: box.parentSku,
            parentName: box.parentName,
            sku: box.sku,
            unit: box.unit,
            unitCount: box.unitCount,
            costPrice: box.costPrice,
            price: box.price,
            sellingPrice: box.price,
            status: box.status,
            nonSaleable: box.nonSaleable,
          };
        }),
      };

      if (values.pushNotify) {
        data["notify"] = values.notify;
        data["updatedBy"] = "SUPER_ADMIN";
        data["pushed"] = values.notify;
        data["pushedDate"] = values.pushedDate;
      }

      try {
        if (id) {
          await updateEntity(id?.toString(), { ...data });
          router?.push(tijarahPaths?.platform?.globalProducts?.index);
        } else {
          console.log(data);

          await create({ ...data });
        }

        toast.success(
          id != null
            ? `${t("Global Product Updated")}`
            : `${t("Global Product Created")}`
        );

        if (newid) {
          await deleteEntity(newid.toString());
        }

        router.back();
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

  const handleDragEnd = (e: any) => {
    if (!e.destination) return;
    let tempData = Array.from(formik?.values?.variants);
    let [source_data] = tempData.splice(e.source.index, 1);
    tempData.splice(e.destination.index, 0, source_data);

    formik.setFieldValue("variants", tempData);
  };

  const productImageFileDrop = (newFiles: any): void => {
    if (newFiles?.length > 1) {
      toast.error(t("Please select one image to upload"));
      return;
    }

    formik.setFieldValue("productImageFile", newFiles);
    if (newFiles[0]) {
      setOpenCropModal(true);
    } else {
      toast.error(
        `${t("File type not supported or limit the image size within 1 MB")}`
      );
    }
  };

  const productImageFileRemove = (): void => {
    formik.setFieldValue("productImageFile", []);
    formik.setFieldValue("productImageUrl", "");
  };

  const productImageFileRemoveAll = (): void => {
    formik.setFieldValue("productImageFile", []);
  };

  const onSuccess = (fileName: string | undefined) => {
    formik.setFieldValue("productImageUrl", fileName);
  };

  const handleUpload = async (files: any) => {
    setIsUploading(true);
    try {
      const file = files[0];
      const tempUrl = URL.createObjectURL(file);
      setImgSrc(tempUrl);
      setIsUploaded(true);
      setIsUploading(false);
    } catch (error) {
      toast.error(error.message);
      setIsUploading(false);
    }
  };

  const handleCroppedImage = (croppedImageUrl: any) => {
    formik.setFieldValue("productImageUrl", croppedImageUrl);
  };

  const handleDirtyConfirmation = () => {
    setShowDirtyDialogEvent(false);
    setIschangedProduct(false);
    formik.setFieldValue("pushed", true);
    formik.setFieldValue("notify", true);
    formik.handleSubmit();
  };
  const handleDirtyConfirmationDiscard = () => {
    setShowDirtyDialogEvent(false);
    setIschangedProduct(false);
    formik.setFieldValue("pushed", false);
    formik.setFieldValue("notify", false);
    formik.handleSubmit();
  };

  const handleConfirmation = () => {
    if (pendingVariantOption) {
      setSelectedVariantOption(pendingVariantOption);
      formik.setFieldValue("variantOption", pendingVariantOption);
      const variants = formik.values.variants;

      if (variants.length === 0) {
        formik.setFieldValue("variants", [newVariant]);
      } else {
        const revertedVariants = [variants[0]];
        formik.setFieldValue("variants", revertedVariants);
      }
      setPendingVariantOption(null);
      setShowDialogEvent(false);
    }
  };

  const handleCardClick = (option: string) => {
    if (selectedVariantOption !== option) {
      if (option === "multipleVariant") {
        setSelectedVariantOption(option);
        formik.setFieldValue("variantOption", option);
        const variants = formik.values.variants;

        if (variants.length === 0) {
          formik.setFieldValue("variants", [newVariant]);
        } else {
          if (variants[0].sku) {
            const revertedVariants = [variants[0]];
            formik.setFieldValue("variants", revertedVariants);
          } else {
            const revertedVariants = [variants[0]];
            formik.setFieldValue("variants", []);
          }
        }
      } else if (
        option === "singleVariant" &&
        formik.values.variants.length > 1
      ) {
        setPendingVariantOption(option);
        setShowDialogEvent(true);
      } else {
        setSelectedVariantOption(option);
        formik.setFieldValue("variantOption", option);
        const variants = formik.values.variants;

        if (variants.length === 0) {
          formik.setFieldValue("variants", [newVariant]);
        } else {
          const revertedVariants = [variants[0]];
          formik.setFieldValue("variants", revertedVariants);
        }
      }
    }
  };

  const handleSaveVariants = (variant?: any) => {
    let data: any = formik.values.variants;

    if (variantIndex == -1) {
      data = [...data, { ...variant, _id: data?.length }];
    } else {
      data?.splice(variantIndex, 1, { ...variant, _id: variantIndex });
    }

    formik.setFieldValue("singleVsku", data[0].sku);
    formik?.setFieldValue("variants", data);

    setOpenVariantModal(false);
  };

  const generateUniqueSku = async () => {
    if (generateApi) {
      try {
        const res = await serviceCaller(endpoint.generateUniqueSKU.path, {
          method: endpoint.generateUniqueSKU.method,
        });

        if (res?.sku) {
          setGenerateApi(false);
          setGenerateSkuHide(true);
          formik.setFieldValue("variants[0].sku", res.sku);
          formik.setFieldValue("singleVsku", res.sku);
        }
      } catch (error: any) {
        formik.setFieldValue("variants[0].sku", "");
        formik.setFieldValue("singleVsku", "");
      }
    }
  };
  const getPriceStrike = () => {
    if (formik.values?.variants?.length > 1) {
      return ``;
    } else {
      const price = formik.values?.variants[0]?.price || 0;
      const originalPrice = formik.values?.variants[0]?.oldPrice;
      return (
        <>
          <span style={{ textDecoration: "line-through", marginLeft: "5px" }}>
            {toFixedNumber(originalPrice)}
          </span>
        </>
      );
    }
  };
  const getCostPriceStrike = () => {
    if (formik.values?.variants?.length > 1) {
      return ``;
    } else {
      const originalPrice = formik.values?.variants[0]?.oldCostPrice;
      return (
        <>
          <span style={{ textDecoration: "line-through", marginLeft: "5px" }}>
            {toFixedNumber(originalPrice)}
          </span>
        </>
      );
    }
  };

  const showMargin = (): string => {
    const costPrice = formik.values?.variants[0]?.costPrice;
    const defaultPrice = formik.values?.variants[0]?.price;

    if (costPrice && defaultPrice) {
      const marginAmount = defaultPrice - costPrice;
      const marginPercentage = ((marginAmount / defaultPrice) * 100).toFixed(2);

      return `${currency} ${marginAmount.toFixed(2)}, ${marginPercentage}%`;
    } else {
      return `0% (${currency} 0)`;
    }
  };

  useEffect(() => {
    if (
      id == null &&
      formik.values.variants.length === 0 &&
      selectedVariantOption === "singleVariant"
    ) {
      formik.setFieldValue("variants", [newVariant]);
    }
  }, [!id, selectedVariantOption]);

  useEffect(() => {
    const skusArray1 = formik.values?.variants.map((item) => item.sku);
    const skusArray2 = formik.values?.boxes.map((item) => item.sku);

    const newArr = [...skusArray1, ...skusArray2];

    setExistingSKU(newArr);
  }, [formik.values?.variants, formik?.values?.boxes]);

  // useEffect(() => {
  //   if (formik.values.init) {
  //     if (formik?.values?.variants?.length > 1) {
  //       setIsDisabled(true);
  //     } else {
  //       setIsDisabled(false);

  //       const data = formik?.values?.variants[0];

  //       formik.setFieldValue("sku", data?.sku);
  //       formik.setFieldValue("unit", data?.unit);
  //       formik.setFieldValue("defaultPrice", data?.price);
  //       formik.setFieldValue("productStatus", data?.status);
  //     }
  //   }
  // }, [formik?.values?.variants]);

  useEffect(() => {
    if (id != null || newid != null) {
      if (type === "updated-product") {
        findOneUpdate(newid?.toString());
      } else {
        findOne(id?.toString());
      }
    }
  }, [id, newid]);

  useEffect(() => {
    if (entity != null && !formik.values.init) {
      formik.setFieldValue("businessTypeRef", entity?.businessTypeRefs);
      formik.setFieldValue("businessType", entity?.businessType);
      formik.setFieldValue("productImageUrl", entity?.image || "");
      formik.setFieldValue("productNameEn", entity?.name?.en);
      formik.setFieldValue("productNameAr", entity?.name?.ar);
      formik.setFieldValue("productDescription", entity?.description);
      formik.setFieldValue("brandRef", entity?.brandRef);
      formik.setFieldValue("brands", entity?.brand?.name);
      formik.setFieldValue("globalCategoriesRef", entity?.categoryRef);
      formik.setFieldValue("globalCategories", entity?.category?.name);
      formik.setFieldValue("taxRef", entity?.taxRef);
      formik.setFieldValue("tax", entity?.tax?.percentage);
      formik.setFieldValue("enabledBatching", entity.batching);
      formik.setFieldValue("notify", entity.notify);
      formik.setFieldValue(
        "variantType",
        entity?.variants?.length > 1 ? "multiple-variants" : "single-variant"
      );
      formik.setFieldValue("variants", entity?.variants || []);
      formik.setFieldValue("singleVsku", entity?.variants?.[0]?.sku || "");
      formik.setFieldValue(
        "singleVNonSaleable",
        entity?.variants[0]?.nonSaleable
      );
      formik.setFieldValue(
        "singleVStatus",
        entity?.variants?.[0]?.status === "active"
      );
      formik.setFieldValue(
        "singleVOldCostPrice",
        entity?.variants?.[0]?.costPrice
      );
      formik.setFieldValue(
        "singleVOldDefaultPrice",
        entity?.variants?.[0]?.price
      );
      formik.setFieldValue("boxes", entity?.boxes || []);

      formik.setFieldValue("variants", entity?.variants || []);
      formik.setFieldValue(
        "multipleVariant",
        entity?.variants.lenght > 1 ? "multipleVariant" : "singleVariant"
      );
      formik.setFieldValue("init", true);
    }
    setSelectedVariantOption(
      entity?.variants.length > 1 ? "multipleVariant" : "singleVariant"
    );
  }, [entity]);
  useEffect(() => {
    if (entityUpdate != null && !formik.values.init) {
      formik.setFieldValue("businessTypeRef", entityUpdate?.businessTypeRefs);
      formik.setFieldValue("businessType", entityUpdate?.businessType);
      formik.setFieldValue("productImageUrl", entityUpdate?.image || "");
      formik.setFieldValue("productNameEn", entityUpdate?.name?.en);
      formik.setFieldValue("productNameAr", entityUpdate?.name?.ar);
      formik.setFieldValue("productDescription", entityUpdate?.description);
      formik.setFieldValue("brandRef", entityUpdate?.brandRef);
      formik.setFieldValue("brands", entityUpdate?.brand?.name);
      formik.setFieldValue("globalCategoriesRef", entityUpdate?.categoryRef);
      formik.setFieldValue("globalCategories", entityUpdate?.category?.name);
      formik.setFieldValue("taxRef", entityUpdate?.taxRef);
      formik.setFieldValue("tax", entityUpdate?.tax?.percentage);
      formik.setFieldValue("enabledBatching", entityUpdate.batching);
      formik.setFieldValue("notify", entityUpdate.notify);
      formik.setFieldValue("pushNotify", false);
      formik.setFieldValue(
        "variantType",
        entityUpdate?.variants?.length > 1
          ? "multiple-variants"
          : "single-variant"
      );
      formik.setFieldValue("variants", entityUpdate?.variants || []);
      formik.setFieldValue(
        "singleVsku",
        entityUpdate?.variants?.[0]?.sku || ""
      );
      formik.setFieldValue(
        "singleVStatus",
        entityUpdate?.variants?.[0]?.status === "active"
      );
      formik.setFieldValue(
        "singleVOldCostPrice",
        entityUpdate?.variants?.[0]?.costPrice
      );
      formik.setFieldValue(
        "singleVOldDefaultPrice",
        entityUpdate?.variants?.[0]?.price
      );
      formik.setFieldValue("boxes", entityUpdate?.boxes || []);

      formik.setFieldValue("variants", entityUpdate?.variants || []);
      formik.setFieldValue(
        "multipleVariant",
        entityUpdate?.variants.lenght > 1 ? "multipleVariant" : "singleVariant"
      );
      formik.setFieldValue("init", true);
    }
    setSelectedVariantOption(
      entityUpdate?.variants.length > 1 ? "multipleVariant" : "singleVariant"
    );
  }, [entityUpdate]);

  if (loading) {
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
    <>
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
                    <TextFieldWrapper
                      autoComplete="off"
                      inputProps={{ style: { textTransform: "capitalize" } }}
                      error={
                        !!(formik.touched.industry && formik.errors.industry)
                      }
                      fullWidth
                      label={t("Industry")}
                      name="industry"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      select
                      disabled
                      value={formik.values.industry}
                      required
                    >
                      {industryOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextFieldWrapper>
                  </Box>
                  <Box sx={{ mt: 3 }}>
                    <BusinessTypeMultiSelect
                      disabled={id != null && !canEdit}
                      error={
                        formik?.touched?.businessTypeRef &&
                        formik.errors.businessTypeRef
                      }
                      selectedIds={formik?.values?.businessTypeRef}
                      required
                      id={"business-multi-select"}
                      onChange={(option: any) => {
                        if (option?.length > 0) {
                          const ids = option?.map((option: any) => {
                            return option._id;
                          });

                          const names = option?.map((option: any) => {
                            return option.name.en;
                          });

                          formik.setFieldValue("businessTypeRef", ids);
                          formik.setFieldValue("businessType", names);
                        } else {
                          formik.setFieldValue("businessTypeRef", []);
                          formik.setFieldValue("businessType", []);
                        }
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      mt: 3,
                      display: "flex",
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ flex: 0.9, pr: 1 }}>
                      <Box>
                        <TextFieldWrapper
                          disabled={id != null && !canEdit}
                          autoComplete="off"
                          inputProps={{
                            style: { textTransform: "capitalize" },
                          }}
                          fullWidth
                          label={t("Product Name (English)")}
                          name="productNameEn"
                          error={Boolean(
                            formik.touched.productNameEn &&
                              formik.errors.productNameEn
                          )}
                          helperText={
                            (formik.touched.productNameEn &&
                              formik.errors.productNameEn) as any
                          }
                          onBlur={formik.handleBlur}
                          onChange={(e) => {
                            formik.handleChange(e);
                          }}
                          required
                          value={formik.values.productNameEn}
                        />
                      </Box>
                      <Box sx={{ mt: 3 }}>
                        <TextFieldWrapper
                          disabled={id != null && !canEdit}
                          autoComplete="off"
                          inputProps={{
                            style: { textTransform: "capitalize" },
                          }}
                          fullWidth
                          label={t("Product Name (Arabic)")}
                          name="productNameAr"
                          error={Boolean(
                            formik.touched.productNameAr &&
                              formik.errors.productNameAr
                          )}
                          helperText={
                            (formik.touched.productNameAr &&
                              formik.errors.productNameAr) as any
                          }
                          onBlur={formik.handleBlur}
                          onChange={(e) => {
                            formik.handleChange(e);
                          }}
                          required
                          value={formik.values.productNameAr}
                        />
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flex: 0.2,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ProductDropzone
                        disabled={id != null && !canEdit}
                        accept={{
                          "image/*": [],
                        }}
                        // caption="(SVG, JPG, PNG, or gif)"
                        files={formik.values.productImageFile}
                        imageName={getUploadedDocName(
                          formik?.values?.productImageUrl
                        )}
                        uploadedImageUrl={formik.values.productImageUrl}
                        onDrop={productImageFileDrop}
                        onUpload={handleUpload}
                        onRemove={productImageFileRemove}
                        onRemoveAll={productImageFileRemoveAll}
                        // maxFiles={1}
                        maxSize={999999}
                        isUploaded={isUploaded}
                        setIsUploaded={setIsUploaded}
                        isUploading={isUploading}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <TextFieldWrapper
                      disabled={id != null && !canEdit}
                      autoComplete="off"
                      inputProps={{ style: { textTransform: "capitalize" } }}
                      label={t("Description")}
                      name="productDescription"
                      multiline
                      rows={4}
                      fullWidth
                      onChange={formik.handleChange("productDescription")}
                      value={formik.values.productDescription}
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
                      disabled={id != null && !canEdit}
                      required
                      error={formik?.touched?.brands && formik.errors.brands}
                      onChange={(id, name) => {
                        formik.handleChange("brandRef")(id || "");
                        formik.handleChange("brands")(name || "");
                      }}
                      selectedId={formik?.values?.brandRef}
                      label={t("Brands")}
                      id="Brands"
                    />
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <GlobalCategoriesDropdown
                      disabled={id != null && !canEdit}
                      required
                      error={
                        formik?.touched?.globalCategories &&
                        formik?.errors?.globalCategories
                      }
                      onChange={(id, name) => {
                        formik.handleChange("globalCategoriesRef")(id || "");
                        formik.handleChange("globalCategories")(name || "");
                      }}
                      selectedId={formik?.values?.globalCategoriesRef}
                      label={t("Global Categories")}
                      id="globalCategories"
                    />
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <TaxDropdown
                      disabled={id != null && !canEdit}
                      required
                      error={formik?.touched?.taxRef && formik?.errors?.taxRef}
                      onChange={(id, name) => {
                        if (id && name >= 0) {
                          formik.handleChange("taxRef")(id || "");
                          formik.setFieldValue("tax", name || 0);
                        }
                      }}
                      selectedId={formik?.values?.taxRef}
                      label={t("VAT")}
                      id="tax"
                    />
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
                      {t("Batching")}
                    </Typography>

                    <Box sx={{ p: 1, display: "flex", alignItems: "center" }}>
                      <Switch
                        color="primary"
                        edge="end"
                        name="enabledBatching"
                        disabled={id != null}
                        checked={formik.values.enabledBatching}
                        onChange={(e) => {
                          if (!canUseBatching) {
                            return toast.error(t("You don't have access"));
                          }
                          toast(
                            `${t("Once product is created can't update this")}`
                          );
                          formik.handleChange(e);
                          setIsSwitchEnabled(e.target.checked);

                          if (!e.target.checked) {
                            formik.setFieldValue("expiry", null);
                          }
                          localStorage.setItem("isChangeinProduct", "true");
                        }}
                        sx={{
                          mr: 0.2,
                        }}
                      />

                      <Tooltip
                        title={t("Once product is created can't update this")}
                      >
                        <SvgIcon color="action">
                          <InfoCircleIcon />
                        </SvgIcon>
                      </Tooltip>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Grid container spacing={1}>
            <Grid item md={3} xs={5}>
              <Card
                sx={{
                  alignItems: "center",
                  cursor: "pointer",
                  display: "flex",
                  p: 0,
                  backgroundColor:
                    selectedVariantOption === "singleVariant"
                      ? "primary.alpha12"
                      : "transparent",
                  boxShadow:
                    selectedVariantOption === "singleVariant"
                      ? (theme) => `${theme.palette.primary.main} 0 0 0 1px`
                      : "none",
                }}
                onClick={() => handleCardClick("singleVariant")}
                variant="outlined"
              >
                <Stack
                  direction="row"
                  sx={{ alignItems: "center" }}
                  spacing={2}
                >
                  <Radio
                    color="primary"
                    checked={selectedVariantOption === "singleVariant"}
                  />
                  <div>
                    <Typography variant="subtitle1">
                      {t("Single Variant")}
                    </Typography>
                  </div>
                </Stack>
              </Card>
            </Grid>
            <Grid item md={3} xs={5}>
              <Card
                sx={{
                  alignItems: "center",
                  cursor: "pointer",
                  display: "flex",
                  p: 0,
                  backgroundColor:
                    selectedVariantOption === "multipleVariant"
                      ? "primary.alpha12"
                      : "transparent",
                  boxShadow:
                    selectedVariantOption === "multipleVariant"
                      ? (theme) => `${theme.palette.primary.main} 0 0 0 1px`
                      : "none",
                }}
                onClick={() => handleCardClick("multipleVariant")}
                variant="outlined"
              >
                <Stack
                  direction="row"
                  sx={{ alignItems: "center" }}
                  spacing={2}
                >
                  <Radio
                    color="primary"
                    checked={selectedVariantOption === "multipleVariant"}
                  />
                  <div>
                    <Typography variant="subtitle1">
                      {t("Multiple Variant")}
                    </Typography>
                  </div>
                </Stack>
              </Card>
            </Grid>
          </Grid>

          {selectedVariantOption === "singleVariant" && (
            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item md={4} xs={12}>
                    <Typography variant="h6">{t("Variant Details")}</Typography>
                  </Grid>
                  <Grid item md={8} xs={12}>
                    <Box
                      sx={{
                        mt: -1,
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        onClick={() => {
                          setVariantIndex(0);
                          setOpenVariantModal(true);
                          setCreateNew(false);
                        }}
                      >
                        {t("Boxes/Packs")}
                      </Button>
                    </Box>
                    <Box sx={{ mt: 3 }}>
                      <TextFieldWrapper
                        inputProps={{ style: { textTransform: "capitalize" } }}
                        autoComplete="off"
                        fullWidth
                        label={t("SKU")}
                        disabled={
                          entity?.variants?.[0]?.sku ===
                          formik.values.singleVsku
                        }
                        name="sku"
                        error={Boolean(
                          formik.touched.singleVsku && formik.errors.singleVsku
                        )}
                        helperText={
                          (formik.touched.singleVsku &&
                            formik.errors.singleVsku) as any
                        }
                        onBlur={formik.handleBlur}
                        onChange={(e) => {
                          const value = e.target.value;
                          const newValue = value;

                          formik.setValues({
                            ...formik.values,
                            variants: [
                              {
                                ...formik.values.variants[0],
                                sku: newValue,
                              },
                              ...formik.values.variants.slice(1),
                            ],
                            singleVsku: newValue,
                          });
                        }}
                        onKeyPress={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                          }
                        }}
                        required
                        value={formik.values.singleVsku}
                      />
                      {!formik.values.variants[0]?.sku &&
                        !id &&
                        !generateSkuHide && (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              mt: 1,
                            }}
                          >
                            <Button
                              onClick={() => {
                                generateUniqueSku();
                              }}
                            >
                              {t("Generate SKU")}
                            </Button>
                          </Box>
                        )}
                    </Box>
                    <Box sx={{ mt: 3 }}>
                      <TextFieldWrapper
                        inputProps={{ style: { textTransform: "capitalize" } }}
                        autoComplete="off"
                        value={formik.values?.variants[0]?.unit || "perItem"}
                        fullWidth
                        error={
                          !!(
                            formik.touched.singleVunit &&
                            formik.errors.singleVunit
                          )
                        }
                        helperText={
                          (formik.touched.singleVunit &&
                            formik.errors.singleVunit) as any
                        }
                        label={t("Unit")}
                        name="unit"
                        onBlur={formik.handleBlur}
                        onChange={(e) => {
                          const selectedUnit = e.target.value;

                          formik.setValues({
                            ...formik.values,
                            variants: [
                              {
                                ...formik.values.variants[0],
                                unit: selectedUnit,
                              },
                              ...formik.values.variants.slice(1),
                            ],
                          });
                        }}
                        select
                        required
                      >
                        {units.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextFieldWrapper>
                    </Box>
                    <Box sx={{ mt: 3 }}>
                      <TextFieldWrapper
                        fullWidth
                        label={t("Cost Price")}
                        name="singleVcostPrice"
                        onBlur={formik.handleBlur}
                        onWheel={(event: any) => {
                          event.preventDefault();
                          event.target.blur();
                        }}
                        error={
                          (formik?.touched?.singleVcostPrice &&
                            formik.errors.singleVcostPrice) as any
                        }
                        helperText={
                          (formik.touched.singleVcostPrice &&
                            formik.errors.singleVcostPrice) as any
                        }
                        onKeyPress={(event): void => {
                          const ascii = event.charCode;
                          const value = (event.target as HTMLInputElement)
                            .value;
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
                          } else if (
                            (ascii < 48 || ascii > 57) &&
                            ascii !== 46
                          ) {
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

                          endAdornment: formik?.values?.variants[0]
                            ?.oldCostPrice && (
                            <Typography sx={{ mr: 1 }}>
                              {getCostPriceStrike()}
                            </Typography>
                          ),
                        }}
                        onChange={(e) => {
                          const value = e.target.value;
                          // const newValue = value ? parseFloat(value) : "";

                          formik.setValues({
                            ...formik.values,
                            variants: [
                              {
                                ...formik.values.variants[0],
                                costPrice: value,
                                oldCostPrice: formik.values.singleVOldCostPrice,
                              },
                              ...formik.values.variants.slice(1),
                            ],
                          });
                          formik.setFieldValue("pushNotify", true);
                          localStorage.setItem("isChangeinProduct", "true");
                        }}
                        value={formik.values.variants[0]?.costPrice}
                      />

                      <Typography
                        variant="body2"
                        color={"#ff9100"}
                        sx={{ mt: 2 }}
                      >
                        {Number(formik.values.variants[0]?.costPrice) > 9999.99
                          ? `${t("Amount exceeds 4 digits")}`
                          : ""}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 3 }}>
                      <TextField
                        fullWidth
                        label={t("Selling Price")}
                        name="singleVdefaultPrice"
                        onBlur={formik.handleBlur}
                        onWheel={(event: any) => {
                          event.preventDefault();
                          event.target.blur();
                        }}
                        error={
                          (formik?.touched?.singleVdefaultPrice &&
                            formik.errors.singleVdefaultPrice) as any
                        }
                        helperText={
                          (formik.touched.singleVdefaultPrice &&
                            formik.errors.singleVdefaultPrice) as any
                        }
                        onKeyPress={(event): void => {
                          const ascii = event.charCode;
                          const value = (event.target as HTMLInputElement)
                            .value;
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
                          } else if (
                            (ascii < 48 || ascii > 57) &&
                            ascii !== 46
                          ) {
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
                          endAdornment: formik?.values?.variants[0]
                            ?.oldPrice && (
                            <Typography sx={{ mr: 1 }}>
                              {getPriceStrike()}
                            </Typography>
                          ),
                        }}
                        onChange={(e) => {
                          const value = e.target.value;
                          // const newValue = value ? parseFloat(value) : "";

                          formik.setValues({
                            ...formik.values,
                            variants: [
                              {
                                ...formik.values.variants[0],
                                price: value,
                                oldPrice: formik.values.singleVOldDefaultPrice,
                              },
                              ...formik.values.variants.slice(1),
                            ],
                          });
                          formik.setFieldValue("pushNotify", true);
                          localStorage.setItem("isChangeinProduct", "true");
                        }}
                        value={formik.values.variants[0]?.price}
                      />

                      <Typography
                        variant="body2"
                        color={"#ff9100"}
                        sx={{ mt: 2 }}
                      >
                        {Number(formik.values.variants[0]?.price) > 9999.99
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
                        {t("Non Saleable Product")}
                      </Typography>

                      <Box sx={{ p: 1, display: "flex", alignItems: "center" }}>
                        <Switch
                          color="primary"
                          edge="end"
                          name="singleVNonSaleable"
                          checked={formik.values.variants[0]?.nonSaleable}
                          onChange={(e) => {
                            if (formik.values.variants[0]?.nonSaleable) {
                              toast(`${t("Product set as saleable")}`);
                            } else {
                              toast(`${t("Product set as non-saleable")}`);
                            }

                            formik.setValues({
                              ...formik.values,
                              variants: [
                                {
                                  ...formik.values.variants[0],
                                  nonSaleable: e.target.checked,
                                },
                                ...formik.values.variants.slice(1),
                              ],
                              singleVNonSaleable: e.target.checked,
                            });
                          }}
                          value={formik.values.variants[0]?.nonSaleable}
                          sx={{
                            mr: 0.2,
                          }}
                        />

                        <Tooltip
                          title={t(
                            "You can change this non-saleable status of this variant when you update this"
                          )}
                        >
                          <SvgIcon color="action">
                            <InfoCircleIcon />
                          </SvgIcon>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 3 }}>
                      <TextField
                        fullWidth
                        label={t("Margin")}
                        disabled
                        value={showMargin()}
                        onChange={formik.handleChange}
                      />
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
                        {t("Status")}
                      </Typography>

                      <Box sx={{ p: 1, display: "flex", alignItems: "center" }}>
                        <Switch
                          color="primary"
                          edge="end"
                          name="singleVStatus"
                          checked={formik.values.singleVStatus}
                          onChange={(e) => {
                            formik.handleChange(e);

                            localStorage.setItem("isChangeinProduct", "true");
                          }}
                          sx={{
                            mr: 0.2,
                          }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {selectedVariantOption === "multipleVariant" && (
            <Card sx={{ my: 4 }}>
              <CardContent>
                <Grid container>
                  <Grid sm={8} xs={6}>
                    <Stack spacing={1}>
                      <Typography variant="h6">{t("Add Variants")}</Typography>
                      <Typography color="text.secondary" variant="body2">
                        {t("You can add upto 10 variants here")}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid sm={4} xs={6}>
                    <Stack
                      alignItems="center"
                      justifyContent="flex-end"
                      direction="row"
                      spacing={3}
                    >
                      <Button
                        onClick={() => {
                          if (id != null && !canEdit) {
                            return toast.error(t("You don't have access"));
                          }
                          if (
                            formik?.values?.variants?.length >= 0 &&
                            formik?.values?.variants?.length < 10
                          ) {
                            setVariantIndex(-1);
                            setOpenVariantModal(true);
                            setCreateNew(true);
                            return;
                          }
                          setOpenVariantModal(false);
                          toast.error(t("You can't add more than 10 variants"));
                        }}
                        startIcon={
                          <SvgIcon>
                            <PlusIcon />
                          </SvgIcon>
                        }
                        variant="outlined"
                      >
                        {t("Create New Variant")}
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>

              <Divider />
              <Divider />

              <Card style={{ borderRadius: 0 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("Variant Name")}</TableCell>
                      <TableCell>{t("SKU")}</TableCell>
                      <TableCell>{t("Unit")}</TableCell>
                      <TableCell>{t("Cost Price")}</TableCell>
                      <TableCell>{t("Price")}</TableCell>
                      <TableCell>{t("Status")}</TableCell>
                      <TableCell
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          pr: 5.5,
                        }}
                      >
                        {t("Action")}
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <DragDropContext onDragEnd={handleDragEnd}>
                    <VariantLists
                      batching={formik.values.enabledBatching}
                      variants={formik?.values?.variants}
                      handleEdit={(index: number) => {
                        if (id != null && !canEdit) {
                          return toast.error("You don't have access");
                        }
                        setVariantIndex(index);
                        setOpenVariantModal(true);
                        setCreateNew(false);
                      }}
                      handleDelete={(index: number) => {
                        if (id != null && !canEdit) {
                          return toast.error("You don't have access");
                        }
                        const selectedVariant = formik.values.variants[index];
                        const parentSkuToRemove = selectedVariant?.sku;
                        const updatedBoxes = formik.values.boxes.filter(
                          (box: any) => box.parentSku !== parentSkuToRemove
                        );

                        formik.values.variants?.splice(index, 1);
                        formik.setFieldValue("boxes", updatedBoxes);
                        formik?.setFieldValue(
                          "variants",
                          formik.values.variants
                        );
                        if (formik.values.variants.length === 0) {
                          formik?.setFieldValue("singleVsku", "");
                        }
                      }}
                      handleStatusChange={(id: number, val: boolean) => {
                        let data: any = {
                          ...formik.values.variants[id],
                          status: val ? "active" : "inactive",
                        };

                        if (id != null && !canEdit) {
                          return toast.error("You don't have access");
                        }
                        formik.values.variants?.splice(id, 1, data);
                        formik.setFieldValue(
                          "variants",
                          formik.values.variants
                        );
                        if (formik.values.variants.length === 0) {
                          formik?.setFieldValue("status", "");
                        }
                      }}
                    />
                  </DragDropContext>
                </Table>
              </Card>
            </Card>
          )}

          <VariantModal
            productData={{
              existingSKU,
              activeTab:
                createNew || selectedVariantOption === "multipleVariant"
                  ? "details"
                  : "details",
              productNameEn: formik.values.productNameEn,
              productNameAr: formik.values.productNameAr,
              enabledBatching: formik.values.enabledBatching,
              hasMultipleVariants: selectedVariantOption === "multipleVariant",
            }}
            multipleVariantsHandleSubmit={(data: any, pushNotify: boolean) => {
              formik.setFieldValue("pushNotify", pushNotify);
              handleSaveVariants(data);
            }}
            handleBoxesSubmit={(boxes: any) => {
              formik.setFieldValue("boxes", [...boxes]);
            }}
            pushNotify={formik.values.pushNotify}
            modalData={formik.values.variants[variantIndex]}
            modalDataBoxes={formik.values.boxes}
            open={openVariantModal}
            createNew={createNew}
            handleClose={() => setOpenVariantModal(false)}
          />

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
            <Button
              color="inherit"
              component={RouterLink}
              href={tijarahPaths?.platform?.globalProducts?.index}
            >
              {t("Cancel")}
            </Button>

            <LoadingButton
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                setShowError(true);

                //  edit
                if (id != null && !canEdit) {
                  return toast.error(t("You don't have access"));
                } else if (!id && !canCreate) {
                  return toast.error(t("You don't have access"));
                } else if (
                  formik.values.variants?.length == 0 ||
                  formik.values.singleVsku === ""
                ) {
                  toast.error(t("Please fill required information"));
                  return;
                }

                if (formik.values.pushNotify) {
                  setShowDirtyDialogEvent(true);
                } else {
                  formik.setFieldValue("pushed", false);
                  formik.setFieldValue("notify", false);
                  formik.handleSubmit();
                }
              }}
              loading={formik.isSubmitting}
              sx={{ m: 1 }}
              variant="contained"
            >
              {type === "updated-product"
                ? t("Import Product")
                : id != null
                ? t("Update")
                : t("Create")}
            </LoadingButton>
          </Stack>
        </Stack>

        <ConfirmationDialog
          show={showDialogEvent}
          toggle={() => setShowDialogEvent(!showDialogEvent)}
          onOk={handleConfirmation}
          okButtonText={`${t("Yes")}`}
          cancelButtonText={t("Cancel")}
          title={t("Confirmation")}
          text={t(
            `Once you change the variant type, it will retain only the default variant and clear all the rest`
          )}
        />

        <ConfirmationDialog
          show={showDirtyDialogEvent}
          ischangedProduct={ischangedProduct}
          toggle={() => setShowDirtyDialogEvent(!showDirtyDialogEvent)}
          onOk={handleDirtyConfirmation}
          onDiscard={handleDirtyConfirmationDiscard}
          okButtonText={`${t("Yes")}`}
          cancelButtonText={t("No")}
          title={t("Confirmation")}
          text={t(`Do you want to notify existing merchant`)}
        />

        {showSuccessModal && (
          <ProductUpdateModalComponent
            open={showSuccessModal}
            handleClose={() => {
              setShowSuccessModal(false);
            }}
            onViewList={() => {
              router.back();
            }}
            formik={formik}
            hasId={id ? true : false}
          />
        )}

        <ImageCropModal
          open={openCropModal}
          handleClose={() => {
            setOpenCropModal(false);
            setImgSrc(null);
          }}
          handleCroppedImage={handleCroppedImage}
          imgSrcUrl={imgSrc}
          fileUploadNameSpace={FileUploadNamespace["product-images"]}
        />
      </form>
    </>
  );
};
