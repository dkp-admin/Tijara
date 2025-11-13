import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  MenuItem,
  Stack,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import { useFormik } from "formik";
import { t } from "i18next";
import router from "next/router";
import { FC, useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import toast from "react-hot-toast";
import ConfirmationDialog from "src/components/confirmation-dialog";
import withPermission from "src/components/permissionManager/restrict-page";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { usePageView } from "src/hooks/use-page-view";
import { MoleculeType } from "src/permissionManager";
import {
  CARD_OPTIONS_LIST,
  OtherChannels,
  PRINT_TYPE_LIST,
  RestaurantChannels,
} from "src/utils/constants";
import { useCurrency } from "src/utils/useCurrency";
import * as Yup from "yup";
import { CashAmountMoadl } from "./cash-amount-modal";
import { OrderDragDropModal } from "./order-drag-drop-modal";
import { PaymentDragDropModal } from "./payment-drag-drop-modal";

interface BillingSettingCardProps {
  id?: string;
  location?: string;
  companyRef?: string;
  companyName?: string;
}

interface CreateLocation {
  paymentTypeRef: any;
  orderTypes: any;
  numberOfPrint: string;
  cardPaymentOptions: string[];
  status: boolean;
  startingCash: number;
  defaultComplete: string;
  quickAmount: boolean;
  catalogueManagement: boolean;
  cashManagement: boolean;
  keypad: boolean;
  discounts: boolean;
  promotions: boolean;
  customCharges: boolean;
}

const validationSchema = Yup.object({});

const BillingSettingTab: FC<BillingSettingCardProps> = (props) => {
  const { id, companyRef, companyName, businessTypeRef, businessType, origin } =
    router.query;
  const { canAccessModule } = useFeatureModuleManager();
  const theme = useTheme();
  const [, setLoad] = useState(false);
  const [, setShowError] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [openOrderModal, setOpenOrderModal] = useState(false);
  const [openCashAmountModal, setOpenCashAmountModal] = useState(false);
  const [cashManagement, setCashManagement] = useState(false);
  const [showDialogCashManagement, setShowDialogCashManagement] =
    useState(false);
  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["device-settings:update"]);

  const { findOne, updateEntity, entity, loading } = useEntity("device");
  const { findOne: findCompany, entity: companyData } = useEntity("company");
  const { findOne: findLocation, entity: locationData } = useEntity("location");
  const { find: findPaymentTypes, entities: paymentTypesData } =
    useEntity("payment-type");
  const currency = useCurrency();

  usePageView();

  const handleDragEnd = (e: any) => {
    if (!e.destination) return;
    let tempData = Array.from(formik?.values?.paymentTypeRef);
    let [source_data] = tempData.splice(e.source.index, 1);
    tempData.splice(e.destination.index, 0, source_data);

    formik.setFieldValue("paymentTypeRef", tempData);
  };
  const handleOrderDragEnd = (e: any) => {
    if (!e.destination) return;
    let tempData = Array.from(formik?.values?.orderTypes);
    let [source_data] = tempData.splice(e.source.index, 1);
    tempData.splice(e.destination.index, 0, source_data);
    formik.setFieldValue("orderTypes", tempData);
  };

  const initialValues: CreateLocation = {
    paymentTypeRef: [],
    orderTypes: [],
    numberOfPrint: "",
    startingCash: 0,
    defaultComplete: "",
    cardPaymentOptions: [],
    status: true,
    quickAmount: false,
    catalogueManagement: false,
    cashManagement: false,
    keypad: false,
    discounts: false,
    promotions: false,
    customCharges: false,
  };

  const formik: any = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      // setLoad(true);

      const data: any = {
        configuration: {
          quickAmount: values.quickAmount,
          catalogueManagement: values.catalogueManagement,
          paymentTypes: values.paymentTypeRef,
          cardPaymentOptions: values.cardPaymentOptions,
          defaultComplete: values.defaultComplete,
          startingCash: values.startingCash,
          cashManagement: values.cashManagement,
          numberOfPrint: Number(values.numberOfPrint),
          orderTypes: values.orderTypes?.map((type: any) => {
            return { name: type.name, status: type.status };
          }),
          keypad: values.keypad,
          discounts: values.discounts,
          promotions: values.promotions,
          customCharges: values.customCharges,
        },
      };

      try {
        if (id) {
          await updateEntity(id?.toString(), data);
        }
        toast.success(t("Setting Details Updated").toString());
        if (origin == "company") {
          // changeTab("locations", Screens?.companyDetail);
        }
        router.back();
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoad(false);
      }
    },
  });

  const activePaymentTypes = formik.values?.paymentTypeRef?.filter(
    (type: any) => type.status === true
  );

  const activeOrderTypes = formik.values?.orderTypes?.filter(
    (type: any) => type.status === true
  );

  useEffect(() => {
    if (id != null) {
      findOne(id?.toString());
    }
  }, [id]);

  useEffect(() => {
    findPaymentTypes({
      page: 0,
      limit: 50,
      activeTab: "active",
      sort: "asc",
    });
  }, []);

  const mapPaymentTypesFromAPI = (
    apiPaymentTypes: any[],
    existingPaymentTypes?: any[]
  ) => {
    if (existingPaymentTypes && existingPaymentTypes.length > 0) {
      const result: any[] = [];

      existingPaymentTypes.forEach((existingType: any, index: number) => {
        const apiType = apiPaymentTypes.find(
          (api: any) =>
            api.name?.en === existingType.name || api.name === existingType.name
        );

        if (apiType) {
          result.push({
            _id: index,
            name: apiType.name?.en || existingType.name,
            nameAr: apiType.name?.ar || "",
            status: existingType.status,
          });
        }
      });

      apiPaymentTypes.forEach((paymentType: any) => {
        const alreadyExists = result.some(
          (existing: any) =>
            existing.name === paymentType.name?.en ||
            existing.name === paymentType.name
        );

        if (!alreadyExists) {
          result.push({
            _id: result.length,
            name: paymentType.name?.en || "",
            nameAr: paymentType.name?.ar || "",
            status: paymentType.status === "active",
          });
        }
      });

      return result;
    }

    return apiPaymentTypes.map((paymentType: any, index: number) => {
      return {
        _id: index,
        name: paymentType.name?.en || "",
        nameAr: paymentType.name?.ar || "",
        status: paymentType.status === "active",
      };
    });
  };

  useEffect(() => {
    if (entity != null && paymentTypesData?.results) {
      // Map API payment types to expected format
      const paymentTypes = mapPaymentTypesFromAPI(
        paymentTypesData.results,
        entity.configuration?.paymentTypes
      );

      const channels = locationData?.channel?.filter(
        (channel: any) => channel.status
      );

      const orderTypes = [];

      if (entity.configuration?.orderTypes) {
        const channelNames = new Set(
          channels?.map((channel: any) => channel.name)
        );

        entity.configuration.orderTypes.forEach((type: any) => {
          if (channelNames.has(type.name)) {
            orderTypes.push(type);
            channelNames.delete(type.name);
          }
        });

        channels?.forEach((channel: any) => {
          if (channelNames.has(channel.name)) {
            orderTypes.push(channel);
          }
        });
      } else {
        orderTypes.push(
          ...(companyData?.industry?.toLowerCase() === "restaurant"
            ? RestaurantChannels
            : OtherChannels)
        );
      }

      formik.setValues({
        quickAmount: Boolean(entity.configuration?.quickAmount),
        catalogueManagement: Boolean(entity.configuration?.catalogueManagement),
        paymentTypeRef: paymentTypes,
        cashManagement: Boolean(entity.configuration?.cashManagement),
        numberOfPrintRef: entity.configuration?.numberOfPrint,
        numberOfPrint: entity.configuration?.numberOfPrint,
        startingCash: entity.configuration?.startingCash,
        cardPaymentOptions: entity.configuration?.cardPaymentOptions,
        defaultComplete: entity.configuration?.defaultComplete,
        orderTypes: orderTypes?.map((type: any, index: number) => {
          console.log(type);

          return { ...type, _id: index };
        }),
        keypad: Boolean(entity.configuration?.keypad),
        discounts: Boolean(entity.configuration?.discounts),
        promotions: Boolean(entity.configuration?.promotions),
        customCharges: Boolean(entity.configuration?.customCharges),
      });

      setCashManagement(Boolean(entity.configuration?.cashManagement));
    }
  }, [entity, locationData, paymentTypesData]);

  useEffect(() => {
    if (companyRef) {
      findCompany(companyRef?.toString());
    }
  }, [companyRef]);

  console.log("formik", formik.values);

  useEffect(() => {
    if (entity?.locationRef) {
      findLocation(entity?.locationRef?.toString());
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
      <Container maxWidth="xl">
        <Stack spacing={2}>
          <form noValidate onSubmit={formik.handleSubmit}>
            <Stack spacing={4} sx={{ mt: 3 }}>
              <Card>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item md={4} xs={12}>
                      <Typography variant="h6">
                        {t("Billing Setting")}
                      </Typography>
                    </Grid>
                    <Grid item md={8} xs={12}>
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
                        <Typography color="textSecondary" variant="body2">
                          {t("Quick Amount")}
                        </Typography>

                        <Box
                          sx={{ p: 1, display: "flex", alignItems: "center" }}
                        >
                          <Switch
                            disabled={!canUpdate}
                            color="primary"
                            edge="end"
                            name="quickAmount"
                            checked={formik.values.quickAmount}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            sx={{
                              mr: 0.2,
                            }}
                          />
                        </Box>
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
                        <Typography color="textSecondary" variant="body2">
                          {t("Catalogue Management")}
                        </Typography>

                        <Box
                          sx={{ p: 1, display: "flex", alignItems: "center" }}
                        >
                          <Typography color="textSecondary" variant="body2">
                            {formik.values.catalogueManagement
                              ? t("Products")
                              : t("Categories")}
                          </Typography>
                          <Switch
                            disabled={!canUpdate}
                            color="primary"
                            edge="end"
                            name="catalogueManagement"
                            checked={formik.values.catalogueManagement}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            sx={{
                              mr: 0.2,
                            }}
                          />
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          mt: 3,
                        }}
                      >
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
                          <Typography color="textSecondary" variant="body2">
                            {t("Payment Types")}
                          </Typography>

                          <Box
                            sx={{
                              p: 1,
                              mt: 1,
                              mb: 1,
                              display: "flex",
                              alignItems: "center",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setOpenPaymentModal(true);
                            }}
                          >
                            <Typography variant="body2">
                              {`${activePaymentTypes?.length} Active`}
                            </Typography>
                            <ArrowForwardIosIcon
                              fontSize="small"
                              style={{
                                color: `${
                                  theme.palette.mode !== "dark"
                                    ? "#6C737F"
                                    : "#A0AEC0"
                                }`,
                              }}
                            />
                          </Box>
                        </Box>
                        <DragDropContext onDragEnd={handleDragEnd}>
                          <PaymentDragDropModal
                            companyRef={companyRef?.toString()}
                            open={openPaymentModal}
                            handleClose={() => setOpenPaymentModal(false)}
                            formik={formik}
                          />
                        </DragDropContext>
                      </Box>
                      <Box
                        sx={{
                          mt: 3,
                        }}
                      >
                        <TextFieldWrapper
                          disabled={!canUpdate}
                          inputProps={{
                            style: { textTransform: "capitalize" },
                          }}
                          autoComplete="off"
                          fullWidth
                          error={
                            !!(
                              formik.touched.cardPaymentOptions &&
                              formik.errors.cardPaymentOptions
                            )
                          }
                          helperText={
                            (formik.touched.cardPaymentOptions &&
                              formik.errors.cardPaymentOptions) as any
                          }
                          label={t("Select Payment Option")}
                          name="cardPaymentOptions"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          select
                          value={formik.values.cardPaymentOptions}
                          required
                        >
                          {CARD_OPTIONS_LIST.map((option) => (
                            <MenuItem key={option.key} value={option.key}>
                              {option.value}
                            </MenuItem>
                          ))}
                        </TextFieldWrapper>
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
                        <Typography color="textSecondary" variant="body2">
                          {t("Cash Management")}
                        </Typography>

                        <Box
                          sx={{ p: 1, display: "flex", alignItems: "center" }}
                        >
                          <Switch
                            disabled={!canUpdate}
                            color="primary"
                            edge="end"
                            name="cashManagement"
                            checked={formik.values.cashManagement}
                            onChange={(e) => {
                              setCashManagement(e.target.checked);
                              setShowDialogCashManagement(true);
                            }}
                            sx={{
                              mr: 0.2,
                            }}
                          />
                        </Box>
                      </Box>

                      {formik.values.cashManagement && (
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
                          <Typography color="textSecondary" variant="body2">
                            {t("Starting Cash")}
                          </Typography>

                          <Box
                            sx={{
                              p: 1,
                              mt: 1,
                              mb: 1,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="body2">
                              {currency + " "}
                              {formik.values.startingCash || 0.0}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      <Box
                        sx={{
                          mt: 3,
                        }}
                      >
                        <TextFieldWrapper
                          disabled={!canUpdate}
                          inputProps={{
                            style: { textTransform: "capitalize" },
                          }}
                          autoComplete="off"
                          fullWidth
                          error={
                            !!(
                              formik.touched.defaultComplete &&
                              formik.errors.defaultComplete
                            )
                          }
                          helperText={
                            (formik.touched.defaultComplete &&
                              formik.errors.defaultComplete) as any
                          }
                          label={t("Default Complete")}
                          name="defaultComplete"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          select
                          value={formik.values.defaultComplete}
                          required
                        >
                          {PRINT_TYPE_LIST.map((option) => (
                            <MenuItem key={option.key} value={option.key}>
                              {option.value}
                            </MenuItem>
                          ))}
                        </TextFieldWrapper>
                      </Box>

                      {/* <Box
                        sx={{
                          mt: 3,
                        }}
                      >
                        <TextFieldWrapper
                          disabled={!canUpdate}
                          inputProps={{
                            style: { textTransform: "capitalize" },
                          }}
                          autoComplete="off"
                          fullWidth
                          error={
                            !!(
                              formik.touched.numberOfPrint &&
                              formik.errors.numberOfPrint
                            )
                          }
                          helperText={
                            (formik.touched.numberOfPrint &&
                              formik.errors.numberOfPrint) as any
                          }
                          label={t("Number of Receipt Prints")}
                          name="numberOfPrint"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          select
                          value={formik.values.numberOfPrint}
                          required
                        >
                          {NO_OF_RECEIPT_PRINT_OPTIONS.map((option) => (
                            <MenuItem key={option.key} value={option.key}>
                              {option.value}
                            </MenuItem>
                          ))}
                        </TextFieldWrapper>
                      </Box> */}

                      <Box
                        sx={{
                          mt: 3,
                        }}
                      >
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
                          <Typography color="textSecondary" variant="body2">
                            {t("Order Types")}
                          </Typography>

                          <Box
                            sx={{
                              p: 1,
                              mt: 1,
                              mb: 1,
                              display: "flex",
                              alignItems: "center",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setOpenOrderModal(true);
                            }}
                          >
                            <Typography variant="body2">
                              {`${activeOrderTypes?.length || 0} ${t(
                                "Active"
                              )}`}
                            </Typography>
                            <ArrowForwardIosIcon
                              fontSize="small"
                              style={{
                                color: `${
                                  theme.palette.mode !== "dark"
                                    ? "#6C737F"
                                    : "#A0AEC0"
                                }`,
                              }}
                            />
                          </Box>
                        </Box>
                        <DragDropContext onDragEnd={handleOrderDragEnd}>
                          <OrderDragDropModal
                            open={openOrderModal}
                            handleClose={() => setOpenOrderModal(false)}
                            formik={formik}
                          />
                        </DragDropContext>
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
                        <Typography color="textSecondary" variant="body2">
                          {t("Keypad")}
                        </Typography>

                        <Box
                          sx={{ p: 1, display: "flex", alignItems: "center" }}
                        >
                          <Switch
                            disabled={!canUpdate}
                            color="primary"
                            edge="end"
                            name="keypad"
                            checked={formik.values.keypad}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            sx={{
                              mr: 0.2,
                            }}
                          />
                        </Box>
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
                        <Typography color="textSecondary" variant="body2">
                          {t("Discount")}
                        </Typography>

                        <Box
                          sx={{ p: 1, display: "flex", alignItems: "center" }}
                        >
                          <Switch
                            disabled={
                              !canUpdate || !canAccessModule("discounts")
                            }
                            color="primary"
                            edge="end"
                            name="discounts"
                            checked={formik.values.discounts}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            sx={{
                              mr: 0.2,
                            }}
                          />
                        </Box>
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
                        <Typography color="textSecondary" variant="body2">
                          {t("Promotions")}
                        </Typography>

                        <Box
                          sx={{ p: 1, display: "flex", alignItems: "center" }}
                        >
                          <Switch
                            disabled={
                              !canUpdate || !canAccessModule("promotions")
                            }
                            color="primary"
                            edge="end"
                            name="promotions"
                            checked={formik.values.promotions}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            sx={{ mr: 0.2 }}
                          />
                        </Box>
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
                        <Typography color="textSecondary" variant="body2">
                          {t("Custom Charges")}
                        </Typography>

                        <Box
                          sx={{ p: 1, display: "flex", alignItems: "center" }}
                        >
                          <Switch
                            disabled={
                              !canUpdate || !canAccessModule("custom_charges")
                            }
                            color="primary"
                            edge="end"
                            name="customCharges"
                            checked={formik.values.customCharges}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            sx={{ mr: 0.2 }}
                          />
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
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
                <LoadingButton
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!canUpdate) {
                      return toast.error("You don't have access");
                    }

                    setShowError(true);

                    formik.handleSubmit();
                  }}
                  loading={formik.isSubmitting}
                  sx={{ m: 1 }}
                  variant="contained"
                >
                  {t("Update")}
                </LoadingButton>
              </Stack>
            </Stack>
          </form>
        </Stack>
      </Container>

      <CashAmountMoadl
        open={openCashAmountModal}
        handleClose={() => setOpenCashAmountModal(false)}
        formik={formik}
      />

      <ConfirmationDialog
        show={showDialogCashManagement}
        toggle={() => setShowDialogCashManagement(!showDialogCashManagement)}
        onOk={() => {
          if (cashManagement) {
            setOpenCashAmountModal(true);
            setShowDialogCashManagement(false);
          } else {
            formik.setFieldValue("cashManagement", false);
            formik.setFieldValue("startingCash", 0);
            setShowDialogCashManagement(false);
          }
        }}
        okButtonText={`${t("Yes")}, ${
          cashManagement ? t("Enabled") : t("Disabled")
        }`}
        okButtonPrimaryColor={true}
        cancelButtonText={t("No")}
        title={t("Confirmation")}
        text={`${t(
          "This changes would refelct in the billing after the current session of the user"
        )}.`}
      />
    </>
  );
};

export default withPermission(
  BillingSettingTab,
  MoleculeType["device-settings:read"]
);
