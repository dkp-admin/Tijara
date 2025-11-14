import { AddCircleOutlineRounded, FileCopy } from "@mui/icons-material";
import DeleteOutlineTwoToneIcon from "@mui/icons-material/DeleteOutlineTwoTone";
import ReorderRoundedIcon from "@mui/icons-material/ReorderRounded";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  SvgIcon,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import Download01 from "@untitled-ui/icons-react/build/esm/Download01";
import Edit02Icon from "@untitled-ui/icons-react/build/esm/Edit02";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import {
  differenceInMinutes,
  endOfDay,
  format,
  parse,
  startOfDay,
} from "date-fns";
import { useFormik } from "formik";
import html2canvas from "html2canvas";
import { DateTime } from "luxon";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import {
  DragDropContext,
  Draggable,
  DraggableStateSnapshot,
  Droppable,
} from "react-beautiful-dnd";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import ConfirmationDialog from "src/components/confirmation-dialog";
import { Seo } from "src/components/seo";
import { AR_MENU_URL, FRONTEND_URL } from "src/config";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { useUserType } from "src/hooks/use-user-type";
import i18n from "src/i18n";
import NoPermission from "src/pages/no-permission";
import { timeZones } from "src/pages/reporting-hour/create";
import { MoleculeType } from "src/permissionManager";
import {
  ChannelsName,
  OtherChannels,
  RestaurantChannels,
  USER_TYPES,
} from "src/utils/constants";
import { convertToUTC } from "src/utils/get-report-date-time";
import parsePhoneNumber from "src/utils/parse-phone-number";
import { Screens } from "src/utils/screens-names";
import useActiveTabs from "src/utils/use-active-tabs";
import * as Yup from "yup";
import TextFieldWrapper from "../text-field-wrapper";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";

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
  arMenu: boolean;
  businessTime: boolean;
  eventBasedTime: boolean;
  extendedReporting: boolean;
  endStartReporting: boolean;
  defaultTime: boolean;
  rollingTime: boolean;
  rollingStartTime: Date;
  timeZone: string;
  refundModes: any[];
  enableRefundModesRestriction: boolean;
  enableGeofencingOnlineOrdering: boolean;
  enableCollectionOnlineOrdering: boolean;
}

const orderTypeOptions = [
  {
    label: i18n.t("All"),
    value: "all",
  },
  {
    label: i18n.t("Self Pickup"),
    value: "pickup",
  },
  {
    label: i18n.t("Delivery"),
    value: "delivery",
  },
];

const paymentTypeOptions = [
  {
    label: i18n.t("All"),
    value: "all",
  },
  {
    label: i18n.t("Online"),
    value: "online",
  },
  {
    label: i18n.t("Offline"),
    value: "offline",
  },
];

