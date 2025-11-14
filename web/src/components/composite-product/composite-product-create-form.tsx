import { Check, Clear, Edit } from "@mui/icons-material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
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
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
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
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { FC, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import endpoint from "src/api/endpoints";
import serviceCaller from "src/api/serviceCaller";
import useWarnIfUnsavedChanges from "src/hooks/check-if-changed";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import i18n from "src/i18n";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import {
  ChannelsForOthers,
  ChannelsForRestaurant,
  ChannelsName,
  Items,
  Preferrence,
  USER_TYPES,
  unitOptions,
} from "src/utils/constants";
import { getUploadedDocName } from "src/utils/get-uploaded-file-name";
import { Screens } from "src/utils/screens-names";
import { FileUploadNamespace } from "src/utils/uploadToS3";
import useActiveTabs from "src/utils/use-active-tabs";
import { useCurrency } from "src/utils/useCurrency";
import * as Yup from "yup";
import ConfirmationDialog from "../confirmation-dialog";
import AddProductTextInput from "../input/add-product-auto-complete";
import BrandDropdown from "../input/brand-auto-complete";
import CategoryDropdown from "../input/category-auto-complete";
import ChannelMultiSelect from "../input/channel-multiSelect";
import CollectionMultiSelect from "../input/collection-multiSelect";
import PreferrrenceMultiSelect from "../input/dietary-preferrence";
import ItemsMultiSelect from "../input/items-multiSelect";
import LocationMultiSelect from "../input/location-multiSelect";
import NewCategoryMultiSelect from "../input/new-category-multiSelect";
import TaxDropdown from "../input/tax-auto-complete";
import { BatchSelectModal } from "../modals/batch-select-modal";
import { HistoryModal } from "../modals/history-modal";
import { ImageCropModal } from "../modals/image-crop-modal";
import { CategoryCreateModal } from "../modals/quick-create/category-create-modal";
import { CollectionCreateModal } from "../modals/quick-create/collection-create-modal";
import { VariantModal } from "../modals/variants-modal";
import { ProductDropzone } from "../product-dropzone";
import { AddModifierModal } from "../product/add-modifier-modal";
import EditModifiersModal from "../product/edit-modifier-modal";
import { SuccessModalComponent } from "../product/product-sucess-modal";
import { Scrollbar } from "../scrollbar";
import TextFieldWrapper from "../text-field-wrapper";
import NoDataAnimation from "../widgets/animations/NoDataAnimation";
import { CompositeProductAddCard } from "./composite-products-add-card";

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

interface CreateCompositeProductProps {
  id: string;
  companyRef?: string;
  companyName?: string;
  industry?: string;
  origin?: string;
}

interface CreateProduct {
  productNameEn: string;
  productNameAr?: string;
  productImageFile?: any[];
  productImageUrl?: string;
  productDescription?: string;
  kitchenRefs: string[];
  kitchens: any[];
  productContains?: string;
  brandRef: string;
  brands?: string;
  categoryRefs?: string[];
  categories?: string[];
  assignedToAllCategories: boolean;
  reportingCategory?: string;
  reportingCategoryRef?: string;
  collectionRefs: string[];
  collections: string[];
  taxRef: string;
  tax: number;
  expiry: Date;
  enabledBatching: boolean;
  bestSeller?: boolean;
  singleVsku: string;
  singleVCode: string;
  singleVNameEn: string;
  singleVNameAr: string;
  singleVunit: string;
  singleVNonSaleable: boolean;
  productsItems: any[];
  isComposite: boolean;
  reduceFromOriginal: boolean;
  singleVreduceFromOriginal: boolean;
  singleVariantPrices: any[];
  singleVdefaultPrice: string;
  singleVcostPrice: string;
  singleVOldDefaultPrice: string;
  singleVOldCostPrice: string;
  singleVassignedToAll: boolean;
  singleVlocationRefs?: string[];
  singleVlocations?: string[];
  selfOrdering: boolean;
  onlineOrdering: boolean;
  assignedToAllChannels: boolean;
  assignedToAllItems: boolean;
  assignedToAllPreferrence: boolean;
  calorieCount?: string;
  dietaryPreferrenceRefs?: string[];
  dietaryPreferrence?: string[];
  itemRefs?: string[];
  items?: string[];
  channelRefs?: string[];
  channels?: string[];
  modifiers?: string[];
  kitchenFacingNameEn?: string;
  kitchenFacingNameAr?: string;
  kitchenRoutingCategory?: string;
  variants: any[];
  singleVariantStocks: any[];
  boxes: any[];
  actions: any[];
  init: boolean;
  prices: any[];
  singleVtype: string;
  singleVStatus: boolean;
  status: boolean;
  isRestaurant: boolean;
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

export const CompositeProductCreateForm: FC<CreateCompositeProductProps> = (
  props
) => {
  useWarnIfUnsavedChanges("Product");

  const { t } = useTranslation();
  const theme = useTheme();
  const { userType } = useUserType();
  const { user } = useAuth();
  const { id, companyRef, companyName, origin, industry } = props;

  const router = useRouter();
  const [modifierData, setModifierData] = useState({});
  const [showDialogDeleteItem, setShowDialogDeleteItem] = useState(false);

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
      {t("Composite Products")}
    </Link>,
    <Link underline="hover" key="2" color="inherit" href="#">
      {id != null
        ? t("Edit Composite Products")
        : t("Create Composite Products")}
    </Link>,
  ];

  const queryClient = useQueryClient();
  const [tabIndex, setTabIndex] = useState(0);
  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["product:update"]);
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
  const { create: assign } = useEntity("kitchen-management/assign");
  const { create: remove } = useEntity("kitchen-management/remove");

  const lng = localStorage.getItem("currentLanguage");

  const {
    find,
    updateEntity: updateTimeBasedEvents,
    loading: eventLoading,
    entities,
  } = useEntity("time-based-events");

  const { create: collectionAssign } = useEntity("collection/assign");

  const { findOne: company, entity: companyEntity } = useEntity("company");
  const [openCategoryCreateModal, setOpenCategoryCreateModal] = useState(false);
  const [openCollectionCreateModal, setOpenCollectionCreateModal] =
    useState(false);
  const [openModifiersModal, setOpenModifiersModal] = useState(false);
  const [openModifiersEditModal, setOpenModifiersEditModal] = useState(false);
  const [pendingVariantOption, setPendingVariantOption] = useState(null);
  const currency = useCurrency();

  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [variantIndex, setVariantIndex] = useState(-1);
  const [modifierIndex, setModifierIndex] = useState(-1);
  const [openVariantModal, setOpenVariantModal] = useState(false);
  const [editStock, setEditStock] = useState(false);
  const [createNew, setCreateNew] = useState(false);
  const [isSwitchEnabled, setIsSwitchEnabled] = useState(false);
  const [showDialogEvent, setShowDialogEvent] = useState(false);
  const [showStockDialogEvent, setShowStockDialogEvent] = useState(false);
  const [showDirtyDialogEvent, setShowDirtyDialogEvent] = useState(false);
  const [ischangedProduct, setIschangedProduct] = useState(false);
  const [generateApi, setGenerateApi] = useState(true);
  const [generateSkuHide, setGenerateSkuHide] = useState(false);
  const [existingSKU, setExistingSKU] = useState([]);
  const [updateProduct, setUpdateProduct] = useState(false);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const [currentToggledSwitch, setCurrentToggledSwitch] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [imgSrc, setImgSrc] = useState("");
  const [channels, setChannels] = useState<any[]>([]);
  const [openCropModal, setOpenCropModal] = useState(false);
  const [updatedCount, setUpdatedCount] = useState<number | null>(0);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(
    null
  );
  const [openBatchModal, setOpenBatchModal] = useState(false);
  const [batchIdx, setBatchIdx] = useState(null);

  const [selectedLocationMenuRef, setSelectedLocationMenuRef] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [tempValue, setTempValue] = useState("");

  const [editIndex, setEditIndex] = useState(null);

  const handleEditClick = (index: any) => {
    setEditIndex(index);
  };

  const handleBlur = () => {
    setEditIndex(null);
  };

  const initialValues: CreateProduct = {
    productNameEn: "",
    productNameAr: "",
    productImageUrl: "",
    productImageFile: [],
    productDescription: "",
    productContains: "",
    kitchenRefs: [],
    kitchens: [],
    brandRef: "",
    brands: "",
    categoryRefs: [],
    categories: [],
    assignedToAllCategories: false,
    reportingCategory: "",
    reportingCategoryRef: "",
    collections: [],
    collectionRefs: [],
    taxRef: "",
    tax: null,
    bestSeller: false,
    expiry: null,
    enabledBatching: false,
    singleVsku: "",
    singleVCode: "",
    singleVNameEn: "",
    singleVNameAr: "",
    singleVunit: "",
    singleVNonSaleable: false,
    productsItems: [],
    isComposite: true,
    reduceFromOriginal: false,
    singleVreduceFromOriginal: false,
    singleVariantPrices: [],
    singleVdefaultPrice: "",
    singleVcostPrice: "",
    singleVOldDefaultPrice: "",
    singleVOldCostPrice: "",
    singleVassignedToAll: true,
    singleVlocationRefs: [],
    singleVlocations: [],
    selfOrdering: true,
    onlineOrdering: true,
    assignedToAllChannels: false,
    assignedToAllItems: false,
    assignedToAllPreferrence: false,
    calorieCount: "",
    dietaryPreferrenceRefs: [],
    dietaryPreferrence: [],
    itemRefs: [],
    items: [],
    channelRefs: [],
    channels: [],
    modifiers: [],
    kitchenFacingNameEn: "",
    kitchenFacingNameAr: "",
    kitchenRoutingCategory: "",
    variants: [],
    singleVariantStocks: [],
    boxes: [],
    actions: [],
    init: false,
    prices: [],

    singleVtype: "",

    singleVStatus: true,
    status: true,
    isRestaurant: false,
  };

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
    // productContains: Yup.string().when("isRestaurant", {
    //   is: true,
    //   then: Yup.string().required(t("Please Select Contains")),
    //   otherwise: Yup.string().optional(),
    // }),
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

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);
      if (values.productsItems?.length < 1) {
        toast.error(t("Add atleast select one associate item").toString());
        return;
      }

      try {
        const data = {
          companyRef: companyRef,
          company: {
            name: companyName,
          },
          name: {
            en: values?.productNameEn.trim(),
            ar: values?.productNameAr.trim(),
          },
          image: values.productImageUrl,
          description: values?.productDescription,
          // kitchenName: {
          //   en: values.kitchenFacingNameEn,
          //   ar: values.kitchenFacingNameAr,
          // },
          contains: values.productContains,
          brandRef: values?.brandRef,
          brand: {
            name: values?.brands,
          },
          categoryRef: values?.reportingCategoryRef,
          category: {
            name: values.reportingCategory,
          },
          assignedToAllCategories: values?.assignedToAllCategories,
          restaurantCategoryRefs: values.categoryRefs,
          restaurantCategories: values.categories,
          collectionRefs: values.collectionRefs,
          collections: values.collections?.map((coll) => {
            return { name: coll };
          }),
          collection: {
            collectionRefs: values.collectionRefs,
            collections: values.collections,
          },
          taxRef: values?.taxRef,
          tax: {
            percentage: values?.tax,
          },
          batching: values?.enabledBatching,
          expiry: expiryDate,
          bestSeller: values.bestSeller,
          isComposite: values.isComposite,
          compositeProductItems: formik.values.productsItems.map(
            (item: any) => {
              return {
                productRef: item.productRef,
                categoryRef: item.categoryRef,
                category: { name: item.category.name },
                sku: item.sku,
                code: item.code,
                hasMultipleVariants: item.hasMultipleVariants,
                selling: item?.sellingPrice || 0,
                name: {
                  en: item.name.en,
                  ar: item.name.ar,
                },
                variant: {
                  en: item.variant.name.en,
                  ar: item.variant.name.ar,
                },
                quantity: id ? item.quantity : item.quantity * item.unitCount,
                cost: Number(item.cost),
              };
            }
          ),
          reduceFromOriginal: values.reduceFromOriginal,
          variants: values?.variants?.map((variant: any) => {
            return {
              assignedToAll: values.singleVassignedToAll,
              locations: values.singleVassignedToAll
                ? locations.results?.map((loc) => {
                    return { name: loc.name.en };
                  })
                : values?.singleVlocations.map((loc) => {
                    return { name: loc };
                  }),
              locationRefs: values.singleVassignedToAll
                ? locations.results?.map((loc) => {
                    return loc._id;
                  })
                : values?.singleVlocationRefs,
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
              reduceFromOriginal: variant.singleVreduceFromOriginal,
              prices: locations.results?.map((ref, index) => {
                const idx = values.singleVariantPrices.findIndex(
                  (price) => price.locationRef == ref._id
                );

                if (idx == -1) {
                  return {
                    price: variant.price,
                    costPrice: variant.costPrice,
                    locationRef: ref._id,
                    location: {
                      name: ref.name.en,
                    },
                  };
                } else {
                  const data: any = {
                    price: values.singleVariantPrices[idx].price,
                    costPrice: variant.costPrice,
                    locationRef: values.singleVariantPrices[idx].locationRef,
                    location: {
                      name: values.singleVariantPrices[idx].location.name,
                    },
                  };

                  return values.singleVariantPrices[idx].price ==
                    variant.oldPrice
                    ? { ...data, price: variant.price }
                    : { ...data, overriden: true };
                }
              }),
              stockConfiguration: values.singleVariantStocks,
            };
          }),
          boxes: values?.boxes?.map((box: any) => {
            return {
              assignedToAll: true,
              locations: [],
              locationRefs: [],
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
              stockConfiguration: [],
            };
          }),
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
          channel: values.channelRefs,
          selfOrdering: values.selfOrdering,
          onlineOrdering: values.onlineOrdering,
          isLooseItem: false,
          ...(values.actions.length == 0 ? { updatedBy: "ADMIN" } : {}),
          status: values.status ? "active" : "inactive",
        };

        console.log("dajjdhajdh");

        const actiondata =
          id &&
          values.singleVariantStocks
            .filter((valueConfig: any) => valueConfig.count)
            .map((valueConfig: any) => {
              if (valueConfig.count) {
                const entityConfig =
                  entity?.variants[0]?.stockConfiguration.find(
                    (ec: any) => ec.locationRef === valueConfig.locationRef
                  );

                const priceFilter = entity?.variants[0]?.prices.find(
                  (ec: any) => ec.locationRef === valueConfig.locationRef
                );

                if (entityConfig && entityConfig.count === valueConfig.count) {
                  return null;
                }

                console.log("priceFilter", priceFilter);

                return {
                  productRef: id,
                  product: {
                    name: {
                      en: values?.productNameEn.trim(),
                      ar: values?.productNameAr.trim(),
                    },
                  },
                  companyRef: companyRef,
                  company: {
                    name: companyName,
                  },
                  locationRef: valueConfig.locationRef,
                  location: valueConfig.location,
                  categoryRef: values?.reportingCategoryRef,
                  category: {
                    name: values.reportingCategory,
                  },
                  variant: {
                    name: {
                      en: values.singleVNameEn,
                      ar: values.singleVNameAr,
                    },
                    type: "item",
                    unit: 1,
                    qty: Number(valueConfig.count),
                    sku: values.singleVsku,
                    costPrice: Number(values.variants[0].costPrice),
                    sellingPrice: Number(values.variants[0].price),
                  },
                  hasMultipleVariants: false,
                  sku: values.singleVsku,
                  batching: values.enabledBatching,
                  action: "inventory-re-count",
                  expiry: valueConfig.expiry || null,
                  price: Number(
                    priceFilter.costPrice || values.variants[0].price
                  ),
                  count: Number(valueConfig.count),
                  destRef: "",
                  sourceRef: "",
                  available: Number(valueConfig.count),
                  received: Number(valueConfig.count),
                  previousStockCount: entityConfig?.count,
                };
              }
            })
            .filter(Boolean); // Remove null values

        console.log(actiondata, "actiondata");

        if (id != null) {
          await updateEntity(id?.toString(), { ...data });
        } else {
          await create({ ...data });
        }

        if (actiondata?.length > 0) {
          Promise.all(
            actiondata.map(async (action) => {
              await batchcreate({ ...action });
            })
          );
          setUpdateProduct(true);
        }

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

        if (id != null && actiondata?.length > 0) {
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
          toast.error(`${"SKU alredy exists"}`);
        } else {
          toast.error(err.message || err.code);
        }
      }
    },
  });

  const singleVariantStocks = formik.values.singleVassignedToAll
    ? formik.values.singleVariantStocks
    : formik.values.singleVariantStocks?.filter((stockDetail: any) =>
        formik.values.singleVlocationRefs.includes(stockDetail.locationRef)
      );

  const handleKitchenChange = async (kitchenId: string, name: any) => {
    const productData = {
      productRef: id,
      name: {
        en: formik.values.productNameEn,
        ar: formik.values.productNameAr,
      },
      category: {
        name: formik.values.reportingCategory,
      },
      brand: {
        name: formik.values.brands,
      },
      price: formik.values?.variants[0]?.price,
    };

    const removeData = {
      productsData: productData,
      kitchenRef: formik.values.kitchenRefs[0]?.toString(),
    };

    const assignData = {
      productsData: [productData],
      kitchenRef: kitchenId,
      name: {
        en: name.en,
        ar: name.ar,
      },
    };
    if (formik.values?.kitchenRefs?.length > 0) {
      await remove(removeData);
    }
    await assign(assignData);
    toast.success(t("Kitchen has been assigned!"));
  };

  usePageView();

  const calculateTotalCost = () => {
    return formik.values?.productsItems?.reduce(
      (total, item) => total + (item.cost || 0) * (item.quantity || 1),
      0
    );
  };

  const calculateTotalSellingPrice = () => {
    return formik.values?.productsItems?.reduce(
      (total, item) => total + (item.sellingPrice || 0) * (item.quantity || 1),
      0
    );
  };

  const handleRemoveItem = (indexToRemove: any) => {
    const updatedItems = [...formik.values?.productsItems];
    updatedItems.splice(indexToRemove, 1);
    formik.setFieldValue("productsItems", updatedItems);
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
      queryClient.invalidateQueries("find-one-product");
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

  const handleAddEditBatchAction = useCallback(
    (newData: any, idx: number) => {
      const existingStocks = formik.values.singleVariantStocks;

      const updatedStock = {
        ...existingStocks[idx],
        count: newData.count,
        destRef: newData.destRef,
        quantityAvailDest: newData.quantityAvailDest,
        receivedDest: newData.receivedDest,
      };

      const updatedStocks = [...existingStocks];
      updatedStocks[idx] = updatedStock;

      formik.setFieldValue("singleVariantStocks", updatedStocks);
    },
    [formik.values.singleVariantStocks]
  );

  useEffect(() => {
    if (locations.results?.length > 0) {
      const initialStock = locations.results.map((location) => {
        const stock = formik.values.singleVariantStocks.find(
          (stock: any) => stock.locationRef === location._id
        );

        if (stock?.locationRef) {
          return stock;
        } else {
          return {
            availability: true,
            tracking: false,
            lowStockAlert: false,
            count: 0,
            lowStockCount: 0,
            expiry: null,
            locationRef: location._id,
            location: { name: location.name.en },
          };
        }
      });
      formik.setFieldValue("singleVariantStocks", initialStock);
    }
  }, [locations.results]);

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
      findOne(id?.toString());
    }
  }, [id, updateProduct]);

  useEffect(() => {
    if (id == null && formik.values.variants.length === 0) {
      formik.setFieldValue("variants", [newVariant]);
    }
  }, [!id]);

  useEffect(() => {
    if (locations.results?.length > 0) {
      const initialStock = locations?.results?.map((location) => {
        const existingStock = entity?.variants[0]?.stockConfiguration?.find(
          (stock: any) => stock?.locationRef === location?._id
        );

        if (existingStock) {
          return existingStock;
        }

        return {
          availability: true,
          tracking: false,
          lowStockAlert: false,
          count: 0,
          lowStockCount: 0,
          expiry: null,
          locationRef: location._id,
          location: { name: location.name.en },
        };
      });

      formik.setFieldValue("singleVariantStocks", initialStock);
    }
  }, [locations.results, entity]);

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
  ]);

  useEffect(() => {
    if (companyRef != null && userType === USER_TYPES.SUPERADMIN) {
      company(companyRef?.toString());
    }
  }, [companyRef]);

  useEffect(() => {
    if (companyRef) {
      findLocation({
        page: 0,
        limit: 100,
        _q: "",
        activeTab: "active",
        sort: "asc",
        companyRef: companyRef?.toString(),
      });
    }
  }, [companyRef]);

  useEffect(() => {
    if (id != null) {
      find({
        page: 0,
        limit: 100,
        _q: "",
        activeTab: "active",
        sort: "asc",
        companyRef: companyRef?.toString(),
        productRef: id.toString(),
      });
    }
  }, [id]);

  // console.log(formik.values.singleVariantStocks);

  useEffect(() => {
    if (!id && userType === USER_TYPES.SUPERADMIN) {
      const Channels =
        companyEntity?.channel?.length > 0
          ? companyEntity?.channel?.map((channel: any) => {
              return {
                label: ChannelsName[channel.name] || channel.name,
                value: channel.name,
              };
            })
          : industry == "restaurant"
          ? ChannelsForRestaurant
          : ChannelsForOthers;

      setChannels(Channels);
      formik.setFieldValue("taxRef", companyEntity?.vat?.vatRef);
      setIsPrefilled(true);
      return;
    }

    const Channels =
      user?.company?.channel?.length > 0
        ? user?.company?.channel?.map((channel: any) => {
            return {
              label: ChannelsName[channel.name] || channel.name,
              value: channel.name,
            };
          })
        : industry == "restaurant"
        ? ChannelsForRestaurant
        : ChannelsForOthers;

    setChannels(Channels);
    formik.setFieldValue("taxRef", user?.company?.vat?.vatRef);
    setIsPrefilled(true);
  }, [companyEntity, user?.company]);

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
    if (id != null && entity != null) {
      const Channels =
        companyEntity?.channel?.length > 0
          ? companyEntity?.channel?.map((channel: any) => {
              return {
                label: ChannelsName[channel.name] || channel.name,
                value: channel.name,
              };
            })
          : industry == "restaurant"
          ? ChannelsForRestaurant
          : ChannelsForOthers;

      formik.setFieldValue("productNameEn", entity.name.en);
      formik.setFieldValue("productNameAr", entity.name.ar);
      formik.setFieldValue("productImageUrl", entity.image || "");
      formik.setFieldValue("productDescription", entity.description);
      formik.setFieldValue("kitchens", entity?.kitchens);
      formik.setFieldValue("kitchenRefs", entity.kitchenRefs);
      formik.setFieldValue("productContains", entity.contains);
      formik.setFieldValue("brandRef", entity.brandRef);
      formik.setFieldValue("brands", entity.brand.name);
      formik.setFieldValue("reportingCategoryRef", entity.categoryRef);
      formik.setFieldValue("reportingCategory", entity.category?.name);
      formik.setFieldValue(
        "assignedToAllCategories",
        entity.assignedToAllCategories
      );
      formik.setFieldValue("categories", entity.restaurantCategories || []);
      formik.setFieldValue("categoryRefs", entity.restaurantCategoryRefs || []);
      formik.setFieldValue("collectionRefs", entity.collectionRefs);
      formik.setFieldValue(
        "collections",
        entity.collections?.map((coll: any) => {
          return coll.name;
        })
      );
      formik.setFieldValue("taxRef", entity.taxRef);
      formik.setFieldValue("tax", entity.tax.percentage);
      formik.setFieldValue("enabledBatching", entity.batching);
      formik.setFieldValue("expiry", entity.expiry);
      formik.setFieldValue("bestSeller", entity.bestSeller);
      formik.setFieldValue("singleVsku", entity?.variants[0].sku || "");
      formik.setFieldValue("singleVunit", entity?.variants[0].unit || "");
      formik.setFieldValue("singleVNameEn", entity?.variants[0].name?.en || "");
      formik.setFieldValue("singleVNameAr", entity?.variants[0].name?.ar || "");
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
      formik.setFieldValue(
        "productsItems",
        entity.compositeProductItems.map((item: any) => ({
          productRef: item.productRef,
          name: item.name,
          categoryRef: item.categoryRef,
          category: item.category,
          sku: item.sku,
          code: item.code,
          hasMultipleVariants: item.hasMultipleVariants,
          price: item.selling,
          sellingPrice: item.selling,
          variant: { name: item.variant },
          type: "item",
          quantity: item.quantity,
          unitCount: item.unitCount,
          cost: item.cost,
        }))
      );

      formik.setFieldValue("isComposite", entity?.isComposite);
      formik.setFieldValue(
        "reduceFromOriginal",
        entity?.singleVreduceFromOriginal
      );
      formik.setFieldValue(
        "singleVreduceFromOriginal",
        entity?.singleVreduceFromOriginal
      );
      formik.setFieldValue(
        "singleVOldCostPrice",
        entity?.variants?.[0]?.costPrice
      );
      formik.setFieldValue(
        "singleVOldDefaultPrice",
        entity?.variants?.[0]?.price
      );
      formik.setFieldValue(
        "singleVCostPrice",
        entity?.variants?.[0]?.costPrice
      );
      formik.setFieldValue("singleVDefaultPrice", entity?.variants?.[0]?.price);
      formik.setFieldValue("variants", entity?.variants || []);
      formik.setFieldValue("boxes", entity?.boxes || []);
      formik.setFieldValue(
        "singleVariantStocks",
        entity?.variants?.[0]?.stockConfiguration
      );
      formik.setFieldValue(
        "singleVariantPrices",
        entity?.variants?.[0]?.prices
      );

      formik.setFieldValue(
        "singleVassignedToAll",
        entity?.variants?.[0]?.assignedToAll
      );
      formik.setFieldValue(
        "singleVlocations",
        entity?.variants?.[0]?.locations?.map(
          (location: any) => location.name
        ) || []
      );
      formik.setFieldValue(
        "singleVlocationRefs",
        entity?.variants?.[0]?.locationRefs
      );

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

      formik.setFieldValue(
        "assignedToAllChannels",
        entity.channel?.length === Channels?.length
      );
      formik.setFieldValue("channelRefs", entity.channel || []);
      formik.setFieldValue("selfOrdering", entity.selfOrdering);
      formik.setFieldValue("onlineOrdering", entity.onlineOrdering);
      formik.setFieldValue("modifiers", entity.modifiers || []);
      formik.setFieldValue("status", entity?.status === "active");
      formik.setFieldValue("init", true);
    }
  }, [entity]);

  // console.log("formik", formik.values);

  // console.log("entity", entity);

  useEffect(() => {
    if (id == null) {
      formik.setFieldValue("assignedToAllChannels", true);
      formik.setFieldValue(
        "channelRefs",
        industry === "restaurant"
          ? ["dine-in", "takeaway", "pickup", "delivery"]
          : ["walk-in", "pickup", "delivery"]
      );
    }

    formik.setFieldValue("isRestaurant", industry === "restaurant");
  }, [id, industry]);

  console.log(formik.values);

  useEffect(() => {
    localStorage.setItem("isChangeinProduct", "false");
  }, []);

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
              width: 500,
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
          {id != null
            ? t("Edit Composite Product")
            : t("Create Composite Product")}
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
                  {/* {industry == "restaurant" && (
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

                  {industry == "restaurant" && (
                    <Grid item md={6} xs={12} alignItems="center">
                      <Box>
                        <KitchenDropdown
                          disabled={id != null && !canUpdate}
                          companyRef={companyRef}
                          required
                          onChange={(id, name) => {
                            handleKitchenChange(id, name);
                          }}
                          selectedId={formik?.values?.kitchenRefs[0] as string}
                          label={t("Kitchen")}
                          id="kitchen"
                        />
                      </Box>
                    </Grid>
                  )} */}

                  <Grid item md={6} xs={12}>
                    <Box>
                      <ProductDropzone
                        disabled={id != null && !canUpdate}
                        accept={{
                          "image/*": [],
                        }}
                        // caption="(SVG, JPG, PNG, or gif)"
                        files={formik.values.productImageFile}
                        imageName={getUploadedDocName(
                          formik?.values?.productImageUrl
                        )}
                        uploadedImageUrl={formik?.values?.productImageUrl}
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
                  </Grid>

                  <Grid item md={6} xs={12}>
                    <Box>
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

                  {industry == "restaurant" && (
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
                  )}

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

                  {/* <Grid item md={6} xs={12}>
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
                  </Grid> */}

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

          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                  item
                  md={12}
                  xs={12}
                >
                  <Typography variant="h6">{t("Variant Details")}</Typography>
                </Grid>

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
                  </Grid>

                  <Grid item md={6} xs={12}>
                    <Box>
                      <TextFieldWrapper
                        fullWidth
                        label={t("Product Code")}
                        name="code"
                        error={Boolean(
                          // formik.touched.singleVCode &&
                          formik.errors.singleVCode
                        )}
                        helperText={
                          // formik.touched.singleVCode &&
                          formik.errors.singleVCode
                        }
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
                        disabled
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
                        {unitOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextFieldWrapper>
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

          <Card
            sx={{
              mt: 4,
              overflow: "auto",
            }}
          >
            <CardContent>
              <Grid container>
                <Grid
                  xs={12}
                  md={12}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Stack
                    spacing={1}
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography variant="h6">{t("Associate Items")}</Typography>
                    <Tooltip title={t("associate_item_info_composite_product")}>
                      <SvgIcon color="action">
                        <InfoCircleIcon />
                      </SvgIcon>
                    </Tooltip>
                  </Stack>
                </Grid>
                {id == null && (
                  <Grid xs={12} md={12}>
                    <Stack spacing={1}>
                      <Box sx={{ mt: 2, p: 1 }}>
                        <AddProductTextInput
                          // error={
                          //   formik?.touched?.products &&
                          //   formik.errors.products
                          // }
                          onChange={(id, name) => {
                            formik.handleChange("productRef")(id || "");
                            formik.handleChange("products")(name || "");
                          }}
                          onProductSelect={(selectedProduct: any) => {
                            formik.setFieldValue("productsItems", [
                              ...formik.values.productsItems,
                              selectedProduct,
                            ]);
                          }}
                          isComposite={true}
                          companyRef={companyRef?.toString()}
                          formik={formik.values?.productsItems}
                          selectedId={""}
                          label={t("Search using Product/SKU or Box SKU")}
                          id="Products"
                          // handleModalOpen={() => {
                          //   setOpenProductCreateModal(true);
                          // }}
                          orderType={"POGRN"}
                        />
                      </Box>
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </CardContent>
            <CompositeProductAddCard
              poid={id}
              formik={formik}
              isReturn={false}
              onRemoveItem={handleRemoveItem}
              selectedOption={"po"}
              costSellingPrice={{
                totalCost: calculateTotalCost(),
                totalSellingPrice: calculateTotalSellingPrice(),
              }}
            />

            <CardContent>
              <Grid item container spacing={3}>
                <Grid item md={6} xs={12}>
                  <Box>
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
                      onKeyPress={(event: any) => {
                        const ascii = event.charCode;
                        const value = event.target.value;
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
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Copy from total">
                              <IconButton
                                onClick={() => {
                                  const totalCost = calculateTotalCost();
                                  formik.setValues({
                                    ...formik.values,
                                    variants: [
                                      {
                                        ...formik.values.variants[0],
                                        costPrice: totalCost.toFixed(2),
                                        oldCostPrice:
                                          formik.values.singleVOldCostPrice,
                                      },
                                      ...formik.values.variants.slice(1),
                                    ],
                                  });
                                }}
                              >
                                <ContentCopyIcon />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                      onChange={(e) => {
                        const value = e.target.value;
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
                </Grid>

                <Grid item md={6} xs={12}>
                  <Box>
                    <TextFieldWrapper
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
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Copy from total">
                              <IconButton
                                onClick={() => {
                                  const totalCost =
                                    calculateTotalSellingPrice();
                                  formik.setValues({
                                    ...formik.values,
                                    variants: [
                                      {
                                        ...formik.values.variants[0],
                                        price: totalCost.toFixed(2),
                                        oldPrice:
                                          formik.values.singleVOldCostPrice,
                                      },
                                      ...formik.values.variants.slice(1),
                                    ],
                                  });
                                }}
                              >
                                <ContentCopyIcon />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
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
                                    style: { textTransform: "capitalize" },
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
                              value={formik.values.prices[index].location.name}
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
                      fullWidth
                      label={t("Margin")}
                      disabled
                      value={showMargin()}
                      onChange={formik.handleChange}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                  item
                  md={12}
                  xs={12}
                >
                  <Typography variant="h6">{t("Prices Managemnet")}</Typography>
                </Grid>

                <Grid item container spacing={3}>
                  <Grid item md={12} xs={12}>
                    <Scrollbar>
                      <Table sx={{ minWidth: 700 }}>
                        <TableHead>
                          <TableRow style={{ textWrap: "nowrap" }}>
                            <TableCell>{t("Location Name")}</TableCell>
                            <TableCell style={{ minWidth: "140px" }}>
                              {t("Cost Price")}
                            </TableCell>
                            <TableCell>{t("Selling Price")}</TableCell>
                            <TableCell>{t("")}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {formik.values?.singleVariantPrices?.length === 0 ? (
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
                                        {t("No Location found!")}
                                      </Typography>
                                    }
                                  />
                                </Box>
                              </TableCell>
                            </TableRow>
                          ) : (
                            formik.values?.singleVariantPrices?.map(
                              (price, index) => (
                                <TableRow key={price.locationRef}>
                                  <TableCell sx={{ py: 0.4 }}>
                                    <Typography
                                      variant="body2"
                                      sx={{ textTransform: "capitalize" }}
                                    >
                                      {price?.location?.name}
                                    </Typography>
                                  </TableCell>
                                  <TableCell sx={{ py: 0.4 }}>
                                    <Box sx={{ p: 1 }}>
                                      <TextFieldWrapper
                                        fullWidth
                                        variant="standard"
                                        label={t("Cost Price")}
                                        name={`prices[${index}].costPrice`}
                                        disabled
                                        value={price?.costPrice}
                                        onKeyPress={(event: any) => {
                                          const ascii = event.charCode;
                                          const value = event.target.value;
                                          const decimalCheck =
                                            value.indexOf(".") !== -1;

                                          if (decimalCheck) {
                                            const decimalSplit =
                                              value.split(".");
                                            const decimalLength =
                                              decimalSplit[1].length;
                                            if (
                                              decimalLength > 1 ||
                                              ascii === 46
                                            ) {
                                              event.preventDefault();
                                            } else if (
                                              ascii < 48 ||
                                              ascii > 57
                                            ) {
                                              event.preventDefault();
                                            }
                                          } else if (
                                            value.length > 5 &&
                                            ascii !== 46
                                          ) {
                                            event.preventDefault();
                                          } else if (
                                            (ascii < 48 || ascii > 57) &&
                                            ascii !== 46
                                          ) {
                                            event.preventDefault();
                                          }
                                        }}
                                      />
                                    </Box>
                                  </TableCell>
                                  <TableCell sx={{ py: 0.4 }}>
                                    <Box sx={{ p: 1 }}>
                                      <TextFieldWrapper
                                        fullWidth
                                        variant="standard"
                                        label={t("Selling Price")}
                                        name={`singleVariantPrices[${index}].price`}
                                        disabled={
                                          editIndex !== index &&
                                          price.price ===
                                            entity?.variants[0]?.price
                                        }
                                        onChange={(e) => {
                                          const value = e.target.value;

                                          const trimmedValue = value.slice(
                                            0,
                                            10
                                          );
                                          formik.setFieldValue(
                                            `singleVariantPrices[${index}].price`,
                                            trimmedValue
                                          );
                                        }}
                                        onBlur={handleBlur}
                                        value={price?.price || 0}
                                        onKeyPress={(event: any) => {
                                          const ascii = event.charCode;
                                          const value = event.target.value;
                                          const decimalCheck =
                                            value.indexOf(".") !== -1;

                                          if (decimalCheck) {
                                            const decimalSplit =
                                              value.split(".");
                                            const decimalLength =
                                              decimalSplit[1].length;
                                            if (
                                              decimalLength > 1 ||
                                              ascii === 46
                                            ) {
                                              event.preventDefault();
                                            } else if (
                                              ascii < 48 ||
                                              ascii > 57
                                            ) {
                                              event.preventDefault();
                                            }
                                          } else if (
                                            value.length > 5 &&
                                            ascii !== 46
                                          ) {
                                            event.preventDefault();
                                          } else if (
                                            (ascii < 48 || ascii > 57) &&
                                            ascii !== 46
                                          ) {
                                            event.preventDefault();
                                          }
                                        }}
                                      />
                                    </Box>
                                  </TableCell>
                                  <TableCell sx={{ maxWidth: "40px", py: 0.4 }}>
                                    {editIndex === index ||
                                    price?.price ===
                                      entity?.variants[0]?.price ? (
                                      <IconButton
                                        onClick={() => handleEditClick(index)}
                                      >
                                        <Edit />
                                      </IconButton>
                                    ) : null}
                                  </TableCell>
                                </TableRow>
                              )
                            )
                          )}
                        </TableBody>
                      </Table>
                    </Scrollbar>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid
                  display={"flex"}
                  alignItems={"center"}
                  item
                  gap={1}
                  md={12}
                  xs={12}
                >
                  <Typography variant="h6">{t("Stock Management")}</Typography>
                  <Tooltip
                    title={t(
                      "Stock can update after creating composite Product"
                    )}
                  >
                    <SvgIcon color="action">
                      <InfoCircleIcon />
                    </SvgIcon>
                  </Tooltip>
                </Grid>
                <Grid item md={12} xs={12}>
                  <Box>
                    <LocationMultiSelect
                      showAllLocation={formik.values.singleVassignedToAll}
                      companyRef={companyRef}
                      selectedIds={formik.values.singleVlocationRefs}
                      required
                      id={"locations"}
                      error={
                        formik.touched.singleVlocationRefs &&
                        formik.errors.singleVlocationRefs
                      }
                      onChange={(option: any, total: number) => {
                        formik.setFieldValue("selectedLocations", option);
                        if (option?.length > 0) {
                          const ids = option.map((option: any) => {
                            return option._id;
                          });

                          const names = option.map((option: any) => {
                            return option.name.en;
                          });

                          if (ids.length == total) {
                            formik.setFieldValue("singleVassignedToAll", true);
                          } else {
                            formik.setFieldValue("singleVassignedToAll", false);
                          }

                          formik.setFieldValue("singleVlocationRefs", ids);
                          formik.setFieldValue("singleVlocations", names);
                        } else {
                          formik.setFieldValue("singleVlocationRefs", []);
                          formik.setFieldValue("singleVlocations", []);
                          formik.setFieldValue("singleVassignedToAll", false);
                        }
                      }}
                    />
                  </Box>
                </Grid>

                <Grid item container spacing={3}>
                  <Grid item md={12} xs={12}>
                    <Scrollbar>
                      <Table sx={{ minWidth: 700 }}>
                        <TableHead>
                          <TableRow style={{ textWrap: "nowrap" }}>
                            <TableCell>{t("Location Name")}</TableCell>
                            <TableCell>{t("Available for sale")}</TableCell>
                            <TableCell>{t("Manage stock/tracking")}</TableCell>
                            <TableCell style={{ minWidth: "140px" }}>
                              {t("Stocks")}
                            </TableCell>
                            <TableCell style={{ minWidth: "160px" }}>
                              {t("Low stock alert")}
                            </TableCell>
                            <TableCell>{t("Alert Count")}</TableCell>

                            {id && <TableCell>{t("Action")}</TableCell>}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {formik.values.singleVariantStocks?.length === 0 ? (
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
                                        {t("No Location found!")}
                                      </Typography>
                                    }
                                  />
                                </Box>
                              </TableCell>
                            </TableRow>
                          ) : (
                            singleVariantStocks?.map(
                              (stockDetail: any, index: number) => (
                                <TableRow key={stockDetail.locationRef}>
                                  <TableCell>
                                    {" "}
                                    <Typography
                                      variant="body2"
                                      sx={{ textTransform: "capitalize" }}
                                    >
                                      {stockDetail.location?.name}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Box>
                                      {stockDetail.availability
                                        ? t("Available for sale")
                                        : t("Out of stock")}
                                      <Switch
                                        color="primary"
                                        edge="end"
                                        name={`availability${stockDetail.locationRef}`}
                                        checked={stockDetail.availability}
                                        onChange={(e) => {
                                          if (!e.target.checked) {
                                            setCurrentToggledSwitch(
                                              stockDetail.locationRef
                                            );
                                            setShowStockDialogEvent(true);
                                          } else {
                                            const updatedStock = [
                                              ...formik.values
                                                .singleVariantStocks,
                                            ];
                                            const stockIndex =
                                              updatedStock.findIndex(
                                                (item) =>
                                                  item.locationRef ===
                                                  stockDetail.locationRef
                                              );

                                            if (stockIndex !== -1) {
                                              updatedStock[
                                                stockIndex
                                              ].availability = e.target.checked;
                                              formik.setFieldValue(
                                                "singleVariantStocks",
                                                updatedStock
                                              );
                                            }
                                          }
                                        }}
                                        sx={{
                                          mr: 0.2,
                                        }}
                                      />
                                      <ConfirmationDialog
                                        show={showStockDialogEvent}
                                        toggle={() => {
                                          setShowStockDialogEvent(
                                            !showStockDialogEvent
                                          );
                                        }}
                                        onOk={() => {
                                          const updatedStock = [
                                            ...formik.values
                                              .singleVariantStocks,
                                          ];
                                          const stockIndex =
                                            updatedStock.findIndex(
                                              (item) =>
                                                item.locationRef ===
                                                currentToggledSwitch
                                            );

                                          if (stockIndex !== -1) {
                                            updatedStock[
                                              stockIndex
                                            ].availability =
                                              !updatedStock[stockIndex]
                                                .availability;
                                            formik.setFieldValue(
                                              "singleVariantStocks",
                                              updatedStock
                                            );
                                          }

                                          setCurrentToggledSwitch(null);
                                          setShowStockDialogEvent(false);
                                        }}
                                        okButtonText={`${t("Yes")}`}
                                        cancelButtonText={t("Cancel")}
                                        title={t("Confirmation")}
                                        text={t(
                                          `You won’t be able to bill this variant, regardless of the stock count. Are you sure you want to disable it?`
                                        )}
                                      />
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Box>
                                      {t("Manage stock/Tracking")}
                                      <Switch
                                        color="primary"
                                        edge="end"
                                        name={`trackstockStatus${stockDetail.locationRef}`}
                                        checked={stockDetail.tracking}
                                        onChange={(e) => {
                                          const updatedStock = [
                                            ...formik.values
                                              .singleVariantStocks,
                                          ];
                                          const stockIndex =
                                            updatedStock.findIndex(
                                              (item) =>
                                                item.locationRef ===
                                                stockDetail.locationRef
                                            );

                                          if (stockIndex !== -1) {
                                            updatedStock[stockIndex].tracking =
                                              e.target.checked;
                                            if (!e.target.checked) {
                                              updatedStock[
                                                stockIndex
                                              ].lowStockAlert = false;
                                            }
                                            formik.setFieldValue(
                                              "singleVariantStocks",
                                              updatedStock
                                            );
                                          }
                                        }}
                                        sx={{
                                          mr: 0.2,
                                        }}
                                      />
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      {editMode === stockDetail.locationRef ? (
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                          }}
                                        >
                                          <TextField
                                            fullWidth
                                            sx={{ minWidth: "60px" }}
                                            variant="standard"
                                            label={t("Stock")}
                                            value={tempValue}
                                            onChange={(e) =>
                                              setTempValue(
                                                e.target.value
                                                  .replace(/\D/g, "")
                                                  .slice(0, 10)
                                              )
                                            }
                                            onKeyPress={(event: any) => {
                                              const ascii = event.charCode;
                                              const value = event.target.value;
                                              const decimalCheck =
                                                value.indexOf(".") !== -1;

                                              if (decimalCheck) {
                                                const decimalSplit =
                                                  value.split(".");
                                                const decimalLength =
                                                  decimalSplit[1].length;
                                                if (
                                                  decimalLength > 1 ||
                                                  ascii === 46
                                                ) {
                                                  event.preventDefault();
                                                } else if (
                                                  ascii < 48 ||
                                                  ascii > 57
                                                ) {
                                                  event.preventDefault();
                                                }
                                              } else if (
                                                value.length > 5 &&
                                                ascii !== 46
                                              ) {
                                                event.preventDefault();
                                              } else if (
                                                (ascii < 48 || ascii > 57) &&
                                                ascii !== 46
                                              ) {
                                                event.preventDefault();
                                              }
                                            }}
                                          />
                                          <IconButton
                                            onClick={() => {
                                              formik.setFieldValue(
                                                `singleVariantStocks[${index}].count`,
                                                tempValue
                                              );
                                              setEditMode(null);
                                            }}
                                          >
                                            <Check />
                                          </IconButton>
                                          <IconButton
                                            onClick={() => setEditMode(null)}
                                          >
                                            <Clear />
                                          </IconButton>
                                        </Box>
                                      ) : (
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                          }}
                                        >
                                          <span>{stockDetail.count}</span>
                                          <IconButton
                                            onClick={() => {
                                              if (!id) {
                                                toast.error(
                                                  "Can update stock only after creating product"
                                                );
                                                return;
                                              }
                                              if (!stockDetail.tracking) {
                                                toast.error(
                                                  "Please trun on tracking to update"
                                                );
                                                return;
                                              }
                                              if (
                                                formik.values.enabledBatching
                                              ) {
                                                setOpenBatchModal(true);
                                              } else {
                                                setTempValue(stockDetail.count);
                                                setEditMode(
                                                  stockDetail.locationRef
                                                );
                                              }
                                            }}
                                          >
                                            <Edit />
                                          </IconButton>
                                        </Box>
                                      )}
                                    </Box>
                                  </TableCell>

                                  <TableCell>
                                    {stockDetail.tracking && (
                                      <Box>
                                        {t("Low stock alert")}
                                        <Switch
                                          color="primary"
                                          edge="end"
                                          name={`lowStockAlert${stockDetail.locationRef}`}
                                          checked={stockDetail.lowStockAlert}
                                          onChange={(e) => {
                                            const updatedStock = [
                                              ...formik.values
                                                .singleVariantStocks,
                                            ];
                                            const stockIndex =
                                              updatedStock.findIndex(
                                                (item) =>
                                                  item.locationRef ===
                                                  stockDetail.locationRef
                                              );

                                            if (stockIndex !== -1) {
                                              updatedStock[
                                                stockIndex
                                              ].lowStockAlert =
                                                e.target.checked;
                                              formik.setFieldValue(
                                                "singleVariantStocks",
                                                updatedStock
                                              );
                                            }
                                          }}
                                          sx={{
                                            mr: 0.2,
                                          }}
                                        />
                                      </Box>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {stockDetail.tracking && (
                                      <Box sx={{ p: 1 }}>
                                        <TextField
                                          fullWidth
                                          variant="standard"
                                          label={t(
                                            "Alert when the stock count goes below"
                                          )}
                                          name={`singleVariantStocks[${index}].lowStockCount`}
                                          disabled={!stockDetail.lowStockAlert}
                                          onChange={(e) => {
                                            const value = e.target.value
                                              .replace(/\D/g, "")
                                              .slice(0, 10);

                                            formik.setFieldValue(
                                              `singleVariantStocks[${index}].lowStockCount`,
                                              value
                                            );
                                          }}
                                          onKeyPress={(event: any) => {
                                            const ascii = event.charCode;
                                            const value = event.target.value;
                                            const decimalCheck =
                                              value.indexOf(".") !== -1;

                                            if (decimalCheck) {
                                              const decimalSplit =
                                                value.split(".");
                                              const decimalLength =
                                                decimalSplit[1].length;
                                              if (
                                                decimalLength > 1 ||
                                                ascii === 46
                                              ) {
                                                event.preventDefault();
                                              } else if (
                                                ascii < 48 ||
                                                ascii > 57
                                              ) {
                                                event.preventDefault();
                                              }
                                            } else if (
                                              value.length > 5 &&
                                              ascii !== 46
                                            ) {
                                              event.preventDefault();
                                            } else if (
                                              (ascii < 48 || ascii > 57) &&
                                              ascii !== 46
                                            ) {
                                              event.preventDefault();
                                            }
                                          }}
                                          value={stockDetail.lowStockCount}
                                        />
                                      </Box>
                                    )}
                                  </TableCell>

                                  <TableCell>
                                    {id &&
                                      stockDetail.tracking &&
                                      !createNew && (
                                        <>
                                          {/* <Button
                                            variant="text"
                                            onClick={() => {
                                              const selectedLocationRef =
                                                stockDetail.locationRef;
                                              const stockIndex =
                                                formik.values.singleVariantStocks.findIndex(
                                                  (item: any) =>
                                                    item.locationRef ===
                                                    selectedLocationRef
                                                );

                                              if (stockIndex !== -1) {
                                                setSelectedAction(
                                                  formik.values.actions[
                                                    stockIndex
                                                  ]
                                                );
                                                setSelectedCardIndex(
                                                  stockIndex
                                                );
                                                // setOpenStockAction(true);
                                              }
                                            }}
                                          >
                                            {t("Update Stock")}
                                          </Button> */}

                                          <Button
                                            variant="text"
                                            onClick={() => {
                                              setSelectedLocationMenuRef(
                                                stockDetail.locationRef
                                              );
                                              setOpenHistoryModal(true);
                                            }}
                                            sx={{
                                              mr: 1,
                                              mt: 1,
                                              textWrap: "nowrap",
                                            }}
                                          >
                                            {t("History")}
                                          </Button>
                                        </>
                                      )}
                                  </TableCell>
                                </TableRow>
                              )
                            )
                          )}
                        </TableBody>
                      </Table>
                    </Scrollbar>
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
                      {/* <Box sx={{ display: "flex", alignItems: "center" }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={Boolean(
                                formik.values.variants[0]?.reduceFromOriginal
                              )}
                              onChange={(e) => {
                                formik.setValues({
                                  ...formik.values,
                                  variants: [
                                    {
                                      ...formik.values.variants[0],
                                      reduceFromOriginal: e.target.checked,
                                    },
                                    ...formik.values.variants.slice(1),
                                  ],
                                  singleVreduceFromOriginal: e.target.checked,
                                  reduceFromOriginal: e.target.checked,
                                });
                              }}
                              value={
                                formik.values.variants[0]?.reduceFromOriginal
                              }
                            />
                          }
                          label={t("Reduce stock from original item")}
                          sx={{
                            flexGrow: 1,
                            mr: 0,
                          }}
                        />

                        <Tooltip
                          sx={{ mx: 2 }}
                          title={t("composite_product_msg_reduceFromOriginal")}
                        >
                          <SvgIcon color="action">
                            <InfoCircleIcon />
                          </SvgIcon>
                        </Tooltip>
                      </Box> */}
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

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
            {id && (
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
            )}

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

                  formik.handleSubmit();
                }}
                loading={formik.isSubmitting}
                disabled={formik.isSubmitting}
                sx={{ mx: 1 }}
                variant="contained"
              >
                {id != null ? t("Update") : t("Create")}
              </LoadingButton>
            </Box>
          </Box>

          {openVariantModal && (
            <VariantModal
              productData={{
                existingSKU,
                companyRef,
                companyName,
                productNameEn: formik.values.productNameEn,
                productNameAr: formik.values.productNameAr,
                enabledBatching: formik.values.enabledBatching,
                hasMultipleVariants: false,
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
              open={openVariantModal}
              editStock={editStock}
              createNew={createNew}
              handleClose={() => setOpenVariantModal(false)}
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

          {openBatchModal && (
            <BatchSelectModal
              itemIndex={batchIdx}
              itemdata={formik.values.singleVariantStocks?.[batchIdx]}
              productSku={formik.values?.singleVsku}
              productRef={id}
              companyRef={companyRef?.toString()}
              handleAddEditAction={handleAddEditBatchAction}
              open={openBatchModal}
              handleClose={() => {
                setOpenBatchModal(false);
                setBatchIdx(null);
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
