import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  MenuItem,
  Stack,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import { t } from "i18next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import endpoint from "src/api/endpoints";
import serviceCaller from "src/api/serviceCaller";
import BrandDropdown from "src/components/input/brand-auto-complete";
import CategoryDropdown from "src/components/input/category-auto-complete";
import ChannelMultiSelect from "src/components/input/channel-multiSelect";
import LocationMultiSelect from "src/components/input/location-multiSelect";
import TaxDropdown from "src/components/input/tax-auto-complete";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import i18n from "src/i18n";
import { MoleculeType } from "src/permissionManager";
import {
  ChannelsForOthers,
  ChannelsForRestaurant,
  ChannelsName,
  USER_TYPES,
  unitOptions,
} from "src/utils/constants";
import { useCurrency } from "src/utils/useCurrency";
import * as Yup from "yup";

interface ProductCreateModalProps {
  open: boolean;
  handleClose: any;
  industry?: any;
  isSaptco?: boolean;
}
interface CreateProduct {
  productImageFile?: any[];
  productImageUrl?: string;
  productNameEn: string;
  productContains?: string;
  assignedToAllChannels: boolean;
  productNameAr?: string;
  categoryRef?: string;
  category: string;
  productDescription?: string;
  brandRef: string;
  channelRefs?: string[];
  channels?: string[];
  brands?: string;
  taxRef: string;
  tax: number;
  expiry: Date;
  enabledBatching: boolean;
  variants: any[];
  init: boolean;
  assignedToAll: boolean;
  locationRefs?: string[];
  locations?: string[];
  variantImageFile: any[];
  variantImageUrl: string;
  variantNameEn?: string;
  variantNameAr?: string;
  singleVCode: string;
  sku: string;
  unit: string;
  type: string;
  defaultPrice: string;
  costPrice: string;
  // locationPrices: string;
  variantStatus: string;
  prices: any[];
  selectedLocations: any[];
  stockConfiguration: any[];
  boxes: any[];
  isRestaurant: boolean;
}
const validationSchema = Yup.object({
  productNameEn: Yup.string()
    .required(`${t("Product Name is required")}`)
    .max(60, t("Product name must not be greater than 60 characters")),
  productNameAr: Yup.string()
    .required(`${t("Product Name is required")}`)
    .max(60, t("Product name must not be greater than 60 characters")),
  category: Yup.string().required(`${t("Category is required")}`),
  brands: Yup.string().required(`${t("Brands is required")}`),
  taxRef: Yup.string().required(`${t("Tax is required")}`),
  enabledBatching: Yup.boolean(),
  locationRefs: Yup.array().when("assignedToAll", {
    is: true,
    then: Yup.array().optional(),
    otherwise: Yup.array()
      .required(i18n.t("Locations is required"))
      .min(1, i18n.t("Locations is required")),
  }),
  unit: Yup.string().required(`${i18n.t("Unit is required")}`),
  sku: Yup.string()
    .required(`${i18n.t("SKU is required")}`)
    .min(6, i18n.t("SKU should be minimum 6 digits"))
    .max(16, i18n.t("SKU should be maximum 16 digits")),
  defaultPrice: Yup.number()
    .typeError(i18n.t("Price must be a number"))
    .moreThan(0, i18n.t("Price must be greater than 0"))
    .nullable(),
  costPrice: Yup.number()
    .typeError(i18n.t("Price must be a number"))
    .moreThan(0, i18n.t("Price must be greater than 0"))
    .nullable(),
  channelRefs: Yup.array()
    .required(t("Order Type is required"))
    .min(1, t("Order Type is required")),
  productContains: Yup.string().when("isRestaurant", {
    is: true,
    then: Yup.string().required(t("Please Select Contains")),
    otherwise: Yup.string().optional(),
  }),
});

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

