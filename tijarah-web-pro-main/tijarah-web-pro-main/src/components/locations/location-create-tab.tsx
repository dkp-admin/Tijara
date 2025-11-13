import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  SvgIcon,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import { endOfDay, format, startOfDay } from "date-fns";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ConfirmationDialog from "src/components/confirmation-dialog";
import CompanyDropdown from "src/components/input/company-auto-complete";
import TaxDropdown from "src/components/input/tax-auto-complete";
import PhoneInput from "src/components/phone-input";
import { Seo } from "src/components/seo";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { useUserType } from "src/hooks/use-user-type";
import NoPermission from "src/pages/no-permission";
import { MoleculeType } from "src/permissionManager";
import {
  OtherChannels,
  RestaurantChannels,
  USER_TYPES,
} from "src/utils/constants";
import countries from "src/utils/countries.json";
import { convertToUTC } from "src/utils/get-report-date-time";
import { getUploadedDocName } from "src/utils/get-uploaded-file-name";
import parsePhoneNumber from "src/utils/parse-phone-number";
import { Screens } from "src/utils/screens-names";
import upload, { FileUploadNamespace } from "src/utils/uploadToS3";
import useActiveTabs from "src/utils/use-active-tabs";
import * as Yup from "yup";
import { OgFileDropzone } from "../original-File-dropzone";
import TextFieldWrapper from "../text-field-wrapper";

interface CreateLocation {
  locationBusinessNameEng: string;
  locationBusinessNameAr: string;
  briefEng: string;
  briefAr: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
  subdomain: string;
  email: string;
  phone: string;
  vatRef: string;
  vat: number;
  commercialRegistrationFile: any[];
  commercialRegistrationUrl: string;
  commercialRegistrationNumber: string;
  channels: any[];
  dinein: boolean;
  courses: boolean;
  status: boolean;
  allowNegativeBilling: boolean;
  onlineOrdering: boolean;
  deliveryRange: number;
  deliveryType: string;
  coordinates: string;
  geofencing: object;
  schedule: { startTime: Date; endTime: Date }[];
  paymentOptions: string;
  startTime: Date;
  endTime: Date;
  qrOrdering: boolean;
  qrPaymentOptions: string;
  businessTime: boolean;
  eventBasedTime: boolean;
  extendedReporting: boolean;
  endStartReporting: boolean;
  defaultTime: boolean;
  rollingTime: boolean;
  rollingStartTime: Date;
  timeZone: string;
}

