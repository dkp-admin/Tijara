import { FormikProps, useFormik } from "formik";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import Checkbox from "react-native-bouncy-checkbox";
import { EventRegister } from "react-native-event-listeners";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Toast from "react-native-toast-message";
import { Like, Raw } from "typeorm";
import * as Yup from "yup";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { BatchModel } from "../../database/batch/batch";
import { ProductModel } from "../../database/product/product";
import { checkDirection } from "../../hooks/check-direction";
import { checkInternet } from "../../hooks/check-internet";
import { useBusinessDetails } from "../../hooks/use-business-details";
import { useResponsive } from "../../hooks/use-responsiveness";
import { queryClient } from "../../query-client";
import { AuthType } from "../../types/auth-types";
import EntityNames from "../../types/entity-name";
import { objectId } from "../../utils/bsonObjectIdTransformer";
import {
  ChannelsName,
  ContainsName,
  ContainsOptions,
  DietryTypeName,
  PreferenceName,
  UNIT_OPTIONS,
} from "../../utils/constants";
import { constructBox } from "../../utils/construct-box";
import { constructDBVariant } from "../../utils/construct-db-variant";
import { constructVariant } from "../../utils/construct-variant";
import { repo } from "../../utils/createDatabaseConnection";
import { ERRORS } from "../../utils/errors";
import ICONS from "../../utils/icons";
import { debugLog, errorLog, infoLog } from "../../utils/log-patch";
import { showAlert } from "../../utils/showAlert";
import ActionSheetHeader from "../action-sheet/action-sheet-header";
import AddEditCategoryModal from "../categories/add-category-modal";
import AddEditCollectionModal from "../collections/add-collection-modal";
import ImageUploader from "../image-uploader";
import AmountInput from "../input/amount-input";
import Input from "../input/input";
import SelectInput from "../input/select-input";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import ErrorText from "../text/error-text";
import Label from "../text/label";
import showToast from "../toast";
import ToolTip from "../tool-tip";
import AddEditVariantModal from "../variant/add-variant-modal";
import VariantList from "../variant/variant-list";
import BrandSelectInput from "./brand-select-input";
import CategoriesSelectInput from "./categories-select-input";
import CategorySelectInput from "./category-select-input";
import ChannelsSelectInput from "./channels-select-input";
import CollectionSelectInput from "./collection-select-input";
import ContainsSelectInput from "./contains-select-input";
import KitchenSelectInput from "./kitchen-select-input";
import ModifierSelectInput from "./modifier-select-input";
import ModifierList from "./modifiers/modifier-list";
import PreferenceSelectInput from "./preference-select-input";
import RelationList from "./relations/relation-list";
import TaxSelectInput from "./tax-select-input";
import TimeEventList from "./time-events/time-event-list";
import { AddProductProps, ModalProps } from "./types";