export const ProductCreateModal: React.FC<ProductCreateModalProps> = ({
  open,
  handleClose,
  industry,
  isSaptco,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { userType } = useUserType();
  const currency = useCurrency();

  const { id, companyRef, companyName, origin } = router.query;
  const [showError, setShowError] = useState(false);

  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["product:update"]);
  const [isPrefilled, setIsPrefilled] = useState(false);
  usePageView();
  const [generateApi, setGenerateApi] = useState(true);
  const [showAddBtn, setShowAddBtn] = useState(false);
  const [channels, setChannels] = useState<any[]>([]);

  const { create, loading } = useEntity("product");
  const { find, entities: locations } = useEntity("location");
  const { findOne: company, entity: companyEntity } = useEntity("company");

  const initialValues: CreateProduct = {
    productImageFile: [],
    productImageUrl: "",
    productNameEn: "",
    productNameAr: "",
    productContains: "",
    productDescription: "",
    brandRef: "",
    expiry: null,
    brands: "",
    categoryRef: "",
    category: "",
    taxRef: "",
    tax: null,
    assignedToAllChannels: false,
    enabledBatching: false,
    variants: [],
    channelRefs: [],
    channels: [],
    boxes: [],
    init: false,
    assignedToAll: false,
    locations: [],
    locationRefs: [],
    variantImageFile: [],
    variantImageUrl: "",
    variantNameEn: "",
    variantNameAr: "",
    sku: "",
    unit: "",
    defaultPrice: "",
    costPrice: "",
    type: "item",
    // locationPrices: "",
    variantStatus: "active",
    prices: [],
    selectedLocations: [],
    stockConfiguration: [],
    isRestaurant: false,
    singleVCode: "",
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);
      const data = {
        image: values.productImageUrl,
        name: {
          en: values?.productNameEn,
          ar: values?.productNameAr,
        },
        contains: values.productContains,
        bestSeller: false,
        restaurantCategoryRefs: [] as any,
        restaurantCategories: [] as any,
        collections: [] as any,
        collectionRefs: [] as any,
        collection: {
          collections: [] as any,
          collectionRefs: [] as any,
        },
        isComposite: false,
        modifiers: [] as any,
        nutritionalInformation: {
          calorieCount: null as any,
          preference: [] as any,
          contains: [] as any,
          assignedToAllPreferrence: false,
          assignedToAllItems: false,
        },
        assignedToAllCategories: false,
        description: values?.productDescription,
        companyRef: companyRef,
        company: {
          name: companyName,
        },
        brandRef: values?.brandRef,
        brand: {
          name: values?.brands,
        },
        categoryRef: values?.categoryRef,
        category: {
          name: values.category,
        },
        channel: values.channelRefs,
        taxRef: values?.taxRef,
        tax: {
          percentage: values?.tax,
        },
        selfOrdering: true,
        onlineOrdering: true,
        batching: values?.enabledBatching,
        expiry: expiryDate,
        isLooseItem: false,
        variants: [
          {
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
            image: values.variantImageUrl,
            name: {
              en: "Regular",
              ar: "Regular.ar",
            },
            type: values.type,
            sku: values.sku,
            code: values.singleVCode,
            unit: values.unit,
            unitCount: 1,
            costPrice: values.costPrice,
            price: values.defaultPrice,
            status: values.variantStatus,
            prices: values.prices,
            stockConfiguration: values.stockConfiguration,
          },
        ],
        boxes: values?.boxes,
        status: "active",
      };

      try {
        await create({ ...data });
        toast.success(
          t(
            "Product  created successfully, it will take few minutes to reflect on POS, If the POS is online otherwise when the POS comes online it will reflect in the product list"
          ).toString()
        );

        handleClose();
      } catch (err) {
        toast.error(err.message);
        handleClose();
      }
    },
  });

  useEffect(() => {
    if (companyRef) {
      find({
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
    if (companyRef != null && userType === USER_TYPES.SUPERADMIN) {
      company(companyRef?.toString());
    }
  }, [companyRef]);

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

  const generateUniqueSku = async () => {
    if (generateApi) {
      try {
        const res = await serviceCaller(endpoint.generateUniqueSKU.path, {
          method: endpoint.generateUniqueSKU.method,
        });

        if (res?.sku) {
          setGenerateApi(false);
          formik.setFieldValue("sku", res.sku);
        }
      } catch (error: any) {
        formik.setFieldValue("sku", "");
      }
    }
  };

  useEffect(() => {
    if (formik.values.sku === "" && open) {
      setGenerateApi(true);
    }
  }, [formik.values.sku]);

  useEffect(() => {
    const pricesLength = formik.values.prices.length;

    if (pricesLength == locations.total) {
      setShowAddBtn(true);
    } else if (pricesLength > 0) {
      const data = formik.values.prices;
      const index = data?.length - 1;
      const visible = Boolean(
        data[index].defaultPrice && data[index].location.name
      );

      setShowAddBtn(!visible);
    } else {
      setShowAddBtn(false);
    }
  }, [formik.values.prices]);

  useEffect(() => {
    if (locations.results?.length > 0) {
      const initialPrices = locations.results.map((location) => {
        return {
          price: formik.values.defaultPrice || 0,
          costPrice: formik.values.costPrice || 0,
          locationRef: location._id,
          overriden: false,
          location: {
            name: location.name.en,
          },
        };
      });
      formik.setFieldValue("prices", initialPrices);
    }
  }, [locations.results, formik.values.costPrice, formik.values.defaultPrice]);

  useEffect(() => {
    if (locations.results?.length > 0) {
      const initialStock = locations.results.map((location) => {
        const stock = formik.values.stockConfiguration.find(
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
      formik.setFieldValue("stockConfiguration", initialStock);
    }
  }, [locations.results]);

  useEffect(() => {
    if (id == null) {
      formik.setFieldValue("assignedToAllChannels", true);
      formik.setFieldValue(
        "channelRefs",
        channels?.map((type: any) => {
          return type.value;
        })
      );
    }

    formik.setFieldValue(
      "isRestaurant",
      industry === "restaurant" || user?.company?.industry === "restaurant"
    );
  }, [id, industry, user?.company?.industry, channels]);

  return (
    <>
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
              {t("Create Product")}
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
          {/* body */}

          <DialogContent>
            <Stack spacing={1} sx={{ mt: 2, mb: 1 }}>
              <Grid container>
                <Grid item md={12} xs={12}>
                  <Box sx={{}}>
                    <TextFieldWrapper
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
                </Grid>

                <Grid item md={12} xs={12}>
                  <Box sx={{ mt: 3 }}>
                    <TextFieldWrapper
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
                </Grid>
                {user?.company?.industry == "restaurant" && (
                  <Grid item md={12} xs={12}>
                    <Box sx={{ mt: 3 }}>
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
                          <MenuItem key={industry.value} value={industry.value}>
                            {industry.label}
                          </MenuItem>
                        ))}
                      </TextFieldWrapper>
                    </Box>
                  </Grid>
                )}
                <Grid item md={12} xs={12}>
                  <Box sx={{ mt: 3 }}>
                    <BrandDropdown
                      required
                      error={formik?.touched?.brands && formik.errors.brands}
                      onChange={(id, name) => {
                        formik.handleChange("brandRef")(id || "");
                        formik.handleChange("brands")(name || "");
                      }}
                      selectedId={formik.values.brandRef}
                      selectedName={formik.values.brands}
                      label={t("Brand")}
                      id="Brands"
                    />
                  </Box>
                </Grid>
                <Grid item md={12} xs={12}>
                  <Box sx={{ mt: 3 }}>
                    <CategoryDropdown
                      defaultSelectedValue={{
                        name: { en: formik.values.category },
                        _id: formik.values.categoryRef,
                      }}
                      companyRef={companyRef?.toString()}
                      required
                      error={
                        formik?.touched?.category && formik?.errors?.category
                      }
                      onChange={(id, name) => {
                        formik.handleChange("categoryRef")(id || "");
                        formik.handleChange("category")(name || "");
                      }}
                      selectedId={formik?.values?.categoryRef}
                      label={t("Category")}
                      id="category"
                    />
                  </Box>
                </Grid>
                <Grid item md={12} xs={12}>
                  <Box sx={{ mt: 3 }}>
                    <TaxDropdown
                      isPrefilled={false}
                      required
                      error={formik?.touched?.taxRef && formik?.errors?.taxRef}
                      onChange={(id, name) => {
                        if (id && name >= 0) {
                          formik.setFieldValue("taxRef", id);
                          formik.setFieldValue("tax", name);
                        }
                      }}
                      selectedId={formik?.values?.taxRef}
                      label={t("VAT")}
                      id="tax"
                    />
                  </Box>
                </Grid>

                <Grid item md={12} xs={12}>
                  <Box sx={{ mt: 3 }}>
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
                        formik.setFieldValue("selectedLocations", option);
                        if (option?.length > 0) {
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

                <Grid item md={12} xs={12}>
                  <Box sx={{ mt: 3 }}>
                    <TextFieldWrapper
                      inputProps={{
                        style: { textTransform: "capitalize" },
                      }}
                      autoComplete="off"
                      fullWidth
                      label={t("SKU")}
                      name="sku"
                      error={Boolean(formik.touched.sku && formik.errors.sku)}
                      helperText={
                        (formik.touched.sku && formik.errors.sku) as any
                      }
                      onBlur={formik.handleBlur}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value) {
                          const cleanedNumber = e.target.value.replace(
                            /\D/g,
                            ""
                          );
                          e.target.value = cleanedNumber
                            ? (Number(cleanedNumber) as any)
                            : "";
                        }
                        formik.handleChange(e);
                      }}
                      disabled={!open}
                      required
                      value={formik.values.sku}
                    />
                    {open && !formik.values.sku && (
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
                <Grid item md={12} xs={12}>
                  <Box sx={{ mt: 3 }}>
                    <TextFieldWrapper
                      inputProps={{
                        style: { textTransform: "capitalize" },
                      }}
                      autoComplete="off"
                      fullWidth
                      error={!!(formik.touched.unit && formik.errors.unit)}
                      helperText={
                        (formik.touched.unit && formik.errors.unit) as any
                      }
                      label={t("Unit")}
                      name="unit"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      select
                      value={formik.values.unit}
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
                <Grid item md={12} xs={12}>
                  <Box sx={{ mt: 3 }}>
                    <TextFieldWrapper
                      required={isSaptco}
                      fullWidth
                      label={isSaptco ? t("Kilometers") : t("Product Code")}
                      name="singleVCode"
                      error={Boolean(
                        formik.touched.singleVCode && formik.errors.singleVCode
                      )}
                      helperText={
                        (formik.touched.singleVCode &&
                          formik.errors.singleVCode) as any
                      }
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.singleVCode}
                    />
                  </Box>
                </Grid>
                <Grid item md={12} xs={12}>
                  <Box sx={{ mt: 3 }}>
                    <TextFieldWrapper
                      fullWidth
                      label={t("Cost Price")}
                      name="costPrice"
                      onBlur={formik.handleBlur}
                      onWheel={(event: any) => {
                        event.preventDefault();
                        event.target.blur();
                      }}
                      error={
                        (formik?.touched?.costPrice &&
                          formik.errors.costPrice) as any
                      }
                      helperText={
                        (formik.touched.costPrice &&
                          formik.errors.costPrice) as any
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
                        } else if (value.length > 9 && ascii !== 46) {
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
                      }}
                      onChange={formik.handleChange}
                      value={formik.values.costPrice}
                    />
                  </Box>
                </Grid>

                <Grid item md={12} xs={12}>
                  <Box sx={{ mt: 3 }}>
                    <TextFieldWrapper
                      required={isSaptco}
                      fullWidth
                      label={t("Selling Price")}
                      name="defaultPrice"
                      onBlur={formik.handleBlur}
                      onWheel={(event: any) => {
                        event.preventDefault();
                        event.target.blur();
                      }}
                      error={
                        (formik?.touched?.defaultPrice &&
                          formik.errors.defaultPrice) as any
                      }
                      helperText={
                        (formik.touched.defaultPrice &&
                          formik.errors.defaultPrice) as any
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
                        } else if (value.length > 9 && ascii !== 46) {
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
                      }}
                      onChange={formik.handleChange}
                      value={formik.values.defaultPrice}
                    />
                  </Box>
                </Grid>
                <Grid item md={12} xs={12}>
                  <Box sx={{ mt: 3 }}>
                    <ChannelMultiSelect
                      required
                      industry={user?.company?.industry}
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
              </Grid>
            </Stack>
          </DialogContent>

          {/* footer */}
          <Divider />
          <DialogActions>
            <LoadingButton
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                if (!canUpdate) {
                  return toast.error(t("You don't have access"));
                }
                setShowError(true);
                if (
                  isSaptco == true &&
                  Number(formik.values?.defaultPrice) <= 0
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
                    `${t("kilometers should not be less than or equal to 0")}  `
                  );
                }

                formik.handleSubmit();
              }}
              loading={formik.isSubmitting}
              sx={{ borderRadius: 1 }}
              variant="contained"
            >
              {t("Create")}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};