const LocationSettingsTab = (props: any) => {
  const { id, companyRef } = props;
  const qrOrderingRef = useRef(null);
  const qrOnlineOrderingRef = useRef(null);
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { userType } = useUserType();
  const { changeTab } = useActiveTabs();
  const { canAccessModule } = useFeatureModuleManager();
  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["location:update"]);
  const canCreate = canAccess(MoleculeType["location:create"]);

  const [, setLoad] = useState(false);
  const [, setShowError] = useState(false);
  const [country, setCountry] = useState("+966");
  const [scheduleIndex, setScheduleIndex] = useState(-1);
  const [openStartTimePicker, setOpenStartTimePicker] = useState(false);
  const [openEndTimePicker, setOpenEndTimePicker] = useState(false);
  const [showDialogCustomerEvent, setShowDialogCustomerEvent] = useState(false);

  const { findOne, create, updateEntity, entity } = useEntity("location");
  const { findOne: company, entity: companyEntity } = useEntity("company");
  const { find: findPaymentTypes, entities: paymentTypesData } =
    useEntity("payment-type");

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
    arMenu: false,
    enableGeofencingOnlineOrdering: false,
    businessTime: true,
    eventBasedTime: false,
    extendedReporting: false,
    endStartReporting: false,
    defaultTime: false,
    rollingTime: false,
    rollingStartTime: null,
    timeZone: "",
    refundModes: [], // Will be populated from API
    enableRefundModesRestriction: false,
    enableCollectionOnlineOrdering: false,
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

  const generateRefundModesFromAPI = (existingRefundModes: any[] = []) => {
    if (paymentTypesData?.results && paymentTypesData.results.length > 0) {
      return paymentTypesData.results.map((paymentType: any) => {
        const existingMode = existingRefundModes.find(
          (mode: any) =>
            mode.value ===
            (paymentType.name?.en || paymentType.name)
              .toLowerCase()
              .replace(/\s+/g, "")
        );

        return {
          label: t(paymentType.name?.en || paymentType.name),
          value: (paymentType.name?.en || paymentType.name)
            .toLowerCase()
            .replace(/\s+/g, ""),
          status: existingMode ? Boolean(existingMode.status) : false,
        };
      });
    }
    return existingRefundModes;
  };

  const formik: any = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values: any): Promise<void> => {
      const shouldValidate =
        values.onlineOrdering || values.qrOrdering || values.arMenu;

      if (
        shouldValidate &&
        !entity.subdomain &&
        companyEntity?.industry === "restaurant"
      ) {
        toast.error(t("Subdomain is required"));
        return;
      }

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
        refundModes: values?.refundModes,
        enableRefundModesRestriction:
          values?.enableRefundModesRestriction || false,
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
          arMenu: values.arMenu,
          enableGeofencingOnlineOrdering:
            values?.enableGeofencingOnlineOrdering,
          enableCollectionOnlineOrdering: values.enableCollectionOnlineOrdering,
        },
        timeZone: values.timeZone,
        businessClosureSetting: {
          businessTime: values.businessTime,
          eventBasedTime: values.eventBasedTime,
          extendedReporting: values.extendedReporting,
          endStartReporting: values.endStartReporting,
          defaultTime: values.defaultTime,
          rollingTime: values.rollingTime,
          startTime: values.rollingStartTime,
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
          await create({ ...data });
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
        toast.error(err.message);
      } finally {
        setLoad(false);
      }
    },
  });

  const handleDragEnd = (e: any) => {
    if (!e.destination) return;
    let tempData = Array.from(formik?.values?.schedule);
    let [source_data] = tempData.splice(e.source.index, 1);
    tempData.splice(e.destination.index, 0, source_data);

    formik.setFieldValue("schedule", tempData);
  };

  const handleAddTimeSlot = () => {
    if (scheduleIndex === -1 && formik.values.schedule?.length === 5) {
      formik.setFieldValue("startTime", null);
      formik.setFieldValue("endTime", null);

      toast.error(t("You can't add more than 5 business time slots"));
      return;
    }

    if (!formik.values.startTime) {
      toast.error(t("Opening time not added"));
      return;
    }

    if (!formik.values.endTime) {
      toast.error(t("Closing time not added"));
      return;
    }

    if (
      differenceInMinutes(formik.values.endTime, formik.values.startTime) <= 0
    ) {
      toast.error(t("Closing time must be after opening time"));
      return;
    }

    for (let index = 0; index < formik.values.schedule.length; index++) {
      if (
        differenceInMinutes(
          new Date(formik.values.schedule[index].startTime),
          formik.values.startTime
        ) === 0 &&
        differenceInMinutes(
          new Date(formik.values.schedule[index].endTime),
          formik.values.endTime
        ) === 0
      ) {
        toast.error(t("Opening and closing time already exist"));
        return;
      }
    }

    if (scheduleIndex !== -1) {
      const data = formik.values.schedule;

      data.splice(scheduleIndex, 1, {
        startTime: formik.values.startTime,
        endTime: formik.values.endTime,
      });

      setScheduleIndex(-1);
      formik.setFieldValue("schedule", data);
    } else {
      formik.setFieldValue("schedule", [
        ...formik.values.schedule,
        {
          startTime: formik.values.startTime,
          endTime: formik.values.endTime,
        },
      ]);
    }

    formik.setFieldValue("startTime", null);
    formik.setFieldValue("endTime", null);
  };

  const handleDownloadQROrdering = () => {
    html2canvas(qrOrderingRef.current).then((canvas) => {
      const qrImage = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = qrImage;
      downloadLink.download = "qr_code.png";
      downloadLink.click();
    });
  };

  const handleDownloadQROnlineOrdering = () => {
    html2canvas(qrOnlineOrderingRef.current).then((canvas) => {
      const qrImage = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = qrImage;
      downloadLink.download = "qr_code_online.png";
      downloadLink.click();
    });
  };

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
    findPaymentTypes({
      page: 0,
      limit: 50,
      activeTab: "active",
      sort: "asc",
    });
  }, []);

  useEffect(() => {
    if (id == null && companyEntity) {
      formik.setFieldValue(
        "channels",
        companyEntity?.industry?.toLowerCase() === "restaurant"
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

      const timeZoneNew = entity.timeZone?.split(",");

      const scheduled = entity?.qrOrderingConfiguration?.schedule?.map(
        (schedule: any) => {
          const startDateTimeUTC = DateTime.fromISO(schedule?.startTime, {
            zone: "utc",
          });
          const endDateTimeUTC = DateTime.fromISO(schedule?.endTime, {
            zone: "utc",
          });

          const timeZone = timeZoneNew?.[1]?.trim();
          const startDateTimeInZone = startDateTimeUTC.setZone(timeZone);
          const endDateTimeInZone = endDateTimeUTC.setZone(timeZone);

          const formattedStartTime = startDateTimeInZone.toFormat("h:mm a");
          const formattedEndTime = endDateTimeInZone.toFormat("h:mm a");

          const date1 = parse(formattedStartTime, "h:mm a", new Date());
          const date2 = parse(formattedEndTime, "h:mm a", new Date());

          const formattedStartDateTime = format(date1, "yyyy-MM-dd h:mm a");
          const formattedEndDateTime = format(date2, "yyyy-MM-dd h:mm a");

          return {
            startTime: new Date(formattedStartDateTime),
            endTime: new Date(formattedEndDateTime),
          };
        }
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
          scheduled?.length > 0
            ? scheduled
            : [
                {
                  startTime: startOfDay(new Date()),
                  endTime: endOfDay(new Date()),
                },
              ],
        paymentOptions:
          entity?.qrOrderingConfiguration?.paymentOptions || "all",
        startTime: null,
        refundModes: generateRefundModesFromAPI(entity?.refundModes || []),
        enableRefundModesRestriction:
          entity?.enableRefundModesRestriction || false,
        endTime: null,
        qrOrdering: entity?.qrOrderingConfiguration?.qrOrdering,
        qrPaymentOptions:
          entity?.qrOrderingConfiguration?.paymentOptionsQr || "all",
        arMenu: entity?.qrOrderingConfiguration?.arMenu || false,
        businessTime: entity?.businessClosureSetting?.businessTime,
        eventBasedTime: entity?.businessClosureSetting?.eventBasedTime,
        extendedReporting: entity?.businessClosureSetting?.extendedReporting,
        endStartReporting: entity?.businessClosureSetting?.endStartReporting,
        defaultTime: entity?.businessClosureSetting?.defaultTime,
        timeZone: entity?.timeZone,
        enableGeofencingOnlineOrdering:
          entity?.qrOrderingConfiguration?.enableGeofencingOnlineOrdering,
        enableCollectionOnlineOrdering:
          entity?.qrOrderingConfiguration?.enableCollectionOnlineOrdering,
      });
    }
  }, [entity, companyEntity]);

  useEffect(() => {
    if (paymentTypesData?.results && paymentTypesData.results.length > 0) {
      const currentRefundModes = formik.values.refundModes || [];
      const updatedRefundModes = generateRefundModesFromAPI(currentRefundModes);
      formik.setFieldValue("refundModes", updatedRefundModes);
    }
  }, [paymentTypesData]);

  useEffect(() => {
    formik.setFieldValue("startTime", null);
    formik.setFieldValue("endTime", null);
  }, []);

  useEffect(() => {
    if (
      !formik.values.defaultTime &&
      !formik.values.eventBasedTime &&
      !formik.values.businessTime
    ) {
      formik.setFieldValue("defaultTime", true);
    }
  }, [
    formik.values.defaultTime,
    formik.values.eventBasedTime,
    formik.values.businessTime,
  ]);

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
              <Typography variant="h4">{id && t("Settings")}</Typography>
            </Stack>

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4} sx={{ mt: 3 }}>
                {id != null && (
                  <Card>
                    <CardContent>
                      <Grid container>
                        <Grid xs={12} md={4}>
                          <Stack spacing={1}>
                            <Typography variant="h6">
                              {t("Operating Hours")}
                            </Typography>
                          </Stack>
                        </Grid>

                        <Grid item xs={12} md={8}>
                          <Box>
                            <Grid
                              container
                              spacing={3}
                              sx={{ mt: 0.25 }}
                            ></Grid>

                            {/* <Typography
                              sx={{ ml: 1, mt: 1, mb: 1.5 }}
                              fontSize="15px"
                              variant="subtitle1">
                              {t("Business Time Slots")}
                            </Typography> */}

                            <Grid container spacing={3}>
                              <Grid item xs={12} sm={5.5}>
                                {/* tslint:disable */}
                                <TimePicker
                                  open={openStartTimePicker}
                                  onOpen={() => setOpenStartTimePicker(true)}
                                  onClose={() => setOpenStartTimePicker(false)}
                                  label={t(`Opening Time`)}
                                  inputFormat="h:mm a" //{/*
                                  // @ts-ignore */}
                                  inputProps={{ disabled: true }}
                                  disablePast
                                  onChange={(date) => {
                                    formik.setFieldValue("startTime", date);
                                    formik.setFieldValue("endTime", null);
                                  }}
                                  value={formik.values.startTime}
                                  renderInput={(params) => (
                                    <TextFieldWrapper
                                      {...params}
                                      fullWidth
                                      name="startTime"
                                      onBlur={formik.handleBlur}
                                      onClick={() =>
                                        setOpenStartTimePicker(true)
                                      }
                                    />
                                  )}
                                />
                              </Grid>

                              <Grid item xs={12} sm={5.5}>
                                {/* tslint:disable */}
                                <TimePicker
                                  open={openEndTimePicker}
                                  onOpen={() => setOpenEndTimePicker(true)}
                                  onClose={() => setOpenEndTimePicker(false)}
                                  minTime={new Date(formik.values.startTime)}
                                  label={t(`Closing Time`)}
                                  inputFormat="h:mm a" //{/*
                                  // @ts-ignore */}
                                  inputProps={{ disabled: true }}
                                  disablePast
                                  onChange={(date) => {
                                    formik.setFieldValue("endTime", date);
                                  }}
                                  value={formik.values.endTime}
                                  renderInput={(params) => (
                                    <TextFieldWrapper
                                      {...params}
                                      fullWidth
                                      name="endTime"
                                      onBlur={formik.handleBlur}
                                      onClick={() => setOpenEndTimePicker(true)}
                                    />
                                  )}
                                />
                              </Grid>

                              <Grid item xs={12} sm={1}>
                                <IconButton
                                  sx={{ mt: 1 }}
                                  color="primary"
                                  onClick={() => handleAddTimeSlot()}
                                  disabled={
                                    !formik.values.startTime ||
                                    !formik.values.endTime
                                  }
                                >
                                  <AddCircleOutlineRounded />
                                </IconButton>
                              </Grid>
                            </Grid>

                            <DragDropContext onDragEnd={handleDragEnd}>
                              <TableContainer>
                                <Table sx={{ mt: 3 }}>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>{t("Opening Time")}</TableCell>
                                      <TableCell>{t("Closing Time")}</TableCell>
                                      <TableCell></TableCell>
                                    </TableRow>
                                  </TableHead>

                                  <Droppable droppableId="slidesDataDroppable">
                                    {(provided) => (
                                      <TableBody
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                      >
                                        {formik.values.schedule?.length > 0 ? (
                                          formik.values.schedule.map(
                                            (schedule: any, idx: any) => {
                                              // const parsedStartTime =
                                              //   DateTime.fromISO(
                                              //     schedule?.startTime,
                                              //     {
                                              //       zone: "Asia/Riyadh",
                                              //     }
                                              //   );
                                              // const parsedEndTime =
                                              //   DateTime.fromISO(
                                              //     schedule?.endTime,
                                              //     {
                                              //       zone: "Asia/Riyadh",
                                              //     }
                                              //   );

                                              return (
                                                <Draggable
                                                  key={idx}
                                                  draggableId={idx.toString()}
                                                  index={idx}
                                                >
                                                  {(
                                                    provided,
                                                    snapshot: DraggableStateSnapshot
                                                  ) => {
                                                    return (
                                                      <TableRow
                                                        key={idx}
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{
                                                          ...provided
                                                            .draggableProps
                                                            .style,
                                                          background:
                                                            snapshot.isDragging
                                                              ? "rgba(245,245,245, 0.75)"
                                                              : "none",
                                                        }}
                                                      >
                                                        <TableCell>
                                                          <Typography variant="body2">
                                                            <IconButton
                                                              sx={{
                                                                mr: 0.7,
                                                                ml: -1,
                                                              }}
                                                            >
                                                              <SvgIcon>
                                                                <ReorderRoundedIcon fontSize="small" />
                                                              </SvgIcon>
                                                            </IconButton>

                                                            {
                                                              // id != null
                                                              // ? parsedStartTime.toFormat(
                                                              //     "h:mm a"
                                                              //   )
                                                              // : schedule?.startTime
                                                              // ?
                                                              format(
                                                                new Date(
                                                                  schedule.startTime
                                                                ),
                                                                "h:mm a"
                                                              )
                                                              // : ""
                                                            }
                                                          </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                          <Typography variant="body2">
                                                            {
                                                              // id != null
                                                              //   ? parsedEndTime.toFormat(
                                                              //       "h:mm a"
                                                              //     )
                                                              //   : schedule?.endTime
                                                              //   ?
                                                              format(
                                                                new Date(
                                                                  schedule.endTime
                                                                ),
                                                                "h:mm a"
                                                              )
                                                              // : ""
                                                            }
                                                          </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                          <Box
                                                            sx={{
                                                              display: "flex",
                                                              justifyContent:
                                                                "flex-end",
                                                            }}
                                                          >
                                                            <IconButton
                                                              sx={{ mr: 0.5 }}
                                                              onClick={() => {
                                                                formik.setFieldValue(
                                                                  "startTime",
                                                                  schedule.startTime
                                                                );
                                                                formik.setFieldValue(
                                                                  "endTime",
                                                                  schedule.endTime
                                                                );
                                                                setScheduleIndex(
                                                                  idx
                                                                );
                                                              }}
                                                            >
                                                              <SvgIcon>
                                                                <Edit02Icon fontSize="small" />
                                                              </SvgIcon>
                                                            </IconButton>

                                                            <IconButton
                                                              color="error"
                                                              onClick={() => {
                                                                formik.values.schedule.splice(
                                                                  idx,
                                                                  1
                                                                );
                                                                formik.setFieldValue(
                                                                  "schedule",
                                                                  [
                                                                    ...formik
                                                                      .values
                                                                      .schedule,
                                                                  ]
                                                                );
                                                              }}
                                                              style={{
                                                                pointerEvents:
                                                                  "painted",
                                                              }}
                                                            >
                                                              <DeleteOutlineTwoToneIcon />
                                                            </IconButton>
                                                          </Box>
                                                        </TableCell>
                                                      </TableRow>
                                                    );
                                                  }}
                                                </Draggable>
                                              );
                                            }
                                          )
                                        ) : (
                                          <TableRow>
                                            <TableCell
                                              colSpan={5}
                                              sx={{ py: 3 }}
                                              style={{ textAlign: "center" }}
                                            >
                                              {t(
                                                "Currently, there are no business time slots"
                                              )}
                                            </TableCell>
                                          </TableRow>
                                        )}
                                      </TableBody>
                                    )}
                                  </Droppable>
                                </Table>
                              </TableContainer>
                            </DragDropContext>

                            <Box sx={{ mt: 3 }}>
                              <TextFieldWrapper
                                select
                                autoComplete="off"
                                inputProps={{
                                  style: { textTransform: "capitalize" },
                                }}
                                fullWidth
                                label={t("Time Zone")}
                                name="timeZone"
                                error={Boolean(
                                  formik.touched.timeZone &&
                                    formik.errors.timeZone
                                )}
                                helperText={
                                  (formik.touched.timeZone &&
                                    formik.errors.timeZone) as any
                                }
                                onBlur={formik.handleBlur}
                                onChange={(e) => {
                                  formik.handleChange(e);
                                }}
                                value={formik.values.timeZone}
                              >
                                {timeZones?.map((industry) => (
                                  <MenuItem
                                    key={industry.value}
                                    value={industry.value}
                                  >
                                    {industry.label}
                                  </MenuItem>
                                ))}
                              </TextFieldWrapper>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent>
                    <Grid container>
                      <Grid xs={12} md={4}>
                        <Stack spacing={1}>
                          <Typography variant="h6">
                            {t("Business Closure Settings")}
                          </Typography>
                        </Stack>
                      </Grid>

                      <Grid item xs={12} md={8}>
                        <Box
                          sx={{
                            display: "flex",
                            paddingLeft: "8px",
                            borderRadius: "8px",
                            alignItems: "center",
                            justifyContent: "space-between",
                            border: `1px solid ${
                              theme.palette.mode !== "dark"
                                ? "#E5E7EB"
                                : "#2D3748"
                            }`,
                          }}
                        >
                          <Typography>{"Business Hours"}</Typography>

                          <Box
                            sx={{
                              p: 1,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Switch
                              edge="end"
                              color="primary"
                              name="businessTime"
                              checked={formik.values.businessTime}
                              onChange={(e) => {
                                if (!formik.values.businessTime) {
                                  formik.setFieldValue("businessTime", true);
                                  formik.setFieldValue("eventBasedTime", false);
                                  formik.setFieldValue(
                                    "extendedReporting",
                                    false
                                  );
                                  formik.setFieldValue(
                                    "endStartReporting",
                                    false
                                  );
                                  formik.setFieldValue("defaultTime", false);
                                  formik.setFieldValue("rollingTime", false);
                                } else {
                                  formik.setFieldValue("businessTime", false);
                                }
                              }}
                              sx={{ mr: 0.2 }}
                            />
                            <Tooltip
                              title={t(
                                "The day-end report covers transactions within store hours, like 8 AM to 10 PM. If the system doesn't follow these hours, it ignores any POS day-start and day-end actions."
                              )}
                            >
                              <SvgIcon color="action">
                                <InfoCircleIcon />
                              </SvgIcon>
                            </Tooltip>
                          </Box>
                        </Box>

                        {/* <Box
                          sx={{
                            display: "flex",
                            paddingLeft: "8px",
                            borderRadius: "8px",
                            alignItems: "center",
                            justifyContent: "space-between",
                            border: `1px solid ${
                              theme.palette.mode !== "dark"
                                ? "#E5E7EB"
                                : "#2D3748"
                            }`,
                            mt: 3,
                          }}>
                          <Typography>
                            {"Day Start and Day End Event"}
                          </Typography>

                          <Box
                            sx={{
                              p: 1,
                              display: "flex",
                              alignItems: "center",
                            }}>
                            <Switch
                              edge="end"
                              color="primary"
                              name="eventBasedTime"
                              checked={formik.values.eventBasedTime}
                              onChange={(e) => {
                                if (!formik.values.eventBasedTime) {
                                  formik.setFieldValue("businessTime", false);
                                  formik.setFieldValue("eventBasedTime", true);
                                  formik.setFieldValue(
                                    "extendedReporting",
                                    false
                                  );
                                  formik.setFieldValue(
                                    "endStartReporting",
                                    true
                                  );
                                  formik.setFieldValue("defaultTime", false);
                                  formik.setFieldValue("rollingTime", false);
                                } else {
                                  formik.setFieldValue("eventBasedTime", false);
                                  formik.setFieldValue(
                                    "extendedReporting",
                                    false
                                  );
                                  formik.setFieldValue(
                                    "endStartReporting",
                                    false
                                  );
                                }
                              }}
                              sx={{ mr: 0.2 }}
                            />
                            <Tooltip
                              title={t(
                                "The report relies on custom day start and day end events, allowing flexible hours. If the day-end isn't performed, the system extends reporting to cover all transactions until the next day, aggregating multiple starts and ends."
                              )}>
                              <SvgIcon color="action">
                                <InfoCircleIcon />
                              </SvgIcon>
                            </Tooltip>
                          </Box>
                        </Box> */}

                        {formik.values.eventBasedTime && (
                          <Box sx={{ display: "flex", mt: 3 }}>
                            {/* <Card
                              sx={{
                                alignItems: "center",
                                cursor: "pointer",
                                display: "flex",
                                p: 0,
                                mr: 2,
                                pr: 2,
                                backgroundColor: formik.values.extendedReporting
                                  ? "primary.alpha12"
                                  : "transparent",
                                boxShadow: formik.values.extendedReporting
                                  ? (theme) =>
                                      `${theme.palette.primary.main} 0 0 0 1px`
                                  : "none",
                              }}
                              onClick={() => {
                                if (!formik.values.extendedReporting) {
                                  formik.setFieldValue(
                                    "extendedReporting",
                                    true
                                  );
                                  formik.setFieldValue(
                                    "endStartReporting",
                                    false
                                  );
                                } else {
                                  formik.setFieldValue(
                                    "extendedReporting",
                                    false
                                  );
                                  formik.setFieldValue(
                                    "endStartReporting",
                                    true
                                  );
                                }
                              }}
                              variant="outlined">
                              <Stack
                                direction="row"
                                sx={{ alignItems: "center" }}
                                spacing={1}>
                                <Radio
                                  color="primary"
                                  checked={formik.values.extendedReporting}
                                />
                                <div>
                                  <Typography variant="subtitle1">
                                    {t("Extended Reporting")}
                                  </Typography>
                                </div>

                                <Tooltip
                                  title={t(
                                    "The reporting period extends to cover all transactions until the actual closing time, even if it surpasses predefined business hours, continuing until the next business day or shift."
                                  )}>
                                  <SvgIcon color="action">
                                    <InfoCircleIcon />
                                  </SvgIcon>
                                </Tooltip>
                              </Stack>
                            </Card> */}

                            {/* <Card
                              sx={{
                                alignItems: "center",
                                cursor: "pointer",
                                display: "flex",
                                p: 0,
                                pr: 2,
                                backgroundColor: formik.values.endStartReporting
                                  ? "primary.alpha12"
                                  : "transparent",
                                boxShadow: formik.values.endStartReporting
                                  ? (theme) =>
                                      `${theme.palette.primary.main} 0 0 0 1px`
                                  : "none",
                              }}
                              onClick={() => {
                                if (!formik.values.endStartReporting) {
                                  formik.setFieldValue(
                                    "endStartReporting",
                                    true
                                  );
                                  formik.setFieldValue(
                                    "extendedReporting",
                                    false
                                  );
                                } else {
                                  formik.setFieldValue(
                                    "endStartReporting",
                                    false
                                  );
                                  formik.setFieldValue(
                                    "extendedReporting",
                                    true
                                  );
                                }
                              }}
                              variant="outlined">
                              <Stack
                                direction="row"
                                sx={{ alignItems: "center" }}
                                spacing={1}>
                                <Radio
                                  color="primary"
                                  checked={formik.values.endStartReporting}
                                />
                                <div>
                                  <Typography variant="subtitle1">
                                    {t("End at business day")}
                                  </Typography>
                                </div>
                                <Tooltip
                                  title={t(
                                    "If the pos is not doing the day end it will be automatically done at the specified day-end time."
                                  )}>
                                  <SvgIcon color="action">
                                    <InfoCircleIcon />
                                  </SvgIcon>
                                </Tooltip>
                              </Stack>
                            </Card> */}
                          </Box>
                        )}

                        <Box
                          sx={{
                            display: "flex",
                            paddingLeft: "8px",
                            borderRadius: "8px",
                            alignItems: "center",
                            justifyContent: "space-between",
                            border: `1px solid ${
                              theme.palette.mode !== "dark"
                                ? "#E5E7EB"
                                : "#2D3748"
                            }`,
                            mt: 3,
                          }}
                        >
                          <Typography>{"Default"}</Typography>

                          <Box
                            sx={{
                              p: 1,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Switch
                              edge="end"
                              color="primary"
                              name="defaultTime"
                              checked={formik.values.defaultTime}
                              onChange={(e) => {
                                if (!formik.values.defaultTime) {
                                  formik.setFieldValue("businessTime", false);
                                  formik.setFieldValue("eventBasedTime", false);
                                  formik.setFieldValue(
                                    "extendedReporting",
                                    false
                                  );
                                  formik.setFieldValue(
                                    "endStartReporting",
                                    false
                                  );
                                  formik.setFieldValue("defaultTime", true);
                                  formik.setFieldValue("rollingTime", false);
                                } else {
                                  formik.setFieldValue("defaultTime", false);
                                }
                              }}
                              sx={{ mr: 0.2 }}
                            />
                            <Tooltip
                              title={t(
                                "The report follows the standard calendar day from 12 AM to 11:59 PM, aligning with the conventional daily timeline. The system ignores any day-start and day-end actions performed from the POS."
                              )}
                            >
                              <SvgIcon color="action">
                                <InfoCircleIcon />
                              </SvgIcon>
                            </Tooltip>
                          </Box>
                        </Box>

                        {/* <Box
                          sx={{
                            display: "flex",
                            paddingLeft: "8px",
                            borderRadius: "8px",
                            alignItems: "center",
                            justifyContent: "space-between",
                            border: `1px solid ${
                              theme.palette.mode !== "dark"
                                ? "#E5E7EB"
                                : "#2D3748"
                            }`,
                            mt: 3,
                          }}>
                          <Typography>{"Rolling time"}</Typography>

                          <Box
                            sx={{
                              p: 1,
                              display: "flex",
                              alignItems: "center",
                            }}>
                            <Switch
                              edge="end"
                              color="primary"
                              name="rollingTime"
                              checked={formik.values.rollingTime}
                              onChange={(e) => {
                                if (!formik.values.rollingTime) {
                                  formik.setFieldValue("businessTime", false);
                                  formik.setFieldValue("eventBasedTime", false);
                                  formik.setFieldValue(
                                    "extendedReporting",
                                    false
                                  );
                                  formik.setFieldValue(
                                    "endStartReporting",
                                    false
                                  );
                                  formik.setFieldValue("defaultTime", false);
                                  formik.setFieldValue("rollingTime", true);
                                } else {
                                  formik.setFieldValue("eventBasedTime", false);
                                }
                              }}
                              sx={{ mr: 0.2 }}
                            />

                            <Tooltip
                              title={t(
                                "The report covers a rolling 24-hour period from a set start time, like 6 AM to 5:59 AM the next day. The system ignores day-start and day-end actions performed from the POS"
                              )}>
                              <SvgIcon color="action">
                                <InfoCircleIcon />
                              </SvgIcon>
                            </Tooltip>
                          </Box>
                        </Box> */}
                        {/*
                        {formik.values.rollingTime && (
                          <Box sx={{ mt: 3 }}>
                            <TimePicker
                              label={t(`Start Time`)}
                              inputFormat="h:mm a"
                              inputProps={{ disabled: true }}
                              disablePast
                              onChange={(date) => {
                                formik.setFieldValue("rollingStartTime", date);
                              }}
                              value={formik.values.rollingStartTime}
                              renderInput={(params) => (
                                <TextFieldWrapper
                                  {...params}
                                  fullWidth
                                  name="rollingStartTime"
                                  onBlur={formik.handleBlur}
                                />
                              )}
                            />
                          </Box>
                        )} */}
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
                            {t("Order Types")}
                          </Typography>
                        </Stack>
                      </Grid>

                      <Grid item xs={12} md={8}>
                        <Grid container spacing={3}>
                          <Grid item md={12} xs={12}>
                            <Card>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>{t("Name")}</TableCell>
                                    <TableCell align="right">
                                      {t("Status")}
                                    </TableCell>
                                  </TableRow>
                                </TableHead>

                                <TableBody>
                                  {formik.values.channels?.length > 0 ? (
                                    formik.values.channels.map(
                                      (channel: any, idx: any) => {
                                        return (
                                          <TableRow key={idx}>
                                            <TableCell>
                                              <Typography variant="body2">
                                                {ChannelsName[channel.name] ||
                                                  channel.name}
                                              </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                              <FormControlLabel
                                                sx={{
                                                  marginRight: 0.5,
                                                  display: "flex",
                                                  flexDirection: "row",
                                                  justifyContent: "flex-end",
                                                }}
                                                control={
                                                  <Switch
                                                    edge="end"
                                                    color="primary"
                                                    name="channels"
                                                    sx={{ mr: 0.2 }}
                                                    checked={channel.status}
                                                    onChange={(e) => {
                                                      const newChannel =
                                                        formik.values.channels;
                                                      channel.status =
                                                        e.target.checked;
                                                      formik.setFieldValue(
                                                        "channels",
                                                        newChannel
                                                      );
                                                    }}
                                                  />
                                                }
                                                label={
                                                  channel.status
                                                    ? t("Active")
                                                    : t("Deactivated")
                                                }
                                              />
                                            </TableCell>
                                          </TableRow>
                                        );
                                      }
                                    )
                                  ) : (
                                    <TableRow>
                                      <TableCell
                                        colSpan={5}
                                        sx={{ py: 3 }}
                                        style={{ textAlign: "center" }}
                                      >
                                        {t(
                                          "Currently, there are no order types"
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </Card>
                          </Grid>
                        </Grid>
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
                            {t("Refund Modes Restriction")}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid xs={12} md={8}>
                        <Stack spacing={1}>
                          <FormControlLabel
                            label=""
                            sx={{
                              marginRight: 0.5,
                              display: "flex",
                              flexDirection: "row",
                              justifyContent: "flex-end",
                            }}
                            control={
                              <Switch
                                edge="end"
                                color="primary"
                                name="channels"
                                sx={{ mr: 0.2 }}
                                checked={
                                  formik?.values?.enableRefundModesRestriction
                                }
                                onChange={(e) => {
                                  formik.setFieldValue(
                                    "enableRefundModesRestriction",
                                    e.target.checked
                                  );
                                }}
                              />
                            }
                          />
                        </Stack>
                      </Grid>

                      {formik?.values?.enableRefundModesRestriction && (
                        <Grid item xs={12} md={12}>
                          <Grid container spacing={3}>
                            <Grid item md={12} xs={12}>
                              <Card>
                                <Table>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>{t("Name")}</TableCell>
                                      <TableCell align="right">
                                        {t("Status")}
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>

                                  <TableBody>
                                    {formik?.values?.refundModes?.length > 0 ? (
                                      formik?.values?.refundModes?.map(
                                        (channel: any, idx: any) => {
                                          return (
                                            <TableRow key={idx}>
                                              <TableCell>
                                                <Typography variant="body2">
                                                  {channel?.label}
                                                </Typography>
                                              </TableCell>
                                              <TableCell align="right">
                                                <FormControlLabel
                                                  sx={{
                                                    marginRight: 0.5,
                                                    display: "flex",
                                                    flexDirection: "row",
                                                    justifyContent: "flex-end",
                                                  }}
                                                  control={
                                                    <Switch
                                                      edge="end"
                                                      color="primary"
                                                      name="channels"
                                                      sx={{ mr: 0.2 }}
                                                      checked={Boolean(
                                                        channel?.status
                                                      )}
                                                      onChange={(e) => {
                                                        const newChannel =
                                                          formik.values
                                                            .refundModes;
                                                        channel.status =
                                                          e.target.checked;
                                                        formik.setFieldValue(
                                                          "refundModes",
                                                          newChannel
                                                        );
                                                      }}
                                                    />
                                                  }
                                                  label={
                                                    Boolean(channel.status)
                                                      ? t("Active")
                                                      : t("Deactivated")
                                                  }
                                                />
                                              </TableCell>
                                            </TableRow>
                                          );
                                        }
                                      )
                                    ) : (
                                      <TableRow>
                                        <TableCell
                                          colSpan={5}
                                          sx={{ py: 3 }}
                                          style={{ textAlign: "center" }}
                                        >
                                          {t(
                                            "Currently, there are no order types"
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </Card>
                            </Grid>
                          </Grid>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>

                {id != null && (
                  <Card>
                    <CardContent>
                      <Grid container>
                        <Grid xs={12} md={4}>
                          <Stack spacing={1}>
                            <Typography variant="h6">
                              {t("Online Ordering")}
                            </Typography>
                            <Typography color="text.secondary" variant="body2">
                              {t("Online order view menu")}
                            </Typography>
                          </Stack>
                        </Grid>

                        <Grid item xs={12} md={8}>
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
                              {t("Online Order")}
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
                                name="onlineOrdering"
                                checked={formik.values.onlineOrdering}
                                onChange={(e) => {
                                  if (
                                    !canAccessModule("online_ordering") &&
                                    e.target.checked
                                  ) {
                                    toast.error(
                                      t(
                                        "Upgrade your subscription to access online ordering"
                                      )
                                    );
                                    return;
                                  }
                                  formik.setFieldValue(
                                    "onlineOrdering",
                                    e.target.checked
                                  );
                                }}
                                disabled={!canAccessModule("online_ordering")}
                                sx={{ mr: 1.5 }}
                              />

                              <Tooltip
                                title={t(
                                  "While enabling this will allow to accept the online order in web or POS billing"
                                )}
                              >
                                <SvgIcon color="action">
                                  <InfoCircleIcon />
                                </SvgIcon>
                              </Tooltip>
                            </Box>
                          </Box>

                          {formik.values.onlineOrdering && (
                            <Box>
                              <Grid container spacing={3} sx={{ mt: 0.25 }}>
                                <Grid item xs={12} sm={6}>
                                  <TextFieldWrapper
                                    error={
                                      !!(
                                        formik.touched.deliveryType &&
                                        formik.errors.deliveryType
                                      )
                                    }
                                    fullWidth
                                    label={t("Order/Delivery Type")}
                                    name="deliveryType"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    select
                                    value={formik.values.deliveryType}
                                    required
                                  >
                                    {orderTypeOptions.map((option) => (
                                      <MenuItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </MenuItem>
                                    ))}
                                  </TextFieldWrapper>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                  <TextFieldWrapper
                                    error={
                                      !!(
                                        formik.touched.paymentOptions &&
                                        formik.errors.paymentOptions
                                      )
                                    }
                                    fullWidth
                                    label={t("Payment Options")}
                                    name="paymentOptions"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    select
                                    value={formik.values.paymentOptions}
                                    required
                                  >
                                    {paymentTypeOptions.map((option) => (
                                      <MenuItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </MenuItem>
                                    ))}
                                  </TextFieldWrapper>
                                </Grid>
                              </Grid>

                              <Box
                                sx={{
                                  mt: 3.5,
                                  py: 0.5,
                                  height: "auto",
                                  border: `1px solid ${
                                    theme.palette.mode !== "dark"
                                      ? "#E5E7EB"
                                      : "#2D3748"
                                  }`,
                                  borderRadius: "8px",
                                  paddingLeft: "8px",
                                }}
                              >
                                <Typography
                                  fontSize="12px"
                                  variant="subtitle2"
                                  color="textSecondary"
                                >
                                  {t("Online Ordering Link")}
                                </Typography>

                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <IconButton
                                    href={
                                      companyEntity?.industry?.toLowerCase() ===
                                      "restaurant"
                                        ? `${FRONTEND_URL}/online-ordering-restaurant?locationRef=${id}&companyRef=${companyRef}`
                                        : `${FRONTEND_URL}/online-ordering-retail?locationRef=${id}&companyRef=${companyRef}`
                                    }
                                    target="_blank"
                                    sx={{
                                      ml: -0.75,
                                      borderRadius: 0,
                                      bgcolor: "transparent",
                                      cursor: "pointer",
                                      "&:hover": {
                                        textDecoration: "underline",
                                        textDecorationColor: "#2970FF",
                                      },
                                    }}
                                  >
                                    <Typography
                                      align="left"
                                      color="#2970FF"
                                      fontSize="14px"
                                      variant="subtitle2"
                                    >
                                      {companyEntity?.industry?.toLowerCase() ===
                                      "restaurant"
                                        ? `${FRONTEND_URL}/online-ordering-restaurant?locationRef=${id}`
                                        : `${FRONTEND_URL}/online-ordering-retail?locationRef=${id}`}
                                    </Typography>
                                  </IconButton>

                                  <Box
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        companyEntity?.industry?.toLowerCase() ===
                                          "restaurant"
                                          ? `${FRONTEND_URL}/online-ordering-restaurant?locationRef=${id}&companyRef=${companyRef}`
                                          : `${FRONTEND_URL}/online-ordering-retail?locationRef=${id}&companyRef=${companyRef}`
                                      );
                                      toast.success(
                                        t("Copied to Clipboard!").toString()
                                      );
                                    }}
                                    sx={{
                                      cursor: "pointer",
                                      mr: 2,
                                    }}
                                  >
                                    <FileCopy fontSize="small" />
                                  </Box>
                                </Box>
                              </Box>

                              <Box
                                ref={qrOnlineOrderingRef}
                                sx={{
                                  mt: 2,
                                  pl: 1,
                                  pt: 1,
                                  maxWidth: 165,
                                  backgroundColor: "background.paper",
                                }}
                              >
                                <QRCode
                                  size={150}
                                  viewBox={`0 0 150 150`}
                                  style={{ height: "auto", maxWidth: 150 }}
                                  value={
                                    companyEntity?.industry?.toLowerCase() ===
                                    "restaurant"
                                      ? `${FRONTEND_URL}/online-ordering-restaurant?locationRef=${id}&companyRef=${companyRef}`
                                      : `${FRONTEND_URL}/online-ordering-retail?locationRef=${id}&companyRef=${companyRef}`
                                  }
                                />
                              </Box>

                              <Box
                                sx={{
                                  maxWidth: 165,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <LoadingButton
                                  sx={{ mt: 0.5, mb: -2 }}
                                  variant="text"
                                  onClick={handleDownloadQROnlineOrdering}
                                >
                                  <Download01 />
                                </LoadingButton>
                              </Box>

                              <Box
                                sx={{
                                  display: "flex",
                                  marginTop: "20px",
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
                                  {t("Enable Geofencing")}
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
                                    name="onlineOrdering"
                                    checked={
                                      formik.values
                                        .enableGeofencingOnlineOrdering
                                    }
                                    onChange={(e) => {
                                      formik.setFieldValue(
                                        "enableGeofencingOnlineOrdering",
                                        e.target.checked
                                      );
                                    }}
                                    sx={{ mr: 1.5 }}
                                  />
                                </Box>
                              </Box>

                              <Box
                                sx={{
                                  display: "flex",
                                  marginTop: "20px",
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
                                  {t("Collections")}
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
                                    name="onlineOrdering"
                                    checked={
                                      formik.values
                                        .enableCollectionOnlineOrdering
                                    }
                                    onChange={(e) => {
                                      formik.setFieldValue(
                                        "enableCollectionOnlineOrdering",
                                        e.target.checked
                                      );
                                    }}
                                    sx={{ mr: 1.5 }}
                                  />

                                  <Tooltip
                                    title={t("Enable collections on menu page")}
                                  >
                                    <SvgIcon color="action">
                                      <InfoCircleIcon />
                                    </SvgIcon>
                                  </Tooltip>
                                </Box>
                              </Box>

                              <Box sx={{ mt: 2 }}>
                                <TextFieldWrapper
                                  multiline
                                  rows={6}
                                  fullWidth
                                  label={
                                    <Stack direction="row" alignItems="center">
                                      <Typography
                                        sx={{ ml: 1 }}
                                        fontSize="15px"
                                        variant="subtitle1"
                                      >
                                        {`${t("Coordinates")} *`}
                                      </Typography>

                                      <Tooltip
                                        sx={{ ml: 1 }}
                                        title={t(
                                          "To determine the coordinates of the zone through the map. Copy object from geojson.io and paste it in below feild."
                                        )}
                                      >
                                        <SvgIcon color="action">
                                          <InfoCircleIcon />
                                        </SvgIcon>
                                      </Tooltip>
                                    </Stack>
                                  }
                                  autoComplete="off"
                                  name="geofencing"
                                  placeholder={t("Paste the Coordinates here")}
                                  error={
                                    !!(
                                      formik.touched.geofencing &&
                                      formik.errors.geofencing
                                    )
                                  }
                                  helperText={
                                    formik.touched.geofencing &&
                                    formik.errors.geofencing
                                  }
                                  onBlur={formik.handleBlur}
                                  onChange={(event) => {
                                    formik.setFieldValue(
                                      "geofencing",
                                      JSON.parse(event.target.value)
                                    );
                                  }}
                                  value={
                                    formik.values.geofencing
                                      ? JSON.stringify(
                                          formik.values.geofencing,
                                          null,
                                          2
                                        )
                                      : ""
                                  }
                                  InputProps={{ readOnly: true }}
                                  onPaste={(event) => {
                                    const pastedData =
                                      event.clipboardData.getData("text");

                                    try {
                                      formik.setFieldValue(
                                        "geofencing",
                                        JSON.parse(pastedData)
                                      );
                                    } catch (error) {
                                      toast.error(
                                        `${t(
                                          "Invalid JSON format for Coordinates"
                                        )}`
                                      );
                                    }
                                  }}
                                />

                                <Stack
                                  spacing={1}
                                  direction="row"
                                  justifyContent="flex-end"
                                >
                                  <Button
                                    variant="text"
                                    color="primary"
                                    target="_blank"
                                    href={`https://geojson.io/#map=5.07/24.44/45.06`}
                                  >
                                    {t("Get Coordinates")}
                                  </Button>
                                </Stack>
                              </Box>

                              <Box sx={{ mt: 3.5 }}>
                                <TextFieldWrapper
                                  required
                                  fullWidth
                                  label={t("Location Pointer")}
                                  name="coordinates"
                                  placeholder={t(
                                    "Paste the Location Pointer here"
                                  )}
                                  error={
                                    !!(
                                      formik.touched.coordinates &&
                                      formik.errors.coordinates
                                    )
                                  }
                                  helperText={
                                    formik.touched.coordinates &&
                                    formik.errors.coordinates
                                  }
                                  onBlur={formik.handleBlur}
                                  onChange={(event) => {
                                    formik.handleChange(event);
                                  }}
                                  value={formik.values.coordinates}
                                />

                                <Stack
                                  spacing={1}
                                  direction="row"
                                  justifyContent="flex-end"
                                >
                                  <Button
                                    variant="text"
                                    color="primary"
                                    target="_blank"
                                    href={`https://www.google.com/maps`}
                                  >
                                    {t("Get Location Pointer")}
                                  </Button>
                                </Stack>
                              </Box>
                            </Box>
                          )}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {id != null && (
                  <Card>
                    <CardContent>
                      <Grid container>
                        <Grid xs={12} md={4}>
                          <Stack spacing={1}>
                            <Typography variant="h6">
                              {t("QR Ordering")}
                            </Typography>
                            <Typography color="text.secondary" variant="body2">
                              {t("Print or view menu QR code")}
                            </Typography>
                          </Stack>
                        </Grid>

                        <Grid item xs={12} md={8}>
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
                              {t("Order from QR/Link")}
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
                                name="qrOrdering"
                                checked={formik.values.qrOrdering}
                                onChange={(e) => {
                                  if (
                                    !canAccessModule("self_ordering") &&
                                    e.target.checked
                                  ) {
                                    toast.error(
                                      t(
                                        "Upgrade your subscription to access QR ordering"
                                      )
                                    );
                                    return;
                                  }
                                  formik.setFieldValue(
                                    "qrOrdering",
                                    e.target.checked
                                  );
                                }}
                                disabled={!canAccessModule("self_ordering")}
                                sx={{ mr: 1.5 }}
                              />

                              <Tooltip
                                title={t(
                                  "While enabling this will allow to accept the qr order in web or POS billing"
                                )}
                              >
                                <SvgIcon color="action">
                                  <InfoCircleIcon />
                                </SvgIcon>
                              </Tooltip>
                            </Box>
                          </Box>

                          {formik.values.qrOrdering && (
                            <Box>
                              <TextFieldWrapper
                                sx={{ mt: 3 }}
                                error={
                                  !!(
                                    formik.touched.qrPaymentOptions &&
                                    formik.errors.qrPaymentOptions
                                  )
                                }
                                fullWidth
                                label={t("Payment Options")}
                                name="qrPaymentOptions"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                select
                                value={formik.values.qrPaymentOptions}
                                required
                              >
                                {paymentTypeOptions.map((option) => (
                                  <MenuItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </TextFieldWrapper>

                              <Box
                                sx={{
                                  mt: 3.5,
                                  py: 0.5,
                                  height: "auto",
                                  border: `1px solid ${
                                    theme.palette.mode !== "dark"
                                      ? "#E5E7EB"
                                      : "#2D3748"
                                  }`,
                                  borderRadius: "8px",
                                  paddingLeft: "8px",
                                }}
                              >
                                <Typography
                                  fontSize="12px"
                                  variant="subtitle2"
                                  color="textSecondary"
                                >
                                  {t("QR Ordering Link")}
                                </Typography>

                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <IconButton
                                    href={
                                      companyEntity?.industry?.toLowerCase() ===
                                      "restaurant"
                                        ? `${FRONTEND_URL}/qr-ordering-restaurant?locationRef=${id}&companyRef=${companyRef}`
                                        : `${FRONTEND_URL}/qr-ordering-retail?locationRef=${id}&companyRef=${companyRef}`
                                    }
                                    target="_blank"
                                    sx={{
                                      ml: -0.75,
                                      borderRadius: 0,
                                      bgcolor: "transparent",
                                      cursor: "pointer",
                                      "&:hover": {
                                        textDecoration: "underline",
                                        textDecorationColor: "#2970FF",
                                      },
                                    }}
                                  >
                                    <Typography
                                      align="left"
                                      color="#2970FF"
                                      fontSize="14px"
                                      variant="subtitle2"
                                    >
                                      {companyEntity?.industry?.toLowerCase() ===
                                      "restaurant"
                                        ? `${FRONTEND_URL}/qr-ordering-restaurant?locationRef=${id}`
                                        : `${FRONTEND_URL}/qr-ordering-retail?locationRef=${id}`}
                                    </Typography>
                                  </IconButton>

                                  <Box
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        companyEntity?.industry?.toLowerCase() ===
                                          "restaurant"
                                          ? `${FRONTEND_URL}/qr-ordering-restaurant?locationRef=${id}&companyRef=${companyRef}`
                                          : `${FRONTEND_URL}/qr-ordering-retail?locationRef=${id}&companyRef=${companyRef}`
                                      );
                                      toast.success(
                                        t("Copied to Clipboard!").toString()
                                      );
                                    }}
                                    sx={{
                                      cursor: "pointer",
                                      mr: 2,
                                    }}
                                  >
                                    <FileCopy fontSize="small" />
                                  </Box>
                                </Box>
                              </Box>

                              <Box
                                ref={qrOrderingRef}
                                sx={{
                                  mt: 2,
                                  pl: 1,
                                  pt: 1,
                                  maxWidth: 165,
                                  backgroundColor: "background.paper",
                                }}
                              >
                                <QRCode
                                  size={150}
                                  viewBox={`0 0 150 150`}
                                  style={{ height: "auto", maxWidth: 150 }}
                                  value={
                                    companyEntity?.industry?.toLowerCase() ===
                                    "restaurant"
                                      ? `${FRONTEND_URL}/qr-ordering-restaurant?locationRef=${id}&companyRef=${companyRef}`
                                      : `${FRONTEND_URL}/qr-ordering-retail?locationRef=${id}&companyRef=${companyRef}`
                                  }
                                />
                              </Box>

                              <Box
                                sx={{
                                  maxWidth: 165,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <LoadingButton
                                  sx={{ mt: 0.5, mb: -2 }}
                                  variant="text"
                                  onClick={handleDownloadQROrdering}
                                >
                                  <Download01 />
                                </LoadingButton>
                              </Box>
                            </Box>
                          )}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {id != null && (
                  <Card>
                    <CardContent>
                      <Grid container>
                        <Grid xs={12} md={4}>
                          <Stack spacing={1}>
                            <Typography variant="h6">{t("AR Menu")}</Typography>
                            <Typography color="text.secondary" variant="body2">
                              {t("Augmented Reality Menu Experience")}
                            </Typography>
                          </Stack>
                        </Grid>

                        <Grid item xs={12} md={8}>
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
                              {t("AR Menu")}
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
                                name="arMenu"
                                checked={formik.values.arMenu}
                                onChange={(e) => {
                                  formik.setFieldValue(
                                    "arMenu",
                                    e.target.checked
                                  );
                                }}
                                sx={{ mr: 1.5 }}
                              />

                              <Tooltip
                                title={t(
                                  "Enable AR Menu to provide immersive augmented reality dining experience"
                                )}
                              >
                                <SvgIcon color="action">
                                  <InfoCircleIcon />
                                </SvgIcon>
                              </Tooltip>
                            </Box>
                          </Box>

                          {formik.values.arMenu && (
                            <Box>
                              <Box
                                sx={{
                                  mt: 3.5,
                                  py: 0.5,
                                  height: "auto",
                                  border: `1px solid ${
                                    theme.palette.mode !== "dark"
                                      ? "#E5E7EB"
                                      : "#2D3748"
                                  }`,
                                  borderRadius: "8px",
                                  paddingLeft: "8px",
                                }}
                              >
                                <Typography
                                  fontSize="12px"
                                  variant="subtitle2"
                                  color="textSecondary"
                                >
                                  {t("AR Menu Link")}
                                </Typography>

                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <IconButton
                                    href={
                                      AR_MENU_URL[
                                        process.env.NEXT_PUBLIC_APP_ENV || "qa"
                                      ]
                                    }
                                    target="_blank"
                                    sx={{
                                      ml: -0.75,
                                      borderRadius: 0,
                                      bgcolor: "transparent",
                                      cursor: "pointer",
                                      "&:hover": {
                                        textDecoration: "underline",
                                        textDecorationColor: "#2970FF",
                                      },
                                    }}
                                  >
                                    <Typography
                                      align="left"
                                      color="#2970FF"
                                      fontSize="14px"
                                      variant="subtitle2"
                                    >
                                      {
                                        AR_MENU_URL[
                                          process.env.NEXT_PUBLIC_APP_ENV ||
                                            "qa"
                                        ]
                                      }
                                    </Typography>
                                  </IconButton>

                                  <Box
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        AR_MENU_URL[
                                          process.env.NEXT_PUBLIC_APP_ENV ||
                                            "qa"
                                        ]
                                      );
                                      toast.success(
                                        t("Copied to Clipboard!").toString()
                                      );
                                    }}
                                    sx={{
                                      cursor: "pointer",
                                      mr: 2,
                                    }}
                                  >
                                    <FileCopy fontSize="small" />
                                  </Box>
                                </Box>
                              </Box>

                              <Box
                                sx={{
                                  mt: 2,
                                  pl: 1,
                                  pt: 1,
                                  maxWidth: 165,
                                  backgroundColor: "background.paper",
                                }}
                              >
                                <QRCode
                                  size={150}
                                  viewBox={`0 0 150 150`}
                                  style={{ height: "auto", maxWidth: 150 }}
                                  value={
                                    AR_MENU_URL[
                                      process.env.NEXT_PUBLIC_APP_ENV || "qa"
                                    ]
                                  }
                                />
                              </Box>

                              <Box
                                sx={{
                                  maxWidth: 165,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <LoadingButton
                                  sx={{ mt: 0.5, mb: -2 }}
                                  variant="text"
                                  onClick={() => {
                                    const arMenuRef =
                                      document.createElement("div");
                                    arMenuRef.innerHTML = `
                                      <div style="padding: 10px; background: white;">
                                        <div style="display: flex; justify-content: center;">
                                          <div id="ar-menu-qr"></div>
                                        </div>
                                      </div>
                                    `;

                                    const qrContainer =
                                      arMenuRef.querySelector("#ar-menu-qr");
                                    if (qrContainer) {
                                      const qrCode =
                                        document.createElement("div");
                                      qrCode.innerHTML = `
                                        <svg width="150" height="150" viewBox="0 0 150 150">
                                          ${
                                            document.querySelector(
                                              '[data-testid="ar-menu-qr"] svg'
                                            )?.innerHTML || ""
                                          }
                                        </svg>
                                      `;
                                      qrContainer.appendChild(qrCode);
                                    }

                                    html2canvas(arMenuRef).then((canvas) => {
                                      const link = document.createElement("a");
                                      link.download = "ar-menu-qr-code.png";
                                      link.href = canvas.toDataURL();
                                      link.click();
                                    });
                                  }}
                                >
                                  <Download01 />
                                </LoadingButton>
                              </Box>
                            </Box>
                          )}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {companyEntity?.industry?.toLowerCase() === "restaurant" && (
                  <Card>
                    <CardContent>
                      <Grid container>
                        <Grid xs={12} md={4}>
                          <Stack spacing={1}>
                            <Typography variant="h6">
                              {t("Tables & Courses")}
                            </Typography>
                          </Stack>
                        </Grid>

                        <Grid item xs={12} md={8}>
                          <Grid container spacing={3}>
                            <Grid item md={6} xs={12}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    disabled={
                                      !canAccessModule("section_tables")
                                    }
                                    checked={formik.values.dinein}
                                    onChange={(e) => {
                                      formik.setFieldValue(
                                        "dinein",
                                        e.target.checked
                                      );
                                      formik.setFieldValue("courses", false);
                                    }}
                                    value={formik.values.dinein}
                                  />
                                }
                                label={t("Tables (Dine-in)")}
                                sx={{ mt: -2.5, mb: -2, ml: 0.25 }}
                              />
                            </Grid>

                            {/* {formik.values.dinein && (
                              <Grid item md={6} xs={12}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={formik.values.courses}
                                      onChange={(e) => {
                                        formik.setFieldValue(
                                          "courses",
                                          e.target.checked
                                        );
                                      }}
                                      value={formik.values.courses}
                                    />
                                  }
                                  label={t("Courses")}
                                  sx={{ mt: -2.5, mb: -2, ml: 0.25 }}
                                />
                              </Grid>
                            )} */}
                          </Grid>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {id != null && (
                  <Card>
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={8}>
                          <Stack spacing={1}>
                            <Typography variant="h6">
                              {t("Negative Billing")}
                            </Typography>
                            <Typography color="text.secondary" variant="body2">
                              {t("Allow Negative Billing")}
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
                                checked={formik.values.allowNegativeBilling}
                                color="primary"
                                edge="end"
                                name="allowNegativeBilling"
                                onChange={() => {
                                  if (!canUpdate) {
                                    return toast.error(
                                      t("You don't have access")
                                    );
                                  }
                                  setShowDialogCustomerEvent(true);
                                }}
                                sx={{
                                  mr: 0.2,
                                }}
                              />
                            }
                            label={
                              formik.values.allowNegativeBilling
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

export default LocationSettingsTab;
