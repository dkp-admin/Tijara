import { Edit } from "@mui/icons-material";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  FormControlLabel,
  Grid,
  IconButton,
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
  TextFieldProps,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import endpoint from "src/api/endpoints";
import serviceCaller from "src/api/serviceCaller";
import ConfirmationDialog from "src/components/confirmation-dialog";
import BoxAutoCompleteDropdown from "src/components/input/box-single-select";
import LocationMultiSelect from "src/components/input/location-multiSelect";
import NewProductAutoCompleteDropdown from "src/components/input/product-single-select";
import { StockEditModal } from "src/components/modals/stock-edit-modal";
import { Seo } from "src/components/seo";
import TextFieldWrapper from "src/components/text-field-wrapper";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { usePageView } from "src/hooks/use-page-view";
import i18n from "src/i18n";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import UpgradePackage from "src/pages/upgrade-package";
import NoPermission from "src/pages/no-permission";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { DropdownOptions } from "src/types/dropdown";
import type { Page as PageType } from "src/types/page";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { Screens } from "src/utils/screens-names";
import useActiveTabs from "src/utils/use-active-tabs";
import { useCurrency } from "src/utils/useCurrency";
import { useDebounce } from "use-debounce";
import * as Yup from "yup";

const Options: DropdownOptions[] = [
  {
    label: i18n.t("Box"),
    value: "box",
  },
  {
    label: i18n.t("Crate"),
    value: "crate",
  },
];

interface CreateBoxesProps {
  code?: string;
  costPrice?: string;
  price?: string;
  prices: any[];
  nameEn?: string;
  nameAr?: string;
  type?: string;
  qty?: string;
  description?: string;
  assignedToAll?: boolean;
  locationRefs?: string[];
  stockConfiguration?: any[];
  locations?: string[];
  status: boolean;
  boxSku: string;
  crateSku: string;
  newLocations: any[];
  nonSaleable: boolean;
  crateProduct?: any;
  boxProduct?: any;
  boxRef: string;
  boxNameEn: string;
  boxNameAr: string;
  boxCode: string;
  currency: string;
}