export default function AddEditProductModal({
  data,
  visible = false,
  handleClose,
  handleSaveProduct,
}: ModalProps) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const isConnected = checkInternet();
  const kitchenSelectInputRef = useRef<any>();
  const categorySelectInputRef = useRef<any>();
  const categoriesSelectInputRef = useRef<any>();
  const collectionSelectInputRef = useRef<any>();
  const channelsSelectInputRef = useRef<any>();
  const brandSelectInputRef = useRef<any>();
  const taxSelectInputRef = useRef<any>();
  const preferenceSelectInputRef = useRef<any>();
  const containsSelectInputRef = useRef<any>();
  const modifiersSelectInputRef = useRef<any>();
  const authContext = useContext<AuthType>(AuthContext);
  const { hp, wp, twoPaneView } = useResponsive();
  const { businessDetails } = useBusinessDetails();

  const [isEditing, setIsEditing] = useState(false);
  const [channels, setChannels] = useState<any[]>([]);
  const [openCategory, setOpenCategory] = useState(false);
  const [openCollection, setOpenCollection] = useState(false);
  const [openVariant, setOpenVariant] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [loaderText, setLoaderText] = useState("");
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [skuGenerated, setSkuGenerated] = useState(false);
  const [timeEvents, setTimeEvents] = useState<any[]>([]);
  const [callCatApi, setCallCatAPi] = useState(false);
  const [callCollApi, setCallCollAPi] = useState(false);

  const formik: FormikProps<AddProductProps> = useFormik<AddProductProps>({
    initialValues: {
      isRestaurant: false,
      isKitchen: false,
      en_name: "",
      ar_name: "",
      productPic: "",
      localImage: "",
      kitchenFacingNameEn: "",
      kitchenFacingNameAr: "",
      // kitchenRoutingCategory: { value: "", key: "" },
      kitchenRefs: [],
      kitchens: [],
      restaurantCategoryRefs: [],
      restaurantCategories: [],
      category: { value: "", key: "" },
      collectionRefs: [],
      collections: [],
      channels: [],
      selfOrdering: true,
      onlineOrdering: true,
      description: "",
      brand: { value: "", key: "" },
      contains: "",
      tax: { value: "", key: "" },
      enabledBatching: false,
      bestSeller: false,
      type: "single",
      sku: "",
      code: "",
      unit: { value: "", key: "" },
      costPrice: "",
      price: "",
      variants: [],
      actions: [],
      boxes: [],
      calorieCount: "",
      preference: [],
      dietryType: [],
      modifiers: [],
      status: "active",
      formChanged: false,
      stockUpdate: false,
    },

    onSubmit: async (values) => {
      const validateFields = () => {
        if (!values.brand.key || !values.tax.key) {
          showToast("error", t("Please fill in all required fields"));
          return false;
        }
        return true;
      };

      if (!validateFields()) {
        return;
      }

      let variants = values.variants;

      if (values.sku && values.unit.key && variants.length === 0) {
        const data = {
          parentSku: "",
          parentName: { en: "", ar: "" },
          type: "item",
          assignedToAll: false,
          en_name: "Regular",
          ar_name: "عادي",
          image: "",
          variantPic: "",
          sku: values.sku,
          code: values.code,
          unit: values.unit.key,
          noOfUnits: 1,
          costPrice: values.costPrice,
          price: values.price,
          originalPrice: values.price,
          nonSaleable: false,
          locationRefs: [businessDetails.location._id],
          locations: [{ name: businessDetails.location.name.en }],
          prices: [
            {
              costPrice:
                Number(values.costPrice) > 0 ? `${values.costPrice}` : "",
              price: Number(values.price) > 0 ? `${values.price}` : "",
              locationRef: businessDetails.location._id,
              location: { name: businessDetails.location.name.en },
            },
          ],
          otherPrices: [],
          stocks: [
            {
              enabledAvailability: true,
              enabledTracking: false,
              stockCount: 0,
              enabledLowStockAlert: false,
              lowStockCount: 0,
              locationRef: businessDetails.location._id,
              location: { name: businessDetails.location.name.en },
            },
          ],
          otherStocks: [],
          status: "active",
        };

        variants = [{ ...data }];
      } else if (variants.length === 1) {
        variants = [
          {
            ...values.variants[0],
            sku: values.sku,
            code: values.code,
            unit: values.unit.key,
            costPrice:
              Number(values.costPrice) > 0 ? `${values.costPrice}` : "",
            prices: [
              {
                costPrice:
                  Number(values.costPrice) > 0 ? `${values.costPrice}` : "",
                price: Number(values.price) > 0 ? `${values.price}` : "",
                locationRef: businessDetails.location._id,
                location: { name: businessDetails.location.name.en },
              },
            ],
          },
        ];
      }

      if (variants.length <= 1) {
        if (values.sku == "") {
          showToast("error", t("Enter SKU"));
          return;
        } else if (values.sku.length < 3) {
          showToast("error", t("SKU must be at least 8 characters"));
          return;
        } else if (!/^[0-9]+$/.test(values.sku)) {
          showToast("error", t("SKU must contain only umeric values"));
          return;
        }

        if (values.unit.key == "") {
          showToast("error", t("Please Select Unit"));
          return;
        }

        if (values.code !== "" && !/^[A-Za-z0-9]+$/.test(values.code)) {
          showToast("error", t("Code must contain only numeric values"));
          return;
        }
      }

      try {
        const variantsList = variants.map((val: any) => constructVariant(val));
        const otherVariantsList =
          product?.otherVariants?.length > 0
            ? product.otherVariants?.map((val: any) => constructVariant(val))
            : [];
        const boxesList = values.boxes.map((val: any) => constructBox(val));
        const otherBoxesList =
          product?.otherBoxes?.length > 0
            ? product.otherBoxes?.map((val: any) => constructBox(val))
            : [];

        const dataObj = {
          image: values.productPic,
          name: {
            en: values.en_name.trim(),
            ar: values.ar_name.trim(),
          },
          kitchenFacingName: {
            en: values.kitchenFacingNameEn.trim(),
            ar: values.kitchenFacingNameAr.trim(),
          },
          contains: values.contains,
          description: values.description,
          companyRef: businessDetails.location.companyRef,
          company: { name: businessDetails.company.name.en },
          brandRef: values.brand.key,
          brand: { name: values.brand.value },
          categoryRef: values.category.key,
          category: { name: values.category.value },
          restaurantCategoryRefs: values.restaurantCategoryRefs,
          restaurantCategories: values.restaurantCategories?.map((cat: any) => {
            return { name: cat };
          }),
          collectionRefs: values.collectionRefs,
          collections: values.collections?.map((coll: any) => {
            return { name: coll };
          }),
          taxRef: values.tax.key,
          tax: { percentage: Number(values.tax.value) },
          batching: values.enabledBatching,
          bestSeller: values.bestSeller,
          channel: values.channels,
          selfOrdering: values.selfOrdering,
          onlineOrdering: values.onlineOrdering,
          isLooseItem: false,
          variants: [...variantsList, ...otherVariantsList],
          boxes: [...boxesList, ...otherBoxesList],
          nutritionalInformation: {
            calorieCount: values?.calorieCount ? values?.calorieCount : null,
            preference: values.preference,
            contains: values.dietryType,
          },
          modifiers: values.modifiers,
          status: values.status,
        };

        const res = !data.product
          ? await serviceCaller(endpoint.createProduct.path, {
              method: endpoint.createProduct.method,
              body: { ...dataObj },
            })
          : await serviceCaller(
              `${endpoint.updateProduct.path}/${product._id}`,
              {
                method: endpoint.updateProduct.method,
                body: { ...dataObj },
              }
            );

        if (res !== null) {
          const variantsList = variants.map((val: any) =>
            constructDBVariant(val)
          );

          if (product?._id) {
            const productData: ProductModel = {
              _id: product._id,
              parent: product.parent || "",
              name: { en: values.en_name.trim(), ar: values.ar_name.trim() },
              kitchenFacingName: {
                en: values.kitchenFacingNameEn.trim(),
                ar: values.kitchenFacingNameAr.trim(),
              },
              contains: values.contains,
              image: values.localImage,
              localImage: values.localImage,
              companyRef: businessDetails.location.companyRef,
              company: { name: businessDetails.company.name.en },
              categoryRef: values.category.key,
              category: { name: values.category.value },
              kitchenRefs: values.kitchenRefs,
              kitchens: values.kitchens?.map((kitchen: any) => {
                return { name: kitchen };
              }),
              restaurantCategoryRefs: values.restaurantCategoryRefs,
              restaurantCategories: values.restaurantCategories?.map(
                (cat: any) => {
                  return { name: cat };
                }
              ),
              collectionsRefs: values.collectionRefs,
              collections: values.collections?.map((coll: any) => {
                return { name: coll };
              }),
              description: values.description,
              brandRef: values.brand.key,
              brand: { name: values.brand.value },
              taxRef: values.tax.key,
              tax: { percentage: values.tax.value },
              status: values.status,
              source: "server",
              enabledBatching: values.enabledBatching,
              bestSeller: values.bestSeller,
              channels: values.channels,
              selfOrdering: values.selfOrdering,
              onlineOrdering: values.onlineOrdering,
              variants: variantsList,
              otherVariants: product?.otherVariants || [],
              boxes: product?.boxes || [],
              otherBoxes: product?.otherBoxes || [],
              nutritionalInformation: {
                calorieCount: values?.calorieCount ? values.calorieCount : "",
                preference: values.preference,
                contains: values.dietryType,
              },
              modifiers: values.modifiers,
              sortOrder: product?.sortOrder || 0,
              sku: [values.sku],
              code: [values?.code || ""],
              boxRefs: product?.boxRefs || [],
              crateRefs: product?.crateRefs || [],
            };

            await repo.product.update({ _id: product._id }, productData);
            await queryClient.invalidateQueries("find-product");
          } else {
            const productData: ProductModel = {
              _id: res._id,
              parent: "",
              name: { en: res.name.en?.trim(), ar: res.name.ar?.trim() },
              kitchenFacingName: {
                en: res?.kitchenFacingName?.en?.trim() || "",
                ar: res?.kitchenFacingName?.ar?.trim() || "",
              },
              contains: res.contains,
              image: res.image,
              localImage: res.image,
              companyRef: res.companyRef,
              company: { name: res.company.name },
              categoryRef: res.categoryRef,
              category: { name: res.category.name },
              kitchenRefs: res.kitchenRefs,
              kitchens: res.kitchens?.map((kitchen: any) => {
                return { name: kitchen };
              }),
              restaurantCategoryRefs: res.restaurantCategoryRefs,
              restaurantCategories: res.restaurantCategories,
              collectionsRefs: res.collectionRefs,
              collections: res.collections,
              description: res.description,
              brandRef: res.brandRef,
              brand: { name: res.brand.name },
              taxRef: res.taxRef,
              tax: { percentage: res.tax.percentage },
              status: res.status,
              source: "server",
              enabledBatching: res.batching,
              bestSeller: res.bestSeller,
              channels: res.channel,
              selfOrdering: res.selfOrdering,
              onlineOrdering: res.onlineOrdering,
              variants: variantsList,
              otherVariants: [],
              boxes: [],
              otherBoxes: [],
              nutritionalInformation: res.nutritionalInformation,
              modifiers: res.modifiers,
              sortOrder: 0,
              sku: [values.sku],
              code: [values?.code || ""],
              boxRefs: [],
              crateRefs: [],
            };

            await repo.product.insert(productData);
            await queryClient.invalidateQueries("find-product");
          }

          debugLog(
            !data.product
              ? "Product created to server"
              : "Product updated to server",
            res,
            "product-add-modal",
            "handleSubmit"
          );

          if (values.actions?.length > 0) {
            const promises = [];

            for (const action of values.actions) {
              const actionData = {
                productRef: action.productRef,
                product: action.product,
                categoryRef: values.category.key,
                category: { name: values.category.value },
                companyRef: action.companyRef,
                company: action.company,
                locationRef: action.locationRef,
                location: action.location,
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
              };

              promises.push(
                await serviceCaller(endpoint.stockHistoryCreate.path, {
                  method: endpoint.stockHistoryCreate.method,
                  body: { ...actionData },
                })
              );
            }

            await Promise.all(promises);

            if (promises?.length > 0) {
              EventRegister.emit("sync:enqueue", {
                entityName: EntityNames.BatchPull,
              });

              EventRegister.emit("sync:enqueue", {
                entityName: EntityNames.StockHistoryPull,
              });
            }
          }

          if (values.stockUpdate) {
            handleSaveProduct(
              product,
              data.product
                ? t("Product Updated Successfully")
                : t("Product Added Successfully")
            );
          } else {
            handleClose();
            showToast(
              "success",
              data.product
                ? t("Product Updated Successfully")
                : t("Product Added Successfully")
            );
          }
        }
      } catch (error: any) {
        errorLog(
          error?.message,
          values,
          "product-add-modal",
          "handleSubmit",
          error
        );
        if (error?.code === "sku_exists") {
          showToast("error", t("SKU already exist"));
        } else {
          showToast("error", error?.code || error?.messaage);
        }
      }
    },
    validationSchema: Yup.object().shape({
      en_name: Yup.string()
        .required(`${t("Product Name is required")}`)
        .max(60, t("Product name must not be greater than 60 characters")),
      ar_name: Yup.string()
        .required(`${t("Product Name in Arabic is required")}`)
        .max(60, t("Product name must not be greater than 60 characters")),
      contains: Yup.string().when("isRestaurant", {
        is: true,
        then: Yup.string().required(t("Please Select Contains")),
        otherwise: Yup.string().optional(),
      }),
      kitchenFacingNameEn: Yup.string().when(["isRestaurant", "isKitchen"], {
        is: (isRestaurant: boolean, isKitchen: boolean) =>
          isRestaurant && isKitchen,
        then: Yup.string()
          .matches(
            /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
            t("Enter valid kitchen facing name")
          )
          // .required(`${t("Kitchen Facing Name is required")}`)
          .max(
            60,
            t("Kitchen Facing name must not be greater than 60 characters")
          ),
        otherwise: Yup.string().optional(),
      }),
      kitchenFacingNameAr: Yup.string().when(["isRestaurant", "isKitchen"], {
        is: (isRestaurant: boolean, isKitchen: boolean) =>
          isRestaurant && isKitchen,
        then: Yup.string()
          .matches(
            /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
            t("Enter valid kitchen facing name")
          )
          // .required(`${t("Kitchen Facing Name in Arabic is required")}`)
          .max(
            60,
            t("Kitchen Facing name must not be greater than 60 characters")
          ),
        otherwise: Yup.string().optional(),
      }),
      // kitchenRoutingCategory: Yup.object().when(["isRestaurant", "isKitchen"], {
      //   is: (isRestaurant: boolean, isKitchen: boolean) =>
      //     isRestaurant && isKitchen,
      //   then: Yup.object({
      //     value: Yup.string().required(
      //       t("Please Select Kitchen Routing Category")
      //     ),
      //     key: Yup.string().required(
      //       t("Please Select Kitchen Routing Category")
      //     ),
      //   })
      //     .required(t("Please Select Kitchen Routing Category"))
      //     .nullable(),
      //   otherwise: Yup.object().optional().nullable(),
      // }),
      // kitchenRefs: Yup.array().when(["isRestaurant", "isKitchen"], {
      //   is: (isRestaurant: boolean, isKitchen: boolean) =>
      //     isRestaurant && isKitchen,
      //   then: Yup.array()
      //     .required(t("Please Select Kitchen"))
      //     .min(1, t("Please Select Kitchen"))
      //     .nullable(),
      //   otherwise: Yup.array().optional().nullable(),
      // }),
      category: Yup.object().when("isRestaurant", {
        is: true,
        then: Yup.object({
          value: Yup.string().required(t("Please Select Reporting Category")),
          key: Yup.string().required(t("Please Select Reporting Category")),
        })
          .required(t("Please Select Reporting Category"))
          .nullable(),
        otherwise: Yup.object({
          value: Yup.string().required(t("Please Select Product Category")),
          key: Yup.string().required(t("Please Select Product Category")),
        })
          .required(t("Please Product Select Category"))
          .nullable(),
      }),
      channels: Yup.array()
        .required(t("Please select channels"))
        .min(1, t("At least one channel should be selected"))
        .nullable(),
    }),
  });

  const getUniqueSKU = async () => {
    try {
      const res = await serviceCaller(endpoint.generateUniqueSKU.path, {
        method: endpoint.generateUniqueSKU.method,
      });

      if (res?.sku) {
        debugLog(
          "Unique SKU generated from api",
          res,
          "add-variant-modal",
          "generateUniqueSKU"
        );
        setSkuGenerated(true);
        formik.setFieldValue("sku", res.sku);
      }
    } catch (error: any) {
      errorLog(
        error?.message,
        endpoint.generateUniqueSKU,
        "add-variant-modal",
        "generateUniqueSKU",
        error
      );
      formik.setFieldValue("sku", "");
      showToast("error", t(ERRORS.SOMETHING_WENT_WRONG));
    }
  };

  const getTimeEvents = async () => {
    if (!isConnected) {
      infoLog(
        "Internet not connected",
        {},
        "product-create-modal",
        "timeEvents"
      );
      return;
    }

    try {
      const res = await serviceCaller(endpoint.timeEvents.path, {
        method: endpoint.timeEvents.method,
        query: {
          page: 0,
          limit: 10,
          sort: "desc",
          activeTab: "active",
          productRef: product._id,
          companyRef: authContext.user.companyRef,
        },
      });

      debugLog(
        "Time events fetch from api",
        {},
        "product-create-modal",
        "timeEvents"
      );

      setTimeEvents(res?.results || []);
    } catch (error: any) {
      errorLog(
        error?.message,
        { _id: product?._id },
        "product-create-modal",
        "timeEvents",
        error
      );
      setTimeEvents([]);
    }
  };

  useMemo(() => {
    if (visible) {
      formik.resetForm();
      setLoaderText("");
      setShowLoader(false);
      setOpenDatePicker(false);
      setScrollEnabled(true);
      setSkuGenerated(false);
      setTimeEvents([]);
      setIsEditing(!data.product);

      if (data.product) {
        setProduct(data.product);
      } else {
        setProduct(null);
      }
    }
  }, [visible, data]);

  useEffect(() => {
    if (product != null) {
      debugLog(
        "Product while editing fetched from db",
        product,
        "product-add-modal",
        "fetchSingleProduct"
      );

      const variantsList = product.variants.map((variant: any) => {
        return {
          _id: variant._id,
          parentSku: variant.parentSku,
          parentName: variant?.parentName,
          type: variant.type || "item",
          assignedToAll: variant.assignedToAll,
          en_name: variant.name.en,
          ar_name: variant.name.ar,
          variantPic: variant.localImage,
          image: variant.image,
          sku: variant.sku,
          code: variant?.code || "",
          unit: variant.unit,
          noOfUnits: variant.noOfUnits,
          costPrice: variant.prices[0]?.costPrice,
          price: variant?.sellingPrice,
          originalPrice: variant?.originalPrice,
          nonSaleable: variant?.nonSaleable || false,
          locationRefs: variant.locationRefs,
          locations: variant.locations,
          prices: variant.prices,
          otherPrices: variant.otherPrices,
          stocks: variant?.stocks || [],
          otherStocks: variant?.otherStocks || [],
          status: variant.status,
        };
      });

      const boxesList = product.boxes?.map((box: any) => {
        return {
          _id: box._id,
          parentSku: box.parentSku,
          parentName: box.parentName,
          type: box.type,
          assignedToAll: box.assignedToAll,
          en_name: box.name.en,
          ar_name: box.name.ar,
          variantPic: box.localImage,
          image: box.image,
          sku: box.sku,
          code: box?.code || "",
          unit: box.unit,
          noOfUnits: box.noOfUnits,
          costPrice: box.costPrice,
          price: box.prices[0]?.price || box?.sellingPrice,
          nonSaleable: box?.nonSaleable || false,
          locationRefs: box.locationRefs,
          locations: box.locations,
          prices: box.prices,
          otherPrices: box.otherPrices,
          stocks: box?.stocks || [],
          otherStocks: box?.otherStocks || [],
          status: box.status,
        };
      });

      const unitData: any = UNIT_OPTIONS.find(
        (unit: any) => unit.key === variantsList[0].unit
      );

      formik.setValues({
        isRestaurant:
          businessDetails?.company?.industry?.toLowerCase() === "restaurant",
        isKitchen: businessDetails?.company?.enableKitchenManagement,
        en_name: product.name.en,
        ar_name: product.name.ar,
        productPic: product.localImage || product.image,
        localImage: product?.localImage,
        kitchenFacingNameEn: product?.kitchenFacingName?.en,
        kitchenFacingNameAr: product?.kitchenFacingName?.ar,
        // kitchenRoutingCategory: { value: "", key: "" },
        kitchenRefs:
          product?.kitchenRefs?.[0] !== `[]` ? product?.kitchenRefs || [] : [],
        kitchens:
          product?.kitchens?.map((kitchen: any) => {
            return kitchen.name;
          }) || [],
        restaurantCategoryRefs:
          product?.restaurantCategoryRefs?.[0] !== `[]`
            ? product?.restaurantCategoryRefs || []
            : [],
        restaurantCategories:
          product?.restaurantCategories?.map((cat: any) => {
            return cat.name;
          }) || [],
        category: {
          value: product.category.name,
          key: product.categoryRef,
        },
        collectionRefs:
          product?.collectionsRefs?.[0] !== `[]` ? product.collectionsRefs : [],
        collections:
          product?.collections?.map((coll: any) => {
            return coll.name;
          }) || [],
        channels:
          product?.channels?.length > 0 && product?.channels?.[0] !== `[]`
            ? product.channels
            : businessDetails?.company?.industry?.toLowerCase() === "restaurant"
            ? ["dine-in", "takeaway", "pickup", "delivery"]
            : ["walk-in", "pickup", "delivery"],
        selfOrdering: product?.selfOrdering,
        onlineOrdering: product?.onlineOrdering,
        description: product.description,
        brand: { value: product.brand.name, key: product.brandRef },
        contains: product?.contains || "",
        tax: { value: product.tax.percentage, key: product.taxRef },
        enabledBatching: product.enabledBatching,
        bestSeller: product?.bestSeller || false,
        type: variantsList.length === 1 ? "single" : "multiple",
        sku: variantsList[0].sku,
        code:
          variantsList[0]?.code && variantsList[0]?.code !== "undefined"
            ? variantsList[0].code
            : "",
        unit: { value: unitData.value, key: unitData.key },
        costPrice: variantsList[0].prices?.[0]?.costPrice
          ? Number(variantsList[0].prices[0].costPrice)?.toFixed(2)
          : "",
        price: variantsList[0].prices[0]?.price
          ? Number(variantsList[0].prices[0].price)?.toFixed(2)
          : "",
        variants: variantsList,
        actions: [],
        boxes: boxesList || [],
        calorieCount:
          product?.nutritionalInformation !== null &&
          product?.nutritionalInformation?.calorieCount !== null
            ? `${product?.nutritionalInformation.calorieCount || ""}`
            : "",
        preference: product?.nutritionalInformation?.preference || [],
        dietryType: product?.nutritionalInformation?.contains || [],
        modifiers: product?.modifiers || [],
        status: product.status,
        formChanged: false,
        stockUpdate: false,
      });

      getTimeEvents();
    }
  }, [product]);

  useMemo(() => {
    const channel = businessDetails?.location?.channel?.map((type: any) => {
      return {
        label: ChannelsName[type.name] || type.name,
        value: type.name,
      };
    });

    setChannels(channel);

    formik.setFieldValue(
      "isRestaurant",
      businessDetails?.company?.industry?.toLowerCase() === "restaurant"
    );

    formik.setFieldValue(
      "isKitchen",
      businessDetails?.company?.enableKitchenManagement
    );

    if (!data.product && businessDetails) {
      formik.setFieldValue("tax", {
        value: businessDetails.company.vat?.percentage,
        key: businessDetails.company.vat?.vatRef,
      });

      formik.setFieldValue(
        "channels",
        businessDetails?.location?.channel?.map((type: any) => {
          return type.name;
        })
      );
    }
  }, [data, businessDetails]);

  const handleDeleteVariant = useCallback(
    async (sku: string) => {
      const idx = formik.values.variants?.findIndex(
        (variant) => variant?.sku === sku
      );
      if (sku && idx != -1) {
        const boxes = formik.values.boxes.filter(
          (box: any) => box.parentSku !== sku
        );

        formik.values.variants.splice(idx, 1);
        formik.setFieldValue("variants", [...formik.values.variants]);
        formik.setFieldValue("boxes", [...boxes]);
        formik.setFieldValue("formChanged", true);

        if (formik.values.variants?.length === 0) {
          formik.setFieldValue("sku", "");
          formik.setFieldValue("code", "");
          formik.setFieldValue("unit", { key: "", value: "" });
          formik.setFieldValue("costPrice", "");
          formik.setFieldValue("price", "");
        }

        debugLog(
          "Variant deleted from product",
          formik.values.variants,
          "product-add-modal",
          "handleDeleteVariant"
        );

        debugLog(
          "Boxes updated to product",
          formik.values.boxes,
          "product-add-modal",
          "handleDeleteVariant"
        );
        showToast("success", t("Variant Deleted Successfully"));
      } else {
        showToast("error", ERRORS.SOMETHING_WENT_WRONG);
      }
    },
    [formik.values.variants]
  );

  const handleSave = useCallback(() => {
    if (isEditing) {
      if (!isConnected) {
        infoLog(
          "Internet not connected",
          {},
          "product-add-modal",
          "handleSave"
        );
        showToast("info", t("Please connect with internet"));
        return;
      }
      formik.handleSubmit();
    } else {
      setIsEditing(true);
    }
  }, [isEditing]);

  const mainContainerStyle = useMemo(() => {
    return {
      ...styles.container,
      backgroundColor: theme.colors.transparentBg,
    };
  }, []);

  const containerStyle = useMemo(() => {
    return {
      ...styles.container,
      marginHorizontal: twoPaneView ? "20%" : "0%",
      backgroundColor: theme.colors.bgColor,
    };
  }, []);

  const handleKitchenChange = async (
    kitchenId: string,
    en_name: "",
    ar_name: ""
  ) => {
    if (!isConnected) {
      infoLog("Internet not connected", {}, "product-add-modal", "handleSave");
      showToast("info", t("Please connect with internet"));
      return;
    }

    kitchenSelectInputRef.current.close();

    const productData = {
      productRef: product?._id,
      name: {
        en: formik.values.en_name,
        ar: formik.values.ar_name,
      },
      category: { name: formik.values.category.value },
      brand: { name: formik.values.brand.value },
      price: formik.values.variants[0]?.price,
    };

    try {
      if (formik.values.kitchenRefs?.length > 0) {
        const removeData = {
          productsData: productData,
          kitchenRef: formik.values.kitchenRefs[0]?.toString(),
        };

        await serviceCaller(endpoint.removeProductKitchen.path, {
          method: endpoint.removeProductKitchen.method,
          body: removeData,
        });
      }

      const assignData = {
        productsData: [productData],
        kitchenRef: kitchenId,
        name: { en: en_name, ar: ar_name },
      };

      await serviceCaller(endpoint.assignProductKitchen.path, {
        method: endpoint.assignProductKitchen.method,
        body: assignData,
      });

      formik.setFieldValue("kitchenRefs", [kitchenId]);
      formik.setFieldValue("kitchens", [en_name]);
      // showToast("success", t("Kitchen has been assigned"));
    } catch (error) {
      // showToast("error", t("Kitchen not updated for product"));
    }
  };

  const handleAddEditVariant = useCallback(
    (data: any) => {
      let variants = formik.values.variants;

      const idx = variants?.findIndex((variant) => variant?.sku === data?.sku);

      if (!data?.sku || idx === -1) {
        debugLog(
          "Variant added to product",
          data,
          "product-add-modal",
          "handleAddEditVariant"
        );

        if (variants.length > 0) {
          variants = [...variants, { ...data }];
        } else {
          variants = [{ ...data }];
        }
      } else {
        debugLog(
          "Variant updated to product",
          data,
          "product-add-modal",
          "handleAddEditVariant"
        );
        variants.splice(idx, 1, data);
      }

      formik.setFieldValue("formChanged", true);
      formik.setFieldValue("variants", [...variants]);

      if (data.stockUpdate) {
        if (!isConnected) {
          infoLog(
            "Internet not connected",
            {},
            "product-add-modal",
            "handleSave"
          );
          showToast("info", t("Please connect with internet"));
          return;
        }
        formik.setFieldValue("stockUpdate", true);
        formik.handleSubmit();
      }
      setOpenVariant(false);
    },
    [formik.values.variants]
  );

  const handleUpdateModifier = useCallback(
    (data: any) => {
      const idx = formik.values.modifiers?.findIndex(
        (modifier) => modifier?.modifierRef === data?.modifierRef
      );

      if (idx !== -1) {
        debugLog(
          "Modifier updated to product",
          data,
          "product-add-modal",
          "handleUpdateModifier"
        );

        formik.setFieldValue("formChanged", true);
        formik.values.modifiers.splice(idx, 1, data);
        formik.setFieldValue("modifiers", [...formik.values.modifiers]);
      }
    },
    [formik.values.modifiers]
  );

  const handleDeleteModifier = useCallback(
    async (id: string) => {
      const idx = formik.values.modifiers?.findIndex(
        (modifier) => modifier?.modifierRef === id
      );

      if (idx !== -1) {
        formik.setFieldValue("formChanged", true);
        formik.values.modifiers.splice(idx, 1);
        formik.setFieldValue("modifiers", [...formik.values.modifiers]);

        debugLog(
          "Modifier deleted from product",
          formik.values.modifiers,
          "product-add-modal",
          "handleDeleteModifier"
        );
        showToast("success", t("Modifier Deleted Successfully"));
      } else {
        showToast("error", ERRORS.SOMETHING_WENT_WRONG);
      }
    },
    [formik.values.modifiers]
  );

  const categoriesOpt = useMemo(() => {
    return formik.values.restaurantCategoryRefs?.length > 0 ? (
      <ScrollView
        horizontal
        contentContainerStyle={{
          width: "95%",
          display: "flex",
          overflow: "hidden",
          flexDirection: "row",
          alignItems: "center",
        }}
        alwaysBounceHorizontal={false}
        showsHorizontalScrollIndicator={false}
      >
        {formik.values.restaurantCategories?.map(
          (category: string, index: number) => {
            return (
              <View
                key={index}
                style={{
                  marginRight: 10,
                  borderRadius: 50,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#E5E9EC",
                }}
              >
                <DefaultText fontSize="md" fontWeight="medium">
                  {category}
                </DefaultText>

                <TouchableOpacity
                  style={{ marginLeft: 10 }}
                  onPress={() => {
                    handleCategories({
                      _id: formik.values.restaurantCategoryRefs[index],
                      name: { en: category },
                    });
                  }}
                  disabled={!isEditing}
                >
                  <ICONS.CloseCircleIcon />
                </TouchableOpacity>
              </View>
            );
          }
        )}
      </ScrollView>
    ) : (
      <DefaultText
        fontWeight="normal"
        color={
          !isEditing ? theme.colors.otherGrey[100] : theme.colors.placeholder
        }
      >
        {t("Select Categories")}
      </DefaultText>
    );
  }, [
    formik.values.restaurantCategories,
    formik.values.restaurantCategoryRefs,
    isEditing,
  ]);

  const handleCategories = (val: any) => {
    if (formik.values.restaurantCategoryRefs.includes(val._id)) {
      const ids = formik.values.restaurantCategoryRefs.filter(
        (id) => id !== val._id
      );
      const names = formik.values.restaurantCategories.filter(
        (name) => name !== val.name.en
      );
      formik.setFieldValue("restaurantCategoryRefs", ids);
      formik.setFieldValue("restaurantCategories", names);
    } else {
      formik.setFieldValue("restaurantCategoryRefs", [
        ...formik.values.restaurantCategoryRefs,
        val._id,
      ]);
      formik.setFieldValue("restaurantCategories", [
        ...formik.values.restaurantCategories,
        val.name.en,
      ]);
    }
  };

  const collectionOpt = useMemo(() => {
    return formik.values.collections?.length > 0 ? (
      <ScrollView
        horizontal
        contentContainerStyle={{
          width: "95%",
          display: "flex",
          overflow: "hidden",
          flexDirection: "row",
          alignItems: "center",
        }}
        alwaysBounceHorizontal={false}
        showsHorizontalScrollIndicator={false}
      >
        {formik.values.collections?.map((collection: string, index: number) => {
          return (
            <View
              key={index}
              style={{
                marginRight: 10,
                borderRadius: 50,
                paddingVertical: 6,
                paddingHorizontal: 12,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#E5E9EC",
              }}
            >
              <DefaultText fontSize="md" fontWeight="medium">
                {collection}
              </DefaultText>

              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => {
                  handleCollection({
                    _id: formik.values.collectionRefs[index],
                    name: { en: collection },
                  });
                }}
                disabled={!isEditing}
              >
                <ICONS.CloseCircleIcon />
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    ) : (
      <DefaultText
        fontWeight="normal"
        color={
          !isEditing ? theme.colors.otherGrey[100] : theme.colors.placeholder
        }
      >
        {t("Select Product Collections")}
      </DefaultText>
    );
  }, [formik.values.collections, formik.values.collectionRefs, isEditing]);

  const handleCollection = (val: any) => {
    if (formik.values.collectionRefs.includes(val._id)) {
      const ids = formik.values.collectionRefs.filter((id) => id !== val._id);
      const names = formik.values.collections.filter(
        (name) => name !== val.name.en
      );
      formik.setFieldValue("collectionRefs", ids);
      formik.setFieldValue("collections", names);
      handleAddOrRemove([val._id], "remove");
    } else {
      formik.setFieldValue("collectionRefs", [
        ...formik.values.collectionRefs,
        val._id,
      ]);
      formik.setFieldValue("collections", [
        ...formik.values.collections,
        val.name.en,
      ]);
      handleAddOrRemove([...formik.values.collectionRefs, val._id], "assign");
    }
  };

  const handleAddOrRemove = async (collectionIds: string[], type: string) => {
    if (product?._id) {
      try {
        const dataObj = {
          products: [
            {
              productRef: product._id,
              price: formik.values.variants?.[0]?.price,
            },
          ],
          productRefs: [product._id],
          collectionRefs: collectionIds,
          type: type,
        };

        await serviceCaller(endpoint.assignCollection.path, {
          method: endpoint.assignCollection.method,
          body: dataObj,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const preferenceOpt = useMemo(() => {
    return formik.values.preference?.length > 0 ? (
      <ScrollView
        horizontal
        contentContainerStyle={{
          width: "100%",
          overflow: "hidden",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
        alwaysBounceHorizontal={false}
        showsHorizontalScrollIndicator={false}
      >
        {formik.values.preference?.map((preference: string, index: number) => {
          return (
            <View
              key={index}
              style={{
                marginRight: 10,
                borderRadius: 50,
                paddingVertical: 6,
                paddingHorizontal: 12,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#E5E9EC",
              }}
            >
              <DefaultText fontSize="md" fontWeight="medium">
                {PreferenceName[preference]}
              </DefaultText>

              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => {
                  handlePrefernce(preference);
                }}
                disabled={!isEditing}
              >
                <ICONS.CloseCircleIcon />
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    ) : (
      <DefaultText
        fontWeight="normal"
        color={
          !isEditing ? theme.colors.otherGrey[100] : theme.colors.placeholder
        }
      >
        {t("Select Dietary Preference")}
      </DefaultText>
    );
  }, [formik.values.preference, isEditing]);

  const handlePrefernce = (val: string) => {
    if (formik.values.preference.includes(val)) {
      const names = formik.values.preference.filter(
        (preference) => preference !== val
      );
      formik.setFieldValue("preference", names);
    } else {
      formik.setFieldValue("preference", [...formik.values.preference, val]);
    }
  };

  const dietryTypeOpt = useMemo(() => {
    return formik.values.dietryType?.length > 0 ? (
      <ScrollView
        horizontal
        contentContainerStyle={{
          width: "100%",
          overflow: "hidden",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
        alwaysBounceHorizontal={false}
        showsHorizontalScrollIndicator={false}
      >
        {formik.values.dietryType?.map((type: string, index: number) => {
          return (
            <View
              key={index}
              style={{
                marginRight: 10,
                borderRadius: 50,
                paddingVertical: 6,
                paddingHorizontal: 12,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#E5E9EC",
              }}
            >
              <DefaultText fontSize="md" fontWeight="medium">
                {DietryTypeName[type]}
              </DefaultText>

              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => {
                  handleDietryType(type);
                }}
                disabled={!isEditing}
              >
                <ICONS.CloseCircleIcon />
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    ) : (
      <DefaultText
        fontWeight="normal"
        color={
          !isEditing ? theme.colors.otherGrey[100] : theme.colors.placeholder
        }
      >
        {t("Select Contains")}
      </DefaultText>
    );
  }, [formik.values.dietryType, isEditing]);

  const handleDietryType = (val: string) => {
    if (formik.values.dietryType.includes(val)) {
      const names = formik.values.dietryType.filter((type) => type !== val);
      formik.setFieldValue("dietryType", names);
    } else {
      formik.setFieldValue("dietryType", [...formik.values.dietryType, val]);
    }
  };

  const channelsOpt = useMemo(() => {
    return formik.values.channels?.length > 0 ? (
      <ScrollView
        horizontal
        contentContainerStyle={{
          width: "95%",
          display: "flex",
          overflow: "hidden",
          flexDirection: "row",
          alignItems: "center",
        }}
        alwaysBounceHorizontal={false}
        showsHorizontalScrollIndicator={false}
      >
        {(channels?.length === formik.values.channels?.length
          ? ["all"]
          : formik.values.channels
        )?.map((channel: string, index: number) => {
          return (
            <View
              key={index}
              style={{
                marginRight: 10,
                borderRadius: 50,
                paddingVertical: 6,
                paddingHorizontal: 12,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#E5E9EC",
              }}
            >
              <DefaultText fontSize="md" fontWeight="medium">
                {channel === "all" ? "All" : ChannelsName[channel] || channel}
              </DefaultText>

              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => {
                  handleChannels(channel);
                }}
                disabled={!isEditing}
              >
                <ICONS.CloseCircleIcon />
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    ) : (
      <DefaultText
        fontWeight="normal"
        color={
          !isEditing ? theme.colors.otherGrey[100] : theme.colors.placeholder
        }
      >
        {t("Select Channels")}
      </DefaultText>
    );
  }, [formik.values.channels, formik.values.isRestaurant, isEditing, channels]);

  const handleChannels = (val: string) => {
    if (formik.values.channels.includes(val)) {
      const names = formik.values.channels.filter((channel) => channel !== val);
      formik.setFieldValue("channels", names);
    } else {
      formik.setFieldValue("channels", [...formik.values.channels, val]);
    }
  };

  const renderSheet = useMemo(
    () => (
      <>
        {openVariant && (
          <AddEditVariantModal
            data={{
              sku: formik.values.variants.map((variant: any) => {
                return variant.sku;
              }),
              boxSku:
                formik.values.boxes?.map((box: any) => {
                  return box.sku;
                }) || [],
              boxes: formik.values.boxes,
              actions: formik.values.actions,
              productId: product?._id || "",
              productName: {
                en: formik.values.en_name,
                ar: formik.values.ar_name,
              },
              enabledBatching: formik.values.enabledBatching,
              type: formik.values.type,
              variant:
                formik.values.type === "single"
                  ? formik.values.variants?.[0] || null
                  : null,
              hasMultipleVariants: formik.values.variants?.length > 1,
            }}
            visible={openVariant}
            handleClose={() => {
              debugLog(
                "Add variant modal closed",
                {},
                "product-add-modal",
                "handleClose"
              );
              setOpenVariant(false);
            }}
            handleDelete={(sku: string) => {
              handleDeleteVariant(sku);
              setOpenVariant(false);
            }}
            handleAdd={handleAddEditVariant}
            handleUpdateBoxes={(boxes: any) => {
              formik.setFieldValue("boxes", [...boxes]);
            }}
            handleUpdateActions={(actions: any) => {
              formik.setFieldValue("actions", [...actions]);
            }}
          />
        )}

        {openCategory && (
          <AddEditCategoryModal
            visible={openCategory}
            handleClose={() => {
              debugLog(
                "Add new category modal closed",
                {},
                "product-add-modal",
                "handleClose"
              );
              setCallCatAPi(true);
              setOpenCategory(false);
            }}
          />
        )}

        {openCollection && (
          <AddEditCollectionModal
            visible={openCollection}
            handleClose={() => {
              debugLog(
                "Add new collection modal closed",
                {},
                "product-add-modal",
                "handleClose"
              );
              setCallCollAPi(true);
              setOpenCollection(false);
            }}
          />
        )}
      </>
    ),
    [
      openVariant,
      openCategory,
      openCollection,
      formik.values.boxes,
      formik.values.actions,
      formik.values.variants,
      formik.values.type,
    ]
  );

  const showProductVDataChangesAlert = async () => {
    await showAlert({
      confirmation: t("Confirmation"),
      alertMsg: t("unsaved_changes_product_close"),
      btnText1: t("Discard"),
      btnText2: t("Save Changes"),
      onPressBtn1: () => {
        handleClose();
      },
      onPressBtn2: () => {
        if (!isConnected) {
          infoLog(
            "Internet not connected",
            {},
            "product-add-modal",
            "handleSave"
          );
          showToast("info", t("Please connect with internet"));
          return;
        }
        formik.handleSubmit();
      },
    });
  };

  const showVariantTypeSwitchAlert = async () => {
    await showAlert({
      confirmation: t("Confirmation"),
      alertMsg: t("multiple_to_single_variant_switch_alert"),
      btnText1: t("No"),
      btnText2: t("Yes"),
      onPressBtn1: () => {},
      onPressBtn2: () => {
        formik.setFieldValue("type", "single");

        if (formik.values.variants.length > 1) {
          formik.setFieldValue("variants", [formik.values.variants[0]]);
        }
      },
    });
  };

  const createNewVariant = () => {
    const create =
      formik.values.sku || formik.values.code || formik.values.unit.key;

    if (create && formik.values.variants.length === 0) {
      const data = {
        parentSku: "",
        parentName: { en: "", ar: "" },
        type: "item",
        assignedToAll: false,
        en_name: "Regular",
        ar_name: "عادي",
        image: "",
        variantPic: "",
        sku: formik.values.sku,
        code: formik.values.code,
        unit: formik.values.unit.key,
        noOfUnits: 1,
        costPrice: formik.values.costPrice,
        price: formik.values.price,
        originalPrice: formik.values.price,
        nonSaleable: false,
        locationRefs: [businessDetails.location._id],
        locations: [{ name: businessDetails.location.name.en }],
        prices: [
          {
            costPrice:
              Number(formik.values.costPrice) > 0
                ? `${formik.values.costPrice}`
                : "",
            price:
              Number(formik.values.price) > 0 ? `${formik.values.price}` : "",
            locationRef: businessDetails.location._id,
            location: { name: businessDetails.location.name.en },
          },
        ],
        otherPrices: [],
        stocks: [
          {
            enabledAvailability: true,
            enabledTracking: false,
            stockCount: 0,
            enabledLowStockAlert: false,
            lowStockCount: 0,
            locationRef: businessDetails.location._id,
            location: { name: businessDetails.location.name.en },
          },
        ],
        otherStocks: [],
        status: "active",
      };

      formik.setFieldValue("formChanged", true);
      formik.setFieldValue("variants", [data]);
    }
  };

  const showBatchingAlert = async (val: boolean) => {
    const enabledMsg = `${t(
      "On enabled batching, created the batch for all the respective variants"
    )}. ${t("Do you want to continue?")}`;

    const disabledMsg = `${t(
      "On disabled batching, the available quantity of all the batches was merged into respective variants"
    )}. ${t("Do you want to continue?")}`;

    await showAlert({
      confirmation: t("Confirmation"),
      alertMsg: val ? enabledMsg : disabledMsg,
      btnText1: t("No"),
      btnText2: t("Yes"),
      onPressBtn1: () => {},
      onPressBtn2: () => {
        if (val) {
          setOpenDatePicker(true);
        } else {
          setShowLoader(true);
          setLoaderText(
            `${t("Please wait")}... ${t(
              "While mergeing all batches into respective variants"
            )}.`
          );
          mergeAllBatchesIntoVariants();
        }
      },
    });
  };

  const mergeAllBatchesIntoVariants = () => {
    formik.values.variants.map(async (variant: any, index: number) => {
      const batches = await repo.batch.find({
        where: {
          variant: Like(`%${variant.sku}%`),
          status: "active",
          expiry: Raw(
            (alias: any) => `${alias} >= '${new Date().toISOString()}'`
          ),
        },
        order: { expiry: "DESC" },
      });

      if (batches.length > 0) {
        const availableQty = batches.reduce(
          (acc: number, batch: BatchModel) => {
            return acc + (batch.available || 0);
          },
          0
        );

        let updatedVariants = formik.values.variants;
        updatedVariants[index].stocks[0].stockCount = availableQty;

        formik.setFieldValue("variants", [...updatedVariants]);

        debugLog(
          "Variant updated to product",
          updatedVariants,
          "product-add-modal",
          "mergeAllBatchIntoVariant"
        );

        debugLog(
          "Batches removed for the variant",
          batches,
          "product-add-modal",
          "mergeAllBatchIntoVariant"
        );
        await repo.batch.remove(batches);
      }
    });

    formik.setFieldValue("enabledBatching", false);
    setLoaderText("");
    setShowLoader(false);
  };

  const createBatchForAllVariants = async (expiry: Date) => {
    formik.values.variants.map(async (variant: any) => {
      const stocks = variant?.stocks?.[0];

      if (stocks?.enabledTracking) {
        const batchData = {
          _id: objectId(),
          companyRef: businessDetails.location.companyRef,
          company: { name: businessDetails.company.name.en },
          locationRef: businessDetails.location._id,
          location: { name: businessDetails.location.name.en },
          vendorRef: "",
          vendor: { name: "" },
          productRef: product._id,
          product: {
            name: { en: formik.values.en_name, ar: formik.values.ar_name },
          },
          hasMultipleVariants: formik.values.variants?.length > 1,
          variant: {
            name: {
              en: variant.en_name,
              ar: variant.ar_name,
            },
            type: variant.type,
            qty: Number(stocks?.stockCount || 0),
            unit: 1,
            sku: variant.sku,
            costPrice: Number(variant.costPrice) || 0,
            sellingPrice: Number(variant.price) || 0,
          },
          sku: variant.sku,
          received: Number(stocks?.stockCount || 0),
          transfer: 0,
          available: Number(stocks?.stockCount || 0),
          expiry: expiry,
          createdAt: new Date(),
          status: "active",
          source: "local",
        };

        await repo.batch.insert(batchData as any);

        debugLog(
          "Batch created for variant",
          batchData,
          "product-add-modal",
          "createBatchForAllVariants"
        );
      }
    });

    formik.setFieldValue("enabledBatching", true);
    setLoaderText("");
    setShowLoader(false);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent={false}
      style={{ height: "100%" }}
    >
      <View style={mainContainerStyle}>
        <View style={containerStyle}>
          <ActionSheetHeader
            title={data.product ? data?.title : t("Add new product")}
            rightBtnText={
              data.product ? (isEditing ? t("Save") : t("Edit")) : t("Add")
            }
            handleLeftBtn={() => {
              if (formik.values.formChanged) {
                showProductVDataChangesAlert();
              } else {
                handleClose();
              }
            }}
            loading={formik.isSubmitting}
            handleRightBtn={handleSave}
            permission={
              data?.product
                ? authContext.permission["pos:product"]?.update
                : authContext.permission["pos:product"]?.create
            }
          />

          <KeyboardAvoidingView
            enabled={true}
            behavior={"height"}
            keyboardVerticalOffset={Platform.OS == "ios" ? 50 : 20}
          >
            <ScrollView
              scrollEnabled={scrollEnabled}
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              onScrollBeginDrag={Keyboard.dismiss}
              contentContainerStyle={{
                paddingVertical: hp("3%"),
                paddingHorizontal: hp("2.5%"),
              }}
            >
              {twoPaneView ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ width: "68%" }}>
                    <Input
                      style={{ width: "100%" }}
                      label={`${t("PRODUCT NAME")} *`}
                      autoCapitalize="words"
                      maxLength={60}
                      placeholderText={t("Enter the product name")}
                      values={formik.values.en_name}
                      handleChange={(val: any) => {
                        formik.setFieldValue("formChanged", true);
                        formik.setFieldValue("en_name", val);
                      }}
                      disabled={!isEditing}
                    />
                    <ErrorText
                      errors={
                        (formik.errors.en_name &&
                          formik.touched.en_name) as Boolean
                      }
                      title={formik.errors.en_name || ""}
                    />

                    <Spacer space={hp("2.5%")} />

                    <Input
                      style={{ width: "100%" }}
                      label={`${t("PRODUCT NAME IN ARABIC")} *`}
                      autoCapitalize="words"
                      maxLength={60}
                      placeholderText={t("Enter the product name")}
                      values={formik.values.ar_name}
                      handleChange={(val: any) => {
                        formik.setFieldValue("formChanged", true);
                        formik.setFieldValue("ar_name", val);
                      }}
                      disabled={!isEditing}
                    />
                    <ErrorText
                      errors={
                        (formik.errors.ar_name &&
                          formik.touched.ar_name) as Boolean
                      }
                      title={formik.errors.ar_name || ""}
                    />
                  </View>

                  <View style={{ marginLeft: wp("2%"), alignItems: "center" }}>
                    <ImageUploader
                      picText={
                        formik.values.productPic
                          ? t("Change Picture")
                          : t("Upload Picture")
                      }
                      uploadedImage={formik.values.productPic}
                      handleImageChange={(uri: string) => {
                        if (uri && uri != product?.image) {
                          formik.setFieldValue("formChanged", true);
                        }
                        formik.setFieldValue("productPic", uri);
                      }}
                      disabled={!isEditing}
                    />
                  </View>
                </View>
              ) : (
                <View>
                  <View
                    style={{ alignItems: "center", marginBottom: hp("3%") }}
                  >
                    <ImageUploader
                      size={hp("20%")}
                      picText={
                        formik.values.productPic
                          ? t("Change Picture")
                          : t("Upload Picture")
                      }
                      uploadedImage={formik.values.productPic}
                      handleImageChange={(uri: string) => {
                        if (uri && uri != product?.image) {
                          formik.setFieldValue("formChanged", true);
                        }
                        formik.setFieldValue("productPic", uri);
                      }}
                      disabled={!isEditing}
                    />
                  </View>

                  <Input
                    style={{ width: "100%" }}
                    label={`${t("PRODUCT NAME")} *`}
                    autoCapitalize="words"
                    maxLength={60}
                    placeholderText={t("Enter the product name")}
                    values={formik.values.en_name}
                    handleChange={(val: any) => {
                      formik.setFieldValue("formChanged", true);
                      formik.setFieldValue("en_name", val);
                    }}
                    disabled={!isEditing}
                  />
                  <ErrorText
                    errors={
                      (formik.errors.en_name &&
                        formik.touched.en_name) as Boolean
                    }
                    title={formik.errors.en_name || ""}
                  />

                  <Spacer space={hp("2.5%")} />

                  <Input
                    style={{ width: "100%" }}
                    label={`${t("PRODUCT NAME IN ARABIC")} *`}
                    autoCapitalize="words"
                    maxLength={60}
                    placeholderText={t("Enter the product name")}
                    values={formik.values.ar_name}
                    handleChange={(val: any) => {
                      formik.setFieldValue("formChanged", true);
                      formik.setFieldValue("ar_name", val);
                    }}
                    disabled={!isEditing}
                  />
                  <ErrorText
                    errors={
                      (formik.errors.ar_name &&
                        formik.touched.ar_name) as Boolean
                    }
                    title={formik.errors.ar_name || ""}
                  />
                </View>
              )}

              {product?._id &&
                formik.values.isRestaurant &&
                formik.values.isKitchen && (
                  <View>
                    {/* <Spacer space={hp("3.75%")} />

                    <Input
                      style={{ width: "100%" }}
                      label={`${t("KITCHEN FACING NAME")}`}
                      autoCapitalize="words"
                      maxLength={60}
                      placeholderText={t("Enter the kitchen facing name")}
                      values={formik.values.kitchenFacingNameEn}
                      handleChange={(val: any) => {
                        formik.setFieldValue("formChanged", true);
                        formik.setFieldValue("kitchenFacingNameEn", val);
                      }}
                      disabled={!isEditing}
                    />
                    <ErrorText
                      errors={
                        (formik.errors.kitchenFacingNameEn &&
                          formik.touched.kitchenFacingNameEn) as Boolean
                      }
                      title={formik.errors.kitchenFacingNameEn || ""}
                    />

                    <Spacer space={hp("3.75%")} />

                    <Input
                      style={{ width: "100%" }}
                      label={`${t("KITCHEN FACING NAME IN ARABIC")}`}
                      autoCapitalize="words"
                      maxLength={60}
                      placeholderText={t("Enter the kitchen facing name")}
                      values={formik.values.kitchenFacingNameAr}
                      handleChange={(val: any) => {
                        formik.setFieldValue("formChanged", true);
                        formik.setFieldValue("kitchenFacingNameAr", val);
                      }}
                      disabled={!isEditing}
                    />
                    <ErrorText
                      errors={
                        (formik.errors.kitchenFacingNameAr &&
                          formik.touched.kitchenFacingNameAr) as Boolean
                      }
                      title={formik.errors.kitchenFacingNameAr || ""}
                    /> */}

                    {/* <Spacer space={hp("3.75%")} />

                    <SelectInput
                      label={`${t("KITCHEN ROUTING")} *`}
                      placeholderText={t("Select Kitchen Routing")}
                      options={[]}
                      allowSearch={false}
                      values={formik.values.kitchenRoutingCategory}
                      handleChange={(val: any) => {
                        if (val.key && val.value) {
                          formik.setFieldValue("formChanged", true);
                          formik.setFieldValue("kitchenRoutingCategory", val);
                        }
                      }}
                      containerStyle={{ borderWidth: 0 }}
                      disabled={!isEditing}
                    />
                    <ErrorText
                      errors={
                        (formik.errors.kitchenRoutingCategory?.value &&
                          formik.touched.kitchenRoutingCategory
                            ?.value) as Boolean
                      }
                      title={formik.errors.kitchenRoutingCategory?.value || ""}
                    /> */}

                    {formik.values.kitchenRefs?.length > 0 && (
                      <>
                        <Spacer space={hp("3.75%")} />

                        <Label>{`${t("KITCHEN")}`}</Label>

                        <TouchableOpacity
                          style={{
                            ...styles.drop_down_view,
                            // height: hp("7.5%"),
                            borderRadius: 16,
                            paddingVertical: 18,
                            opacity: 0.5, // isEditing ? 1 : 0.5,
                            backgroundColor: theme.colors.white[1000],
                          }}
                          // onPress={() => {
                          //   if (isEditing) {
                          //     kitchenSelectInputRef.current.open();
                          //   }
                          // }}
                          disabled={true} // {!isEditing}
                        >
                          <DefaultText
                            fontWeight="normal"
                            color={
                              !isEditing ||
                              formik.values.kitchenRefs?.length > 0
                                ? theme.colors.otherGrey[100]
                                : theme.colors.placeholder
                            }
                          >
                            {formik.values.kitchenRefs?.length > 0
                              ? formik.values.kitchens
                                  ?.map((kitchen: any) => kitchen)
                                  .join(", ")
                              : t("Select Kitchen")}
                          </DefaultText>

                          {/* <View
                        style={{
                          transform: [{ rotate: isRTL ? "180deg" : "0deg" }],
                        }}
                      >
                        <ICONS.RightContentIcon />
                      </View> */}
                        </TouchableOpacity>
                      </>
                    )}

                    <Spacer space={hp("1%")} />
                  </View>
                )}

              {formik.values.isRestaurant && (
                <View>
                  <Spacer space={hp("3%")} />

                  <SelectInput
                    label={`${t("CONTAINS")} *`}
                    placeholderText={t("Select Contains")}
                    options={ContainsOptions}
                    allowSearch={false}
                    values={{
                      key: formik.values.contains,
                      value: ContainsName[formik.values.contains],
                    }}
                    handleChange={(val: any) => {
                      if (val.key && val.value) {
                        formik.setFieldValue("formChanged", true);
                        formik.setFieldValue("contains", val.key);
                      }
                    }}
                    containerStyle={{ borderWidth: 0 }}
                    disabled={!isEditing}
                  />
                  <ErrorText
                    errors={
                      (formik.errors.contains &&
                        formik.touched.contains) as Boolean
                    }
                    title={formik.errors.contains || ""}
                  />
                </View>
              )}

              <Spacer
                space={formik.values.isRestaurant ? hp("4%") : hp("3.25%")}
              />

              <Input
                containerStyle={{ height: hp("15%") }}
                style={{ paddingVertical: wp("1.25%") }}
                label={t("DESCRIPTION")}
                autoCapitalize="sentences"
                placeholderText={t("Enter the product description")}
                multiline={true}
                numOfLines={10}
                maxLength={70}
                values={formik.values.description}
                handleChange={(val: string) => {
                  formik.setFieldValue("formChanged", true);
                  formik.setFieldValue("description", val);
                }}
                disabled={!isEditing}
              />

              {formik.values.isRestaurant && (
                <View>
                  <Spacer space={hp("3.75%")} />

                  <Label>{t("CATEGORIES")}</Label>

                  <TouchableOpacity
                    style={{
                      ...styles.collection_view,
                      // height: hp("7.5%"),
                      paddingVertical:
                        formik.values.restaurantCategories?.length > 0
                          ? 13
                          : 19,
                      opacity: isEditing ? 1 : 0.5,
                      backgroundColor: theme.colors.white[1000],
                    }}
                    onPress={() => {
                      if (isEditing) {
                        categoriesSelectInputRef.current.open();
                      }
                    }}
                    disabled={!isEditing}
                  >
                    {categoriesOpt}

                    <View
                      style={{
                        right: 0,
                        paddingLeft: 4,
                        paddingRight: 16,
                        position: "absolute",
                        transform: [{ rotate: isRTL ? "180deg" : "0deg" }],
                      }}
                    >
                      <ICONS.RightContentIcon />
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              <Spacer space={hp("3.75%")} />

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Label>
                  {`${
                    formik.values.isRestaurant
                      ? t("REPORTING CATEGORY")
                      : t("PRODUCT CATEGORY")
                  } *`}
                </Label>

                <TouchableOpacity
                  style={{ marginRight: hp("1.5%") }}
                  onPress={() => {
                    debugLog(
                      "Add new category modal opened",
                      {},
                      "product-add-modal",
                      "handleAddCategory"
                    );
                    setCallCatAPi(false);
                    setOpenCategory(true);
                  }}
                  disabled={!isEditing}
                >
                  <DefaultText
                    fontSize="md"
                    fontWeight="medium"
                    color={
                      isEditing ? "primary.1000" : theme.colors.placeholder
                    }
                  >
                    {t("ADD NEW")}
                  </DefaultText>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={{
                  ...styles.drop_down_view,
                  height: hp("7.5%"),
                  borderRadius: 16,
                  opacity: isEditing ? 1 : 0.5,
                  backgroundColor: theme.colors.white[1000],
                }}
                onPress={() => {
                  if (isEditing) {
                    categorySelectInputRef.current.open();
                  }
                }}
                disabled={!isEditing}
              >
                <DefaultText
                  fontWeight="normal"
                  color={
                    !isEditing || formik.values.category.key
                      ? theme.colors.otherGrey[100]
                      : theme.colors.placeholder
                  }
                >
                  {formik.values.category.key
                    ? formik.values.category.value
                    : formik.values.isRestaurant
                    ? t("Select Reporting Category")
                    : t("Select Product Category")}
                </DefaultText>

                <View
                  style={{
                    transform: [
                      {
                        rotate: isRTL ? "180deg" : "0deg",
                      },
                    ],
                  }}
                >
                  <ICONS.RightContentIcon />
                </View>
              </TouchableOpacity>
              <ErrorText
                errors={
                  (formik.errors.category?.value &&
                    formik.touched.category?.value) as Boolean
                }
                title={formik.errors.category?.value || ""}
              />

              {product?._id && (
                <View>
                  <Spacer space={hp("3.75%")} />

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Label>{t("PRODUCT COLLECTIONS")}</Label>

                    <TouchableOpacity
                      style={{ marginRight: hp("1.5%") }}
                      onPress={() => {
                        debugLog(
                          "Add new collection modal opened",
                          {},
                          "product-add-modal",
                          "handleAddCollection"
                        );
                        setCallCollAPi(false);
                        setOpenCollection(true);
                      }}
                      disabled={!isEditing}
                    >
                      <DefaultText
                        fontSize="md"
                        fontWeight="medium"
                        color={
                          isEditing ? "primary.1000" : theme.colors.placeholder
                        }
                      >
                        {t("ADD NEW")}
                      </DefaultText>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={{
                      ...styles.collection_view,
                      // height: hp("7.5%"),
                      paddingVertical:
                        formik.values.collections?.length > 0 ? 13 : 19,
                      opacity: isEditing ? 1 : 0.5,
                      backgroundColor: theme.colors.white[1000],
                    }}
                    onPress={() => {
                      if (isEditing) {
                        collectionSelectInputRef.current.open();
                      }
                    }}
                    disabled={!isEditing}
                  >
                    {collectionOpt}

                    <View
                      style={{
                        right: 0,
                        paddingLeft: 4,
                        paddingRight: 16,
                        position: "absolute",
                        transform: [{ rotate: isRTL ? "180deg" : "0deg" }],
                      }}
                    >
                      <ICONS.RightContentIcon />
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              <Spacer space={hp("3.75%")} />

              <View>
                <TouchableOpacity
                  style={{
                    ...styles.drop_down_view,
                    height: hp("7.5%"),
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    opacity: isEditing ? 1 : 0.5,
                    backgroundColor: theme.colors.white[1000],
                  }}
                  onPress={() => {
                    if (isEditing) {
                      brandSelectInputRef.current.open();
                    }
                  }}
                  disabled={!isEditing}
                >
                  <DefaultText
                    style={{ maxWidth: "40%" }}
                    fontWeight="normal"
                    color={theme.colors.text.primary}
                  >
                    {`${t("Brand")} *`}
                  </DefaultText>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <DefaultText
                      fontWeight="normal"
                      color={
                        !isEditing || formik.values.brand.key
                          ? theme.colors.otherGrey[100]
                          : theme.colors.placeholder
                      }
                      style={{ marginRight: hp("2%") }}
                    >
                      {formik.values.brand.key
                        ? formik.values.brand.value
                        : t("Select Brand")}
                    </DefaultText>

                    <View
                      style={{
                        transform: [
                          {
                            rotate: isRTL ? "180deg" : "0deg",
                          },
                        ],
                      }}
                    >
                      <ICONS.RightContentIcon />
                    </View>
                  </View>
                </TouchableOpacity>

                <View
                  style={{
                    marginLeft: 16,
                    borderBottomWidth: 0.5,
                    borderColor: theme.colors.dividerColor.main,
                  }}
                />

                <TouchableOpacity
                  style={{
                    ...styles.drop_down_view,
                    height: hp("7.5%"),
                    opacity: isEditing ? 1 : 0.5,
                    backgroundColor: theme.colors.white[1000],
                  }}
                  onPress={() => {
                    if (isEditing) {
                      taxSelectInputRef.current.open();
                    }
                  }}
                  disabled={!isEditing}
                >
                  <DefaultText
                    style={{ maxWidth: "40%" }}
                    fontWeight="normal"
                    color={theme.colors.text.primary}
                  >
                    {`${t("VAT")} (${t("in")} %) *`}
                  </DefaultText>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <DefaultText
                      fontWeight="normal"
                      color={
                        !isEditing || formik.values.tax.key
                          ? theme.colors.otherGrey[100]
                          : theme.colors.placeholder
                      }
                      style={{ marginRight: hp("2%") }}
                    >
                      {formik.values.tax.key
                        ? `${formik.values.tax.value}%`
                        : t("Select Tax")}
                    </DefaultText>

                    <View
                      style={{
                        transform: [
                          {
                            rotate: isRTL ? "180deg" : "0deg",
                          },
                        ],
                      }}
                    >
                      <ICONS.RightContentIcon />
                    </View>
                  </View>
                </TouchableOpacity>

                <View
                  style={{
                    marginLeft: 16,
                    borderBottomWidth: 0.5,
                    borderColor: theme.colors.dividerColor.main,
                  }}
                />

                <View
                  style={{
                    paddingVertical: 13,
                    paddingHorizontal: 16,
                    borderBottomLeftRadius: formik.values.isRestaurant ? 0 : 16,
                    borderBottomRightRadius: formik.values.isRestaurant
                      ? 0
                      : 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    opacity: data?.product?._id ? 0.5 : 1,
                    backgroundColor: theme.colors.white[1000],
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <DefaultText>{t("Batching")}</DefaultText>

                    <View style={{ marginTop: 4, marginLeft: 8 }}>
                      <ToolTip infoMsg={t("Please update batching from web")} />
                    </View>
                  </View>

                  <Switch
                    style={{
                      opacity: data?.product?._id
                        ? 1
                        : authContext.permission["pos:product"]?.batching
                        ? 1
                        : 0.5,
                      transform:
                        Platform.OS == "ios"
                          ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                          : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
                      height: hp("5%"),
                    }}
                    trackColor={{
                      false: "rgba(120, 120, 128, 0.16)",
                      true: "#34C759",
                    }}
                    thumbColor={theme.colors.white[1000]}
                    onValueChange={(val: any) => {
                      if (!data.product) {
                        formik.setFieldValue("formChanged", true);
                        formik.setFieldValue("enabledBatching", val);
                        return;
                      }

                      showBatchingAlert(val);
                    }}
                    value={formik.values.enabledBatching}
                    disabled={
                      data?.product?._id
                        ? true
                        : !authContext.permission["pos:product"]?.batching
                    }
                  />
                </View>

                {formik.values.isRestaurant && (
                  <>
                    <View
                      style={{
                        marginLeft: 16,
                        borderBottomWidth: 0.5,
                        borderColor: theme.colors.dividerColor.main,
                      }}
                    />

                    <View
                      style={{
                        paddingVertical: 13,
                        paddingHorizontal: 16,
                        borderBottomLeftRadius: 16,
                        borderBottomRightRadius: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        opacity: isEditing ? 1 : 0.5,
                        backgroundColor: theme.colors.white[1000],
                      }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <DefaultText>{t("Bestseller")}</DefaultText>

                        <View style={{ marginTop: 4, marginLeft: 8 }}>
                          <ToolTip
                            infoMsg={t(
                              "There can only be 3 best seller product in a category"
                            )}
                          />
                        </View>
                      </View>

                      <Switch
                        style={{
                          opacity: isEditing ? 1 : 0.5,
                          transform:
                            Platform.OS == "ios"
                              ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                              : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
                          height: hp("5%"),
                        }}
                        trackColor={{
                          false: "rgba(120, 120, 128, 0.16)",
                          true: "#34C759",
                        }}
                        thumbColor={theme.colors.white[1000]}
                        onValueChange={(val: any) => {
                          formik.setFieldValue("formChanged", true);
                          formik.setFieldValue("bestSeller", val);
                        }}
                        value={formik.values.bestSeller}
                        disabled={!isEditing}
                      />
                    </View>
                  </>
                )}
              </View>

              <Spacer space={hp("5%")} />

              <View style={styles.labelTextView}>
                <View
                  style={{
                    marginBottom: formik.values.sku ? hp("2.5%") : hp("0.5%"),
                    marginLeft: hp("1.75%"),
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    style={{
                      maxWidth: "40%",
                      opacity: isEditing ? 1 : 0.5,
                      flexDirection: "row",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                    onPress={() => {
                      if (formik.values.variants.length === 0) {
                        formik.setFieldValue("type", "single");
                      } else {
                        showVariantTypeSwitchAlert();

                        const variant = formik.values.variants[0];

                        const unitData: any = UNIT_OPTIONS.find(
                          (unit: any) => unit.key === variant.unit
                        );

                        formik.setFieldValue("sku", variant.sku);
                        formik.setFieldValue("code", variant?.code || "");
                        formik.setFieldValue("unit", unitData);
                        formik.setFieldValue(
                          "costPrice",
                          variant.prices[0]?.costPrice
                        );
                        formik.setFieldValue("price", variant.prices[0]?.price);
                      }
                    }}
                    disabled={!isEditing}
                  >
                    <Checkbox
                      isChecked={formik.values.type == "single"}
                      fillColor={theme.colors.white[1000]}
                      unfillColor={theme.colors.white[1000]}
                      iconComponent={
                        formik.values.type == "single" ? (
                          <ICONS.RadioFilledIcon
                            color={theme.colors.primary[1000]}
                          />
                        ) : (
                          <ICONS.RadioEmptyIcon
                            color={theme.colors.primary[1000]}
                          />
                        )
                      }
                      disableBuiltInState
                      disabled
                    />

                    <DefaultText fontSize="xl">
                      {t("Single Variant")}
                    </DefaultText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      maxWidth: "40%",
                      opacity: isEditing ? 1 : 0.5,
                      marginLeft: hp("4%"),
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                    onPress={() => {
                      createNewVariant();
                      formik.setFieldValue("type", "multiple");
                    }}
                    disabled={!isEditing}
                  >
                    <Checkbox
                      isChecked={formik.values.type == "multiple"}
                      fillColor={theme.colors.white[1000]}
                      unfillColor={theme.colors.white[1000]}
                      iconComponent={
                        formik.values.type == "multiple" ? (
                          <ICONS.RadioFilledIcon
                            color={theme.colors.primary[1000]}
                          />
                        ) : (
                          <ICONS.RadioEmptyIcon
                            color={theme.colors.primary[1000]}
                          />
                        )
                      }
                      disableBuiltInState
                      disabled
                    />

                    <DefaultText fontSize="xl">
                      {t("Multiple Variants")}
                    </DefaultText>
                  </TouchableOpacity>
                </View>
              </View>

              {isConnected &&
                !skuGenerated &&
                formik.values.type === "single" &&
                !formik.values.sku && (
                  <TouchableOpacity
                    style={{
                      alignItems: "flex-end",
                      opacity: isEditing ? 1 : 0.5,
                      marginRight: hp("1.5%"),
                      marginBottom: 8,
                    }}
                    onPress={getUniqueSKU}
                    disabled={skuGenerated || !isEditing}
                  >
                    <DefaultText
                      fontSize="md"
                      fontWeight="medium"
                      color={
                        skuGenerated ? theme.colors.placeholder : "primary.1000"
                      }
                    >
                      {t("GENERATE SKU")}
                    </DefaultText>
                  </TouchableOpacity>
                )}

              {formik.values.type === "single" ? (
                <View>
                  <View
                    style={{
                      ...styles.skuView,
                      backgroundColor: theme.colors.white[1000],
                    }}
                  >
                    <DefaultText fontWeight="normal">{`${t(
                      "SKU"
                    )} *`}</DefaultText>

                    <Input
                      containerStyle={styles.skuInputContainerView}
                      maxLength={16}
                      style={{
                        width: "100%",
                        textAlign: isRTL ? "left" : "right",
                      }}
                      keyboardType={"number-pad"}
                      placeholderText={t("Enter sku")}
                      values={formik.values.sku}
                      handleChange={(val: any) => {
                        formik.setFieldValue("formChanged", true);
                        formik.setFieldValue("sku", val?.trim());
                      }}
                      disabled={
                        !isEditing ||
                        (product?._id && formik.values.variants.length > 0)
                      }
                    />
                  </View>

                  <View
                    style={{
                      ...styles.dividerView,
                      borderColor: theme.colors.dividerColor.main,
                    }}
                  />

                  <View
                    style={{
                      ...styles.priceView,
                      backgroundColor: theme.colors.white[1000],
                    }}
                  >
                    <DefaultText fontWeight="normal">{t("Code")}</DefaultText>

                    <Input
                      containerStyle={styles.skuInputContainerView}
                      maxLength={30}
                      style={{
                        width: "100%",
                        textAlign: isRTL ? "left" : "right",
                      }}
                      placeholderText={t("Enter code")}
                      values={formik.values.code}
                      handleChange={(val: any) => {
                        formik.setFieldValue("code", val?.trim());
                      }}
                      disabled={!isEditing}
                    />
                  </View>

                  <View
                    style={{
                      ...styles.dividerView,
                      borderColor: theme.colors.dividerColor.main,
                    }}
                  />

                  <SelectInput
                    containerStyle={{
                      borderWidth: 0,
                      borderRadius: 0,
                    }}
                    clearValues={formik.values.unit?.key == ""}
                    isTwoText={true}
                    allowSearch={false}
                    leftText={`${t("Unit")} *`}
                    placeholderText={t("Select Unit")}
                    options={UNIT_OPTIONS}
                    values={formik.values.unit}
                    handleChange={(val: any) => {
                      if (val.key && val.value) {
                        formik.setFieldValue("formChanged", true);
                        formik.setFieldValue("unit", val);
                      }
                    }}
                    disabled={!isEditing}
                  />

                  <View
                    style={{
                      ...styles.dividerView,
                      borderColor: theme.colors.dividerColor.main,
                    }}
                  />

                  <View
                    style={{
                      ...styles.priceView,
                      backgroundColor: theme.colors.white[1000],
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <DefaultText fontWeight="normal">
                        {`${t("Cost Price")} (${t("in")} ${t("SAR")})`}
                      </DefaultText>

                      <View style={{ marginTop: 4, marginLeft: 8 }}>
                        <ToolTip infoMsg={t("info_cost_price")} />
                      </View>
                    </View>

                    <AmountInput
                      containerStyle={styles.amountView}
                      maxLength={6}
                      style={{
                        width: "100%",
                        textAlign: isRTL ? "left" : "right",
                      }}
                      placeholderText={`${t("SAR")}  0.00`}
                      values={formik.values.costPrice}
                      handleChange={(val: any) => {
                        if (val.length > 2) {
                          showToast("info", t("Amount exceeds 3 digits"));
                        }

                        formik.setFieldValue("formChanged", true);
                        formik.setFieldValue("costPrice", val);
                      }}
                      disabled={!isEditing}
                    />
                  </View>

                  <View
                    style={{
                      ...styles.dividerView,
                      borderColor: theme.colors.dividerColor.main,
                    }}
                  />

                  <View
                    style={{
                      ...styles.priceView,
                      borderBottomLeftRadius: 16,
                      borderBottomRightRadius: 16,
                      backgroundColor: theme.colors.white[1000],
                    }}
                  >
                    <DefaultText fontWeight="normal">
                      {`${t("Selling Price")} (${t("in")} ${t("SAR")})`}
                    </DefaultText>

                    <AmountInput
                      containerStyle={styles.amountView}
                      maxLength={6}
                      style={{
                        width: "100%",
                        textAlign: isRTL ? "left" : "right",
                      }}
                      placeholderText={`${t("SAR")}  0.00`}
                      values={formik.values.price}
                      handleChange={(val: any) => {
                        if (val.length > 2) {
                          showToast("info", t("Amount exceeds 3 digits"));
                        }
                        formik.setFieldValue("formChanged", true);
                        formik.setFieldValue("price", val);
                      }}
                      disabled={!isEditing}
                    />
                  </View>
                </View>
              ) : (
                <VariantList
                  variants={formik.values.variants}
                  boxes={formik.values.boxes}
                  actions={formik.values.actions}
                  productId={data?.product?._id || ""}
                  productName={{
                    en: formik.values.en_name,
                    ar: formik.values.ar_name,
                  }}
                  enabledBatching={formik.values.enabledBatching}
                  handleAdd={handleAddEditVariant}
                  handleUpdateBoxes={(boxes: any) => {
                    formik.setFieldValue("boxes", [...boxes]);
                  }}
                  handleUpdateActions={(actions: any) => {
                    formik.setFieldValue("actions", [...actions]);
                  }}
                  handleDelete={handleDeleteVariant}
                  handleSort={(data: any) => {
                    debugLog(
                      "Variant drag drop performed to update position",
                      data,
                      "product-add-modal",
                      "handleDragDropVariant"
                    );
                    formik.setFieldValue("variants", [...data]);
                  }}
                  handleDragDrop={(val: boolean) => setScrollEnabled(val)}
                />
              )}

              <TouchableOpacity
                style={{
                  borderRadius: 14,
                  marginTop: hp("3.5%"),
                  paddingVertical: hp("2%"),
                  backgroundColor: theme.colors.white[1000],
                }}
                onPress={() => {
                  if (formik.values.variants?.length >= 10) {
                    infoLog(
                      "You can't add more than 10 variants",
                      {},
                      "product-add-modal",
                      "handleAddVariant"
                    );
                    showToast("info", t("You can't add more than 10 variants"));
                  } else {
                    if (
                      formik.values.type === "single" &&
                      formik.values.variants?.length === 0
                    ) {
                      createNewVariant();
                    }
                    debugLog(
                      "Add variant modal opened",
                      {},
                      "product-add-modal",
                      "handleAddVariant"
                    );
                    setOpenVariant(true);
                  }
                }}
                disabled={!isEditing}
              >
                <DefaultText
                  style={{ textAlign: "center" }}
                  fontSize="2xl"
                  fontWeight="medium"
                  color={isEditing ? "primary.1000" : theme.colors.placeholder}
                >
                  {formik.values.type === "single"
                    ? t("Stock & Boxes")
                    : t("Add a Variant")}
                </DefaultText>
              </TouchableOpacity>

              {formik.values.isRestaurant && (
                <>
                  <Spacer space={hp("5%")} />

                  <Label>{t("NUTRITIONAL INFORMATION")}</Label>

                  <View>
                    <View
                      style={{
                        ...styles.drop_down_view,
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        backgroundColor: theme.colors.white[1000],
                      }}
                    >
                      <DefaultText fontWeight="normal">
                        {`${t("Calorie Count")} (${t("in")} ${t("calories")})`}
                      </DefaultText>

                      <Input
                        containerStyle={styles.amountView}
                        style={{
                          width: "100%",
                          textAlign: isRTL ? "left" : "right",
                        }}
                        maxLength={6}
                        keyboardType="number-pad"
                        placeholderText={t("Enter calorie count")}
                        values={`${formik.values.calorieCount}`}
                        handleChange={(val: any) => {
                          if (val === "" || /^\d+(\.\d{0,3})?$/.test(val)) {
                            formik.setFieldValue("calorieCount", val);
                          }
                        }}
                        disabled={!isEditing}
                      />
                    </View>

                    <View
                      style={{
                        marginLeft: 16,
                        borderBottomWidth: 0.5,
                        borderColor: theme.colors.dividerColor.main,
                      }}
                    />

                    <TouchableOpacity
                      style={{
                        ...styles.drop_down_view,
                        // height: hp("7.5%"),
                        paddingVertical:
                          formik.values.preference?.length > 0 ? 13 : 19,
                        opacity: isEditing ? 1 : 0.5,
                        backgroundColor: theme.colors.white[1000],
                      }}
                      onPress={() => {
                        if (isEditing) {
                          preferenceSelectInputRef.current.open();
                        }
                      }}
                      disabled={!isEditing}
                    >
                      <DefaultText
                        style={{ width: "30%" }}
                        fontWeight="normal"
                        color={theme.colors.text.primary}
                      >
                        {t("Dietry Preferences")}
                      </DefaultText>

                      <View
                        style={{
                          width: "70%",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "flex-end",
                        }}
                      >
                        {preferenceOpt}

                        <View
                          style={{
                            marginTop: 3,
                            marginLeft: 8,
                            transform: [{ rotate: isRTL ? "180deg" : "0deg" }],
                          }}
                        >
                          <ICONS.RightContentIcon />
                        </View>
                      </View>
                    </TouchableOpacity>

                    <View
                      style={{
                        marginLeft: 16,
                        borderBottomWidth: 0.5,
                        borderColor: theme.colors.dividerColor.main,
                      }}
                    />

                    <TouchableOpacity
                      style={{
                        ...styles.drop_down_view,
                        // height: hp("7.5%"),
                        paddingVertical:
                          formik.values.dietryType?.length > 0 ? 13 : 19,
                        opacity: isEditing ? 1 : 0.5,
                        borderBottomLeftRadius: 16,
                        borderBottomRightRadius: 16,
                        backgroundColor: theme.colors.white[1000],
                      }}
                      onPress={() => {
                        if (isEditing) {
                          containsSelectInputRef.current.open();
                        }
                      }}
                      disabled={!isEditing}
                    >
                      <DefaultText
                        style={{ width: "30%" }}
                        fontWeight="normal"
                        color={theme.colors.text.primary}
                      >
                        {t("Contains the following")}
                      </DefaultText>

                      <View
                        style={{
                          maxWidth: "70%",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "flex-end",
                        }}
                      >
                        {dietryTypeOpt}

                        <View
                          style={{
                            marginTop: 3,
                            marginLeft: 8,
                            transform: [{ rotate: isRTL ? "180deg" : "0deg" }],
                          }}
                        >
                          <ICONS.RightContentIcon />
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>

                  <Spacer space={hp("4.75%")} />

                  <View
                    style={{
                      marginBottom: 6,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Label>{t("MODIFIERS")}</Label>

                    <TouchableOpacity
                      style={{ marginRight: hp("1.5%") }}
                      onPress={() => {
                        if (isEditing) {
                          modifiersSelectInputRef.current.open();
                        }
                      }}
                      disabled={!isEditing}
                    >
                      <DefaultText
                        fontSize="md"
                        fontWeight="medium"
                        color={
                          isEditing ? "primary.1000" : theme.colors.placeholder
                        }
                      >
                        {t("ADD MODIFIER")}
                      </DefaultText>
                    </TouchableOpacity>
                  </View>

                  <ModifierList
                    disabled={!isEditing}
                    modifiers={formik.values.modifiers}
                    handleUpdate={handleUpdateModifier}
                    handleDelete={handleDeleteModifier}
                    handleSort={(data: any) => {
                      debugLog(
                        "Modifier drag drop performed to update position",
                        data,
                        "product-add-modal",
                        "handleDragDropModifier"
                      );
                      formik.setFieldValue("modifiers", [...data]);
                    }}
                    handleDragDrop={(val: boolean) => setScrollEnabled(val)}
                  />
                </>
              )}

              <Spacer space={hp("4.75%")} />

              <Label>{`${t("CHANNELS")} *`}</Label>

              <TouchableOpacity
                style={{
                  ...styles.collection_view,
                  // height: hp("7.5%"),
                  paddingVertical: formik.values.channels?.length > 0 ? 13 : 19,
                  opacity: isEditing ? 1 : 0.5,
                  backgroundColor: theme.colors.white[1000],
                }}
                onPress={() => {
                  if (isEditing) {
                    channelsSelectInputRef.current.open();
                  }
                }}
                disabled={!isEditing}
              >
                {channelsOpt}

                <View
                  style={{
                    right: 0,
                    paddingLeft: 4,
                    paddingRight: 16,
                    position: "absolute",
                    transform: [{ rotate: isRTL ? "180deg" : "0deg" }],
                  }}
                >
                  <ICONS.RightContentIcon />
                </View>
              </TouchableOpacity>
              <ErrorText
                errors={
                  (formik.errors.channels && formik.touched.channels) as Boolean
                }
                title={formik.errors.channels as any}
              />

              {/* {businessDetails?.company?.industry?.toLowerCase() ===
                "restaurant" && (
                <View>
                  <Spacer space={hp("3.75%")} />

                  <View
                    style={{
                      borderRadius: 16,
                      paddingVertical: 13,
                      paddingHorizontal: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      opacity: isEditing ? 1 : 0.5,
                      backgroundColor: theme.colors.white[1000],
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <DefaultText>{t("Self Ordering")}</DefaultText>

                      <View style={{ marginTop: 4, marginLeft: 8 }}>
                        <ToolTip
                          infoMsg={t("info_product_self_ordering_toggle")}
                        />
                      </View>
                    </View>

                    <Switch
                      style={{
                        opacity: isEditing ? 1 : 0.5,
                        transform:
                          Platform.OS == "ios"
                            ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                            : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
                        height: hp("5%"),
                      }}
                      trackColor={{
                        false: "rgba(120, 120, 128, 0.16)",
                        true: "#34C759",
                      }}
                      thumbColor={theme.colors.white[1000]}
                      onValueChange={(val: any) => {
                        formik.setFieldValue("formChanged", true);
                        formik.setFieldValue("selfOrdering", val);
                      }}
                      value={formik.values.selfOrdering}
                      disabled={!isEditing}
                    />
                  </View>
                </View>
              )} */}

              <Spacer space={hp("3.75%")} />

              <View
                style={{
                  borderRadius: 16,
                  paddingVertical: 13,
                  paddingHorizontal: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  opacity: isEditing ? 1 : 0.5,
                  backgroundColor: theme.colors.white[1000],
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <DefaultText>{t("Online Ordering")}</DefaultText>

                  <View style={{ marginTop: 4, marginLeft: 8 }}>
                    <ToolTip
                      infoMsg={t("info_product_online_ordering_toggle")}
                    />
                  </View>
                </View>

                <Switch
                  style={{
                    opacity: isEditing ? 1 : 0.5,
                    transform:
                      Platform.OS == "ios"
                        ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                        : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
                    height: hp("5%"),
                  }}
                  trackColor={{
                    false: "rgba(120, 120, 128, 0.16)",
                    true: "#34C759",
                  }}
                  thumbColor={theme.colors.white[1000]}
                  onValueChange={(val: any) => {
                    formik.setFieldValue("formChanged", true);
                    formik.setFieldValue("onlineOrdering", val);
                  }}
                  value={formik.values.onlineOrdering}
                  disabled={!isEditing}
                />
              </View>

              {product?._id && timeEvents?.length > 0 && (
                <View>
                  <Spacer space={hp("4.75%")} />

                  <Label>{t("TIME EVENTS")}</Label>

                  <Spacer space={6} />

                  <TimeEventList timeEvents={timeEvents} />
                </View>
              )}

              {product?._id &&
                (product?.boxRefs?.length > 0 ||
                  product?.crateRefs?.length > 0) && (
                  <View>
                    <Spacer space={hp("4.75%")} />

                    <Label>{t("RELATIONS")}</Label>

                    <Spacer space={6} />

                    <RelationList product={product} />
                  </View>
                )}

              <Spacer space={hp("12%")} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>

        {showLoader && (
          <View
            style={{
              width: twoPaneView ? "60%" : "100%",
              height: "100%",
              overflow: "hidden",
              position: "absolute",
              marginHorizontal: twoPaneView ? "20%" : "0%",
              backgroundColor: "rgba(0, 0, 0, 0.3)",
            }}
          >
            <ActivityIndicator style={{ marginTop: "40%" }} size={"small"} />

            <DefaultText
              style={{
                marginTop: 20,
                textAlign: "center",
                paddingHorizontal: "12%",
              }}
              fontSize="xl"
              fontWeight="medium"
            >
              {loaderText}
            </DefaultText>
          </View>
        )}
      </View>

      <KitchenSelectInput
        kitchen={{
          _id: formik.values.kitchenRefs[0],
          en_name: formik.values.kitchens[0],
          ar_name: "",
        }}
        sheetRef={kitchenSelectInputRef}
        handleSelected={(val: any) => {
          if (val?._id) {
            formik.setFieldValue("formChanged", true);
            handleKitchenChange(val._id, val.en_name, val.ar_name);
          }
        }}
      />

      <CategoriesSelectInput
        callApi={callCatApi}
        sheetRef={categoriesSelectInputRef}
        selectedIds={formik.values.restaurantCategoryRefs}
        selectedNames={formik.values.restaurantCategories}
        handleSelected={(ids: string[], names: string[]) => {
          if (ids?.length > 0) {
            formik.setFieldValue("restaurantCategoryRefs", ids);
            formik.setFieldValue("restaurantCategories", names);
          } else {
            formik.setFieldValue("restaurantCategoryRefs", []);
            formik.setFieldValue("restaurantCategories", []);
          }

          formik.setFieldValue("formChanged", true);
          categoriesSelectInputRef.current.close();
        }}
      />

      <CategorySelectInput
        callApi={callCatApi}
        sheetRef={categorySelectInputRef}
        values={formik.values.category}
        reportingCategory={formik.values.isRestaurant}
        handleSelected={(val: any) => {
          if (val?.key && val?.value) {
            formik.setFieldValue("formChanged", true);
            formik.setFieldValue("category", val);
            categorySelectInputRef.current.close();
          }
        }}
      />

      <CollectionSelectInput
        callApi={callCollApi}
        productRef={product?._id}
        productPrice={formik.values.variants?.[0]?.price}
        sheetRef={collectionSelectInputRef}
        selectedIds={formik.values.collectionRefs}
        selectedNames={formik.values.collections}
        handleSelected={(ids: string[], names: string[]) => {
          if (ids?.length > 0) {
            formik.setFieldValue("collectionRefs", ids);
            formik.setFieldValue("collections", names);
          } else {
            formik.setFieldValue("collectionRefs", []);
            formik.setFieldValue("collections", []);
          }

          formik.setFieldValue("formChanged", true);
          collectionSelectInputRef.current.close();
        }}
      />

      <ChannelsSelectInput
        sheetRef={channelsSelectInputRef}
        selectedIds={formik.values.channels}
        channelOptions={channels}
        handleSelected={(channels: string[]) => {
          if (channels?.length > 0) {
            formik.setFieldValue("channels", channels);
          } else {
            formik.setFieldValue("channels", []);
          }

          formik.setFieldValue("formChanged", true);
          channelsSelectInputRef.current.close();
        }}
      />

      <BrandSelectInput
        sheetRef={brandSelectInputRef}
        values={formik.values.brand}
        handleSelected={(val: any) => {
          if (val?.key && val?.value) {
            formik.setFieldValue("formChanged", true);
            formik.setFieldValue("brand", val);
            brandSelectInputRef.current.close();
          }
        }}
      />

      <TaxSelectInput
        sheetRef={taxSelectInputRef}
        values={formik.values.tax}
        handleSelected={(val: any) => {
          if (val.key) {
            formik.setFieldValue("formChanged", true);
            formik.setFieldValue("tax", val);
            taxSelectInputRef.current.close();
          }
        }}
      />

      <PreferenceSelectInput
        sheetRef={preferenceSelectInputRef}
        selectedIds={formik.values.preference}
        handleSelected={(preference: string[]) => {
          if (preference?.length > 0) {
            formik.setFieldValue("preference", preference);
          } else {
            formik.setFieldValue("preference", []);
          }

          formik.setFieldValue("formChanged", true);
          preferenceSelectInputRef.current.close();
        }}
      />

      <ContainsSelectInput
        sheetRef={containsSelectInputRef}
        selectedIds={formik.values.dietryType}
        handleSelected={(dietryType: string[]) => {
          if (dietryType?.length > 0) {
            formik.setFieldValue("dietryType", dietryType);
          } else {
            formik.setFieldValue("dietryType", []);
          }

          formik.setFieldValue("formChanged", true);
          containsSelectInputRef.current.close();
        }}
      />

      <ModifierSelectInput
        sheetRef={modifiersSelectInputRef}
        values={formik.values.modifiers}
        handleSelected={(modifiers: any[]) => {
          if (modifiers?.length > 0) {
            formik.setFieldValue("modifiers", modifiers);
            showToast("success", t("Modifier added to product"));
          } else {
            formik.setFieldValue("modifiers", []);
          }

          formik.setFieldValue("formChanged", true);
          modifiersSelectInputRef.current.close();
        }}
      />

      <DateTimePickerModal
        isDarkModeEnabled={true}
        minimumDate={new Date()}
        minuteInterval={1}
        isVisible={openDatePicker}
        date={new Date()}
        mode="date"
        onConfirm={(date) => {
          setOpenDatePicker(false);
          setShowLoader(true);
          setLoaderText(
            `${t("Please wait")}... ${t(
              "While craeting batch for all the variants"
            )}.`
          );
          createBatchForAllVariants(date);
        }}
        onCancel={() => setOpenDatePicker(false)}
      />

      {renderSheet}

      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
  drop_down_view: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  collection_view: {
    width: "100%",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  labelTextView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dividerView: { marginLeft: 16, borderBottomWidth: 0.5 },
  skuView: {
    paddingHorizontal: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skuInputContainerView: {
    flex: 0.75,
    borderWidth: 0,
    borderRadius: 0,
  },
  priceView: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amountView: {
    flex: 0.75,
    borderWidth: 0,
    borderRadius: 0,
    alignSelf: "flex-end",
  },
});
