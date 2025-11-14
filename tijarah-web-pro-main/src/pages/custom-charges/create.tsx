import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  Grid,
  Link,
  MenuItem,
  Stack,
  SvgIcon,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import CompanyDropdown from "src/components/input/company-auto-complete";
import LocationMultiSelect from "src/components/input/location-multiSelect";
import TaxDropdown from "src/components/input/tax-auto-complete";
import { Seo } from "src/components/seo";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import i18n from "src/i18n";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import UpgradePackage from "src/pages/upgrade-package";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import {
  ChannelsForOthers,
  ChannelsForRestaurant,
  ChannelsName,
  USER_TYPES,
} from "src/utils/constants";
import { Screens } from "src/utils/screens-names";
import upload, { FileUploadNamespace } from "src/utils/uploadToS3";
import useActiveTabs from "src/utils/use-active-tabs";
import * as Yup from "yup";
import { useCurrency } from "src/utils/useCurrency";

interface CreateCustomCharges {
  chargeNameEn?: string;
  chargeNameAr?: string;
  logoFile?: any[];
  logo?: string;
  type?: string;
  fixedOrCustom?: string;
  value?: string | number;
  locationRefs?: string[];
  locations?: string[];
  assignedToAll?: boolean;
  status?: boolean;
  origin?: string;
  taxRef: string;
  tax: number;
  channel: string;
  applyAutoCharge: boolean;
  skip: boolean;
  orderAmount: number;
}

const validationSchema = Yup.object({
  locationRefs: Yup.array().when("assignedToAll", {
    is: true,
    then: Yup.array().optional(),
    otherwise: Yup.array()
      .required(i18n.t("Locations is required"))
      .min(1, i18n.t("Locations is required")),
  }),
  chargeNameEn: Yup.string()
    .required(`${i18n.t("Charge name english is required")}`)
    .max(20, "Charge name must not be greater than 20"),
  chargeNameAr: Yup.string()
    .required(`${i18n.t("Charge name arabic is required")}`)
    .max(20, "Charge name must not be greater than 20"),
  type: Yup.string().required(`${i18n.t("Type is required")}`),
  fixedOrCustom: Yup.string().required(`${i18n.t("select an option")}`),
  // value: Yup.number()
  //   .test(
  //     i18n.t("Is positive?"),
  //     i18n.t("value must be greater than 0"),
  //     (value) => value > 0
  //   )
  //   .when("type", {
  //     is: "percentage",
  //     then: Yup.number().test(
  //       i18n.t("Is positive?"),
  //       i18n.t("value must not be greater than two digits"),
  //       (number) => String(number).length <= 2
  //     ),
  //   })
  //   .required(i18n.t("Charge value is required")),
  value: Yup.number()
    .test(
      i18n.t("Is positive?"),
      i18n.t("value must be greater than 0"),
      (value) => value > 0
    )
    .when("type", {
      is: "percentage",
      then: Yup.number().test(
        i18n.t("Is valid percentage?"),
        i18n.t(
          "value must be a valid percentage with max 2 digits before and after decimal"
        ),
        (number) => {
          const parts = String(number).split(".");
          return parts[0].length <= 2 && (!parts[1] || parts[1].length <= 2);
        }
      ),
      otherwise: Yup.number().test(
        i18n.t("Is valid amount?"),
        i18n.t(
          "value must be a valid amount with max 10 digits before and 2 digits after decimal"
        ),
        (number) => {
          const parts = String(number).split(".");
          return parts[0].length <= 10 && (!parts[1] || parts[1].length <= 2);
        }
      ),
    })
    .required(i18n.t("Charge value is required")),
  taxRef: Yup.string().required(`${i18n.t("Tax is required")}`),
  channel: Yup.string().required(`${i18n.t("Please Select Channel")}`),
  orderAmount: Yup.number().when("skip", {
    is: true,
    then: Yup.number()
      .test(
        i18n.t("Is valid amount?"),
        i18n.t(
          "Amount must be a valid amount with max 6 digits before and 2 digits after decimal"
        ),
        (number) => {
          const parts = String(number).split(".");
          return parts[0].length <= 6 && (!parts[1] || parts[1].length <= 2);
        }
      )
      .nullable(),
    otherwise: Yup.number().optional(),
  }),
});

