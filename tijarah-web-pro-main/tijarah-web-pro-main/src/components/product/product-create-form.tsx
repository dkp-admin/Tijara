import DeleteOutlineTwoToneIcon from "@mui/icons-material/DeleteOutlineTwoTone";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { LoadingButton } from "@mui/lab";
import {
  Autocomplete,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Link,
  MenuItem,
  Radio,
  Stack,
  SvgIcon,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import Edit02Icon from "@untitled-ui/icons-react/build/esm/Edit02";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import endpoint from "src/api/endpoints";
import serviceCaller from "src/api/serviceCaller";
import useWarnIfUnsavedChanges from "src/hooks/check-if-changed";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import i18n from "src/i18n";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { Sort } from "src/types/sortoption";
import {
  ChannelsForOthers,
  ChannelsForRestaurant,
  ChannelsName,
  Items,
  Preferrence,
  USER_TYPES,
  sortOptions,
  unitOptions,
  unitOptionsRestaurant,
} from "src/utils/constants";
import { getUploadedDocName } from "src/utils/get-uploaded-file-name";
import { Screens } from "src/utils/screens-names";
import upload, { FileUploadNamespace } from "src/utils/uploadToS3";
import useActiveTabs from "src/utils/use-active-tabs";
import { useCurrency } from "src/utils/useCurrency";
import * as Yup from "yup";
import ConfirmationDialog from "../confirmation-dialog";
import BrandDropdown from "../input/brand-auto-complete";
import CategoryDropdown from "../input/category-auto-complete";
import ChannelMultiSelect from "../input/channel-multiSelect";
import CollectionMultiSelect from "../input/collection-multiSelect";
import PreferrrenceMultiSelect from "../input/dietary-preferrence";
import ItemsMultiSelect from "../input/items-multiSelect";
import KitchenMultiSelect from "../input/kitchen-multi-select";
import TaxDropdown from "../input/tax-auto-complete";
import { HistoryModal } from "../modals/history-modal";
import { ImageCropModal } from "../modals/image-crop-modal";
import { VariantModalMultipleVariant } from "../modals/multi-variant-modal";
import { CategoryCreateModal } from "../modals/quick-create/category-create-modal";
import { CollectionCreateModal } from "../modals/quick-create/collection-create-modal";
import { VariantModal } from "../modals/variants-modal";
import { ProductDropzone } from "../product-dropzone";
import { Scrollbar } from "../scrollbar";
import TextFieldWrapper from "../text-field-wrapper";
import NoDataAnimation from "../widgets/animations/NoDataAnimation";
import { AddModifierModal } from "./add-modifier-modal";
import EditModifiersModal from "./edit-modifier-modal";
import { SuccessModalComponent } from "./product-sucess-modal";
import { VariantLists } from "./variant-list";
import { GlbFileDropZone } from "../glb-dropzone";

const ProductContainOptions = [
  {
    label: i18n.t("Veg"),
    value: "veg",
  },
  {
    label: i18n.t("Egg"),
    value: "egg",
  },
  {
    label: i18n.t("Non-veg"),
    value: "non-veg",
  },
];

interface CreateProductProps {
  id: string;
  companyRef?: string;
  companyName?: string;
  industry?: string;
  origin?: string;
  isSaptco?: boolean;
}

interface CreateProduct {
  kitchenRefs: string[];
  kitchens: any[];
  selfOrdering: boolean;
  onlineOrdering: boolean;
  assignedToAllChannels: boolean;
  assignedToAllItems: boolean;
  assignedToAllPreferrence: boolean;
  assignedToAllCategories: boolean;
  productContains?: string;
  calorieCount?: string;
  dietaryPreferrenceRefs?: string[];
  dietaryPreferrence?: string[];
  itemRefs?: string[];
  items?: string[];
  categoryRefs?: string[];
  categories?: string[];
  reportingCategory?: string;
  reportingCategoryRef?: string;
  bestSeller?: boolean;
  channelRefs?: string[];
  channels?: string[];
  modifiers?: string[];
  kitchenFacingNameEn?: string;
  kitchenFacingNameAr?: string;
  kitchenRoutingCategory?: string;
  productImageFile?: any[];
  productImageUrl?: string;
  productNameEn: string;
  productNameAr?: string;
  productDescription?: string;
  brandRef: string;
  brands?: string;
  taxRef: string;
  tax: number;
  expiry: Date;
  enabledBatching: boolean;
  variants: any[];
  singleVariantStocks: any[];
  boxes: any[];
  actions: any[];
  init: boolean;
  prices: any[];
  singleVariantPrices: any[];
  singleVsku: string;
  singleVCode: string;
  singleVunit: string;
  singleVtype: string;
  singleVdefaultPrice: string;
  singleVcostPrice: string;
  singleVOldDefaultPrice: string;
  singleVOldCostPrice: string;
  singleVNonSaleable: boolean;
  singleVStatus: boolean;
  collectionRefs: string[];
  collections: string[];
  status: boolean;
  isRestaurant: boolean;
  currency: string;
  glbFileUrl?: string;
  glbFile?: any[];
}

const newVariant = {
  assignedToAll: true,
  locations: [] as string[],
  locationRefs: [] as string[],
  image: "",
  name: {
    en: "regular",
    ar: "regular.ar",
  },
  type: "item",
  sku: "",
  code: "",
  unit: "perItem",
  unitCount: 1,
  costPrice: "",
  price: "",
  status: "active",
  nonSaleable: false,
  prices: [] as any,
  stockConfiguration: [] as any,
};

export const ProductCreateForm: FC<CreateProductProps> = (props) => {
  useWarnIfUnsavedChanges("Product");

  const { t } = useTranslation();
  const theme = useTheme();
  const { userType } = useUserType();
  const { user } = useAuth();
  const { canAccessModule } = useFeatureModuleManager();

  const { id, companyRef, companyName, origin, industry, isSaptco } = props;

  console.log(id, "ID FROM PRODUCT");

  const router = useRouter();
  const [channels, setChannels] = useState<any[]>([]);
  const [modifierData, setModifierData] = useState({});
  const [showDialogDeleteItem, setShowDialogDeleteItem] = useState(false);
  const [page, setPage] = useState<number>(0);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);

  const { findOne: findOrderTypes, entity: orderTypeListData } = useEntity(
    "company/order-types"
  );

  const breadcrumbs = [
    <Link
      underline="hover"
      key="1"
      color="inherit"
      onClick={() => {
        router.push({
          pathname: tijarahPaths.dashboard.salesDashboard,
        });
      }}
    >
      <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
    </Link>,
    <Link
      underline="hover"
      key="2"
      color="inherit"
      onClick={() => {
        if (origin == "company") {
          changeTab("catalogue", Screens?.companyDetail);
        }
        if (localStorage.getItem("isChangeinProduct") === "true") {
          setShowDirtyDialogEvent(true);
          setIschangedProduct(true);
        } else {
          router.back();
        }
      }}
    >
      {t("Products")}
    </Link>,
    <Link underline="hover" key="2" color="inherit" href="#">
      {id != null ? t("Edit Products") : t("Create Products")}
    </Link>,
  ];

  const queryClient = useQueryClient();
  const [tabIndex, setTabIndex] = useState(0);
  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["product:update"]);
  const [selectedVariantOption, setSelectedVariantOption] =
    useState("singleVariant");
  const canCreate = canAccess(MoleculeType["product:create"]);

  const canUseBatching = canAccess(MoleculeType["product:batching"]);

  usePageView();
  const { changeTab, getTab } = useActiveTabs();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [responseId, setResponseId] = useState("");

  const { find: findLocation, entities: locations } = useEntity("location");

  const { findOne, create, updateEntity, deleteEntity, entity, loading } =
    useEntity("product");
  const { create: batchcreate } = useEntity("stock-history");
  const { find: findRelation, entities: relations } = useEntity(
    "boxes-crates/product"
  );
  const newdd: any = relations;
  const lng = localStorage.getItem("currentLanguage");
  const { create: collectionAssign } = useEntity("collection/assign");
  const currency = useCurrency();

  const { findOne: company, entity: companyEntity } = useEntity("company");
  const [openCategoryCreateModal, setOpenCategoryCreateModal] = useState(false);
  const [openCollectionCreateModal, setOpenCollectionCreateModal] =
    useState(false);
  const [openModifiersModal, setOpenModifiersModal] = useState(false);
  const [openModifiersEditModal, setOpenModifiersEditModal] = useState(false);
  const [pendingVariantOption, setPendingVariantOption] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [variantIndex, setVariantIndex] = useState(-1);
  const [modifierIndex, setModifierIndex] = useState(-1);
  const [openVariantModal, setOpenVariantModal] = useState(false);
  const [openVariantModalMulti, setOpenVariantModalMulti] = useState(false);
  const [editStock, setEditStock] = useState(false);
  const [createNew, setCreateNew] = useState(false);
  const [isSwitchEnabled, setIsSwitchEnabled] = useState(false);
  const [showDialogEvent, setShowDialogEvent] = useState(false);
  const [showDirtyDialogEvent, setShowDirtyDialogEvent] = useState(false);
  const [ischangedProduct, setIschangedProduct] = useState(false);
  const [generateApi, setGenerateApi] = useState(true);
  const [generateSkuHide, setGenerateSkuHide] = useState(false);
  const [existingSKU, setExistingSKU] = useState([]);
  const [updateProduct, setUpdateProduct] = useState(false);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const [tabToOpen, setTabToOpen] = useState("");
  const [glbUploading, setGlbUploading] = useState(false);
  const units =
    user?.company?.industry === "restaurant"
      ? unitOptionsRestaurant
      : unitOptions;
  const [imgSrc, setImgSrc] = useState("");
  const [openCropModal, setOpenCropModal] = useState(false);

  const handleDragEnd = (e: any) => {
    if (!e.destination) return;
    let tempData = Array.from(formik?.values?.variants);
    let [source_data] = tempData.splice(e.source.index, 1);
    tempData.splice(e.destination.index, 0, source_data);

    formik.setFieldValue("variants", tempData);
  };

  const initialValues: CreateProduct = {
    kitchenRefs: [],
    kitchens: [],
    selfOrdering: true,
    onlineOrdering: true,
    assignedToAllChannels: false,
    assignedToAllItems: false,
    assignedToAllPreferrence: false,
    assignedToAllCategories: false,
    productContains: "",
    calorieCount: "",
    dietaryPreferrenceRefs: [],
    dietaryPreferrence: [],
    collections: [],
    collectionRefs: [],
    itemRefs: [],
    items: [],
    categoryRefs: [],
    categories: [],
    reportingCategory: "",
    reportingCategoryRef: "",
    bestSeller: false,
    channelRefs: [],
    channels: [],
    modifiers: [],
    kitchenFacingNameEn: "",
    kitchenFacingNameAr: "",
    kitchenRoutingCategory: "",
    productImageFile: [],
    productImageUrl: "",
    productNameEn: "",
    productNameAr: "",
    productDescription: "",
    brandRef: "",
    expiry: null,
    brands: "",
    taxRef: "",
    tax: null,
    enabledBatching: false,
    variants: [],
    singleVariantStocks: [],
    boxes: [],
    actions: [],
    init: false,
    prices: [],
    singleVariantPrices: [],
    singleVsku: "",
    singleVCode: "",
    singleVunit: "",
    singleVtype: "",
    singleVdefaultPrice: "",
    singleVcostPrice: "",
    singleVOldDefaultPrice: "",
    singleVOldCostPrice: "",
    singleVNonSaleable: false,
    singleVStatus: true,
    status: true,
    isRestaurant: false,
    currency: currency,
    glbFileUrl: "",
  };

  const validationSchema = Yup.object({
    productNameEn: Yup.string()
      .required(`${t("Product Name is required")}`)
      .max(60, t("Product name must not be greater than 60 characters")),
    productNameAr: Yup.string()
      .required(`${t("Product Name is required")}`)
      .max(60, t("Product name must not be greater than 60 characters")),
    productContains: Yup.string().when("isRestaurant", {
      is: true,
      then: Yup.string().required(t("Please Select Contains")),
      otherwise: Yup.string().optional(),
    }),
    reportingCategory: Yup.string().required(`${t("Category is required")}`),
    brands: Yup.string().required(`${t("Brands is required")}`),
    taxRef: Yup.string().required(`${t("Tax is required")}`),
    enabledBatching: Yup.boolean(),
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
    singleVCode: Yup.string()
      .matches(
        /^[A-Za-z0-9]+$/,
        t(
          "Special characters and spaces are not allowed. Only alpha-numeric values are allowed."
        )
      )
      .max(30, t("Product Code should be maximum 30 digits"))
      .nullable()
      .optional(),
    channelRefs: Yup.array()
      .required(t("Order Type is required"))
      .min(1, t("Order Type is required")),
  });

  const glbFileDrop = (newFiles: any): void => {
    const sizes: any[] = newFiles?.map((op: any) => op?.size);

    if (sizes.find((o: any) => o > 10485760)) {
      toast.error("File size cannot be greater than 10MB");
      return;
    }
    formik.setFieldValue("glbFile", newFiles);
  };

  const glbFileRemove = (): void => {
    formik.setFieldValue("glbFile", []);
    formik.setFieldValue("glbFileUrl", "");
  };

  const glbFileRemoveAll = (): void => {
    formik.setFieldValue("glbFile", []);
  };

  const handleUploadGlbFile = async (files: any) => {
    setGlbUploading(true);
    try {
      const url = await upload(files, FileUploadNamespace["glb-file"]);
      formik.setFieldValue("glbFileUrl", url);

      setIsUploaded(true);
      setGlbUploading(false);
      toast.success("GLB File Uploaded");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);

      try {
        const data: any = {
          image: values.productImageUrl,
          name: {
            en: values?.productNameEn.trim(),
            ar: values?.productNameAr.trim(),
          },
          kitchenFacingName: {
            en: values.kitchenFacingNameEn,
            ar: values.kitchenFacingNameAr,
          },
          contains: values.productContains,
          bestSeller: values.bestSeller,
          // restaurantCategoryRefs: values.categoryRefs,
          // restaurantCategories: values.categories,
          assignedToAllCategories: values?.assignedToAllCategories,
          collectionRefs: values.collectionRefs,
          collections: values.collections?.map((coll) => {
            return { name: coll };
          }),
          isComposite: false,
          modifiers: values.modifiers.map((data: any) => {
            return {
              modifierRef: data?.modifierRef,
              name: data.name,
              noOfFreeModifier: data?.noOfFreeModifier
                ? data?.noOfFreeModifier
                : 0,
              default: data?.default ? data?.default : null,
              excluded: data?.excluded?.length > 0 ? data?.excluded : null,
              type: data.type,
              min: data.min || 0,
              max: data.max || 1,
              values: data.values,
              status: data.status,
            };
          }),
          nutritionalInformation: {
            calorieCount: values?.calorieCount ? values?.calorieCount : null,
            preference: values.dietaryPreferrenceRefs,
            contains: values.itemRefs,
            assignedToAllPreferrence: values?.assignedToAllPreferrence,
            assignedToAllItems: values?.assignedToAllItems,
          },
          collection: {
            collectionRefs: values.collectionRefs,
            collections: values.collections,
          },

          description: values?.productDescription,
          companyRef: companyRef,
          company: {
            name: companyName,
          },
          brandRef: values?.brandRef,
          brand: {
            name: values?.brands,
          },
          categoryRef: values?.reportingCategoryRef,
          category: {
            name: values.reportingCategory,
          },
          channel: values.channelRefs,
          taxRef: values?.taxRef,
          tax: {
            percentage: values?.tax,
          },
          selfOrdering: values.selfOrdering,
          onlineOrdering: values.onlineOrdering,
          batching: values?.enabledBatching,
          expiry: expiryDate,
          isLooseItem: false,
          ...(values.actions.length == 0 ? { updatedBy: "ADMIN" } : {}),
          variants: values?.variants?.map((variant: any) => {
            return {
              assignedToAll: variant.assignedToAll,
              locations:
                selectedVariantOption === "singleVariant" && id == null
                  ? variant?.locationRefs?.length > 0
                    ? variant.locations
                    : locations.results?.map((loc) => {
                        return { name: loc.name.en };
                      })
                  : variant.locations,
              locationRefs:
                selectedVariantOption === "singleVariant" && id == null
                  ? variant?.locationRefs?.length > 0
                    ? variant.locationRefs
                    : locations.results?.map((loc) => {
                        return loc._id;
                      })
                  : variant.locationRefs,
              image: variant.image,
              name: {
                en: variant.name.en.trim(),
                ar: variant.name.ar.trim(),
              },
              type: variant.type,
              sku: variant.sku,
              code: variant?.code || "",
              unit: variant.unit,
              unitCount: 1,
              costPrice: variant.costPrice,
              oldCostPrice: variant.oldCostPrice,
              price: variant.price,
              oldPrice: variant.oldPrice,
              status: variant.status,
              nonSaleable: variant.nonSaleable,
              prices:
                selectedVariantOption === "singleVariant"
                  ? values.singleVariantPrices
                  : variant.prices,
              stockConfiguration:
                selectedVariantOption === "singleVariant" && id == null
                  ? values.singleVariantStocks
                  : variant.stockConfiguration,
            };
          }),
          boxes: values?.boxes?.map((box: any) => {
            return {
              assignedToAll: true,
              locations: [] as any[],
              locationRefs: [] as any[],
              image: "",
              name: box.parentName,
              type: box.type,
              parentSku: box.parentSku,
              parentName: box.parentName,
              sku: box.sku,
              code: box?.code || "",
              unit: box.unit,
              unitCount: box.unitCount,
              costPrice: box.costPrice,
              price: box.price,
              status: box.status,
              nonSaleable: box.nonSaleable,
              prices: box.prices,
              stockConfiguration: [] as any[],
            };
          }) as any,
          status: values.status ? "active" : "inactive",
          currency,
          glbFileUrl: values?.glbFileUrl || "",
        };

        const actiondata = {
          actions: values?.actions?.map((action) => {
            return {
              productRef: action.productRef,
              product: action.product,
              companyRef: action.companyRef,
              company: action.company,
              locationRef: action.locationRef,
              location: action.location,
              categoryRef: values?.reportingCategoryRef,
              category: {
                name: values.reportingCategory,
              },
              variant: action.variant,
              hasMultipleVariants: action.hasMultipleVariants,
              sku: action.sku,
              batching: action.batching,
              action: action.action,
              expiry: action.expiry,
              ...(action.vendorRef ? { vendorRef: action.vendorRef } : {}),
              ...(action.vendorRef ? { vendor: action.vendor } : {}),
              price: Number(action.price),
              count: Number(action.count),
              sourceRef: action.sourceRef,
              destRef: action.destRef,
              available: action.available,
              received: action.received,
              transfer: action.transfer,
              availableSource: action.availableSource,
              receivedSource: action.receivedSource,
              transferSource: action.transferSource,
              previousStockCount: action.previousStockCount,
              currency,
            };
          }),
        };

        if (id != null) {
          await updateEntity(id?.toString(), { ...data });
        } else {
          await create({ ...data });
        }

        if (actiondata.actions.length > 0) {
          Promise.all(
            actiondata.actions.map(async (action) => {
              await batchcreate({ ...action });
              // queryClient.invalidateQueries("find-one-product");
            })
          );
          setUpdateProduct(true);
        }

        // queryClient.invalidateQueries("find-one-product");

        toast.success(
          id != null
            ? `${t(
                "Product  updated successfully, it will take few minutes to reflect on POS, If the POS is online otherwise when the POS comes online it will reflect in the product list"
              )}`
            : `${t(
                "Product  created successfully, it will take few minutes to reflect on POS, If the POS is online otherwise when the POS comes online it will reflect in the product list"
              )}`
        );

        if (origin == "company") {
          changeTab("catalogue", Screens?.companyDetail);
        }

        if (id != null && actiondata.actions.length > 0) {
          formik.resetForm();
          setResponseId(id);
          localStorage.setItem("isChangeinProduct", "false");
          setShowSuccessModal(true);
        } else {
          formik.resetForm();
          localStorage.setItem("isChangeinProduct", "false");
          router.back();
        }
      } catch (err) {
        if (err.message == "sku_exists_message") {
          toast.error(`${"SKU already exists"}`);
        } else {
          toast.error(err.message || err.code);
        }
      }
    },
  });

  usePageView();

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

  const handleDirtyConfirmation = () => {
    localStorage.setItem("isChangeinProduct", "false");
    setShowDirtyDialogEvent(false);
    setIschangedProduct(false);
    formik.handleSubmit();
  };
  const handleDirtyConfirmationDiscard = () => {
    localStorage.setItem("isChangeinProduct", "false");
    setShowDirtyDialogEvent(false);
    setIschangedProduct(false);
    router.back();
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

    const currentVariants = formik.values.variants;
    const updatedVariants = currentVariants.map((variant: any) => {
      if (
        currentVariants.length === 1 ||
        variant.image === formik.values.productImageUrl
      ) {
        return {
          ...variant,
          image: "",
        };
      }
      return variant;
    });

    formik.setFieldValue("variants", updatedVariants);
  };

  const productImageFileRemoveAll = (): void => {
    formik.setFieldValue("productImageFile", []);
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

    const currentVariants = formik.values.variants;
    const updatedVariants = currentVariants.map((variant: any) => {
      if (
        currentVariants.length === 1 ||
        !variant.image ||
        variant.image === formik.values.productImageUrl
      ) {
        return {
          ...variant,
          image: croppedImageUrl,
        };
      }
      return variant;
    });

    formik.setFieldValue("variants", updatedVariants);
  };

  const handleSaveVariants = (variant?: any) => {
    let data: any = formik.values.variants;

    if (variantIndex == -1) {
      data = [...data, { ...variant, _id: data?.length }];
    } else {
      data?.splice(variantIndex, 1, { ...variant, _id: variantIndex });
    }

    formik.setFieldValue("singleVsku", data[0].sku);
    formik.setFieldValue("singleVCode", data[0].code);
    formik.setFieldValue("singleVdefaultPrice", data[0].price);
    formik.setFieldValue("singleVariantPrices", data[0].prices);

    formik?.setFieldValue("variants", data);

    setOpenVariantModal(false);
    setOpenVariantModalMulti(false);
  };

  const handleSaveModifiers = (modifiers?: any) => {
    let data: any = formik.values.modifiers;

    if (modifierIndex == -1) {
      data = [...data, ...modifiers];
    } else {
      data?.splice(modifierIndex, 1, ...modifiers);
    }

    const newData = data.map((d: any) => {
      return {
        modifierRef: d?._id,
        min: 1,
        max: 1,
        noOfFreeModifier: 0,
        ...d,
      };
    });
    formik?.setFieldValue("modifiers", newData);

    setOpenModifiersModal(false);
  };

  const handleEditModifier = (data: any) => {
    const modifiedObj: any = { ...data };

    const newArray = formik.values.modifiers.map((obj: any, index) => {
      if (obj._id === modifiedObj._id) {
        return modifiedObj;
      }

      return obj;
    });

    formik.setFieldValue("modifiers", newArray);
  };

  const handleAddOrRemove = async (options: any, type: string) => {
    const assignCollectionIds = options?.map((option: any) => {
      return option._id;
    });

    const removeCollectionIds =
      type === "remove"
        ? formik.values.collectionRefs?.filter((ref: string) => {
            if (!assignCollectionIds?.includes(ref)) {
              return ref;
            }
          })
        : [];

    try {
      const data = {
        products: [
          { productRef: id, price: formik.values.variants?.[0]?.price },
        ],
        productRefs: [id],
        collectionRefs:
          type === "remove" ? removeCollectionIds : assignCollectionIds,
        type: type,
      };

      await collectionAssign(data);

      if (type === "remove") {
        toast.success(t("Collection Removed"));
      } else {
        toast.success(t("Collection Saved"));
      }
      // queryClient.invalidateQueries("find-one-product");
    } catch (error) {
      toast.error(error.message || error.code);
    }
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

  const handleDeleteItem = async () => {
    try {
      await deleteEntity(id.toString());
      toast.success(`${t("Item Deleted")}`);
      setShowDialogDeleteItem(false);
      router.back();
    } catch (error) {
      toast.error(error.message);
      setShowDialogDeleteItem(false);
    }
  };

  useEffect(() => {
    const margin = showMargin();
  }, [
    formik.values?.variants[0]?.costPrice,
    formik.values?.variants[0]?.price,
  ]);

  useEffect(() => {
    if (formik.values?.variants[0]?.sku === "" && id) {
      setGenerateApi(true);
    }
  }, [formik.values?.variants[0]?.sku]);

  useEffect(() => {
    if (
      JSON.stringify(formik.values?.variants) !==
      JSON.stringify(entity?.variants)
    ) {
      setFormChanged(true);
    } else {
      setFormChanged(false);
    }
  }, [formik.values, entity]);

  useEffect(() => {
    if (id != null) {
      // formik.resetForm();
      findOne(id?.toString());
    }
  }, [id, updateProduct]);
  console.log(formik.values);

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
    if (locations.results?.length > 0 && id == null) {
      const initialStock: any = locations.results.map((location: any) => {
        return {
          availability: true,
          tracking: false,
          lowStockAlert: false,
          count: 0,
          lowStockCount: 0,
          expiry: null as any,
          locationRef: location._id,
          location: { name: location.name.en },
        };
      });
      formik.setFieldValue("singleVariantStocks", initialStock);
    }
  }, [locations.results, selectedVariantOption]);

  useEffect(() => {
    if (locations.results?.length > 0 && !id) {
      const initialPrices = locations.results.map((location) => {
        return {
          price: formik.values.variants[0]?.price || 0,
          costPrice: formik.values.variants[0]?.costPrice || 0,
          locationRef: location._id,
          overriden: false,
          location: {
            name: location.name.en,
          },
        };
      });
      formik.setFieldValue("singleVariantPrices", initialPrices);
    }
  }, [
    locations.results,
    formik.values.variants[0]?.price,
    formik.values.variants[0]?.costPrice,
    selectedVariantOption,
  ]);

  useEffect(() => {
    if (companyRef != null && userType === USER_TYPES.SUPERADMIN) {
      company(companyRef?.toString());
    }
  }, [companyRef]);

  useEffect(() => {
    findLocation({
      page: 0,
      limit: 100,
      _q: "",
      activeTab: "active",
      sort: "asc",
      companyRef: companyRef?.toString(),
    });
  }, [companyRef]);

  // Fetch order types from API
  useEffect(() => {
    const companyRefToUse =
      userType === USER_TYPES.SUPERADMIN ? companyRef : user?.company?._id;
    if (companyRefToUse && companyRefToUse !== "all") {
      findOrderTypes(companyRefToUse);
    }
  }, [companyRef, user?.company?._id, userType]);

  // Map order types API response to options format and set initial values
  useEffect(() => {
    if (orderTypeListData?.orderTypes?.length > 0) {
      const apiChannels = orderTypeListData.orderTypes.map(
        (orderType: any) => ({
          label: orderType.label,
          value: orderType.value,
        })
      );

      setChannels(apiChannels);

      // Set initial channel values for new products
      if (!id) {
        const data = apiChannels.map((channel: any) => channel.value);
        formik.setFieldValue("channelRefs", data);
        formik.setFieldValue("assignedToAllChannels", true);
      }
    }

    if (!id) {
      const taxRef =
        userType === USER_TYPES.SUPERADMIN
          ? companyEntity?.vat?.vatRef
          : user?.company?.vat?.vatRef;
      if (taxRef) {
        formik.setFieldValue("taxRef", taxRef);
      }
      setIsPrefilled(true);
    }
  }, [
    orderTypeListData?.orderTypes,
    companyEntity,
    user?.company,
    id,
    industry,
    userType,
  ]);

  useEffect(() => {
    const skusArray1 = formik.values?.variants.map((item) => item.sku);
    const skusArray2 = formik.values?.boxes.map((item) => item.sku);

    const newArr = [...skusArray1, ...skusArray2];

    setExistingSKU(newArr);
  }, [formik.values?.variants, formik?.values?.boxes]);

  useEffect(() => {
    const handleBeforeUnload = (event: any) => {
      if (localStorage.getItem("isChangeinProduct") === "true") {
        event.preventDefault();
        event.returnValue = "";
        const confirmationMessage =
          "Are you sure you want to leave? Your changes may not be saved.";
        (event || window.event).returnValue = confirmationMessage;

        return confirmationMessage;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (id != null && entity != null && channels.length > 0) {
      formik.setFieldValue(
        "kitchenFacingNameEn",
        entity?.kitchenFacingName?.en
      );
      formik.setFieldValue(
        "kitchenFacingNameAr",
        entity?.kitchenFacingName?.ar
      );
      formik.setFieldValue("kitchens", entity?.kitchens);
      formik.setFieldValue("kitchenRefs", entity.kitchenRefs);
      formik.setFieldValue("productContains", entity.contains);
      formik.setFieldValue("bestSeller", entity.bestSeller);
      formik.setFieldValue(
        "calorieCount",
        entity?.nutritionalInformation?.calorieCount !== null
          ? `${entity?.nutritionalInformation?.calorieCount || ""}`
          : ""
      );
      formik.setFieldValue(
        "assignedToAllPreferrence",
        entity.nutritionalInformation?.preference?.length ===
          Preferrence?.length
      );
      formik.setFieldValue(
        "dietaryPreferrenceRefs",
        entity.nutritionalInformation?.preference
      );
      formik.setFieldValue(
        "assignedToAllItems",
        entity.nutritionalInformation?.contains?.length === Items?.length
      );
      formik.setFieldValue("itemRefs", entity.nutritionalInformation?.contains);
      // formik.setFieldValue("categories", entity.restaurantCategories || []);
      // formik.setFieldValue("categoryRefs", entity.restaurantCategoryRefs || []);
      formik.setFieldValue(
        "assignedToAllCategories",
        entity.assignedToAllCategories
      );
      formik.setFieldValue(
        "assignedToAllChannels",
        entity.channel?.length === channels?.length
      );
      formik.setFieldValue("channelRefs", entity.channel || []);
      formik.setFieldValue("selfOrdering", entity.selfOrdering);
      formik.setFieldValue("onlineOrdering", entity.onlineOrdering);
      formik.setFieldValue("modifiers", entity.modifiers || []);
      formik.setFieldValue("productImageUrl", entity.image || "");
      formik.setFieldValue("productNameEn", entity.name.en);
      formik.setFieldValue("productNameAr", entity.name.ar);
      formik.setFieldValue("productDescription", entity.description);
      formik.setFieldValue("brandRef", entity.brandRef);
      formik.setFieldValue("brands", entity.brand.name);
      formik.setFieldValue("collectionRefs", entity.collectionRefs);
      formik.setFieldValue(
        "collections",
        entity.collections?.map((coll: any) => {
          return coll.name;
        })
      );
      formik.setFieldValue("reportingCategoryRef", entity.categoryRef);
      formik.setFieldValue("currency", entity.currency || "SAR");
      formik.setFieldValue("reportingCategory", entity.category?.name);
      formik.setFieldValue("taxRef", entity.taxRef);
      formik.setFieldValue("tax", entity.tax.percentage);
      formik.setFieldValue("enabledBatching", entity.batching);
      formik.setFieldValue("expiry", entity.expiry as any);
      formik.setFieldValue("variants", entity?.variants || []);
      formik.setFieldValue("status", entity?.status === "active");
      formik.setFieldValue("singleVsku", entity?.variants[0]?.sku || "");
      formik.setFieldValue(
        "singleVariantPrices",
        entity?.variants[0]?.prices || ""
      );
      formik.setFieldValue(
        "singleVCode",
        entity?.variants[0]?.code == "undefined"
          ? ""
          : entity?.variants[0]?.code
      );
      formik.setFieldValue(
        "singleVNonSaleable",
        entity?.variants[0]?.nonSaleable
      );
      formik.setFieldValue("boxes", entity?.boxes || []);
      formik.setFieldValue("init", true);
      formik.setFieldValue(
        "multipleVariant",
        entity?.variants.lenght > 1 ? "multipleVariant" : "singleVariant"
      );
      formik.setFieldValue(
        "singleVariantStocks",
        entity?.variants.stockConfiguration
      );
      formik.setFieldValue(
        "singleVOldCostPrice",
        entity?.variants?.[0]?.costPrice
      );
      formik.setFieldValue(
        "singleVOldDefaultPrice",
        entity?.variants?.[0]?.price
      );
      formik.setFieldValue("glbFileUrl", entity.glbFileUrl || "");
      setSelectedVariantOption(
        entity?.variants.length > 1 ? "multipleVariant" : "singleVariant"
      );
    }
  }, [entity, companyEntity, channels]);

  useEffect(() => {
    formik.setFieldValue("isRestaurant", industry === "restaurant");
  }, [id, industry, companyEntity]);

  useEffect(() => {
    localStorage.setItem("isChangeinProduct", "false");
  }, []);

  useEffect(() => {
    if (id != null) {
      findRelation({
        page: page,
        sort: sort,
        limit: 100,
        productRef: id?.toString(),
        companyRef: companyRef.toString(),
      });
    }
  }, [entity]);

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
      <Stack spacing={4}>
        <Box
          sx={{
            maxWidth: 80,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              width: 300,
              mt: 1,
            }}
          >
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="breadcrumb"
            >
              {breadcrumbs}
            </Breadcrumbs>
          </Stack>
        </Box>

        <Typography variant="h4">
          {id != null ? t("Edit Product") : t("Create Product")}
        </Typography>
      </Stack>

      <form noValidate onSubmit={formik.handleSubmit}>
        <Stack spacing={4} sx={{ mt: 3 }}>
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item md={12} xs={12}>
                  <Typography variant="h6">{t("Basic Details")}</Typography>
                </Grid>
                <Grid item container spacing={3}>
                  <Grid item md={6} xs={12}>
                    <Box>
                      <TextFieldWrapper
                        disabled={id != null && !canUpdate}
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
                          localStorage.setItem("isChangeinProduct", "true");
                        }}
                        required
                        value={formik.values.productNameEn}
                      />
                    </Box>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <Box>
                      <TextFieldWrapper
                        disabled={id != null && !canUpdate}
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
                          localStorage.setItem("isChangeinProduct", "true");
                        }}
                        required
                        value={formik.values.productNameAr}
                      />
                    </Box>
                  </Grid>
                  {industry == "restaurant" && (
                    <Grid item md={6} xs={12} alignItems="center">
                      <Box>
                        <TextFieldWrapper
                          select
                          required
                          fullWidth
                          disabled={id != null && !canUpdate}
                          label={t("Contains")}
                          name="productContains"
                          error={
                            !!(
                              formik.touched.productContains &&
                              formik.errors.productContains
                            )
                          }
                          helperText={
                            (formik.touched.productContains &&
                              formik.errors.productContains) as any
                          }
                          onBlur={formik.handleBlur}
                          onChange={(e) => {
                            formik.handleChange(e);
                            localStorage.setItem("isChangeinProduct", "true");
                          }}
                          value={formik.values.productContains}
                        >
                          {ProductContainOptions?.map((industry) => (
                            <MenuItem
                              key={industry.value}
                              value={industry.value}
                            >
                              {industry.label}
                            </MenuItem>
                          ))}
                        </TextFieldWrapper>
                      </Box>
                    </Grid>
                  )}

                  {id != null &&
                    industry == "restaurant" &&
                    formik.values.kitchenRefs?.length > 0 &&
                    companyEntity?.configuration?.enableKitchenManagment && (
                      <Grid item md={6} xs={12} alignItems="center">
                        <Box>
                          <KitchenMultiSelect
                            disabled={true}
                            id={"kitchens"}
                            label={t("Kitchens")}
                            companyRef={companyRef}
                            selectedIds={formik.values.kitchenRefs}
                            onChange={(option: any) => {
                              if (option?.length > 0) {
                                const ids = option.map((option: any) => {
                                  return option._id;
                                });

                                const names = option.map((option: any) => {
                                  return {
                                    name: option.name.en,
                                    kitchenRef: option._id,
                                  };
                                });

                                formik.setFieldValue("kitchenRefs", ids);
                                formik.setFieldValue("kitchens", names);
                              } else {
                                formik.setFieldValue("kitchenRefs", []);
                                formik.setFieldValue("kitchens", []);
                              }
                            }}
                          />
                        </Box>
                      </Grid>
                    )}

                  {/* {industry == "restaurant" && (
                    <Grid item md={6} xs={12} alignItems="center">
                      <Box>
                        <TextFieldWrapper
                          disabled={id != null && !canUpdate}
                          autoComplete="off"
                          inputProps={{
                            style: { textTransform: "capitalize" },
                          }}
                          fullWidth
                          label={t("Kitchen facing name (English)")}
                          name="kitchenFacingNameEn"
                          error={Boolean(
                            formik.touched.kitchenFacingNameEn &&
                              formik.errors.kitchenFacingNameEn
                          )}
                          helperText={
                            (formik.touched.kitchenFacingNameEn &&
                              formik.errors.kitchenFacingNameEn) as any
                          }
                          onBlur={formik.handleBlur}
                          onChange={(e) => {
                            formik.handleChange(e);
                            localStorage.setItem("isChangeinProduct", "true");
                          }}
                          value={formik.values.kitchenFacingNameEn}
                        />
                      </Box>
                    </Grid>
                  )} */}

                  {/* {industry == "restaurant" && (
                    <Grid item md={6} xs={12}>
                      <Box>
                        <TextFieldWrapper
                          disabled={id != null && !canUpdate}
                          autoComplete="off"
                          inputProps={{
                            style: { textTransform: "capitalize" },
                          }}
                          fullWidth
                          label={t("Kitchen facing name (Arabic)")}
                          name="kitchenFacingNameAr"
                          error={Boolean(
                            formik.touched.kitchenFacingNameAr &&
                              formik.errors.kitchenFacingNameAr
                          )}
                          helperText={
                            (formik.touched.kitchenFacingNameAr &&
                              formik.errors.kitchenFacingNameAr) as any
                          }
                          onBlur={formik.handleBlur}
                          onChange={(e) => {
                            formik.handleChange(e);
                            localStorage.setItem("isChangeinProduct", "true");
                          }}
                          value={formik.values.kitchenFacingNameAr}
                        />
                      </Box>
                    </Grid>
                  )} */}

                  <Grid item md={6} xs={12}>
                    <Typography sx={{ mb: 2 }} variant="h6">
                      {t("Product Image")}
                    </Typography>
                    <Box>
                      <ProductDropzone
                        disabled={id != null && !canUpdate}
                        accept={{
                          "image/*": [],
                        }}
                        files={formik.values.productImageFile}
                        imageName={getUploadedDocName(
                          formik?.values?.productImageUrl
                        )}
                        uploadedImageUrl={formik?.values?.productImageUrl}
                        onDrop={productImageFileDrop}
                        onUpload={handleUpload}
                        onRemove={productImageFileRemove}
                        onRemoveAll={productImageFileRemoveAll}
                        maxSize={999999}
                        isUploaded={isUploaded}
                        setIsUploaded={setIsUploaded}
                        isUploading={isUploading}
                      />
                    </Box>
                  </Grid>

                  <Grid item md={6} xs={12}>
                    <Typography sx={{ mb: 2 }} variant="h6">
                      {t("AR GLB File")}
                    </Typography>
                    <GlbFileDropZone
                      accept={{
                        "model/gltf-binary": [".glb"],
                        "model/usdz": [".usdz"],
                      }}
                      files={formik.values.glbFile}
                      imageName={getUploadedDocName(formik.values.glbFileUrl)}
                      uploadedImageUrl={formik.values.glbFileUrl}
                      onDrop={glbFileDrop}
                      onUpload={handleUploadGlbFile}
                      onRemove={glbFileRemove}
                      onRemoveAll={glbFileRemoveAll}
                      maxFiles={1}
                      isUploaded={isUploaded}
                      setIsUploaded={setIsUploaded}
                      isUploading={glbUploading}
                    />
                  </Grid>

                  <Grid item md={6} xs={12}>
                    <Box
                      sx={
                        {
                          // mt: id !== null && industry == "restaurant" ? -6 : 0,
                        }
                      }
                    >
                      <TextFieldWrapper
                        disabled={id != null && !canUpdate}
                        autoComplete="off"
                        label={t("Description")}
                        name="productDescription"
                        multiline
                        rows={2}
                        fullWidth
                        onChange={(e) => {
                          formik.handleChange(e);
                          localStorage.setItem("isChangeinProduct", "true");
                        }}
                        value={formik.values.productDescription}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item md={12} xs={12}>
                  <Typography variant="h6">
                    {t("Brand, Category, Collection & VAT Details")}
                  </Typography>
                </Grid>
                <Grid item container spacing={3}>
                  <Grid item md={6} xs={12}>
                    <Box>
                      <BrandDropdown
                        disabled={id != null && !canUpdate}
                        required
                        error={formik?.touched?.brands && formik.errors.brands}
                        onChange={(id, name) => {
                          formik.handleChange("brandRef")(id || "");
                          formik.handleChange("brands")(name || "");
                          localStorage.setItem("isChangeinProduct", "true");
                        }}
                        selectedId={formik.values.brandRef}
                        selectedName={formik.values.brands}
                        label={t("Brand")}
                        id="Brands"
                      />
                    </Box>
                  </Grid>

                  {/* {industry == "restaurant" && (
                    <Grid item md={6} xs={12}>
                      <Box>
                        <NewCategoryMultiSelect
                          showAllCategories={
                            formik.values.assignedToAllCategories
                          }
                          label={t("Categories")}
                          companyRef={companyRef}
                          selectedIds={formik.values.categoryRefs}
                          id={"categories"}
                          error={
                            formik.touched.categoryRefs &&
                            formik.errors.categoryRefs
                          }
                          onChange={(option: any, total: number) => {
                            if (option?.length > 0) {
                              const ids = option.map((option: any) => {
                                return option._id;
                              });

                              const names = option.map((option: any) => {
                                return {
                                  name: option.name.en,
                                };
                              });

                              if (ids.length == total) {
                                formik.setFieldValue(
                                  "assignedToAllCategories",
                                  true
                                );
                              } else {
                                formik.setFieldValue(
                                  "assignedToAllCategories",
                                  false
                                );
                              }

                              formik.setFieldValue("categoryRefs", ids);
                              formik.setFieldValue("categories", names);
                            } else {
                              formik.setFieldValue("categoryRefs", []);
                              formik.setFieldValue("categories", []);
                              formik.setFieldValue(
                                "assignedToAllCategories",
                                false
                              );
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                  )} */}

                  <Grid item md={6} xs={12} alignItems="center">
                    <Box>
                      <CategoryDropdown
                        disabled={id != null && !canUpdate}
                        defaultSelectedValue={{
                          name: { en: formik.values.reportingCategory },
                          _id: formik.values.reportingCategory,
                        }}
                        companyRef={companyRef}
                        required
                        error={
                          formik?.touched?.reportingCategory &&
                          formik?.errors?.reportingCategory
                        }
                        onChange={(id, name) => {
                          formik.handleChange("reportingCategoryRef")(id || "");
                          formik.handleChange("reportingCategory")(name || "");
                          localStorage.setItem("isChangeinProduct", "true");
                        }}
                        selectedId={formik?.values?.reportingCategory}
                        label={
                          user?.company?.industry === "retail" ||
                          industry == "retail"
                            ? t("Category")
                            : t("Reporting Category")
                        }
                        id="reportingCategory"
                        handleModalOpen={() => {
                          setOpenCategoryCreateModal(true);
                        }}
                      />
                    </Box>
                  </Grid>
                  {id != null && (
                    <Grid item md={6} xs={12} alignItems="center">
                      <Box>
                        <CollectionMultiSelect
                          companyRef={companyRef}
                          id="collection-multi-select"
                          selectedIds={formik.values.collectionRefs}
                          handleModalOpen={() => {
                            setOpenCollectionCreateModal(true);
                          }}
                          onChange={(option, action) => {
                            if (action === "select-option") {
                              handleAddOrRemove(option, "assign");
                            } else if (action === "remove-option") {
                              handleAddOrRemove(option, "remove");
                            }

                            if (option?.length > 0) {
                              const ids = option?.map((option: any) => {
                                return option._id;
                              });

                              const names = option?.map((option: any) => {
                                return option.name.en;
                              });

                              formik.setFieldValue("collectionRefs", ids);
                              formik.setFieldValue("collections", names);
                            } else {
                              formik.setFieldValue("collectionRefs", []);
                              formik.setFieldValue("collections", []);
                            }

                            localStorage.setItem("isChangeinProduct", "true");
                          }}
                        />
                      </Box>
                    </Grid>
                  )}

                  <Grid item md={6} xs={12}>
                    <Box>
                      <TaxDropdown
                        disabled={id != null && !canUpdate}
                        isPrefilled={isPrefilled}
                        setIsPrefilled={setIsPrefilled}
                        required
                        error={
                          formik?.touched?.taxRef && formik?.errors?.taxRef
                        }
                        onChange={(id, name) => {
                          if (id && name >= 0) {
                            formik.setFieldValue("taxRef", id);
                            formik.setFieldValue("tax", name);
                          }
                          // localStorage.setItem("isChangeinProduct", "true");
                        }}
                        selectedId={formik?.values?.taxRef}
                        label={t("VAT")}
                        id="tax"
                      />
                    </Box>
                  </Grid>

                  <Grid item md={6} xs={12}>
                    <Box
                      sx={{
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
                              `${t(
                                "Once product is created can't update this"
                              )}`
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

                  {industry == "restaurant" && (
                    <Grid item md={6} xs={12}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          border: `1px solid ${
                            theme.palette.mode !== "dark"
                              ? "#E5E7EB"
                              : "#2D3748"
                          }`,
                          borderRadius: "8px",
                          paddingLeft: "8px",
                        }}
                      >
                        <Typography color="textSecondary">
                          {t("Best Seller")}
                        </Typography>

                        <Box
                          sx={{ p: 1, display: "flex", alignItems: "center" }}
                        >
                          <Switch
                            color="primary"
                            edge="end"
                            name="bestSeller"
                            checked={formik.values.bestSeller}
                            onChange={(e) => {
                              formik.handleChange(e);
                              localStorage.setItem("isChangeinProduct", "true");
                            }}
                            sx={{
                              mr: 0.2,
                            }}
                          />

                          <Tooltip
                            title={t(
                              "There can only be 3 best seller product in a category."
                            )}
                          >
                            <SvgIcon color="action">
                              <InfoCircleIcon />
                            </SvgIcon>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Grid container spacing={1}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Card
                sx={{
                  alignItems: "center",
                  cursor: "pointer",
                  display: "flex",
                  p: 0,
                  pr: 2,
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
                  spacing={1}
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
              <Card
                sx={{
                  alignItems: "center",
                  cursor: "pointer",
                  display: "flex",
                  p: 0,
                  pr: 2,
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
                  spacing={1}
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
            </Box>
          </Grid>

          {selectedVariantOption === "singleVariant" && (
            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  {entity?._id && (
                    <Grid
                      display={"flex"}
                      alignItems={"center"}
                      justifyContent={"space-between"}
                      item
                      md={12}
                      xs={12}
                    >
                      <Typography variant="h6">
                        {t("Variant Details")}
                      </Typography>
                      <Box>
                        <Tooltip
                          title={
                            !canAccessModule("inventory")
                              ? t(
                                  "Upgrade your subscription to access this module"
                                )
                              : ""
                          }
                        >
                          <Button
                            disabled={!canAccessModule("inventory")}
                            onClick={() => {
                              setVariantIndex(0);
                              setOpenVariantModal(true);
                              setEditStock(true);
                              setCreateNew(false);
                              setTabToOpen("stock");
                            }}
                          >
                            {t("Manage Stock")}
                          </Button>
                        </Tooltip>
                        <Button
                          onClick={() => {
                            setVariantIndex(0);
                            setOpenVariantModal(true);
                            setEditStock(true);
                            setCreateNew(false);
                            setTabToOpen("details");
                          }}
                        >
                          {t("Manage Pricing")}
                        </Button>
                      </Box>
                    </Grid>
                  )}

                  <Grid item container spacing={3}>
                    <Grid item md={6} xs={12}>
                      <Box>
                        <TextFieldWrapper
                          inputProps={{
                            style: { textTransform: "capitalize" },
                          }}
                          autoComplete="off"
                          fullWidth
                          label={t("SKU")}
                          disabled={
                            entity?.variants?.[0]?.sku ===
                            formik.values.singleVsku
                          }
                          name="sku"
                          error={Boolean(
                            formik.touched.singleVsku &&
                              formik.errors.singleVsku
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
                    </Grid>

                    <Grid item md={6} xs={12}>
                      <Box>
                        <TextFieldWrapper
                          fullWidth
                          label={t("Cost Price")}
                          name="singleVcostPrice"
                          disabled={Boolean(id)}
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
                                  oldCostPrice:
                                    formik.values.singleVOldCostPrice,
                                },
                                ...formik.values.variants.slice(1),
                              ],
                            });
                            localStorage.setItem("isChangeinProduct", "true");
                          }}
                          value={formik.values.variants[0]?.costPrice}
                        />
                        <Typography
                          variant="body2"
                          color={"#ff9100"}
                          sx={{ mt: 2 }}
                        >
                          {Number(formik.values.variants[0]?.costPrice) >
                          9999.99
                            ? `${t("Amount exceeds 4 digits")}`
                            : ""}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item md={6} xs={12}>
                      <Box>
                        <TextField
                          fullWidth
                          required={isSaptco == true}
                          label={
                            isSaptco == true
                              ? t("Kilometer")
                              : t("Product Code")
                          }
                          name="code"
                          error={Boolean(
                            // formik.touched.singleVCode &&
                            formik.errors.singleVCode
                          )}
                          helperText={formik.errors.singleVCode}
                          onBlur={formik.handleBlur}
                          onChange={(e) => {
                            // if (/^[A-Za-z0-9]+$/.test(e.target.value)) {
                            const value = e.target.value;
                            const newValue = value;

                            formik.setValues({
                              ...formik.values,
                              variants: [
                                {
                                  ...formik.values.variants[0],
                                  code: newValue,
                                },
                                ...formik.values.variants.slice(1),
                              ],
                              singleVCode: newValue,
                            });
                            // }
                          }}
                          value={formik.values.singleVCode}
                        />
                      </Box>
                    </Grid>

                    <Grid item md={6} xs={12}>
                      <Box>
                        <TextFieldWrapper
                          fullWidth
                          required={isSaptco == true}
                          label={t("Selling Price")}
                          name="singleVdefaultPrice"
                          disabled={Boolean(id)}
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
                          }}
                          onChange={(e) => {
                            const value = e.target.value;

                            formik.setFieldValue(
                              "singleVOldDefaultPrice",
                              value
                            );
                            // const newValue = value ? parseFloat(value) : "";

                            const pricesArray =
                              formik.values.variants[0].prices.map(
                                (pr: any) => ({
                                  ...pr,
                                  price:
                                    pr.price ===
                                    formik.values.singleVOldDefaultPrice
                                      ? value
                                      : pr.price,
                                })
                              );

                            // Create updated variants array
                            const variants = [
                              {
                                ...formik.values.variants[0],
                                prices: pricesArray,
                                price: value,
                                oldPrice: formik.values.singleVOldDefaultPrice,
                              },
                              ...formik.values.variants.slice(1),
                            ];

                            // Update formik state
                            formik.setFieldValue("variants", variants);

                            // Update localStorage

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

                        {formik.values.prices?.length > 0 &&
                          formik.values.prices.map((data: any, index: any) => (
                            <Box
                              key={index}
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <TextFieldWrapper
                                inputProps={{
                                  style: { textTransform: "capitalize" },
                                }}
                                autoComplete="off"
                                fullWidth
                                required
                                label="Price"
                                name={`prices.${index}.price`}
                                onWheel={(event: any) => {
                                  event.preventDefault();
                                  event.target.blur();
                                }}
                                error={
                                  (formik?.touched?.prices &&
                                    index === formik.values.prices.length - 1 &&
                                    formik.errors.prices) as any
                                }
                                helperText={
                                  (index === formik.values.prices.length - 1 &&
                                    formik.touched.prices &&
                                    formik.errors.prices) as any
                                }
                                onBlur={formik.handleBlur}
                                onChange={(e) => {
                                  formik.handleChange(e);
                                }}
                                value={formik.values.prices[index].price}
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
                                sx={{ mr: 2, width: "42%" }}
                              />

                              <Box sx={{ width: "50%" }}>
                                <Autocomplete
                                  options={[]}
                                  renderInput={(params) => (
                                    <TextFieldWrapper
                                      inputProps={{
                                        style: {
                                          textTransform: "capitalize",
                                        },
                                      }}
                                      required
                                      autoComplete="off"
                                      {...params}
                                      label="Location"
                                      name={`prices.${index}.locationRef`}
                                      onBlur={formik.handleBlur}
                                      onChange={formik.handleChange}
                                      value={
                                        formik.values.prices[index].locationRef
                                      }
                                    />
                                  )}
                                  value={
                                    formik.values.prices[index].location.name
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
                            </Box>
                          ))}
                      </Box>
                    </Grid>

                    <Grid item md={6} xs={12}>
                      <Box>
                        <TextFieldWrapper
                          inputProps={{
                            style: { textTransform: "capitalize" },
                          }}
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
                    </Grid>

                    <Grid item md={6} xs={12}>
                      <Box>
                        <TextFieldWrapper
                          fullWidth
                          label={t("Margin")}
                          disabled
                          value={showMargin()}
                          onChange={formik.handleChange}
                        />
                      </Box>
                    </Grid>

                    <Grid item md={6} xs={12}>
                      <Box
                        sx={{
                          mx: 0.5,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={Boolean(
                                  formik.values.variants[0]?.nonSaleable
                                )}
                                onChange={(e) => {
                                  if (formik.values.variants[0]?.nonSaleable) {
                                    toast(`${t("Set as sellable")}`);
                                  } else {
                                    toast(`${t("Set as non-sellable")}`);
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
                              />
                            }
                            label={t("Non Sellable")}
                            sx={{
                              flexGrow: 1,
                              mr: 0,
                            }}
                          />

                          <Tooltip
                            sx={{ mx: 2 }}
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
                    </Grid>
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
                      <Typography variant="h6">
                        {t("Product and variant details")}
                      </Typography>
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
                          if (
                            formik?.values?.variants?.length >= 0 &&
                            formik?.values?.variants?.length < 10 &&
                            !user?.company?.saptcoCompany
                          ) {
                            setVariantIndex(-1);
                            setOpenVariantModalMulti(true);
                            setEditStock(false);
                            setCreateNew(true);
                          } else if (
                            formik?.values?.variants?.length >= 0 &&
                            user?.company?.saptcoCompany
                          ) {
                            setVariantIndex(-1);
                            setOpenVariantModalMulti(true);
                            setEditStock(false);
                            setCreateNew(true);
                          } else {
                            setOpenVariantModalMulti(false);
                            toast.error(
                              t("You can't add more than 10 variants")
                            );
                          }
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
                <Scrollbar>
                  <Table>
                    <TableHead
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <TableRow>
                        <TableCell width={"20%"}>{t("Variant Name")}</TableCell>
                        <TableCell>{t("SKU")}</TableCell>
                        <TableCell>{t("Unit")}</TableCell>
                        <TableCell>{t("Cost Price")}</TableCell>
                        <TableCell>{t("Price")}</TableCell>
                        <TableCell width={"25%"}>{t("Location(s)")}</TableCell>
                        <TableCell>{t("Stock")}</TableCell>
                        <TableCell>{t("Pricing")}</TableCell>
                        <TableCell
                          sx={{
                            display: "flex",
                            justifyContent: "center",
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
                          setVariantIndex(index);
                          setOpenVariantModalMulti(true);
                          setEditStock(false);
                          setCreateNew(false);
                        }}
                        handleEditStock={(index: number) => {
                          if (!canAccessModule("inventory")) {
                            toast.error(
                              t(
                                "Upgrade your subscription to access this module"
                              )
                            );
                            return;
                          }
                          setVariantIndex(index);
                          setOpenVariantModal(true);
                          setEditStock(true);
                          setCreateNew(false);
                          setTabToOpen("stock");
                        }}
                        handlePricingEdit={(index: number) => {
                          setVariantIndex(index);
                          setOpenVariantModal(true);
                          setEditStock(false);
                          setCreateNew(false);
                          setTabToOpen("details");
                        }}
                        handleHistoryClick={(index: number) => {
                          setVariantIndex(index);
                          setTabIndex(0);
                          setOpenHistoryModal(true);
                        }}
                        handleBatchHistoryClick={(index: number) => {
                          setVariantIndex(index);
                          setTabIndex(1);
                          setOpenHistoryModal(true);
                        }}
                        handleDelete={(index: number) => {
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
                            formik.setFieldValue("singleVCode", "");
                          }
                        }}
                        handleStatusChange={(id: number, val: boolean) => {
                          let data: any = {
                            ...formik.values.variants[id],
                            status: val ? "active" : "inactive",
                          };

                          formik.values.variants?.splice(id, 1, data);
                          formik.setFieldValue(
                            "variants",
                            formik.values.variants
                          );
                        }}
                      />
                    </DragDropContext>
                  </Table>
                </Scrollbar>
              </Card>
            </Card>
          )}

          {industry == "restaurant" && (
            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item md={12} xs={12}>
                    <Typography variant="h6">
                      {t("Nutritional information")}
                    </Typography>
                  </Grid>
                  <Grid item container spacing={3}>
                    <Grid item md={6} xs={12}>
                      <Box>
                        <Box>
                          <TextFieldWrapper
                            onWheel={(event: any) => {
                              event.preventDefault();
                              event.target.blur();
                            }}
                            disabled={id != null && !canUpdate}
                            autoComplete="off"
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            fullWidth
                            label={t("Calorie count")}
                            name="calorieCount"
                            onBlur={formik.handleBlur}
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
                            onChange={(e) => {
                              formik.handleChange(e);
                              localStorage.setItem("isChangeinProduct", "true");
                            }}
                            value={formik.values.calorieCount}
                          />
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item md={6} xs={12}>
                      <Box>
                        <PreferrrenceMultiSelect
                          showAllPreferrence={
                            formik.values.assignedToAllPreferrence
                          }
                          selectedIds={
                            formik?.values?.dietaryPreferrenceRefs as any
                          }
                          id={"dietary-multi-select"}
                          error={
                            formik?.touched?.dietaryPreferrenceRefs &&
                            formik.errors.dietaryPreferrenceRefs
                          }
                          onChange={(option: any, total: number) => {
                            if (option?.length > 0) {
                              const ids = option?.map((option: any) => {
                                return option.value;
                              });

                              const names = option?.map((option: any) => {
                                return option.label;
                              });

                              if (ids.length == total) {
                                formik.setFieldValue(
                                  "assignedToAllPreferrence",
                                  true
                                );
                              } else {
                                formik.setFieldValue(
                                  "assignedToAllPreferrence",
                                  false
                                );
                              }

                              formik.setFieldValue(
                                "dietaryPreferrenceRefs",
                                ids
                              );
                              formik.setFieldValue("dietaryPreferrence", names);
                            } else {
                              formik.setFieldValue(
                                "dietaryPreferrenceRefs",
                                []
                              );
                              formik.setFieldValue("dietaryPreferrence", []);
                              formik.setFieldValue(
                                "assignedToAllPreferrence",
                                false
                              );
                            }
                          }}
                        />
                      </Box>
                    </Grid>

                    <Grid item md={6} xs={12}>
                      <Box>
                        <ItemsMultiSelect
                          showAllItems={formik.values.assignedToAllItems}
                          selectedIds={formik?.values?.itemRefs as any}
                          id={"items-multi-select"}
                          error={
                            formik?.touched?.itemRefs && formik.errors.itemRefs
                          }
                          onChange={(option: any, total: number) => {
                            if (option?.length > 0) {
                              const ids = option?.map((option: any) => {
                                return option.value;
                              });

                              const names = option?.map((option: any) => {
                                return option.label;
                              });

                              if (ids.length == total) {
                                formik.setFieldValue(
                                  "assignedToAllItems",
                                  true
                                );
                              } else {
                                formik.setFieldValue(
                                  "assignedToAllItems",
                                  false
                                );
                              }

                              formik.setFieldValue("itemRefs", ids);
                              formik.setFieldValue("items", names);
                            } else {
                              formik.setFieldValue("itemRefs", []);
                              formik.setFieldValue("items", []);
                              formik.setFieldValue("assignedToAllItems", false);
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {industry == "restaurant" && (
            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid
                    width={"100%"}
                    display={"flex"}
                    flexDirection={"row"}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                    item
                  >
                    <Typography variant="h6">{t("Add Modifiers")}</Typography>
                    <Button
                      onClick={() => {
                        setModifierIndex(-1);
                        setOpenModifiersModal(true);
                      }}
                      disabled={!canAccessModule("modifiers")}
                    >
                      {t("Add Modifiers")}
                    </Button>
                  </Grid>

                  <Box
                    sx={{
                      display: "flex",
                      width: "100%",
                      mt: 2,
                    }}
                  >
                    <Scrollbar
                      sx={{
                        display: "flex",
                        width: "100%",
                        mt: 2,
                      }}
                    >
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>{t("Name")}</TableCell>
                            <TableCell>{t("Minimum options")}</TableCell>
                            <TableCell>{t("Maximum options")}</TableCell>
                            {/* <TableCell>{t("Free options")}</TableCell> */}
                            <TableCell>{t("Status")}</TableCell>
                            <TableCell>{""}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {formik.values.modifiers.length > 0 ? (
                            formik.values.modifiers.map(
                              (mod: any, idx: number) => {
                                return (
                                  <TableRow key={idx}>
                                    <TableCell>{mod?.name}</TableCell>
                                    <TableCell>{mod?.min || 0}</TableCell>
                                    <TableCell>{mod?.max || 0}</TableCell>
                                    {/* <TableCell>
                                    {mod?.noOfFreeModifier || 0}
                                  </TableCell> */}
                                    <TableCell>
                                      <FormControlLabel
                                        sx={{
                                          width: "120px",
                                          display: "flex",
                                          flexDirection: "row",
                                        }}
                                        control={
                                          <Switch
                                            checked={mod.status === "active"}
                                            color="primary"
                                            edge="end"
                                            name="status"
                                            value={mod.status === "active"}
                                            onChange={(e) => {
                                              toast.error(
                                                t(
                                                  "Manage status from modifiers screen"
                                                )
                                              );
                                            }}
                                            sx={{ mr: 0.2 }}
                                          />
                                        }
                                        label={
                                          mod.status === "active"
                                            ? t("Active")
                                            : t("Deactivated")
                                        }
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Box>
                                        <IconButton
                                          onClick={() => {
                                            setModifierData({ ...mod });
                                            setOpenModifiersEditModal(true);
                                          }}
                                        >
                                          <SvgIcon>
                                            <Edit02Icon fontSize="small" />
                                          </SvgIcon>
                                        </IconButton>

                                        <IconButton
                                          onClick={(e) => {
                                            if (!canUpdate) {
                                              return toast.error(
                                                t("You don't have access")
                                              );
                                            }
                                            e.preventDefault();

                                            formik.values.modifiers?.splice(
                                              idx,
                                              1
                                            );
                                            formik?.setFieldValue(
                                              "modifiers",
                                              formik.values.modifiers
                                            );
                                            toast.success(
                                              t("Modifier option deleted")
                                            );
                                          }}
                                          style={{
                                            pointerEvents: "painted",
                                          }}
                                        >
                                          <DeleteOutlineTwoToneIcon color="error" />
                                        </IconButton>
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                );
                              }
                            )
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={7}
                                style={{
                                  textAlign: "center",
                                  borderBottom: "none",
                                }}
                              >
                                <Box sx={{ mt: 4, mb: 4 }}>
                                  <NoDataAnimation
                                    text={
                                      <Typography
                                        variant="h5"
                                        textAlign="center"
                                        sx={{ mt: 5 }}
                                      >
                                        {t("No Modifiers!")}
                                      </Typography>
                                    }
                                  />
                                </Box>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </Scrollbar>
                  </Box>
                </Grid>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item md={12} xs={12}>
                  <Typography variant="h6">{t("Add Order Types")}</Typography>
                </Grid>
                <Grid item md={6} xs={12}>
                  <Box>
                    <ChannelMultiSelect
                      required
                      industry={industry}
                      orderTypes={channels}
                      showAllChannels={formik.values.assignedToAllChannels}
                      selectedIds={formik?.values?.channelRefs as any}
                      id={"channels-multi-select"}
                      error={
                        formik?.touched?.channelRefs &&
                        formik.errors.channelRefs
                      }
                      onChange={(option: any, total: number) => {
                        if (option?.length > 0) {
                          const ids = option?.map((option: any) => {
                            return option.value;
                          });

                          const names = option?.map((option: any) => {
                            return option.label;
                          });

                          if (ids.length == total) {
                            formik.setFieldValue("assignedToAllChannels", true);
                          } else {
                            formik.setFieldValue(
                              "assignedToAllChannels",
                              false
                            );
                          }

                          formik.setFieldValue("channelRefs", ids);
                          formik.setFieldValue("channels", names);
                        } else {
                          formik.setFieldValue("channelRefs", []);
                          formik.setFieldValue("channels", []);
                          formik.setFieldValue("assignedToAllChannels", false);
                        }
                      }}
                    />
                  </Box>
                </Grid>

                {industry !== "restaurant" && (
                  <Grid item md={6} xs={12}>
                    <Box
                      sx={{
                        mt: -0.2,
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
                        {t("Online Ordering")}
                      </Typography>

                      <Box sx={{ p: 1, display: "flex", alignItems: "center" }}>
                        <Switch
                          color="primary"
                          edge="end"
                          name="onlineOrdering"
                          checked={formik.values.onlineOrdering}
                          onChange={(e) => {
                            formik.handleChange(e);
                            localStorage.setItem("isChangeinProduct", "true");
                          }}
                          sx={{
                            mr: 0.2,
                          }}
                        />

                        <Tooltip title={t("online ordering info message.")}>
                          <SvgIcon color="action">
                            <InfoCircleIcon />
                          </SvgIcon>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {id != null && (
            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={8}>
                    <Stack spacing={1}>
                      <Typography variant="h6">{t("Status")}</Typography>
                      <Typography color="text.secondary" variant="body2">
                        {t("Change the status of the Product")}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid
                    item
                    xs={4}
                    sx={{ display: "flex", justifyContent: "flex-end" }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formik.values.status}
                          color="primary"
                          edge="end"
                          name="status"
                          onChange={() => {
                            if (id != null && !canUpdate) {
                              return toast.error(t("You don't have access"));
                            }
                            formik.setFieldValue(
                              "status",
                              !formik.values.status
                            );
                          }}
                          sx={{ mr: 0.2 }}
                        />
                      }
                      label={
                        formik.values.status ? t("Active") : t("Deactivated")
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {id != null && newdd?.length > 0 && (
            <Card>
              <CardHeader title={t("Relations")} />
              <CardContent>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{"Crate"}</TableCell>
                      <TableCell>{"Box"}</TableCell>
                      <TableCell>{"Product"}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {newdd?.map((d: any, index: any) => {
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            {d?.type == "crate"
                              ? `${d?.name?.en}(${
                                  d?.crateSku ? d?.crateSku : ""
                                }) - ${d?.qty} ${t("Boxes Per Crate")}`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {d?.type == "crate"
                              ? `${d?.boxName?.en} (${d?.boxSku})`
                              : d?.type == "box"
                              ? `${d?.name?.en} (${d?.boxSku})  - ${d?.qty} ${t(
                                  "Products Per Box"
                                )} `
                              : ""}
                          </TableCell>
                          <TableCell>{`${d?.product?.name?.en}${
                            d?.product?.variant?.en
                              ? `, ${
                                  d?.product?.variant?.[lng] ||
                                  d?.product?.variant?.en
                                }`
                              : ""
                          } (${d?.product?.sku})`}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <Box
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginRight: "10px",
              marginLeft: "10px",
            }}
            sx={{ mx: 6 }}
          >
            {Boolean(!id) && (
              <LoadingButton
                color="inherit"
                onClick={() => {
                  if (origin == "company") {
                    changeTab("catalogue", Screens?.companyDetail);
                  }
                  if (localStorage.getItem("isChangeinProduct") === "true") {
                    setShowDirtyDialogEvent(true);
                    setIschangedProduct(true);
                  } else {
                    router.back();
                  }
                }}
              >
                {t("Cancel")}
              </LoadingButton>
            )}
            <Box></Box>
            {/* {id && (
              <LoadingButton
                variant="outlined"
                color="error"
                onClick={() => {
                  if (origin == "company") {
                    changeTab("catalogue", Screens?.companyDetail);
                  }
                  setShowDialogDeleteItem(true);
                }}
                sx={{ ml: 1 }}
              >
                {t("Delete")}
              </LoadingButton>
            )} */}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {id && (
                <LoadingButton
                  color="inherit"
                  onClick={() => {
                    if (origin == "company") {
                      changeTab("catalogue", Screens?.companyDetail);
                    }
                    if (localStorage.getItem("isChangeinProduct") === "true") {
                      setShowDirtyDialogEvent(true);
                      setIschangedProduct(true);
                    } else {
                      router.back();
                    }
                  }}
                >
                  {t("Cancel")}
                </LoadingButton>
              )}

              <LoadingButton
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  if (id != null && !canUpdate) {
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

                  if (
                    isSaptco == true &&
                    Number(formik.values.variants[0]?.price) <= 0
                  ) {
                    return toast.error(
                      `${t(
                        "selling price should not be less than or equal to 0"
                      )}  `
                    );
                  }
                  if (
                    isSaptco == true &&
                    Number(formik.values.singleVCode) <= 0
                  ) {
                    return toast.error(
                      `${t(
                        "kilometers should not be less than or equal to 0"
                      )}  `
                    );
                  }

                  formik.handleSubmit();
                }}
                loading={formik.isSubmitting}
                sx={{ mx: 1 }}
                variant="contained"
                // disabled={!localStorage.getItem("isChangeinProduct")}
              >
                {id != null ? t("Update") : t("Create")}
              </LoadingButton>
            </Box>
          </Box>

          {openVariantModal && (
            <VariantModal
              isSaptco={isSaptco as boolean}
              // setUpdateProduct={(val: any) => setUpdateProduct(val)}
              productData={{
                existingSKU,
                companyRef,
                companyName,
                productNameEn: formik.values.productNameEn,
                productNameAr: formik.values.productNameAr,
                enabledBatching: formik.values.enabledBatching,
                hasMultipleVariants:
                  selectedVariantOption === "multipleVariant",
              }}
              tabToOpen={tabToOpen}
              multipleVariantsHandleSubmit={(data: any) => {
                handleSaveVariants(data);
              }}
              handleBoxesSubmit={(boxes: any) => {
                formik.setFieldValue("boxes", [...boxes]);
              }}
              handleActionsSubmit={(actions: any) => {
                if (actions.length === 0) {
                  formik.setFieldValue("actions", [...actions]);
                } else {
                  formik.setFieldValue("actions", [...actions]);
                  formik.handleSubmit();
                }
              }}
              modalData={formik.values.variants[variantIndex]}
              modalDataBoxes={formik.values.boxes}
              modalDataActions={formik.values.actions}
              open={openVariantModal}
              editStock={editStock}
              createNew={createNew}
              handleClose={() => setOpenVariantModal(false)}
            />
          )}

          {openVariantModalMulti && (
            <VariantModalMultipleVariant
              isSaptco={isSaptco as boolean}
              // setUpdateProduct={(val: any) => setUpdateProduct(val)}
              productData={{
                existingSKU,
                companyRef,
                companyName,
                productNameEn: formik.values.productNameEn,
                productNameAr: formik.values.productNameAr,
                enabledBatching: formik.values.enabledBatching,
                hasMultipleVariants:
                  selectedVariantOption === "multipleVariant",
              }}
              multipleVariantsHandleSubmit={(data: any) => {
                handleSaveVariants(data);
              }}
              handleBoxesSubmit={(boxes: any) => {
                formik.setFieldValue("boxes", [...boxes]);
              }}
              handleActionsSubmit={(actions: any) => {
                if (actions.length === 0) {
                  formik.setFieldValue("actions", [...actions]);
                } else {
                  formik.setFieldValue("actions", [...actions]);
                  formik.handleSubmit();
                }
              }}
              modalData={formik.values.variants[variantIndex]}
              modalDataBoxes={formik.values.boxes}
              modalDataActions={formik.values.actions}
              open={openVariantModalMulti}
              editStock={editStock}
              createNew={createNew}
              handleClose={() => setOpenVariantModalMulti(false)}
            />
          )}

          {openHistoryModal && (
            <HistoryModal
              productData={{
                en: formik.values.productNameEn,
                ar: formik.values.productNameAr,
                hasMultipleVariants:
                  formik.values.variants.length > 1 ? true : false,
                enabledBatching: formik.values.enabledBatching,
                productId: id,
              }}
              modalData={formik.values.variants[variantIndex]}
              companyRef={companyRef}
              open={openHistoryModal}
              onClose={() => {
                setOpenHistoryModal(false);
              }}
              tabIndex={tabIndex}
            />
          )}

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
            show={showDialogDeleteItem}
            toggle={() => setShowDialogDeleteItem(!showDialogDeleteItem)}
            onOk={(e: any) => {
              handleDeleteItem();
            }}
            okButtonText={`${t("Delete")}`}
            cancelButtonText={t("Cancel")}
            title={t("Confirm Delete?")}
            text={t(
              "Are you sure you want to delete this? This action cannot be undone."
            )}
          />

          <ConfirmationDialog
            show={showDirtyDialogEvent}
            ischangedProduct={ischangedProduct}
            toggle={() => setShowDirtyDialogEvent(!showDirtyDialogEvent)}
            onOk={handleDirtyConfirmation}
            onDiscard={handleDirtyConfirmationDiscard}
            okButtonText={`${t("Save changes")}`}
            okButtonPrimaryColor
            cancelButtonText={t("Discard")}
            cancelButtonErrorColor
            title={t("Confirmation")}
            text={t(`Changes are made are you sure want to go back`)}
          />

          {showSuccessModal && (
            <SuccessModalComponent
              open={showSuccessModal}
              onViewProduct={() => {
                setUpdateProduct(true);
                queryClient.invalidateQueries("find-one-product");
                setShowSuccessModal(false);
                // router.push({
                //   pathname: tijarahPaths.catalogue?.products.create,
                //   query: {
                //     id: responseId,
                //     companyRef: companyRef,
                //     companyName: companyName,
                //     origin: origin,
                //   },
                // });
              }}
              onViewList={() => {
                router.back();
              }}
              hasId={id ? true : false}
            />
          )}
          {openCategoryCreateModal && (
            <CategoryCreateModal
              open={openCategoryCreateModal}
              handleClose={() => {
                setOpenCategoryCreateModal(false);
              }}
            />
          )}

          {openModifiersModal && (
            <AddModifierModal
              modifiersData={formik.values.modifiers}
              companyRef={companyRef}
              open={openModifiersModal}
              handleClose={() => {
                setOpenModifiersModal(false);
              }}
              handleModifierSubmit={(data: any) => {
                handleSaveModifiers(data);
              }}
            />
          )}
          {openCollectionCreateModal && (
            <CollectionCreateModal
              open={openCollectionCreateModal}
              handleClose={() => {
                setOpenCollectionCreateModal(false);
              }}
            />
          )}
          {openModifiersEditModal && (
            <EditModifiersModal
              id={id}
              EditModData={modifierData}
              handleEditModifier={(data: any) => {
                handleEditModifier(data);
              }}
              open={openModifiersEditModal}
              handleClose={() => {
                setOpenModifiersEditModal(false);
              }}
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
        </Stack>
      </form>
    </>
  );
};