const CreateBoxes: PageType = () => {
  const router = useRouter();
  const { id, companyRef, companyName, origin, industry } = router.query;
  const { t } = useTranslation();

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

        router.back();
      }}
    >
      {t("Boxes and Crates")}
    </Link>,
    <Link underline="hover" key="2" color="inherit" href="#">
      {id != null ? t("Edit Box/Crate") : t("Create Box/Crate")}
    </Link>,
  ];

  const { changeTab } = useActiveTabs();
  usePageView();
  const [showDialogDeleteItem, setShowDialogDeleteItem] = useState(false);
  const { canAccessModule } = useFeatureModuleManager();
  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["boxes-crates:update"]);
  const canCreate = canAccess(MoleculeType["boxes-crates:create"]);

  const [currentToggledSwitch, setCurrentToggledSwitch] = useState(null);
  const [showStockDialogEvent, setShowStockDialogEvent] = useState(false);
  const [updatedCount, setUpdatedCount] = useState<number | null>(0);
  const [generateApi, setGenerateApi] = useState(true);
  const [generateSkuHide, setGenerateSkuHide] = useState(false);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [singleVariantStocks, setSingleVariantStocks] = useState([]);
  const { mode } = router.query;
  const { findOne, create, updateEntity, deleteEntity, entity, loading } =
    useEntity("boxes-crates");
  const { find: findLocation, entities: locations } = useEntity("location");
  const { find: findRelation, entities } = useEntity("boxes-crates/product");
  const { create: stockCreate } = useEntity("stock-history");
  const theme = useTheme();

  const lng = localStorage.getItem("currentLanguage");
  const currency = useCurrency();
  const [openStockModal, setOpenStockModal] = useState(false);
  const [stockIdx, setStockIdx] = useState(null);
  const newdd: any = entities;

  const [, setShowError] = useState(false);

  const initialValues: CreateBoxesProps = {
    code: "",
    costPrice: "",
    price: "",
    prices: [],
    nameEn: "",
    nameAr: "",
    type: "box",
    qty: "",
    description: "",
    stockConfiguration: [],
    assignedToAll: false,
    locationRefs: [],
    locations: [],
    status: true,
    boxSku: "",
    crateSku: "",
    newLocations: [],
    nonSaleable: false,
    crateProduct: null,
    boxProduct: null,
    boxRef: "",
    boxNameEn: "",
    boxNameAr: "",
    boxCode: "",
    currency,
  };

  const validationSchema = Yup.object({
    nameEn: Yup.string()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid name")
      )
      .required(`${t(" Name is required in English")}`)
      .max(60, "Name must not be greater than 60 characters"),
    nameAr: Yup.string()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid name")
      )
      .required(`${t(" Name is required in Arabic")}`)
      .max(60, "Name must not be greater than 60 characters"),
    costPrice: Yup.string().required(t("Cost Price is required")),
    price: Yup.string().required(t("Selling Price is required")),
    qty: Yup.number()
      .required(t("Count is required"))
      .min(1, t("Count must be greater than 0")),

    boxProduct: Yup.object().when("type", {
      is: "box",
      then: Yup.object().required(t("Please add product")).nullable(),
      otherwise: Yup.object().optional().nullable(),
    }),
    crateProduct: Yup.object().when("type", {
      is: "crate",
      then: Yup.object().required(t("Please add box")).nullable(),
      otherwise: Yup.object().optional().nullable(),
    }),
    boxSku: Yup.string().when("type", {
      is: "box",
      then: Yup.string()
        .required(`${t("SKU is required")}`)
        .matches(
          /^[0-9]+$/,
          t(
            "Special characters, alphabets and spaces are not allowed. Only numeric values are allowed."
          )
        )
        .min(3, t("SKU should be minimum 3 digits"))
        .max(16, t("SKU should be maximum 16 digits")),
      otherwise: Yup.string().optional().nullable(),
    }),
    crateSku: Yup.string().when("type", {
      is: "crate",
      then: Yup.string()
        .matches(
          /^[0-9]+$/,
          t(
            "Special characters, alphabets and spaces are not allowed. Only numeric values are allowed."
          )
        )
        .required(`${t("SKU is required")}`)
        .min(3, t("SKU should be minimum 3 digits"))
        .max(16, t("SKU should be maximum 16 digits")),
      otherwise: Yup.string().optional().nullable(),
    }),
    code: Yup.string()
      .matches(
        /^[A-Za-z0-9]+$/,
        t(
          "Special characters and spaces are not allowed. Only alpha-numeric values are allowed."
        )
      )
      .max(30, t("Product Code should be maximum 30 digits"))
      .nullable()
      .optional(),
    locationRefs: Yup.array().when("assignedToAll", {
      is: true,
      then: Yup.array().optional(),
      otherwise: Yup.array()
        .required(i18n.t("Locations is required"))
        .min(1, i18n.t("Locations is required")),
    }),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      try {
        for (let i = 0; i < values?.stockConfiguration?.length; i++) {
          if (
            Boolean(values.stockConfiguration?.[i]?.lowStockAlert) &&
            Number(values.stockConfiguration?.[i]?.lowStockCount) < 1
          ) {
            toast.error(
              `Low stock count is required for ${values.stockConfiguration?.[i]?.location?.name}`
            );
            return;
          }
        }

        if (values.type == "box") {
          const product = await serviceCaller(
            `/product/${values.boxProduct.productRef}`,
            {
              method: "GET",
            }
          );

          const variant = product.variants.find(
            (variant: any) => variant.sku === values.boxProduct.sku
          );

          let batch: any;

          if (product.batching) {
            batch = await serviceCaller(`/batch`, {
              method: "GET",
              query: {
                page: 0,
                limit: 50,
                _q: "",
                activeTab: "active",
                sort: "desc",
                sku: variant.sku,
                companyRef: companyRef,
              },
            });
          }

          const data = {
            name: {
              en: values.nameEn,
              ar: values.nameAr,
            },
            company: {
              name: companyName,
            },
            companyRef: companyRef,
            type: values.type,
            code: values?.code || "",
            costPrice: values?.costPrice,
            price: values?.price,
            qty: Number(values.qty),
            description: values.description,
            locations: values.newLocations,
            locationRefs: values.locationRefs,
            stockConfiguration: values.stockConfiguration,
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
            product: {
              name: {
                en: values.boxProduct.name.en,
                ar: values.boxProduct.name.ar,
              },
              category: {
                name: values.boxProduct.category.name,
              },
              categoryRef: values.boxProduct.categoryRef,

              brand: {
                name: values?.boxProduct?.brand?.name,
              },
              variant: {
                en:
                  values?.boxProduct?.variantNameEn ||
                  values?.boxProduct?.variant?.en,
                ar:
                  values?.boxProduct?.variantNameAr ||
                  values?.boxProduct?.variant?.ar,
              },
              brandRef: values.boxProduct?.brandRef,
              price: values.boxProduct.price,
              sku: values.boxProduct.sku,
              productRef: values.boxProduct.productRef,
              code: values.boxProduct.code,
              taxRef: values.boxProduct.taxRef,
              tax: {
                percentage: values?.boxProduct?.tax?.percentage,
              },
            },
            boxSku: values.boxSku,
            crateSku: values.crateSku,
            productSku: values.boxProduct.sku,
            nonSaleable: values.nonSaleable,
            status: values.status ? "active" : "inactive",
            currency,
          };

          // const actiondata = values.stockConfiguration
          //   .filter((valueConfig: any) => valueConfig.count)
          //   .map((valueConfig: any) => {
          //     if (id != null || valueConfig?.count > 0) {
          //       const entityConfig = entity?.stockConfiguration?.find(
          //         (ec: any) => ec?.locationRef === valueConfig?.locationRef
          //       );

          //       if (
          //         entityConfig &&
          //         entityConfig?.count === valueConfig?.count
          //       ) {
          //         return null;
          //       }

          //       return {
          //         company: { name: companyName },
          //         companyRef: companyRef,
          //         productRef: values.boxProduct.productRef,
          //         boxCrateRef: id ? id : null,
          //         product: {
          //           name: {
          //             en: values.boxProduct?.name.en,
          //             ar: values.boxProduct?.name.ar,
          //           },
          //           type: "item",
          //           unit: 1,
          //           costPrice: values.boxProduct.costPrice || 0,
          //           sellingPrice: values.boxProduct.price,
          //           qty: Number(valueConfig?.count) * Number(values.qty),
          //           sku: values.boxProduct.sku,
          //         },
          //         boxCrateData: {
          //           name: { en: values.nameEn, ar: values.nameAr },
          //           type: "box",
          //           unit: Number(values.qty),
          //           costPrice: values.costPrice,
          //           sellingPrice: values.price,
          //           qty: valueConfig?.count,
          //           sku: values.boxSku,
          //         },
          //         category: { name: values.boxProduct.category?.name },
          //         categoryRef: values.boxProduct.categoryRef,
          //         expiry: null,
          //         variant: {
          //           name: { en: values.nameEn, ar: values.nameAr },
          //           type: "box",
          //           unit: values.qty,
          //           costPrice: values.costPrice,
          //           sellingPrice: values.price,
          //           qty: Number(valueConfig?.count),
          //           sku: values.boxProduct.sku,
          //         },
          //         sku: values.boxSku,
          //         locationRef: valueConfig?.locationRef,
          //         location: { name: valueConfig?.location?.name },
          //         hasMultipleVariants: values.boxProduct.hasMultipleVariants,
          //         price: values.price,
          //         count: Number(valueConfig?.count),
          //         currentStockCount: Number(valueConfig?.count),
          //         previousStockCount:
          //           id != null ? Number(entityConfig?.count) : 0,
          //         action: "inventory-re-count",
          //       };
          //     }
          //   })
          //   .filter(Boolean);

          const productActiondata = values?.stockConfiguration
            .filter((boxConfig: any) => Boolean(boxConfig?.isChangeInItem))
            .map((boxConfig: any) => {
              const valueConfig = variant?.stockConfiguration?.find(
                (ec: any) => ec?.locationRef === boxConfig?.locationRef
              );

              const batchData = batch?.results?.find(
                (ec: any) => ec?.locationRef === boxConfig?.locationRef
              );

              return {
                company: { name: product.company.name },
                companyRef: product.companyRef,
                productRef: product._id,
                product: {
                  name: { en: product.name.en, ar: product.name.ar },
                },
                locationRef: boxConfig.locationRef,
                location: boxConfig.location,
                category: { name: product.category.name },
                categoryRef: product.categoryRef,
                variant: {
                  name: { en: variant.name.en, ar: variant.name.ar },
                  type: "item",
                  unit: 1,
                  qty: Number(boxConfig?.count) * Number(values.qty),
                  sku: variant.sku,
                  costPrice: variant.costPrice,
                  sellingPrice: variant.price,
                },
                hasMultipleVariants: product.variants.length > 1,
                sku: variant.sku,
                batching: batchData?._id ? product.batching : false,
                action: "inventory-re-count",
                price: Number(variant.price),
                count: Number(boxConfig?.count) * Number(values.qty),
                destRef:
                  product.batching && batchData?._id ? batchData._id : "",
                sourceRef: "",
                available: Number(boxConfig?.count) * Number(values.qty),
                previousStockCount: Number(valueConfig?.count || 0),
                auto: true,
              };
            })
            .filter(Boolean);

          if (id != null) {
            await updateEntity(id?.toString(), { ...data });
          } else {
            await create({ ...data });
          }
          if (productActiondata.length > 0) {
            // await Promise.all(
            //   actiondata.map(async (action: any) => {
            //     await stockCreate({ ...action });
            //   })
            // );
            await Promise.all(
              productActiondata.map(async (action: any) => {
                await stockCreate({ ...action });
              })
            );
          }
        } else {
          const box = await serviceCaller(
            `/boxes-crates/${formik.values.boxRef}`,
            { method: "GET" }
          );

          const product = await serviceCaller(
            `/product/${values.crateProduct?.productRef}`,
            { method: "GET" }
          );

          const variant = product.variants.find(
            (variant: any) => variant.sku === values.crateProduct.sku
          );

          let batch: any;

          if (product.batching) {
            batch = await serviceCaller(`/batch`, {
              method: "GET",
              query: {
                page: 0,
                limit: 50,
                _q: "",
                activeTab: "active",
                sort: "desc",
                sku: variant.sku,
                companyRef: companyRef,
              },
            });
          }

          const crateData = {
            name: {
              en: values.nameEn,
              ar: values.nameAr,
            },
            company: {
              name: companyName,
            },
            companyRef: companyRef,
            type: values.type,
            qty: Number(values.qty),
            code: values?.code || "",
            costPrice: values?.costPrice,
            price: values?.price,
            description: values.description || "",
            locations: values.newLocations,
            locationRefs: values.locationRefs,
            box: {
              boxRef: values.boxRef,
              name: {
                en: values.boxNameEn,
                ar: values.boxNameAr,
              },
              sku: values.boxSku,
              code: values.boxCode,
              price: box.price,
            },
            boxRef: values.boxRef,
            boxName: {
              en: values.boxNameEn,
              ar: values.boxNameAr,
            },
            prices: locations.results?.map((ref) => {
              return {
                price: values.price,
                costPrice: values.costPrice,
                locationRef: ref._id,
                location: { name: ref.name.en },
              };
            }),
            product: {
              name: {
                en: values.crateProduct?.name?.en,
                ar: values.crateProduct?.name?.ar,
              },
              category: {
                name: values.crateProduct?.category?.name,
              },
              categoryRef: values.crateProduct?.categoryRef,
              brand: {
                name: values.crateProduct?.brand.name,
              },
              brandRef: values?.crateProduct?.brandRef,
              price: values.crateProduct?.price,
              sku: values.crateProduct?.sku,
              productRef: values.crateProduct?.productRef,
              code: values.crateProduct?.code,
              taxRef: values.crateProduct.taxRef,
              tax: {
                percentage: values.crateProduct.tax?.percentage,
              },
              variant: {
                en:
                  values?.boxProduct?.variantNameEn ||
                  values?.boxProduct?.variant?.en,
                ar:
                  values?.boxProduct?.variantNameAr ||
                  values?.boxProduct?.variant?.ar,
              },
            },
            stockConfiguration: values.stockConfiguration,
            boxSku: values.boxSku,
            crateSku: values.crateSku,
            productSku: values.crateProduct?.sku,
            nonSaleable: values.nonSaleable,
            status: values.status ? "active" : "inactive",
            currency,
          };

          const actiondata = values.stockConfiguration
            .filter((valueConfig: any) => valueConfig?.count)
            .map((valueConfig: any) => {
              if (id != null || valueConfig?.count > 0) {
                const entityConfig = entity?.stockConfiguration?.find(
                  (ec: any) => ec?.locationRef === valueConfig?.locationRef
                );

                if (
                  entityConfig &&
                  entityConfig?.count === valueConfig?.count
                ) {
                  return null;
                }

                return {
                  company: { name: companyName },
                  companyRef: companyRef,
                  productRef: values.crateProduct.productRef,
                  boxCrateRef: id ? id : null,
                  product: {
                    name: { en: product.name.en, ar: product.name.ar },
                    type: "item",
                    unit: 1,
                    costPrice: variant.costPrice,
                    sellingPrice: variant.price,
                    qty: Number(valueConfig?.count) * Number(values.qty),
                    sku: variant.sku,
                  },
                  boxCrateData: {
                    name: { en: values?.nameEn, ar: values?.nameAr },
                    type: "crate",
                    unit: Number(values.qty),
                    costPrice: values.costPrice,
                    sellingPrice: values.price,
                    qty: valueConfig?.count,
                    sku: values.crateSku,
                  },
                  category: { name: product.category.name },
                  categoryRef: product.categoryRef,
                  expiry: null,
                  variant: {
                    name: { en: values.nameEn, ar: values.nameAr },
                    type: "crate",
                    unit: values.qty,
                    costPrice: variant.costPrice,
                    sellingPrice: variant.price,
                    qty: Number(valueConfig?.count),
                    sku: values.crateProduct.sku,
                  },
                  sku: values.crateSku,
                  locationRef: valueConfig?.locationRef,
                  location: { name: valueConfig?.location?.name },
                  hasMultipleVariants: product?.variant?.length > 1,
                  price: values.price,
                  count: Number(valueConfig?.count),
                  currentStockCount: Number(valueConfig?.count),
                  previousStockCount:
                    id != null ? Number(entityConfig?.count) : 0,
                  action: "inventory-re-count",
                };
              }
            })
            .filter(Boolean);

          const boxActiondata = values?.stockConfiguration
            .filter((valueConfig: any) => Boolean(valueConfig?.isChangeInItem))
            .map((valueConfig: any) => {
              const boxConfig = box?.stockConfiguration?.find(
                (ec: any) => ec?.locationRef === valueConfig?.locationRef
              );

              return {
                company: { name: companyName },
                companyRef: companyRef,
                productRef: values.crateProduct.productRef,
                boxCrateRef: values.boxRef,
                product: {
                  name: { en: product.name.en, ar: product.name.ar },
                  type: "item",
                  unit: 1,
                  costPrice: variant.costPrice,
                  sellingPrice: variant.price,
                  qty:
                    Number(valueConfig?.count) *
                    Number(values.qty) *
                    Number(box.qty),
                  sku: values.crateProduct.sku,
                },
                boxCrateData: {
                  name: { en: values?.boxNameEn, ar: values?.boxNameAr },
                  type: "box",
                  unit: Number(box.qty),
                  costPrice: box.costPrice,
                  sellingPrice: box.price,
                  qty: Number(valueConfig?.count) * Number(box?.qty),
                  sku: values.boxSku,
                },
                category: { name: product.category.name },
                categoryRef: product.categoryRef,
                variant: {
                  name: { en: box.name.en, ar: box.name.ar },
                  type: "box",
                  unit: box.qty,
                  costPrice: box.costPrice,
                  sellingPrice: box.price,
                  qty: Number(valueConfig?.count) * Number(values.qty),
                  sku: values.crateProduct.sku,
                },
                sku: values.boxSku,
                locationRef: valueConfig?.locationRef,
                location: { name: valueConfig?.location?.name },
                hasMultipleVariants: product?.variants?.length > 1,
                price: box.price,
                count: Number(valueConfig?.count) * Number(values.qty),
                currentStockCount:
                  Number(valueConfig?.count) * Number(values.qty),
                previousStockCount: Number(boxConfig?.count || 0),
                action: "inventory-re-count",
                auto: true,
              };
            })
            .filter(Boolean);

          const productActiondata = values?.stockConfiguration
            .filter((valueConfig: any) => Boolean(valueConfig?.isChangeInItem))
            .map((valueConfig: any) => {
              const configbox = box?.stockConfiguration?.find(
                (ec: any) => ec?.locationRef === valueConfig?.locationRef
              );

              const configProduct = variant?.stockConfiguration?.find(
                (ec: any) => ec?.locationRef === configbox?.locationRef
              );

              const batchData = batch?.results?.find(
                (ec: any) => ec?.locationRef === valueConfig?.locationRef
              );

              return {
                company: { name: companyName },
                companyRef: companyRef,
                productRef: values.crateProduct.productRef,
                product: {
                  name: { en: product?.name.en, ar: product?.name.ar },
                },
                locationRef: valueConfig.locationRef,
                location: valueConfig.location,
                category: { name: product.category?.name },
                categoryRef: product.categoryRef,
                variant: {
                  name: { en: variant?.name?.en, ar: variant?.name.ar },
                  type: "item",
                  unit: 1,
                  qty:
                    Number(valueConfig?.count) *
                    Number(values?.qty) *
                    Number(box?.qty),
                  sku: variant.sku,
                  costPrice: variant.costPrice,
                  sellingPrice: variant.price,
                },
                hasMultipleVariants: product?.variant?.length > 1,
                sku: values.crateProduct.sku,
                action: "inventory-re-count",
                expiry: valueConfig.expiry || null,
                price: Number(variant.price),
                count:
                  Number(valueConfig?.count) *
                  Number(values?.qty) *
                  Number(box?.qty),
                batching: batchData?._id ? product.batching : false,
                destRef:
                  product.batching && batchData?._id ? batchData._id : "",
                sourceRef: "",
                available:
                  Number(valueConfig?.count) *
                  Number(values?.qty) *
                  Number(box?.qty),
                previousStockCount: Math.abs(Number(configProduct?.count)),
                auto: true,
              };
            })
            .filter(Boolean);

          if (id != null) {
            await updateEntity(id?.toString(), { ...crateData });
          } else {
            await create({ ...crateData });
          }
          if (actiondata.length > 0) {
            await Promise.all(
              actiondata.map(async (action: any) => {
                await stockCreate({ ...action });
              })
            );
            await Promise.all(
              boxActiondata.map(async (action: any) => {
                await stockCreate({ ...action });
              })
            );
            await Promise.all(
              productActiondata.map(async (action: any) => {
                await stockCreate({ ...action });
              })
            );
          }
        }

        toast.success(
          id == null
            ? `${values?.type == "box" ? t("Box Created") : t("Crate Created")}`
            : `${values?.type == "box" ? t("Box Updated") : t("Crate Updated")}`
        );
        if (origin == "company") {
          changeTab("catalogue", Screens?.companyDetail);
        }
        router.back();
      } catch (err) {
        if (err?.error?.message === "sku_exists") {
          toast.error(t("SKU already exist!"));
          return;
        }
        toast.error(err.message);
      }
    },
  });

  const handleAddEditStockAction = useCallback(
    (newData: any, locationRef: string) => {
      const existingStocks = formik.values.stockConfiguration;

      const stockIndex = existingStocks.findIndex(
        (stock: any) => stock.locationRef === locationRef
      );

      if (stockIndex !== -1) {
        const updatedStocks = [...existingStocks];
        updatedStocks[stockIndex] = {
          ...existingStocks[stockIndex],
          ...newData,
        };

        formik.setFieldValue("stockConfiguration", updatedStocks);
      } else {
        toast.error("No matching locationRef found.");
      }
    },
    [formik.values.stockConfiguration]
  );

  const generateUniqueSku = async () => {
    if (generateApi) {
      try {
        const res = await serviceCaller(endpoint.generateUniqueSKU.path, {
          method: endpoint.generateUniqueSKU.method,
        });

        if (res?.sku) {
          setGenerateApi(false);
          setGenerateSkuHide(true);
          if (formik.values.type == "box") {
            formik.setFieldValue("boxSku", res.sku);
          } else {
            formik.setFieldValue("crateSku", res.sku);
          }
        }
      } catch (error: any) {
        if (formik.values.type == "box") {
          formik.setFieldValue("boxSku", "");
        } else {
          formik.setFieldValue("crateSku", "");
        }
      }
    }
  };

  useEffect(() => {
    if (id != null) {
      findOne(id?.toString());
    }
  }, [id]);

  useEffect(() => {
    if (id != null) {
      findRelation({
        page: page,
        sort: sort,
        limit: 100,
        productRef: entity?.product?.productRef?.toString(),
        companyRef: companyRef.toString(),
      });
    }
  }, [entity]);

  useEffect(() => {
    if (formik.values?.boxSku === "" && id) {
      setGenerateApi(true);
    }
  }, [formik.values?.boxSku]);

  useEffect(() => {
    if (entity != null) {
      const loc = entity?.locations?.map((d: any) => {
        return d?.name;
      });

      const locRefs = entity?.locations?.map((d: any) => {
        return d?.locationRef;
      });

      if (locations?.results?.length == entity?.locationRefs?.length) {
        formik.setFieldValue("assignedToAll", true);
      } else {
        formik.setFieldValue("assignedToAll", false);
      }
      formik.setFieldValue("boxSku", entity?.boxSku);
      formik.setFieldValue("boxRef", entity?.boxRef);
      formik.setFieldValue("boxNameEn", entity?.boxName?.en);
      formik.setFieldValue("boxNameAr", entity?.boxName?.ar);
      formik.setFieldValue("nameEn", entity?.name?.en);
      formik.setFieldValue("nameAr", entity?.name?.ar);
      formik.setFieldValue("product", entity?.product);

      formik.setFieldValue("newLocations", entity?.locations);
      formik.setFieldValue("locations", loc);
      formik.setFieldValue("locationRefs", locRefs);

      if (entity?.type == "box") {
        formik.setFieldValue("boxProduct", entity?.product);
      } else {
        formik.setFieldValue("crateProduct", entity?.product);
      }
      formik.setFieldValue("type", entity?.type);
      formik.setFieldValue("qty", entity?.qty);
      formik.setFieldValue("boxSku", entity?.boxSku);
      formik.setFieldValue("crateSku", entity?.crateSku);
      formik.setFieldValue("description", entity?.description);
      formik.setFieldValue("costPrice", entity?.costPrice);
      formik.setFieldValue("price", entity?.price);
      formik.setFieldValue("code", entity?.code || "");
      formik.setFieldValue("nonSaleable", entity?.nonSaleable);
      formik.setFieldValue("currency", entity?.currency || "SAR");
      formik.setFieldValue(
        "stockConfiguration",
        entity?.stockConfiguration?.map((stock: any) => {
          if (locRefs?.includes(stock?.locationRef)) {
            return stock;
          }
        }) || []
      );
      formik.setFieldValue("status", entity?.status == "active" ? true : false);
    }
  }, [entity, locations]);

  useEffect(() => {
    if (companyRef) {
      findLocation({
        page: 0,
        limit: 100,
        _q: "",
        activeTab: "active",
        sort: "asc",
        companyRef: companyRef.toString(),
      });
    }
  }, [companyRef]);

  useEffect(() => {
    if (locations.results?.length > 0) {
      const initialStock = locations.results.map((location) => {
        const stock = entity?.stockConfiguration.find(
          (stock: any) => stock?.locationRef === location._id
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
      formik.setFieldValue("stockConfiguration", initialStock);
    }
  }, [locations.results, entity]);

  console.log(formik.values);

  useEffect(() => {
    const singleVariantStocks = formik.values.assignedToAll
      ? formik.values.stockConfiguration
      : formik.values?.stockConfiguration?.filter((stockDetail: any) =>
          formik.values.locationRefs?.includes(stockDetail?.locationRef)
        );
    setSingleVariantStocks(singleVariantStocks);
  }, [
    formik.values.assignedToAll,
    formik.values.locationRefs,
    formik.values.stockConfiguration,
  ]);

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

  if (!canAccessModule("account")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["boxes-crates:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo
        title={
          id != null ? `${t("Edit Box/Crate")}` : `${t("Create Box/Crate ")}`
        }
      />
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
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
                    width: 420,
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
                {id != null ? t("Edit Box/Crate") : t("Create Box/Crate")}
              </Typography>
            </Stack>

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4} sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">
                          {t("Box and Crate Details")}
                        </Typography>
                      </Grid>

                      <Grid item md={8} xs={12}>
                        <Box sx={{ mt: 3 }}>
                          <TextField
                            disabled={id != null}
                            error={
                              !!(formik.touched.type && formik.errors.type)
                            }
                            fullWidth
                            label={t("Type")}
                            name="type"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            select
                            value={formik.values.type}
                            required
                          >
                            {Options.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Box>

                        <Box sx={{ mt: 2 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            autoComplete="off"
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            fullWidth
                            label={t("Name (English)")}
                            name="nameEn"
                            error={Boolean(
                              formik.touched.nameEn && formik.errors.nameEn
                            )}
                            helperText={
                              formik.touched.nameEn && formik.errors.nameEn
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            required
                            value={formik.values.nameEn}
                          />
                        </Box>
                        <Box sx={{ mt: 2 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            autoComplete="off"
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            fullWidth
                            label={t("Name (Arabic)")}
                            name="nameAr"
                            error={Boolean(
                              formik.touched.nameAr && formik.errors.nameAr
                            )}
                            helperText={
                              formik.touched.nameAr && formik.errors.nameAr
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            required
                            value={formik.values.nameAr}
                          />
                        </Box>

                        {formik.values.type == "box" && (
                          <Box sx={{ mt: 3 }}>
                            <NewProductAutoCompleteDropdown
                              error={Boolean(
                                formik.touched.boxProduct &&
                                  formik.errors.boxProduct
                              )}
                              helperText={
                                (formik.touched.boxProduct &&
                                  formik.errors.boxProduct) as any
                              }
                              required={true}
                              disabled={id != null}
                              id="new-product-auto-complete"
                              label={t("Product")}
                              locationRefs={formik.values.locationRefs}
                              selectedId={formik.values.boxProduct?.sku}
                              companyRef={companyRef as string}
                              onChange={(data: any) => {
                                formik.setFieldValue("boxProduct", data);

                                if (!id) {
                                  const newStockConfig =
                                    data.stockConfiguration;

                                  const updatedStockConfiguration =
                                    formik.values.stockConfiguration.map(
                                      (stockItem: any) => {
                                        const matchingConfig =
                                          newStockConfig.find(
                                            (newItem: any) =>
                                              newItem.locationRef ===
                                              stockItem.locationRef
                                          );

                                        if (matchingConfig) {
                                          return {
                                            ...stockItem,
                                            tracking: matchingConfig.tracking,
                                          };
                                        }

                                        return stockItem;
                                      }
                                    );

                                  formik.setFieldValue(
                                    "stockConfiguration",
                                    updatedStockConfiguration
                                  );
                                }
                              }}
                            />
                          </Box>
                        )}

                        {formik.values.type == "crate" && (
                          <Box sx={{ mt: 3 }}>
                            <BoxAutoCompleteDropdown
                              error={Boolean(
                                formik.touched.crateProduct &&
                                  formik.errors.crateProduct
                              )}
                              helperText={
                                (formik.touched.crateProduct &&
                                  formik.errors.crateProduct) as any
                              }
                              required={true}
                              disabled={id != null}
                              id="new-product-auto-complete"
                              label={t("Box")}
                              locationRefs={formik.values.locationRefs}
                              selectedId={formik.values.boxSku}
                              companyRef={companyRef as string}
                              onChange={(data: any) => {
                                formik.setFieldValue("boxRef", data?.boxRef);
                                formik.setFieldValue("boxSku", data?.boxSku);
                                formik.setFieldValue("item", data);
                                formik.setFieldValue(
                                  "crateProduct",
                                  data?.product
                                );
                                formik.setFieldValue(
                                  "boxNameEn",
                                  data?.name?.en
                                );
                                formik.setFieldValue(
                                  "boxNameAr",
                                  data?.name?.ar
                                );
                                formik.setFieldValue("boxCode", data?.code);

                                console.log(data, "data");

                                if (!id) {
                                  const newStockConfig =
                                    data.stockConfiguration;

                                  const updatedStockConfiguration =
                                    formik.values.stockConfiguration.map(
                                      (stockItem: any) => {
                                        const matchingConfig =
                                          newStockConfig.find(
                                            (newItem: any) =>
                                              newItem.locationRef ===
                                              stockItem.locationRef
                                          );

                                        if (matchingConfig) {
                                          return {
                                            ...stockItem,
                                            tracking: matchingConfig.tracking,
                                          };
                                        }

                                        return stockItem;
                                      }
                                    );

                                  formik.setFieldValue(
                                    "stockConfiguration",
                                    updatedStockConfiguration
                                  );
                                }
                              }}
                            />
                          </Box>
                        )}

                        <Box sx={{ mt: 3, mb: 3 }}>
                          <TextField
                            sx={{
                              "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                                {
                                  display: "none",
                                },
                              "& input[type=number]": {
                                MozAppearance: "textfield",
                              },
                            }}
                            type="number"
                            required
                            error={Boolean(
                              formik.touched.qty && formik.errors.qty
                            )}
                            helperText={
                              (formik.touched.qty && formik.errors.qty) as any
                            }
                            label={
                              formik.values?.type == "box"
                                ? t("Product Count.")
                                : t("Box Count.")
                            }
                            name="qty"
                            fullWidth
                            onChange={(e) => {
                              const val = e.target.value;
                              const regex = /^[0-9\b]+$/;

                              if (val === "" || regex.test(val)) {
                                formik.setFieldValue("qty", val);
                              }
                            }}
                            onPaste={(e) => {
                              const paste = e.clipboardData.getData("text");
                              const filteredPaste = paste.replace(
                                /[^0-9]/g,
                                ""
                              );
                              e.preventDefault();
                              formik.setFieldValue("qty", filteredPaste);
                            }}
                            onKeyDown={(event) => {
                              if (
                                event.key == "." ||
                                event.key === "+" ||
                                event.key === "-"
                              ) {
                                event.preventDefault();
                              }
                            }}
                            value={formik.values.qty}
                          />
                        </Box>

                        <Box>
                          {formik.values.type == "box" && (
                            <TextField
                              disabled={id != null}
                              sx={{
                                "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                                  {
                                    display: "none",
                                  },
                                "& input[type=number]": {
                                  MozAppearance: "textfield",
                                },
                              }}
                              type="number"
                              fullWidth
                              label={t("Box SKU")}
                              name="boxSku"
                              error={Boolean(
                                formik.touched.boxSku && formik.errors.boxSku
                              )}
                              helperText={
                                (formik.touched.boxSku &&
                                  formik.errors.boxSku) as any
                              }
                              onBlur={formik.handleBlur}
                              onChange={(e) => {
                                const val = e.target.value;
                                const regex = /^[0-9\b]+$/;

                                if (val === "" || regex.test(val)) {
                                  formik.setFieldValue("boxSku", val);
                                }
                              }}
                              onPaste={(e) => {
                                const paste = e.clipboardData.getData("text");
                                const filteredPaste = paste.replace(
                                  /[^0-9]/g,
                                  ""
                                );
                                e.preventDefault();
                                formik.setFieldValue("boxSku", filteredPaste);
                              }}
                              onKeyPress={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                }
                              }}
                              onKeyDown={(event) => {
                                if (
                                  event.key == "." ||
                                  event.key === "+" ||
                                  event.key === "-"
                                ) {
                                  event.preventDefault();
                                }
                              }}
                              required
                              value={formik.values.boxSku}
                            />
                          )}

                          {formik.values.type == "box" &&
                            !formik.values?.boxSku &&
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

                          {formik.values.type == "crate" && (
                            <TextField
                              disabled={id != null}
                              sx={{
                                "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                                  {
                                    display: "none",
                                  },
                                "& input[type=number]": {
                                  MozAppearance: "textfield",
                                },
                              }}
                              type="number"
                              fullWidth
                              label={t("Crate SKU")}
                              name="crateSku"
                              error={Boolean(
                                formik.touched.crateSku &&
                                  formik.errors.crateSku
                              )}
                              helperText={
                                (formik.touched.crateSku &&
                                  formik.errors.crateSku) as any
                              }
                              onBlur={formik.handleBlur}
                              onChange={(e) => {
                                const val = e.target.value;
                                const regex = /^[0-9\b]+$/;
                                if (val === "" || regex.test(val)) {
                                  formik.setFieldValue("crateSku", val);
                                }
                              }}
                              onKeyPress={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                }
                              }}
                              onKeyDown={(event) => {
                                if (
                                  event.key == "." ||
                                  event.key === "+" ||
                                  event.key === "-"
                                ) {
                                  event.preventDefault();
                                }
                              }}
                              onPaste={(e) => {
                                const paste = e.clipboardData.getData("text");
                                const filteredPaste = paste.replace(
                                  /[^0-9]/g,
                                  ""
                                );
                                e.preventDefault();
                                formik.setFieldValue("crateSku", filteredPaste);
                              }}
                              required
                              value={formik.values.crateSku}
                            />
                          )}

                          {formik.values.type == "crate" &&
                            !formik.values?.crateSku &&
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

                        <Box sx={{ mt: 3, mx: 0.5 }}>
                          <TextFieldWrapper
                            fullWidth
                            label={
                              formik.values.type == "box"
                                ? t("Box Code")
                                : t("Crate Code")
                            }
                            name="code"
                            error={Boolean(formik.errors.code)}
                            helperText={formik.errors.code}
                            onKeyPress={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                              }
                            }}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.code}
                          />
                        </Box>

                        <Box sx={{ mt: 3, mx: 0.5 }}>
                          <TextFieldWrapper
                            autoComplete="off"
                            fullWidth
                            required
                            label={t("Cost price")}
                            name="costPrice"
                            error={Boolean(
                              formik.touched.costPrice &&
                                formik.errors.costPrice
                            )}
                            helperText={
                              (formik.touched.costPrice &&
                                formik.errors.costPrice) as any
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

                          <Typography
                            variant="body2"
                            color={"#ff9100"}
                            sx={{ mt: 2 }}
                          >
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
                            label={t("Selling price")}
                            name="price"
                            error={Boolean(
                              formik.touched.price && formik.errors.price
                            )}
                            helperText={
                              (formik.touched.price &&
                                formik.errors.price) as any
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
                          />
                          <Typography
                            variant="body2"
                            color={"#ff9100"}
                            sx={{ mt: 2 }}
                          >
                            {Number(formik.values.price) > 9999.99
                              ? `${t("Amount exceeds 4 digits")}`
                              : ""}
                          </Typography>
                        </Box>

                        <Box sx={{ mt: 3, mb: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            autoComplete="off"
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            label={t("Description")}
                            name="description"
                            multiline
                            rows={4}
                            fullWidth
                            onChange={formik.handleChange("description")}
                            value={formik.values.description}
                          />
                        </Box>

                        <Box
                          sx={{
                            mt: 3,
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
                            {t("Non Saleable")}
                          </Typography>

                          <Box
                            sx={{
                              p: 1,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Switch
                              color="primary"
                              edge="end"
                              name="nonSaleable"
                              // disabled={id != null}
                              checked={formik.values.nonSaleable}
                              onChange={(e) => {
                                if (formik.values.nonSaleable) {
                                  toast(
                                    `${t(
                                      `${
                                        formik.values.type === "crate"
                                          ? "Crate"
                                          : "Box"
                                      } set as saleable`
                                    )}`
                                  );
                                } else {
                                  toast(
                                    `${t(
                                      `${
                                        formik.values.type === "crate"
                                          ? "Crate"
                                          : "Box"
                                      } set as non-saleable`
                                    )}`
                                  );
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
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={12} xs={12}>
                        <Box>
                          <LocationMultiSelect
                            showAllLocation={formik.values.assignedToAll}
                            companyRef={companyRef}
                            selectedIds={formik.values.locationRefs}
                            required
                            id={"locations"}
                            error={
                              formik.touched.locationRefs &&
                              formik.errors.locationRefs
                            }
                            onChange={(option: any, total: number) => {
                              // formik.setFieldValue("selectedLocations", option);
                              if (option?.length > 0) {
                                const newLoc = option?.map((d: any) => {
                                  return {
                                    name: d?.name?.en,
                                    locationRef: d?._id,
                                  };
                                });
                                formik.setFieldValue("newLocations", newLoc);

                                const ids = option.map((option: any) => {
                                  return option._id;
                                });

                                const names = option.map((option: any) => {
                                  return option.name.en;
                                });

                                if (ids.length == total) {
                                  formik.setFieldValue("assignedToAll", true);
                                } else {
                                  formik.setFieldValue("assignedToAll", false);
                                }

                                formik.setFieldValue("locationRefs", ids);
                                formik.setFieldValue("locations", names);
                              } else {
                                formik.setFieldValue("locationRefs", []);
                                formik.setFieldValue("locations", []);
                                formik.setFieldValue("assignedToAll", false);
                              }
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"space-between"}
                        item
                        md={12}
                        xs={12}
                      >
                        <Typography variant="h6">
                          {t("Stock Management")}
                        </Typography>
                      </Grid>

                      <Grid item container spacing={3}>
                        <Grid item md={12} xs={12}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>{t("Location Name")}</TableCell>
                                <TableCell>
                                  {t("Billing availability")}
                                </TableCell>
                                <TableCell>{t("Stock tracking")}</TableCell>
                                <TableCell>{t("Stocks")}</TableCell>
                                <TableCell>{t("Low stock alert")}</TableCell>
                                <TableCell>{t("Alert Count")}</TableCell>
                                {id != null &&
                                  (formik.values.type == "box"
                                    ? formik.values.boxProduct?.batching
                                    : formik.values.crateProduct?.batching) && (
                                    <TableCell>{t("Expiry")}</TableCell>
                                  )}
                              </TableRow>
                            </TableHead>

                            <TableBody>
                              {formik.values?.stockConfiguration?.length ===
                              0 ? (
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
                                            {t("No stock found!")}
                                          </Typography>
                                        }
                                      />
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ) : (
                                singleVariantStocks?.map(
                                  (stockDetail: any, index: number) => {
                                    return (
                                      <TableRow key={stockDetail?.locationRef}>
                                        <TableCell>
                                          <Typography variant="body2">
                                            {stockDetail?.location?.name}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              flexDirection: "row",
                                              textWrap: "nowrap",
                                              alignItems: "center",
                                            }}
                                          >
                                            {stockDetail?.availability
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
                                                      ?.stockConfiguration,
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
                                                    ].availability =
                                                      e.target.checked;
                                                    formik.setFieldValue(
                                                      "stockConfiguration",
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
                                                    ?.stockConfiguration,
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
                                                    "stockConfiguration",
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
                                                `Disabling this ${
                                                  formik.values.type === "crate"
                                                    ? "crate"
                                                    : "box"
                                                } will prevent you from billing it, even if there is stock. Are you sure you want to disable it?`
                                              )}
                                            />
                                          </Box>
                                        </TableCell>
                                        <TableCell>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              flexDirection: "row",
                                              textWrap: "nowrap",
                                              alignItems: "center",
                                            }}
                                          >
                                            {t(
                                              `Stock tracking ${
                                                stockDetail.tracking
                                                  ? "On"
                                                  : "Off"
                                              }`
                                            )}
                                            <Switch
                                              color="primary"
                                              edge="end"
                                              name={`trackstockStatus${stockDetail.locationRef}`}
                                              checked={stockDetail.tracking}
                                              onChange={(e) => {
                                                const updatedStock = [
                                                  ...formik.values
                                                    ?.stockConfiguration,
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
                                                  ].tracking = e.target.checked;
                                                  formik.setFieldValue(
                                                    "stockConfiguration",
                                                    updatedStock
                                                  );
                                                }
                                                if (
                                                  Boolean(!stockDetail.tracking)
                                                ) {
                                                  toast(
                                                    `${
                                                      formik.values.type ===
                                                      "crate"
                                                        ? "Stock tracking will also be disable on linked Boxes & Variants"
                                                        : "Stock tracking will also be disable on linked Crates & Variants"
                                                    }`
                                                  );
                                                } else {
                                                  toast(
                                                    `${
                                                      formik.values.type ===
                                                      "crate"
                                                        ? "Stock tracking will also be enabled on linked Boxes & Variants"
                                                        : "Stock tracking will also be enabled on linked Crates & Variants"
                                                    }`
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
                                            <Box
                                              sx={{
                                                display: "flex",
                                                alignItems: "center",
                                              }}
                                            >
                                              <span>{stockDetail.count}</span>
                                              <IconButton
                                                onClick={() => {
                                                  if (!stockDetail.tracking) {
                                                    toast.error(
                                                      "Please turn on tracking to update"
                                                    );
                                                    return;
                                                  }

                                                  setOpenStockModal(true);
                                                  setStockIdx(
                                                    stockDetail.locationRef
                                                  );
                                                }}
                                              >
                                                <Edit
                                                  style={{
                                                    fontSize: "18px",
                                                  }}
                                                />
                                              </IconButton>
                                            </Box>
                                          </Box>
                                        </TableCell>

                                        <TableCell>
                                          {stockDetail.tracking && (
                                            <Box
                                              sx={{
                                                display: "flex",
                                                flexDirection: "row",
                                                textWrap: "nowrap",
                                                alignItems: "center",
                                              }}
                                            >
                                              {t(
                                                `Alert ${
                                                  stockDetail.lowStockAlert
                                                    ? "On"
                                                    : "Off"
                                                }`
                                              )}
                                              <Switch
                                                color="primary"
                                                edge="end"
                                                name={`lowStockAlert${stockDetail.locationRef}`}
                                                checked={
                                                  stockDetail.lowStockAlert
                                                }
                                                onChange={(e) => {
                                                  const updatedStock = [
                                                    ...formik.values
                                                      ?.stockConfiguration,
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
                                                      "stockConfiguration",
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
                                              <TextFieldWrapper
                                                fullWidth
                                                label={t(
                                                  "Alert when stock count is low"
                                                )}
                                                name={`stockConfiguration[${index}].lowStockCount`}
                                                disabled={
                                                  !stockDetail.lowStockAlert
                                                }
                                                onChange={(e) => {
                                                  const value = e.target.value;
                                                  const cleanedNumber =
                                                    value.replace(/\D/g, "");
                                                  const trimmedValue =
                                                    cleanedNumber.slice(0, 10);

                                                  // const updatedStock = [
                                                  //   ...formik.values
                                                  //     ?.stockConfiguration,
                                                  // ];
                                                  // const stockIndex =
                                                  //   updatedStock.findIndex(
                                                  //     (item) =>
                                                  //       item.locationRef ===
                                                  //       stockDetail.locationRef
                                                  //   );

                                                  // if (stockIndex !== -1) {
                                                  //   updatedStock[
                                                  //     stockIndex
                                                  //   ].lowStockCount =
                                                  //     trimmedValue;
                                                  //   formik.setFieldValue(
                                                  //     "stockConfiguration",
                                                  //     updatedStock
                                                  //   );
                                                  // }
                                                  formik.setFieldValue(
                                                    `stockConfiguration[${index}].lowStockCount`,
                                                    trimmedValue
                                                  );
                                                }}
                                                value={
                                                  stockDetail.lowStockCount
                                                }
                                              />
                                            </Box>
                                          )}
                                        </TableCell>

                                        {id != null &&
                                          (formik.values.type == "box"
                                            ? formik.values.boxProduct?.batching
                                            : formik.values.crateProduct
                                                ?.batching) && (
                                            <TableCell>
                                              <Box sx={{ p: 1 }}>
                                                <DatePicker
                                                  //@ts-ignore
                                                  inputProps={{
                                                    disabled: true,
                                                  }}
                                                  label={`Expiry Date`}
                                                  inputFormat="dd/MM/yyyy"
                                                  onChange={(
                                                    date: Date | null
                                                  ): void => {
                                                    const updatedStock = [
                                                      ...formik.values
                                                        .stockConfiguration,
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
                                                      ].expiry = date;
                                                      formik.setFieldValue(
                                                        "stockConfiguration",
                                                        updatedStock
                                                      );
                                                    }
                                                  }}
                                                  minDate={new Date()}
                                                  disablePast
                                                  value={stockDetail.expiry}
                                                  renderInput={(
                                                    params: JSX.IntrinsicAttributes &
                                                      TextFieldProps
                                                  ) => (
                                                    <TextField
                                                      // required={
                                                      //   stockDetail.tracking &&
                                                      //   formik.values.item[0]
                                                      //     ?.batching
                                                      // }
                                                      fullWidth
                                                      {...params}
                                                      onBlur={formik.handleBlur(
                                                        "expiry"
                                                      )}
                                                    />
                                                  )}
                                                />
                                              </Box>
                                            </TableCell>
                                          )}
                                      </TableRow>
                                    );
                                  }
                                )
                              )}
                            </TableBody>
                            {/* )} */}
                          </Table>
                        </Grid>
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
                              {t("Change the status of the Box")}
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid
                          item
                          xs={4}
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
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
                                    return toast.error(
                                      t("You don't have access")
                                    );
                                  }
                                  formik.setFieldValue(
                                    "status",
                                    !formik.values.status
                                  );
                                }}
                                sx={{
                                  mr: 0.2,
                                }}
                              />
                            }
                            label={
                              formik.values.status
                                ? t("Active")
                                : t("Deactivated")
                            }
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {id != null && (
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
                                    ? `${d?.name?.en} (${d?.boxSku})  - ${
                                        d?.qty
                                      } ${t("Products Per Box")} `
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
                  <Box>
                    {Boolean(!id) && (
                      <LoadingButton
                        color="inherit"
                        onClick={() => {
                          if (origin == "company") {
                            changeTab("catalogue", Screens?.companyDetail);
                          }
                          router.back();
                        }}
                      >
                        {t("Cancel")}
                      </LoadingButton>
                    )}
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
                        sx={{ ml: 1 }}>
                        {t("Delete")}
                      </LoadingButton>
                    )} */}
                  </Box>
                  <Box>
                    {id && (
                      <LoadingButton
                        color="inherit"
                        onClick={() => {
                          if (origin == "company") {
                            changeTab("catalogue", Screens?.companyDetail);
                          }
                          router.back();
                        }}
                      >
                        {t("Cancel")}
                      </LoadingButton>
                    )}
                    <LoadingButton
                      type="submit"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowError(true);
                        if (id != null && !canUpdate) {
                          return toast.error(t("You don't have access"));
                        } else if (!id && !canCreate) {
                          return toast.error(t("You don't have access"));
                        }
                        formik.handleSubmit();
                      }}
                      loading={formik.isSubmitting}
                      sx={{ m: 1 }}
                      variant="contained"
                    >
                      {id != null ? t("Update") : t("Create")}
                    </LoadingButton>
                  </Box>
                </Stack>
              </Stack>
            </form>
          </Stack>
        </Container>
      </Box>

      {openStockModal && (
        <StockEditModal
          itemIndex={stockIdx}
          itemdata={formik.values.stockConfiguration}
          handleAddEditAction={handleAddEditStockAction}
          open={openStockModal}
          handleClose={() => {
            setOpenStockModal(false);
            setStockIdx(null);
          }}
          type={formik.values.type}
        />
      )}

      <ConfirmationDialog
        show={showDialogDeleteItem}
        toggle={() => setShowDialogDeleteItem(!showDialogDeleteItem)}
        onOk={(e: any) => {
          // handleDeleteItem();
        }}
        okButtonText={`${t("Delete")}`}
        cancelButtonText={t("Cancel")}
        title={t("Confirm Delete?")}
        text={t(
          "Are you sure you want to delete this? This action cannot be undone."
        )}
      />
    </>
  );
};

CreateBoxes.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default CreateBoxes;
