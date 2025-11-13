import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import React, { FC, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { IMaskInput } from "react-imask";
import { useQueryClient } from "react-query";
import ConfirmationDialog from "src/components/confirmation-dialog";
import CompanyDropdown from "src/components/input/company-auto-complete";
import LocationAutoCompleteDropdown from "src/components/input/location-singleSelect";
import { DevicesModal } from "src/components/modals/devices";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { AuthContext } from "src/contexts/auth/jwt-context";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import NoPermission from "src/pages/no-permission";
import { MoleculeType } from "src/permissionManager";
import {
  OtherChannels,
  RestaurantChannels,
  USER_TYPES,
} from "src/utils/constants";
import generateUniqueCode from "src/utils/generate-unique-code";
import { Screens } from "src/utils/screens-names";
import useActiveTabs from "src/utils/use-active-tabs";
import * as Yup from "yup";
import { ZatcaModal } from "./zatca-modal";

interface DeviceDetailsCardProps {
  id?: string;
  location?: string;
  companyRef?: string;
  companyName?: string;
}

interface CreateDevice {
  locationRef: string;
  location: string;
  deviceName: string;
  deviceType: string;
  connectivityStatus: string;
  deviceCode: string;
  devicePassword: string;
  status: boolean;
  oldStatus: boolean;
  enableZatca: string;
  zatcaId: string;
  tokenType: string;
  requestId: string;
  refundHash: string;
  invoiceSequence: string;
  invoiceHash: string;
  nearpay: boolean;
  trsmCode: string;
}

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const DeviceDetailsTab: FC<DeviceDetailsCardProps> = (props) => {
  const { t } = useTranslation();
  const { user, device } = useAuth();
  const { userType } = useUserType();
  const [openZatcaModal, setOpenZatcaModal] = useState<boolean>(false);
  const [showDialogDeleteItem, setShowDialogDeleteItem] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState({}) as any;
  const router = useRouter();
  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["device:update"]);
  const canCreate = canAccess(MoleculeType["device:create"]);
  const {
    id,
    companyRef,
    companyName,
    businessTypeRef,
    bussinessType,
    origin,
  } = router.query as any;

  const deviceTypeOptions = [
    {
      label: "POS",
      value: "pos",
    },
    // {
    //   label: "KDS",
    //   value: "kds",
    // },
  ];

  const companyContext = JSON.parse(localStorage.getItem("companyContext"));
  const authContext = useContext(AuthContext);

  const userIsAdmin =
    user.userType === USER_TYPES.ADMIN ||
    user.userType === USER_TYPES.SUPERADMIN;

  const { changeTab } = useActiveTabs();

  usePageView();

  const [, setShowError] = useState(false);
  const [openDeviceModal, setOpenDeviceModal] = useState(false);
  const [showDialogUnpair, setShowDialogUnpair] = useState(false);
  const [alreadyLoaded, setAlreadyLoaded] = useState(false);
  const [showZatcaConfirmationModal, setShowZatcaConfirmationModal] =
    useState(false);
  const { findOne, create, updateEntity, deleteEntity, entity, loading } =
    useEntity("device");
  const { findOne: findCompany, entity: companyData } = useEntity("company");
  const { findOne: findLocation, entity: locationData } = useEntity("location");
  const { find: findPaymentTypes, entities: paymentTypesData } =
    useEntity("payment-type");

  const initialValues: CreateDevice = {
    locationRef: "",
    location: "",
    deviceName: "",
    deviceType: "",
    connectivityStatus: "",
    deviceCode: "",
    devicePassword: "",
    status: true,
    oldStatus: true,
    enableZatca: "inactive",
    zatcaId: "",
    tokenType: "",
    requestId: "",
    refundHash: "",
    invoiceSequence: "",
    invoiceHash: "",
    nearpay: false,
    trsmCode: "",
  };

  const validationSchema = Yup.object({
    locationRef: Yup.string().required(`${t("Please Select Location")}`),
    deviceName: Yup.string()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid device name")
      )
      .required(`${t("Device Name is required")}`)
      .max(20, t("Device name must not be greater than 20 characters")),
    deviceType: Yup.string().required(`${t("Please Select Device Type")}`),
    deviceCode: Yup.string().required(`${t("Device Code is required")}`),
    devicePassword: Yup.string().required(
      `${t("Device Password is required")}`
    ),
  });

  const queryClient = useQueryClient();

  // Fetch payment types from API
  useEffect(() => {
    findPaymentTypes({
      page: 0,
      limit: 50,
      activeTab: "active",
      sort: "asc",
    });
  }, []);

  // Helper function to map API payment types to expected format
  const mapPaymentTypesFromAPI = (apiPaymentTypes: any[]) => {
    return apiPaymentTypes.map((paymentType: any, index: number) => ({
      _id: index,
      name: paymentType.name?.en || paymentType.name,
      status: paymentType.status === "active",
    }));
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      let billingConfig;

      // Helper function to merge and deduplicate order types
      const mergeOrderTypes = (
        enabledChannels: any[] | null | undefined,
        defaultChannels: any[],
        existingOrderTypes?: any[]
      ) => {
        const allOrderTypes: any[] = [];

        // Add enabled location channels first (with null check)
        if (enabledChannels?.length > 0) {
          enabledChannels.forEach((channel) => {
            allOrderTypes.push({
              name: channel.name,
              status: channel.status,
              // Preserve existing configuration if available
              ...(existingOrderTypes?.find(
                (type: any) => type.name === channel.name
              ) || {}),
            });
          });
        }

        // Add default channels that are not already included
        if (defaultChannels?.length > 0) {
          defaultChannels.forEach((defaultChannel) => {
            const exists = allOrderTypes.find(
              (type) => type.name === defaultChannel.name
            );
            if (!exists) {
              allOrderTypes.push({
                ...defaultChannel,
                // Override with existing configuration if available
                ...(existingOrderTypes?.find(
                  (type: any) => type.name === defaultChannel.name
                ) || {}),
              });
            }
          });
        }

        // Add any remaining existing order types that weren't covered above
        if (existingOrderTypes?.length > 0) {
          existingOrderTypes.forEach((existingType) => {
            const exists = allOrderTypes.find(
              (type) => type.name === existingType.name
            );
            if (!exists) {
              allOrderTypes.push(existingType);
            }
          });
        }

        // If no order types found, use default channels as fallback
        if (allOrderTypes.length === 0 && defaultChannels?.length > 0) {
          return defaultChannels.map((type, index) => ({
            ...type,
            _id: index,
          }));
        }

        // Assign sequential IDs and return
        return allOrderTypes.map((type, index) => ({
          ...type,
          _id: index,
        }));
      };

      if (!entity?.configuration) {
        const enabledChannels =
          locationData?.channel?.filter((channel: any) => channel.status) || [];
        const defaultChannels =
          companyData?.industry?.toLowerCase() === "restaurant"
            ? RestaurantChannels
            : OtherChannels;

        // Get payment types from API
        const apiPaymentTypes = paymentTypesData?.results
          ? mapPaymentTypesFromAPI(paymentTypesData.results)
          : [];

        billingConfig = {
          quickAmount: true,
          catalogueManagement: true,
          paymentTypes: apiPaymentTypes,
          cardPaymentOptions: ["manual"],
          defaultComplete: "with-print",
          cashManagement: false,
          startingCash: 0,
          identity: "",
          numberOfPrint: 1,
          keypad: false,
          discounts: false,
          promotions: false,
          customCharges: false,
          orderTypes: mergeOrderTypes(enabledChannels, defaultChannels),
        };
      } else {
        // Get payment types from API, preserving existing configuration status
        const apiPaymentTypes = paymentTypesData?.results
          ? mapPaymentTypesFromAPI(paymentTypesData.results)
          : [];

        // Merge API payment types with existing configuration
        const paymentTypes = apiPaymentTypes.map((apiType: any) => {
          const existingType = entity.configuration?.paymentTypes?.find(
            (existing: any) => existing.name === apiType.name
          );
          return existingType ? existingType : apiType;
        });

        const enabledChannels =
          locationData?.channel?.filter((channel: any) => channel.status) || [];
        const defaultChannels =
          companyData?.industry?.toLowerCase() === "restaurant"
            ? RestaurantChannels
            : OtherChannels;
        const existingOrderTypes = entity.configuration?.orderTypes;

        const orderTypes = mergeOrderTypes(
          enabledChannels,
          defaultChannels,
          existingOrderTypes
        );

        billingConfig = {
          quickAmount: entity.configuration?.quickAmount,
          catalogueManagement: entity.configuration?.catalogueManagement,
          paymentTypes: paymentTypes,
          cardPaymentOptions: entity.configuration?.cardPaymentOptions,
          defaultComplete: entity.configuration?.defaultComplete,
          cashManagement: entity.configuration?.cashManagement,
          startingCash: entity.configuration?.startingCash,
          identity: "",
          numberOfPrint: entity.configuration?.numberOfPrint,
          keypad: entity.configuration?.keypad,
          discounts: entity.configuration?.discounts,
          promotions: Boolean(entity.configuration?.promotions),
          customCharges: Boolean(entity.configuration?.customCharges),
          orderTypes: orderTypes,
        };
      }

      const data = {
        companyRef: companyRef,
        configuration: billingConfig,
        connectivityStatus:
          values.connectivityStatus === "Paired" ? "online" : "offline",
        company: {
          name: companyName,
          businessTypeRef: businessTypeRef,
          businessType: bussinessType,
        },
        locationRef: values.locationRef,
        location: { name: values.location },
        name: values.deviceName.trim(),
        type: values.deviceType,
        deviceCode: values.deviceCode,
        pin: values.devicePassword,
        devicePin: values.devicePassword,
        nearpay: values.nearpay,
        trsmCode: values.trsmCode,
        ...(values.enableZatca
          ? {}
          : {
              zatcaConfiguration: {
                requestId: 0,
                tokenType: "false",
                invoiceSequence: 0,
                invoiceHash: "",
                refundHash: "",
                enableZatca: "inactive",
                zatcaId: null,
              },
            }),
        status: values.status ? "active" : "inactive",
      };

      try {
        if (id != null) {
          await updateEntity(id?.toString(), { ...data });

          if (
            device?.phone === values.deviceCode &&
            values.status !== values.oldStatus
          ) {
            localStorage.removeItem("device");
            localStorage.removeItem("cartItems");
          }
        } else {
          await create({ ...data });
        }

        toast.success(
          id != null
            ? t("Device Updated").toString()
            : t("Device Created").toString()
        );

        setOpenDeviceModal(true);
      } catch (err) {
        toast.error(
          err.message === "undefined_message" ? err.error.message : err.message
        );
      }
    },
  });

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

  const handleUnpairDevice = async () => {
    const deveicePassword = generateUniqueCode(6);

    try {
      await updateEntity(id?.toString(), {
        deviceCode: formik.values.deviceCode,
        pin: deveicePassword,
        devicePin: deveicePassword,
        connectivityStatus: "offline",
      });

      if (device?.phone === formik.values.deviceCode) {
        localStorage.removeItem("device");
        localStorage.removeItem("cartItems");
      }

      setShowDialogUnpair(false);
      toast.success("Device unpaired successfully!");
      localStorage.setItem("setReload", "true");
      setOpenDeviceModal(true);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const DeviceCodeMask = React.forwardRef<HTMLElement, CustomProps>(
    function DeviceCodeMask(props, ref) {
      const { onChange, ...other } = props;
      return (
        <IMaskInput
          {...other}
          mask="********"
          inputRef={ref}
          onAccept={(value: any) =>
            onChange({ target: { name: props.name, value } })
          }
          overwrite
        />
      );
    }
  );

  const DevicePasswordMask = React.forwardRef<HTMLElement, CustomProps>(
    function DevicePasswordMask(props, ref) {
      const { onChange, ...other } = props;
      return (
        <IMaskInput
          {...other}
          mask="******"
          inputRef={ref}
          onAccept={(value: any) =>
            onChange({ target: { name: props.name, value } })
          }
          overwrite
        />
      );
    }
  );
  const handleStatusChange = async (id: string, checked: boolean) => {
    await updateEntity(id as string, {
      status: checked ? "active" : "inactive",
    });

    if (device?.phone === formik.values.deviceCode) {
      localStorage.removeItem("device");
      localStorage.removeItem("cartItems");
    }
  };

  useEffect(() => {
    if (id != null) {
      findOne(id?.toString());
    }
  }, [id]);

  useEffect(() => {
    if (!userIsAdmin) {
      formik.setFieldValue("locationRef", user.locationRef);
      formik.setFieldValue("location", user.location.name);
    }
  }, []);

  useEffect(() => {
    if (entity != null) {
      formik.setValues({
        locationRef: entity?.locationRef,
        location: entity?.location?.name,
        deviceName: entity?.name,
        deviceType: entity?.type || "pos",
        connectivityStatus:
          entity?.connectivityStatus == "offline" ? "Unpaired" : "Paired",
        deviceCode: entity?.deviceCode,
        devicePassword: entity?.pin || entity?.devicePin,
        status: entity?.status == "active" ? true : false,
        oldStatus: entity?.status == "active" ? true : false,
        enableZatca: entity?.zatcaConfiguration?.enableZatca,
        zatcaId: entity?.zatcaConfiguration?.zatcaId,
        tokenType: entity?.zatcaConfiguration?.tokenType,
        requestId: entity?.zatcaConfiguration?.requestId,
        refundHash: entity?.zatcaConfiguration?.refundHash,
        invoiceSequence: entity?.zatcaConfiguration?.invoiceSequence,
        invoiceHash: entity?.zatcaConfiguration?.invoiceHash,
        trsmCode: entity?.trsmCode,
        nearpay: entity?.nearpay,
      });
      setAlreadyLoaded(true);
    }
  }, [entity]);

  useEffect(() => {
    if (id == null) {
      formik.setFieldValue("deviceCode", generateUniqueCode(8));
      formik.setFieldValue("devicePassword", generateUniqueCode(6));
    }
  }, []);

  useEffect(() => {
    if (companyRef) {
      findCompany(companyRef?.toString());
    }
  }, [companyRef]);

  useEffect(() => {
    if (formik.values.locationRef) {
      findLocation(formik.values.locationRef?.toString());
    }
  }, [formik.values.locationRef]);

  useEffect(() => {
    if (
      id == null &&
      companyData?.industry?.toString()?.toLowerCase() !== "restaurant"
    ) {
      formik.setFieldValue("deviceType", "pos");
    }
  }, [id, companyData]);

  if (loading && !alreadyLoaded) {
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

  console.log("COMPANY---->", companyData);

  if (!canAccess(MoleculeType["device:read"])) {
    return <NoPermission />;
  }
  return (
    <>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <form noValidate onSubmit={formik.handleSubmit}>
            <Stack spacing={4} sx={{ mt: 3 }}>
              <Card>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item md={4} xs={12}>
                      <Typography variant="h6">
                        {t("Device Details")}
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
                        <LocationAutoCompleteDropdown
                          disabled={id}
                          showAllLocation={false}
                          companyRef={companyRef}
                          required
                          error={
                            formik?.touched?.locationRef &&
                            formik?.errors?.locationRef
                          }
                          onChange={(id, name) => {
                            formik.setFieldValue("locationRef", id);
                            formik.setFieldValue("location", name?.en);
                          }}
                          selectedId={formik?.values?.locationRef}
                          label={t("Location")}
                          id="locationRef"
                        />
                      </Box>

                      <Box sx={{ mt: 3 }}>
                        <TextFieldWrapper
                          fullWidth
                          label={t("Device Name")}
                          name="deviceName"
                          error={Boolean(
                            formik.touched.deviceName &&
                              formik.errors.deviceName
                          )}
                          helperText={
                            (formik.touched.deviceName &&
                              formik.errors.deviceName) as any
                          }
                          onBlur={formik.handleBlur}
                          onChange={(e) => {
                            formik.handleChange(e);
                          }}
                          required
                          disabled={!canUpdate}
                          value={formik.values.deviceName}
                        />
                      </Box>

                      {companyData?.industry?.toString()?.toLowerCase() ===
                        "restaurant" && (
                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            fullWidth
                            label={t("Device Type")}
                            name="deviceType"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            error={Boolean(
                              formik.touched.deviceType &&
                                formik.errors.deviceType
                            )}
                            helperText={
                              (formik.touched.deviceType &&
                                formik.errors.deviceType) as any
                            }
                            select
                            value={formik.values.deviceType}
                            required
                            disabled={
                              companyData?.industry
                                ?.toString()
                                ?.toLowerCase() === "restaurant"
                                ? !canUpdate
                                : true
                            }
                          >
                            {deviceTypeOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextFieldWrapper>
                        </Box>
                      )}

                      <Box sx={{ mt: 3 }}>
                        <TextField
                          disabled={id != null && !canUpdate}
                          fullWidth
                          required
                          label={t("Device Code")}
                          name="deviceCode"
                          focused={false}
                          error={Boolean(
                            formik.touched.deviceCode &&
                              formik.errors.deviceCode
                          )}
                          helperText={
                            (formik.touched.deviceCode &&
                              formik.errors.deviceCode) as any
                          }
                          onKeyDown={(event) => {
                            if (event.key == "Backspace") {
                              event.preventDefault();
                            }
                          }}
                          value={formik.values.deviceCode}
                          InputProps={{
                            inputComponent: DeviceCodeMask as any,
                            // endAdornment: (
                            //   <IconButton
                            //     onClick={() => {
                            //       formik.setFieldValue(
                            //         "deviceCode",
                            //         generateUniqueCode(8)
                            //       );
                            //     }}
                            //   >
                            //     <AutorenewRoundedIcon />
                            //   </IconButton>
                            // ),
                          }}
                        />
                      </Box>

                      <Box sx={{ mt: 3 }}>
                        <TextField
                          disabled={id != null && !canUpdate}
                          fullWidth
                          required
                          label={t("Device Password")}
                          name="devicePassword"
                          focused={false}
                          error={Boolean(
                            formik.touched.devicePassword &&
                              formik.errors.devicePassword
                          )}
                          helperText={
                            (formik.touched.devicePassword &&
                              formik.errors.devicePassword) as any
                          }
                          onKeyDown={(event) => {
                            if (event.key == "Backspace") {
                              event.preventDefault();
                            }
                          }}
                          onBlur={formik.handleBlur}
                          value={formik.values.devicePassword}
                          InputProps={{
                            inputComponent: DevicePasswordMask as any,
                            endAdornment: (
                              <>
                                {!id && (
                                  <IconButton
                                    onClick={() => {
                                      formik.setFieldValue(
                                        "devicePassword",
                                        generateUniqueCode(6)
                                      );
                                    }}
                                  >
                                    <AutorenewRoundedIcon />
                                  </IconButton>
                                )}
                              </>
                            ),
                          }}
                        />
                      </Box>

                      {id != null && (
                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            sx={{ textTransform: "capitalize" }}
                            fullWidth
                            disabled
                            label={t("Connectivity Status")}
                            name="connectivityStatus"
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            value={formik.values.connectivityStatus}
                          />
                        </Box>
                      )}

                      {id !== null && (
                        <Grid
                          container
                          spacing={3}
                          style={{ marginTop: "2px" }}
                        >
                          <Grid item xs={8}>
                            <Stack>
                              <Typography color="text.primary">
                                {t("Enable Nearpay")}
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
                                  checked={
                                    formik.values?.nearpay ? true : false
                                  }
                                  color="primary"
                                  edge="end"
                                  name="status"
                                  onChange={(e) => {
                                    if (!canUpdate) {
                                      return toast.error(
                                        t("You don't have access")
                                      );
                                    }
                                    if (e.target.checked) {
                                      formik.setFieldValue("nearpay", true);
                                    } else {
                                      formik.setFieldValue("nearpay", false);
                                    }
                                  }}
                                  value={entity?.nearpay}
                                  sx={{
                                    mr: 0.2,
                                  }}
                                />
                              }
                              label={
                                entity?.nearpay ? t("Active") : t("Deactivated")
                              }
                            />
                          </Grid>
                        </Grid>
                      )}

                      {companyData?.configuration?.nearpay &&
                        companyData?.configuration?.nearpayMerchantId &&
                        formik.values.nearpay &&
                        id !== null && (
                          <>
                            <Box sx={{ mt: 1 }}>
                              <TextField
                                disabled={
                                  (id != null && !canUpdate) ||
                                  entity?.trsmCode !== ""
                                }
                                fullWidth
                                required={false}
                                label={t("NearPay TSRM Code")}
                                name="trsmCode"
                                focused={false}
                                onChange={(e) => {
                                  formik.setFieldValue(
                                    "trsmCode",
                                    e.target.value
                                  );
                                }}
                                error={Boolean(
                                  formik.touched.trsmCode &&
                                    formik.errors.trsmCode
                                )}
                                helperText={
                                  (formik.touched.trsmCode &&
                                    formik.errors.trsmCode) as any
                                }
                                onBlur={formik.handleBlur}
                                value={formik.values.trsmCode}
                              />
                              <small>
                                You have to unpair the device to change TRSM
                                code and login device again
                              </small>
                            </Box>
                            {entity?.trsmCode && entity?.terminalId && (
                              <Box mt={3}>
                                <Grid item md={12} xs={12}>
                                  <Box sx={{ mb: 3 }}>
                                    <TextField
                                      fullWidth
                                      disabled={true}
                                      label={t("Terminal ID")}
                                      name="terminalId"
                                      value={entity?.terminalId}
                                      required
                                    />
                                    <small style={{ marginTop: 20 }}>
                                      This ID is generated by nearpay
                                    </small>
                                  </Box>
                                </Grid>
                              </Box>
                            )}
                          </>
                        )}

                      {id != null &&
                        formik.values.connectivityStatus == "Paired" && (
                          <Stack
                            alignItems="center"
                            direction="row"
                            justifyContent="flex-end"
                            sx={{ mt: 3 }}
                          >
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => {
                                if (!canUpdate) {
                                  return toast.error("You don't have acccess");
                                }
                                setShowDialogUnpair(true);
                              }}
                            >
                              {t("Unpair")}
                            </Button>
                          </Stack>
                        )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <DevicesModal
                modalData={{
                  deviceCode: formik.values.deviceCode,
                  devicePassword: formik.values.devicePassword,
                }}
                open={openDeviceModal}
                handleClose={() => {
                  setOpenDeviceModal(false);
                  if (origin == "company") {
                    changeTab("devices", Screens?.companyDetail);
                  }
                  router.back();
                }}
              />

              {id != null && (
                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={8}>
                        <Stack spacing={1}>
                          <Typography variant="h6">{t("Status")}</Typography>
                          <Typography color="text.secondary" variant="body2">
                            {t("Change the status of the device")}
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
                              checked={formik.values?.status ? true : false}
                              color="primary"
                              edge="end"
                              name="status"
                              onChange={(e) => {
                                if (!canUpdate) {
                                  return toast.error(
                                    t("You don't have access")
                                  );
                                }
                                if (e.target.checked) {
                                  formik.setFieldValue("status", true);
                                } else {
                                  formik.setFieldValue("status", false);
                                }
                              }}
                              value={entity?.status === "active" ? true : false}
                              sx={{
                                mr: 0.2,
                              }}
                            />
                          }
                          label={
                            entity?.status === "active"
                              ? t("Active")
                              : t("Deactivated")
                          }
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {id != null &&
                (authContext.user?.company?.configuration?.enableZatca ||
                  companyContext?.configuration?.enableZatca) && (
                  <Card>
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={8}>
                          <Stack spacing={1}>
                            <Typography variant="h6">{t("Zatca")}</Typography>
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
                            onClick={() => {
                              if (userType !== USER_TYPES.SUPERADMIN) {
                                toast.error(t("You don't have permission"));
                              }
                            }}
                            control={
                              <Switch
                                disabled={userType != USER_TYPES.SUPERADMIN}
                                checked={
                                  entity?.zatcaConfiguration?.enableZatca ===
                                  "active"
                                }
                                color="primary"
                                edge="end"
                                name="status"
                                onChange={(e) => {
                                  if (!canUpdate) {
                                    return toast.error(
                                      t("You don't have access")
                                    );
                                  }
                                  if (e.target.checked) {
                                    setSelectedDevice(entity);
                                    setOpenZatcaModal(true);
                                  } else {
                                    setShowZatcaConfirmationModal(true);
                                    setSelectedDevice(entity);
                                  }
                                }}
                                value={entity?.enableZatca}
                                sx={{
                                  mr: 0.2,
                                }}
                              />
                            }
                            label={
                              entity?.zatcaConfiguration?.enableZatca ===
                              "active"
                                ? t("Active")
                                : t("Deactivated")
                            }
                          />
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          {id != null &&
                            formik.values.enableZatca === "active" && (
                              <Stack alignItems="center" direction="row">
                                <Typography variant="h6">
                                  {t("Expiration")}
                                </Typography>
                              </Stack>
                            )}
                          {id != null &&
                            formik.values.enableZatca === "active" &&
                            entity?.zatcaConfiguration?.zatcaExpiry && (
                              <Stack alignItems="center" direction="row">
                                <Typography variant="body2">
                                  {format(
                                    new Date(
                                      entity?.zatcaConfiguration?.zatcaExpiry
                                    ),
                                    "dd/MM/yyyy"
                                  )}
                                </Typography>
                              </Stack>
                            )}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

              {id == null ? (
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
                        changeTab("devices", Screens?.companyDetail);
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
                      if (!canCreate) {
                        return toast.error(t("You don't have access"));
                      }
                      formik.handleSubmit();
                    }}
                    loading={formik.isSubmitting}
                    sx={{ m: 1 }}
                    variant="contained"
                  >
                    {t("Create")}
                  </LoadingButton>
                </Stack>
              ) : (
                <Stack
                  alignItems="center"
                  direction="row"
                  justifyContent="flex-end"
                  spacing={1}
                  style={{
                    marginRight: "10px",
                    marginLeft: "10px",
                  }}
                  sx={{ mx: 6 }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => {
                      if (!canUpdate) {
                        return toast.error(t("You don't have access"));
                      }
                      setOpenDeviceModal(true);
                    }}
                  >
                    {t("Share")}
                  </Button>
                  <LoadingButton
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowError(true);
                      if (!canCreate) {
                        return toast.error(t("You don't have access"));
                      }
                      formik.handleSubmit();
                    }}
                    loading={formik.isSubmitting}
                    sx={{ m: 1 }}
                    variant="contained"
                  >
                    {t("Update")}
                  </LoadingButton>
                </Stack>
              )}
            </Stack>
          </form>
        </Stack>
      </Container>

      <ConfirmationDialog
        show={showDialogUnpair}
        toggle={() => setShowDialogUnpair(!showDialogUnpair)}
        onOk={async () => {
          await handleUnpairDevice();
        }}
        okButtonText={t("Yes")}
        cancelButtonText={t("No")}
        title={t("Confirmation")}
        text={`${t(
          "On unpairing device session will be ended and not be able to login with the device code"
        )}. ${"Are you sure you want to unpair this device?"}`}
      />

      <ConfirmationDialog
        show={showZatcaConfirmationModal}
        toggle={() =>
          setShowZatcaConfirmationModal(!showZatcaConfirmationModal)
        }
        onOk={(e: any) => {
          updateEntity(selectedDevice?._id, {
            zatcaConfiguration: { enableZatca: "inactive" },
          });
          toast.success("Zatca disbaled successfully");
          setSelectedDevice({});
          setShowZatcaConfirmationModal(false);
        }}
        okButtonText={`${t("Yes")}, ${t("Deactivate")}`}
        cancelButtonText={t("Cancel")}
        title={t("Confirmation")}
        text={t(
          "The invoices created on this device will not be pushed to ZATCA, if disabled"
        )}
      />

      <ZatcaModal
        open={openZatcaModal}
        handleClose={() => {
          queryClient.invalidateQueries("find-one-device");
          setSelectedDevice({});
          setOpenZatcaModal(false);
        }}
        data={selectedDevice}
        companyContextLocal={companyContext}
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
    </>
  );
};

export default DeviceDetailsTab;