const LocationCreateTab = (props: any) => {
  const { id, companyRef } = props;
  const qrRef = useRef(null);
  const { t } = useTranslation();
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { changeTab } = useActiveTabs();
  const { userType } = useUserType();

  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["location:update"]);
  const canCreate = canAccess(MoleculeType["location:create"]);

  const [, setLoad] = useState(false);
  const [, setShowError] = useState(false);
  const [country, setCountry] = useState("+966");
  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [showDialogCustomerEvent, setShowDialogCustomerEvent] = useState(false);

  const lng = localStorage.getItem("currentLanguage");

  const { findOne, create, updateEntity, entity } = useEntity("location");
  const { findOne: company, entity: companyEntity } = useEntity("company");

  const commercialRegistrationFileDrop = (newFiles: any): void => {
    const sizes: any[] = newFiles?.map((op: any) => op?.size);

    if (sizes.find((o: any) => o > 999999)) {
      toast.error("File size cannot be greater than 1MB");
      return;
    }
    formik.setFieldValue("commercialRegistrationFile", newFiles);
  };

  const commercialRegistrationFileRemove = (): void => {
    formik.setFieldValue("commercialRegistrationFile", []);
    formik.setFieldValue("commercialRegistrationUrl", "");
  };

  const commercialRegistrationFileRemoveAll = (): void => {
    formik.setFieldValue("commercialRegistrationFile", []);
  };

  const onSuccess = (fileName: string | undefined) => {
    formik.setFieldValue("commercialRegistrationUrl", fileName);
  };

  const handleChangeCountry = (event: any) => {
    setCountry(event.target.value);
  };

  const handleUpload = async (files: any) => {
    setIsUploading(true);
    try {
      const url = await upload(
        files,
        FileUploadNamespace["commercial-registrations-certificate"]
      );
      onSuccess(url);
      setIsUploaded(true);
      setIsUploading(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const initialValues: CreateLocation = {
    locationBusinessNameEng: "",
    locationBusinessNameAr: "",
    briefEng: "",
    briefAr: "",
    addressLine1: "",
    addressLine2: "",
    postalCode: "",
    city: "",
    state: "",
    country: "Saudi Arabia",
    subdomain: "",
    email: "",
    phone: "",
    vatRef: "",
    vat: null,
    commercialRegistrationFile: [],
    commercialRegistrationUrl: "",
    commercialRegistrationNumber: "",
    channels: [],
    dinein: false,
    courses: false,
    status: true,
    allowNegativeBilling: true,
    onlineOrdering: false,
    deliveryRange: 10,
    deliveryType: "all",
    coordinates: "",
    geofencing: null,
    schedule: [
      { startTime: startOfDay(new Date()), endTime: endOfDay(new Date()) },
    ],
    paymentOptions: "all",
    startTime: null,
    endTime: null,
    qrOrdering: false,
    qrPaymentOptions: "all",
    businessTime: true,
    eventBasedTime: false,
    extendedReporting: false,
    endStartReporting: false,
    defaultTime: false,
    rollingTime: false,
    rollingStartTime: null,
    timeZone: "Saudi Arabia,Asia/Riyadh, utcOffset+03:00",
  };

  const validationSchema = Yup.object({
    locationBusinessNameEng: Yup.string()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid business name")
      )
      .required(`${t("Business Name is required")}`)
      .max(60, t("Businees name must not be greater than 60 characters")),
    locationBusinessNameAr: Yup.string()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid business name")
      )
      .required(`${t("Business Name is required")}`)
      .max(60),
    phone: Yup.string()
      .min(9, `${t("Phone Number should be minimum 9 digits")}`)
      .max(12, `${t("Phone Number should be maximum 12 digits")}`)
      .required(`${t("Phone number is required")}`),
    email: Yup.string()
      .email(`${t("Must be a valid email")}`)
      .max(70)
      .required(`${t("Email is required")}`),
    vatRef: Yup.string().required(`${t("VAT Percentage is required")}`),
    addressLine1: Yup.string()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid address")
      )
      .required(`${t("Address Line is required")}`)
      .max(60, t("Address line 1 must not be greater than 60 characters")),
    postalCode: Yup.string()
      .required(`${t("Postal Code is required")}`)
      .max(10, t("Postal Code should not be greater than 10")),
    city: Yup.string()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid address")
      )
      .required(`${t("City is required")}`)
      .max(40, t("City must not be greater than 40 characters")),
    country: Yup.string().required(`${t("Please Select Country")}`),
    subdomain: Yup.string()
      .trim()
      .matches(
        /^[a-z0-9-]+$/,
        t("Subdomain can only contain lowercase letters, numbers, and hyphens")
      )
      .min(3, t("Subdomain must be at least 3 characters"))
      .max(30, t("Subdomain must not be greater than 30 characters")),
    commercialRegistrationUrl: Yup.string().required(
      "Please Upload Commercial Registration Document"
    ),
    commercialRegistrationNumber: Yup.string()
      .required("Commercial Registration Number of the outlet is required")
      .max(
        60,
        t(
          "Commercial Registration Number must not be greater than 60 characters"
        )
      ),
    coordinates: Yup.string().when("onlineOrdering", {
      is: true,
      then: Yup.string()
        .required(t("Location pointer is required"))
        .matches(
          /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/,
          t("Invalid location pointer format")
        ),
      otherwise: Yup.string().optional(),
    }),
    geofencing: Yup.object().when(["onlineOrdering", "deliveryType"], {
      is: (onlineOrdering: boolean, deliveryType: string) =>
        !onlineOrdering || deliveryType === "pickup",
      then: Yup.object().optional().nullable(),
      otherwise: Yup.object()
        .required(t("Please add coordinates"))
        .typeError(t("Invalid JSON format for Coordinates"))
        .nullable(),
    }),
  });

  const formik: any = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values: any): Promise<void> => {
      const inactiveChannel = values.channels?.filter(
        (channel: any) => !channel.status
      );

      if (inactiveChannel?.length === values.channels?.length) {
        toast.error(t("At least one order type must be active"));
        return;
      }

      if (values.schedule?.length === 0) {
        toast.error(t("Business opening and closing time slot is required"));
        return;
      }

      setLoad(true);

      let geofencing = null;
      let coordinates = null;

      if (id && values.geofencing && values.deliveryType !== "pickup") {
        const geometry = values.geofencing?.features?.[0]?.geometry;

        if (geometry?.coordinates?.[0]?.length > 2) {
          const coordinates = geometry?.coordinates?.[0];
          geofencing = {
            type: values.geofencing?.type,
            features: [
              {
                type: values.geofencing?.features?.[0]?.type,
                geometry: { coordinates: coordinates, type: geometry?.type },
              },
            ],
          };
        } else {
          geofencing = values.geofencing;
        }
      }

      if (id && values.coordinates) {
        const coords = values.coordinates?.split(",");
        coordinates = {
          lat: parseFloat(coords[0]),
          lng: parseFloat(coords[1]),
        };
      }

      const timeZoneNew = values.timeZone?.split(",");
      const scheduled: any[] = [];

      values.schedule?.forEach((schedule: any) => {
        if (schedule.startTime && schedule.endTime) {
          const startDateString = format(
            new Date(schedule?.startTime),
            "dd MMM yyyy"
          );
          const endDateString = format(
            new Date(schedule?.endTime),
            "dd MMM yyyy"
          );
          const startTimeString = format(
            new Date(schedule?.startTime),
            "h:mm a"
          );
          const endTimeString = format(new Date(schedule?.endTime), "h:mm a");

          const { UTCFromDate, UTCToDate } = convertToUTC(
            startDateString,
            endDateString,
            startTimeString,
            endTimeString,
            timeZoneNew?.[1]?.trim()
          );

          scheduled.push({
            startTime: UTCFromDate,
            endTime: UTCToDate,
          });
        }
      });

      const data: any = {
        companyRef: companyRef,
        company: {
          name: {
            en: companyEntity?.name?.en,
            ar: companyEntity?.name?.ar,
          },
        },
        ownerRef: companyEntity?.ownerRef,
        owner: {
          name: companyEntity?.owner?.name,
        },
        businessTypeRef: companyEntity?.businessTypeRef,
        businessType: companyEntity?.businessType,
        logo:
          userType == USER_TYPES.ADMIN
            ? user.company.logo
            : "https://wajeeh.sgp1.digitaloceanspaces.com/development/profile/otg8999horpP0Uv-DAVhk_Default.jpg",
        name: {
          en: values.locationBusinessNameEng.trim(),
          ar: values.locationBusinessNameAr.trim(),
        },
        phone: parsePhoneNumber(country, values.phone),
        email: values.email,
        vatRef: values.vatRef,
        vat: values.vat,
        address: {
          address1: values.addressLine1.trim(),
          address2: values.addressLine2,
          country: values.country,
          postalCode: values.postalCode,
          state: values.state,
          city: values.city.trim(),
        },
        subdomain: values.subdomain.trim(),
        commercialRegistrationNumber: {
          url: values.commercialRegistrationUrl,
          docNumber: values.commercialRegistrationNumber,
        },
        channel: values.channels,
        dinein: values.dinein,
        courses: values.courses,
        status: values.status ? "active" : "inactive",
        allowNegativeBilling: values.allowNegativeBilling,
        qrOrderingConfiguration: {
          onlineOrdering: values.onlineOrdering,
          deliveryRange: values.deliveryRange,
          deliveryType: values.deliveryType,
          coordinates: coordinates,
          geofencing: geofencing,
          schedule: scheduled,
          paymentOptions: values.paymentOptions,
          qrOrdering: values.qrOrdering,
          paymentOptionsQr: values.qrPaymentOptions,
        },
        timeZone: values.timeZone,
        businessClosureSetting: {
          businessTime: false,
          eventBasedTime: false,
          extendedReporting: false,
          endStartReporting: false,
          defaultTime: true,
          rollingTime: false,
          startTime: null,
        },
      };

      if (!id || !entity?.pickupDeliveryConfiguration) {
        data["pickupDeliveryConfiguration"] = {
          pickup: true,
          delivery: true,
          pickupOffTill: "",
          deliveryOffTill: "",
          pickupNextAvailable: null,
          deliveryNextAvailable: null,
        };
      }

      if (!id || !entity?.pickupQRConfiguration) {
        data["pickupQRConfiguration"] = {
          pickup: true,
          pickupOffTill: "",
          pickupNextAvailable: null,
        };
      }

      if (values.briefEng && values.briefAr) {
        data["brief"] = {
          en: values.briefEng.trim(),
          ar: values.briefAr.trim(),
        };
      }

      try {
        if (id) {
          await updateEntity(id?.toString(), { ...data });
        } else {
          const created = await create({ ...data });
          const localUser: any = JSON.parse(localStorage.getItem("user"));
          localUser?.locationRefs?.push(created._id);
          localStorage.setItem("user", JSON.stringify(localUser));

          await updateUser(localUser);
        }

        toast.success(
          id
            ? t("Location Details Updated info message").toString()
            : t("New Location Created").toString()
        );
        if (origin == "company") {
          changeTab("locations", Screens?.companyDetail);
        }
        router.back();
      } catch (err) {
        toast.error(
          err.message === "undefined_message" ? err.error.message : err.message
        );
      } finally {
        setLoad(false);
      }
    },
  });

  useEffect(() => {
    if (id != null) {
      findOne(id?.toString());
    }
  }, [id]);

  useEffect(() => {
    if (companyRef) {
      company(companyRef?.toString());
    }
  }, [companyRef]);

  useEffect(() => {
    if (!id && userType === USER_TYPES.SUPERADMIN) {
      formik.setFieldValue("vatRef", companyEntity?.vat?.vatRef);
      setIsPrefilled(true);
    } else {
      formik.setFieldValue("vatRef", user?.company?.vat?.vatRef);
      setIsPrefilled(true);
    }
  }, [companyEntity, user?.company]);

  useEffect(() => {
    if (id == null && companyEntity) {
      formik.setFieldValue(
        "channels",
        companyEntity?.channel?.length > 0
          ? companyEntity.channel
          : companyEntity?.industry?.toLowerCase() === "restaurant"
          ? RestaurantChannels
          : OtherChannels
      );
    }
  }, [id, companyEntity]);

  useEffect(() => {
    if (entity != null) {
      const phoneNumber = entity?.phone
        ? entity?.phone?.toString().split("-")[1]
        : "";

      setCountry(
        phoneNumber ? entity?.phone?.toString().split("-")[0] : "+966"
      );

      formik.setValues({
        locationBusinessNameEng: entity.name.en,
        locationBusinessNameAr: entity.name.ar,
        briefEng: entity.brief?.en,
        briefAr: entity.brief?.ar,
        phone: entity?.phone?.split("-")?.[1],
        email: entity?.email,
        vatRef: entity.vatRef,
        vat: entity.vat,
        addressLine1: entity.address?.address1,
        addressLine2: entity.address?.address2 || "",
        postalCode: entity.address?.postalCode || "",
        city: entity.address.city,
        state: entity.address.state,
        country: entity.address.country,
        subdomain: entity.subdomain || "",
        commercialRegistrationUrl: entity?.commercialRegistrationNumber?.url,
        commercialRegistrationNumber:
          entity?.commercialRegistrationNumber?.docNumber,
        channels:
          entity?.channel?.length > 0
            ? entity.channel
            : companyEntity?.channel?.length > 0
            ? companyEntity.channel
            : companyEntity?.industry?.toLowerCase() === "restaurant"
            ? RestaurantChannels
            : OtherChannels,
        dinein: entity?.dinein,
        courses: entity?.courses,
        status: entity?.status === "active",
        allowNegativeBilling: entity?.allowNegativeBilling,
        onlineOrdering: entity?.qrOrderingConfiguration?.onlineOrdering,
        deliveryRange: entity?.qrOrderingConfiguration?.deliveryRange || 10,
        deliveryType: entity?.qrOrderingConfiguration?.deliveryType || "all",
        coordinates: entity?.qrOrderingConfiguration?.coordinates
          ? `${entity?.qrOrderingConfiguration?.coordinates?.lat}, ${entity?.qrOrderingConfiguration?.coordinates?.lng}`
          : "",
        geofencing: entity?.qrOrderingConfiguration?.geofencing || null,
        schedule:
          entity?.qrOrderingConfiguration?.schedule?.length > 0
            ? entity?.qrOrderingConfiguration?.schedule
            : [
                {
                  startTime: startOfDay(new Date()),
                  endTime: endOfDay(new Date()),
                },
              ],
        paymentOptions:
          entity?.qrOrderingConfiguration?.paymentOptions || "all",
        startTime: null,
        endTime: null,
        qrOrdering: entity?.qrOrderingConfiguration?.qrOrdering,
        qrPaymentOptions:
          entity?.qrOrderingConfiguration?.paymentOptionsQr || "all",
        timeZone: entity?.timeZone,
        businessTime: entity?.businessClosureSetting?.businessTime,
        eventBasedTime: entity?.businessClosureSetting?.eventBasedTime,
        extendedReporting: entity?.businessClosureSetting?.extendedReporting,
        endStartReporting: entity?.businessClosureSetting?.endStartReporting,
        defaultTime: entity?.businessClosureSetting?.defaultTime,
      });
    }
  }, [entity, companyEntity]);

  if (!canAccess(MoleculeType["location:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo
        title={id ? `${t("Edit Location")}` : `${t("Create New Location")}`}
      />
      <Box component="main" sx={{ flexGrow: 1, py: 8, mb: 4 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack spacing={4}>
              <Typography variant="h4">
                {id ? t("Edit Location") : t("Create New Location")}
              </Typography>
            </Stack>

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4} sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">
                          {t("Basic Details")}
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

                        <Box>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            autoComplete="off"
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            fullWidth
                            label={t("Location Business Name (English)")}
                            name="locationBusinessNameEng"
                            error={Boolean(
                              formik.touched.locationBusinessNameEng &&
                                formik.errors.locationBusinessNameEng
                            )}
                            helperText={
                              (formik.touched.locationBusinessNameEng &&
                                formik.errors.locationBusinessNameEng) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            required
                            value={formik.values.locationBusinessNameEng}
                          />
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            autoComplete="off"
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            fullWidth
                            required
                            label={t("Location Business Name (Arabic)")}
                            name="locationBusinessNameAr"
                            error={Boolean(
                              formik.touched.locationBusinessNameAr &&
                                formik.errors.locationBusinessNameAr
                            )}
                            helperText={
                              (formik.touched.locationBusinessNameAr &&
                                formik.errors.locationBusinessNameAr) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            value={formik.values.locationBusinessNameAr}
                          />
                        </Box>

                        <Box sx={{ mt: 1 }}>
                          <PhoneInput
                            disabled={id != null && !canUpdate}
                            touched={formik.touched.phone}
                            error={formik.errors.phone}
                            value={formik.values.phone}
                            onBlur={formik.handleBlur("phone")}
                            country={country}
                            handleChangeCountry={handleChangeCountry}
                            onChange={formik.handleChange("phone")}
                            required
                            label={t("Phone Number")}
                          />
                        </Box>

                        <Box sx={{ mt: 2 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            autoComplete="off"
                            fullWidth
                            required
                            label={t("Email")}
                            name="email"
                            error={Boolean(
                              formik.touched.email && formik.errors.email
                            )}
                            helperText={
                              (formik.touched.email &&
                                formik.errors.email) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            value={formik.values.email}
                          />
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TaxDropdown
                            disabled={id != null && !canUpdate}
                            required
                            isPrefilled={isPrefilled}
                            setIsPrefilled={setIsPrefilled}
                            error={
                              formik?.touched?.vatPercentage &&
                              formik?.errors?.vatPercentage
                            }
                            onChange={(id, tax) => {
                              if (id && tax >= 0) {
                                formik.setFieldValue("vatRef", id);
                                formik.setFieldValue("vat", {
                                  percentage: tax,
                                });
                              }
                            }}
                            selectedId={formik?.values?.vatRef}
                            label={t("VAT Percentage")}
                            id="vatPercentage"
                          />
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            autoComplete="off"
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            label={t("Brief (English)")}
                            name="briefEng"
                            multiline
                            rows={4}
                            fullWidth
                            onChange={formik.handleChange("briefEng")}
                            value={formik.values.briefEng}
                          />
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            autoComplete="off"
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            label={t("Brief (Arabic)")}
                            name="briefAr"
                            multiline
                            rows={4}
                            fullWidth
                            onChange={formik.handleChange("briefAr")}
                            value={formik.values.briefAr}
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
                        <Typography variant="h6">{t("Subdomain")}</Typography>
                      </Grid>
                      <Grid
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                        item
                        md={8}
                        xs={12}
                      >
                        <Box>
                          <TextFieldWrapper
                            error={
                              !!(
                                formik.touched.subdomain &&
                                formik.errors.subdomain
                              )
                            }
                            fullWidth
                            helperText={
                              formik.touched.subdomain &&
                              formik.errors.subdomain
                            }
                            label={t("Subdomain")}
                            name="subdomain"
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              const value = e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]/g, "");
                              e.target.value = value;
                              formik.handleChange(e);
                            }}
                            value={formik.values.subdomain}
                            required={false}
                            placeholder="Subdomain"
                            disabled={
                              companyEntity?.subdomain === "" ||
                              !companyEntity?.subdomain
                            }
                          />
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{ textAlign: "left", color: "grey" }}
                        >
                          {`Your Ordering URL will be ${
                            formik.values.subdomain
                              ? `https://${formik.values.subdomain}.${companyEntity.subdomain}.ruyahdine.com`
                              : `https://${
                                  formik.values.subdomain || "locationSubdomain"
                                }.${
                                  companyEntity?.subdomain || "companySubdomain"
                                }.ruyahdine.com`
                          }`}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid
                        item
                        md={4}
                        xs={12}
                        sx={{
                          display: "flex",
                          justifyContent: "flex-start",
                          flexDirection: "row",
                        }}
                      >
                        <Typography variant="h6">
                          {t("Business Address")}
                        </Typography>
                        <Tooltip
                          sx={{ ml: 1 }}
                          title={t("Showing Other Details")}
                        >
                          <SvgIcon color="action">
                            <InfoCircleIcon />
                          </SvgIcon>
                        </Tooltip>
                      </Grid>
                      <Grid item md={8} xs={12}>
                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            autoComplete="off"
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            error={
                              !!(
                                formik.touched.country && formik.errors.country
                              )
                            }
                            helperText={
                              (formik.touched.country &&
                                formik.errors.country) as any
                            }
                            fullWidth
                            label={t("Country")}
                            name="country"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            select
                            value={formik.values.country}
                            required
                          >
                            {countries?.map((countryData: any) => (
                              <MenuItem
                                key={countryData.code}
                                value={countryData.name.en}
                              >
                                {countryData?.name?.[lng] ||
                                  countryData?.name?.en}
                              </MenuItem>
                            ))}
                          </TextFieldWrapper>
                        </Box>
                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            autoComplete="off"
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            fullWidth
                            label={t("Address Line 1")}
                            name="addressLine1"
                            error={Boolean(
                              formik.touched.addressLine1 &&
                                formik.errors.addressLine1
                            )}
                            helperText={
                              (formik.touched.addressLine1 &&
                                formik.errors.addressLine1) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            required
                            value={formik.values.addressLine1}
                          />
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            fullWidth
                            autoComplete="off"
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            label={t("Address Line 2")}
                            name="addressLine2"
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            value={formik.values.addressLine2}
                          />
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            fullWidth
                            label={t("Postal Code")}
                            name="postalCode"
                            error={Boolean(
                              formik.touched.postalCode &&
                                formik.errors.postalCode
                            )}
                            helperText={
                              (formik.touched.postalCode &&
                                formik.errors.postalCode) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              // Only allow alphanumeric characters
                              const value = e.target.value.replace(
                                /[^A-Za-z0-9]/g,
                                ""
                              );
                              e.target.value = value;
                              formik.handleChange(e);
                            }}
                            required
                            value={formik.values.postalCode}
                            inputProps={{
                              pattern: "[A-Za-z0-9]*",
                            }}
                          />
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            autoComplete="off"
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            fullWidth
                            required
                            label={t("City")}
                            name="city"
                            error={Boolean(
                              formik.touched.city && formik.errors.city
                            )}
                            helperText={
                              (formik.touched.city && formik.errors.city) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            value={formik.values.city}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Grid container>
                      <Grid xs={12} md={4}>
                        <Stack spacing={1}>
                          <Typography variant="h6">
                            {t("Commercial Registration Number")}
                          </Typography>
                          <Typography color="text.secondary" variant="body2">
                            {t("Add Commercial Registration Document Here")}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid xs={12} md={8}>
                        <Stack spacing={3}>
                          <OgFileDropzone
                            disabled={id != null && !canUpdate}
                            accept={{ "image/*": [], "application/pdf": [] }}
                            caption="(SVG, JPG, PNG, PDF, or gif)"
                            files={formik.values.commercialRegistrationFile}
                            imageName={getUploadedDocName(
                              formik.values.commercialRegistrationUrl
                            )}
                            uploadedImageUrl={
                              formik.values.commercialRegistrationUrl
                            }
                            onDrop={commercialRegistrationFileDrop}
                            onUpload={handleUpload}
                            onRemove={commercialRegistrationFileRemove}
                            onRemoveAll={commercialRegistrationFileRemoveAll}
                            maxFiles={1}
                            isUploaded={isUploaded}
                            setIsUploaded={setIsUploaded}
                            isUploading={isUploading}
                          />
                          {Boolean(
                            formik.touched.commercialRegistrationUrl
                          ) && (
                            <Typography
                              color="error.main"
                              sx={{
                                mb: 3,
                                fontSize: "12px",
                                fontWeight: 500,
                                margin: "5px 14px 0 14px",
                              }}
                            >
                              {formik.errors.commercialRegistrationUrl}
                            </Typography>
                          )}

                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            autoComplete="off"
                            error={
                              !!(
                                formik.touched.commercialRegistrationNumber &&
                                formik.errors.commercialRegistrationNumber
                              )
                            }
                            fullWidth
                            helperText={
                              formik.touched.commercialRegistrationNumber &&
                              formik.errors.commercialRegistrationNumber
                            }
                            label={t("Commercial Registration Number")}
                            name="commercialRegistrationNumber"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.commercialRegistrationNumber?.replace(
                              /[^A-Za-z0-9]/,
                              ""
                            )}
                            required
                          />
                        </Stack>
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
                              {t("Change the location status")}
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
                        changeTab("locations", Screens?.companyDetail);
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
                    {id ? t("Update") : t("Create")}
                  </LoadingButton>
                </Stack>
              </Stack>
              <ConfirmationDialog
                show={showDialogCustomerEvent}
                toggle={() =>
                  setShowDialogCustomerEvent(!showDialogCustomerEvent)
                }
                onOk={(e: any) => {
                  formik.setFieldValue(
                    "allowNegativeBilling",
                    !formik.values.allowNegativeBilling
                  );
                  setShowDialogCustomerEvent(false);
                }}
                okButtonText={`${t("OK")}`}
                title={t("Message")}
                text={t(
                  "Please relaunch the 'Tijarah360 POS' app on all the POS devices for the changes to take effect. "
                )}
              />
            </form>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default LocationCreateTab;