const CreateCustomCharges: PageType = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { userType } = useUserType();
  const router = useRouter();
  const canAccess = usePermissionManager();
  const canCreate = canAccess(MoleculeType["custom-charge:create"]);
  const canUpdate = canAccess(MoleculeType["custom-charge:update"]);
  const { canAccessModule } = useFeatureModuleManager();
  const { changeTab } = useActiveTabs();
  const [channels, setChannels] = useState<any[]>([]);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const currency = useCurrency();

  const { id, companyRef, companyName, companyNameAr, origin } = router.query;

  usePageView();

  const { findOne: findCompany, entity: companyData } = useEntity("company");
  const { findOne, create, updateEntity, entity, loading } =
    useEntity("custom-charge");
  const { find: findLocation, entities: locations } = useEntity("location");

  const chargeTypeOptions = [
    {
      label: t("Percentage"),
      value: "percentage",
    },
    {
      label: t("Amount"),
      value: "fixed",
    },
  ];

  const fixedCustomOption = [
    {
      label: t("Fixed"),
      value: "fixed",
    },
    {
      label: t("Custom"),
      value: "custom",
    },
  ];

  const initialValues: CreateCustomCharges = {
    logoFile: [],
    logo: "",
    status: true,
    chargeNameEn: "",
    chargeNameAr: "",
    type: "",
    fixedOrCustom: "",
    assignedToAll: false,
    locationRefs: [],
    locations: [],
    value: 0,
    taxRef: "",
    tax: null,
    channel: "",
    applyAutoCharge: false,
    skip: false,
    orderAmount: 0,
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const data = {
        companyRef: companyRef,
        company: {
          name: {
            en: companyName,
            ar: companyNameAr,
          },
        },
        locationRefs: values.locationRefs,
        locations: values.locations,
        name: {
          en: values.chargeNameEn,
          ar: values.chargeNameAr,
        },
        image: values?.logo,
        value: values.value,
        type: values.type,
        chargeType: values.fixedOrCustom,
        status: values.status ? "active" : "inactive",
        taxRef: values?.taxRef,
        tax: { percentage: values?.tax },
        channel: values.channel,
        applyAutoChargeOnOrders: values.applyAutoCharge,
        skipIfOrderValueIsAbove: values.skip,
        orderValue: values.orderAmount,
      };

      try {
        if (id != null) {
          await updateEntity(id?.toString(), { ...data });
        } else {
          await create({ ...data });
        }

        toast.success(
          id != null
            ? t("Custom Charge Updated").toString()
            : t("New Custom Charge Created").toString()
        );
        if (origin == "company") {
          changeTab("customCharges", Screens?.companyDetail);
        }
        router.back();
      } catch (err) {
        if (err.message === "duplicate_record") {
          toast.error(t("Discount already exists."));
        } else {
          toast.error(err.message);
        }
      }
    },
  });

  const companyLogoFileRemove = (): void => {
    formik.setFieldValue("logoFile", []);
    formik.setFieldValue("logo", "");
  };
  const companyLogoFileDrop = (newFiles: any): void => {
    formik.setFieldValue("logoFile", newFiles);
  };
  const logoFileRemoveAll = (): void => {
    formik.setFieldValue("logoFile", []);
  };

  const handleUpload = async (files: any) => {
    setIsUploading(true);

    try {
      const url = await upload(
        files,
        FileUploadNamespace["custom-charges-icons"]
      );
      formik.setFieldValue("logo", url);

      setIsUploaded(true);
      setIsUploading(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getLabel = () => {
    if (formik.values.type === "fixed") {
      if (formik.values.fixedOrCustom === "fixed") {
        return t(`Price (in ${currency})`);
      } else {
        return t(`Max Amount (in ${currency})`);
      }
    } else {
      if (formik.values.fixedOrCustom === "fixed") {
        return t("Percentage");
      } else {
        return t("Max Percentage");
      }
    }
  };

  useEffect(() => {
    if (id != null) {
      findOne(id?.toString());
    }
  }, [id]);

  useEffect(() => {
    if (companyRef) {
      findCompany(companyRef?.toString());
    }
  }, [companyRef]);

  useEffect(() => {
    if (userType === USER_TYPES.SUPERADMIN) {
      const Channels =
        companyData?.channel?.length > 0
          ? companyData?.channel?.map((channel: any) => {
              return {
                label: ChannelsName[channel.name] || channel.name,
                value: channel.name,
              };
            })
          : companyData?.industry == "restaurant"
          ? ChannelsForRestaurant
          : ChannelsForOthers;

      setChannels(Channels);
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
        : companyData?.industry == "restaurant"
        ? ChannelsForRestaurant
        : ChannelsForOthers;

    setChannels(Channels);
  }, [companyData, user?.company]);

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
    if (entity != null) {
      formik.setValues({
        value: entity?.value,
        chargeNameEn: entity?.name?.en,
        chargeNameAr: entity?.name?.ar,
        locationRefs: entity?.locationRefs,
        type: entity?.type,
        fixedOrCustom: entity?.chargeType,
        status: entity?.status === "active",
        locations: entity?.locations,
        taxRef: entity?.taxRef,
        tax: entity?.tax?.percentage,
        channel: entity?.channel,
        applyAutoCharge: entity?.applyAutoChargeOnOrders,
        skip: entity?.skipIfOrderValueIsAbove,
        orderAmount: entity?.orderValue,
        assignedToAll:
          locations?.results?.length == entity?.locationRefs?.length
            ? true
            : false,
      });
    }
  }, [entity, locations?.results]);

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

  if (!canAccessModule("custom_charges")) {
    return <UpgradePackage />;
  }

  return (
    <>
      <Seo
        title={
          id ? `${t("Edit Custom Charges")}` : `${t("Create Custom Charges")}`
        }
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack spacing={4}>
              <Box sx={{ maxWidth: 150, cursor: "pointer" }}>
                <Link
                  color="textPrimary"
                  component="a"
                  sx={{ alignItems: "center", display: "flex" }}
                  onClick={() => {
                    if (origin == "company") {
                      changeTab("customCharges", Screens?.companyDetail);
                    }
                    router.back();
                  }}
                >
                  <ArrowBackIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "#6B7280" }}
                  />
                  <Typography variant="subtitle2">
                    {t("Custom Charges")}
                  </Typography>
                </Link>
              </Box>

              <Typography variant="h4">
                {id != null
                  ? t("Edit Custom Charges")
                  : t("Create Custom Charges")}
              </Typography>
            </Stack>

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4} sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">
                          {t("Charges Details")}
                        </Typography>
                      </Grid>
                      <Grid item md={8} xs={12}>
                        {userType == USER_TYPES.SUPERADMIN && (
                          <Box sx={{ mb: 3 }}>
                            <CompanyDropdown
                              disabled
                              onChange={() => {}}
                              selectedId={companyRef as string}
                              label={t("Company")}
                              id="company"
                            />
                          </Box>
                        )}

                        {/* <Box>
                          <Box>
                            <Typography variant="h6">{t("Icon")}</Typography>
                            <Typography
                              color="textSecondary"
                              sx={{ mt: 1 }}
                              variant="body2"
                            >
                              {t("Please upload the category Icon")}
                            </Typography>
                          </Box>

                          <FileDropzone
                            disabled={id != null && !canUpdate}
                            // @ts-ignore
                            accept={{
                              "image/*": [],
                              "application/pdf": [],
                            }}
                            caption="(SVG, JPG, PNG, PDF, or gif)"
                            files={formik.values.logoFile}
                            imageName={getUploadedDocName(formik.values.logo)}
                            uploadedImageUrl={formik.values.logo}
                            onDrop={companyLogoFileDrop}
                            onUpload={handleUpload}
                            onRemove={companyLogoFileRemove}
                            onRemoveAll={logoFileRemoveAll}
                            maxFiles={1}
                            maxSize={999999}
                            isUploaded={isUploaded}
                            setIsUploaded={setIsUploaded}
                            isUploading={isUploading}
                            fileDataTestId="company-logo-file"
                          />
                        </Box> */}

                        <Box sx={{ mt: 3, mb: 3 }}>
                          <LocationMultiSelect
                            disabled={id != null && !canUpdate}
                            showAllLocation={formik.values.assignedToAll}
                            companyRef={companyRef}
                            selectedIds={formik.values.locationRefs || []}
                            required
                            id={"locations"}
                            error={
                              formik.touched.locationRefs &&
                              formik.errors.locationRefs
                            }
                            onChange={(option: any, total: number) => {
                              // formik.setFieldValue("selectedLocations", option);
                              if (option?.length > 0) {
                                const ids = option?.map((option: any) => {
                                  return option?._id;
                                });

                                const names = option?.map((option: any) => {
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

                        <Box>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            fullWidth
                            label={t("Charge Name English")}
                            name="chargeNameEn"
                            error={Boolean(
                              formik.touched.chargeNameEn &&
                                formik.errors.chargeNameEn
                            )}
                            helperText={
                              (formik.touched.chargeNameEn &&
                                formik.errors.chargeNameEn) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            required
                            // disabled={id != null}
                            // onKeyDown={(event): void => {
                            //   event.preventDefault();
                            // }}
                            value={formik.values.chargeNameEn}
                          />
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            fullWidth
                            label={t("Charge Name Arabic")}
                            name="chargeNameAr"
                            error={Boolean(
                              formik.touched.chargeNameAr &&
                                formik.errors.chargeNameAr
                            )}
                            helperText={
                              (formik.touched.chargeNameAr &&
                                formik.errors.chargeNameAr) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            required
                            // disabled={id != null}
                            // onKeyDown={(event): void => {
                            //   event.preventDefault();
                            // }}
                            value={formik.values.chargeNameAr}
                          />
                        </Box>

                        <Box
                          sx={{ mt: 3, display: "flex", alignItems: "center" }}
                        >
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            error={
                              !!(formik.touched.type && formik.errors.type)
                            }
                            helperText={
                              (formik.touched.type && formik.errors.type) as any
                            }
                            fullWidth
                            label="Type"
                            name="type"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            select
                            value={formik.values.type}
                            // disabled={id != null}
                            required
                          >
                            {chargeTypeOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextFieldWrapper>

                          <Tooltip
                            sx={{ ml: 2 }}
                            title={t(
                              "create custom charge type percentage or amount info"
                            )}
                          >
                            <SvgIcon color="primary">
                              <InfoCircleIcon />
                            </SvgIcon>
                          </Tooltip>
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            error={
                              !!(
                                formik.touched.fixedOrCustom &&
                                formik.errors.fixedOrCustom
                              )
                            }
                            helperText={
                              (formik.touched.fixedOrCustom &&
                                formik.errors.fixedOrCustom) as any
                            }
                            fullWidth
                            label="Fixed / Custom"
                            name="fixedOrCustom"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            select
                            value={formik.values.fixedOrCustom}
                            required
                          >
                            {fixedCustomOption.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextFieldWrapper>
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            required
                            disabled={id != null && !canUpdate}
                            fullWidth
                            label={getLabel()}
                            name="value"
                            onBlur={formik.handleBlur}
                            onWheel={(event: any) => {
                              event.preventDefault();
                              event.target.blur();
                            }}
                            error={Boolean(
                              formik.touched.value && formik.errors.value
                            )}
                            helperText={
                              (formik.touched.value &&
                                formik.errors.value) as any
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
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            value={formik.values.value}
                          />

                          <Typography
                            sx={{ mt: 2 }}
                            variant="body2"
                            color={"#ff9100"}
                          >
                            {formik.values.type === "fixed" &&
                            Number(formik.values.value) > 9999.99
                              ? `${t("Amount exceeds 4 digit")}`
                              : ""}
                          </Typography>
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TaxDropdown
                            id="tax"
                            required
                            label={t("VAT")}
                            selectedId={formik?.values?.taxRef}
                            error={
                              formik?.touched?.taxRef && formik?.errors?.taxRef
                            }
                            onChange={(id, name) => {
                              if (id && name >= 0) {
                                formik.setFieldValue("taxRef", id);
                                formik.setFieldValue("tax", name);
                              }
                            }}
                          />
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextField
                            select
                            required
                            fullWidth
                            error={Boolean(
                              formik.touched.channel && formik.errors.channel
                            )}
                            helperText={
                              (formik.touched.channel &&
                                formik.errors.channel) as any
                            }
                            name="channel"
                            label={t("Order Types")}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.channel}
                          >
                            {[
                              {
                                label: t("All"),
                                value: "all",
                              },
                              ...channels,
                            ].map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Box>

                        <Box
                          sx={{
                            mt: 3,
                            ml: -1,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Checkbox
                            name="applyAutoCharge"
                            onChange={formik.handleChange}
                            checked={formik.values.applyAutoCharge}
                          />

                          <Typography variant="subtitle2">
                            {t("Apply Auto Charge on orders")}
                          </Typography>

                          <Tooltip
                            sx={{ ml: 2 }}
                            title={t(
                              "If checked, the charge will be applied automatically when the conditions above are met."
                            )}
                          >
                            <SvgIcon color="primary">
                              <InfoCircleIcon />
                            </SvgIcon>
                          </Tooltip>
                        </Box>

                        <Box sx={{ mt: 2.5 }}>
                          <Box
                            sx={{
                              mt: -1,
                              ml: -1,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Checkbox
                              name="skip"
                              onChange={formik.handleChange}
                              checked={formik.values.skip}
                            />

                            <Typography variant="subtitle2">
                              {t("Skip if the order value is above")}
                            </Typography>
                          </Box>

                          {formik.values.skip && (
                            <TextField
                              fullWidth
                              name="orderAmount"
                              label={t(`Amount (in ${currency})`)}
                              onBlur={formik.handleBlur}
                              onWheel={(event: any) => {
                                event.preventDefault();
                                event.target.blur();
                              }}
                              error={Boolean(
                                formik.touched.orderAmount &&
                                  formik.errors.orderAmount
                              )}
                              helperText={
                                (formik.touched.orderAmount &&
                                  formik.errors.orderAmount) as any
                              }
                              sx={{
                                mt: 1.5,
                                "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                                  {
                                    display: "none",
                                  },
                                "& input[type=number]": {
                                  MozAppearance: "textfield",
                                },
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
                              onChange={(e) => {
                                formik.handleChange(e);
                              }}
                              value={formik.values.orderAmount}
                            />
                          )}

                          <Typography
                            sx={{ mt: 1, ml: 2 }}
                            variant="body2"
                            color={"#ff9100"}
                          >
                            {Number(formik.values.orderAmount) > 9999.99
                              ? `${t("Amount exceeds 4 digit")}`
                              : ""}
                          </Typography>
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
                              {t("Change the status of the Custom Charge")}
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
                                disabled={entity?.expired}
                                checked={formik.values.status}
                                color="primary"
                                edge="end"
                                name="status"
                                onChange={() => {
                                  if (!canUpdate) {
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
                    onClick={() => {
                      if (origin == "company") {
                        changeTab("customCharges", Screens?.companyDetail);
                      }
                      router.back();
                    }}
                  >
                    {t("Cancel")}
                  </Button>

                  <LoadingButton
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();

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
                </Stack>
              </Stack>
            </form>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

CreateCustomCharges.getLayout = (page) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default CreateCustomCharges;
