import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
  Link,
  MenuItem,
  Stack,
  Switch,
  TextFieldProps,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import CompanyDropdown from "src/components/input/company-auto-complete";
import { Seo } from "src/components/seo";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import UpgradePackage from "src/pages/upgrade-package";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import { USER_TYPES } from "src/utils/constants";
import { Screens } from "src/utils/screens-names";
import useActiveTabs from "src/utils/use-active-tabs";
import { useCurrency } from "src/utils/useCurrency";
import * as Yup from "yup";
interface CreateDiscount {
  discountCode: string;
  discountType: string;
  discountValue: string | number;
  discountExpiry: Date;
  status: boolean;
  origin?: string;
}

const Page: PageType = () => {
  const { t } = useTranslation();
  const { userType } = useUserType();
  const router = useRouter();
  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["coupon:update"]);
  const canCreate = canAccess(MoleculeType["coupon:create"]);
  const { canAccessModule } = useFeatureModuleManager();
  const { changeTab } = useActiveTabs();
  const currency = useCurrency();

  const { id, companyRef, companyName, origin } = router.query;

  usePageView();

  const [, setLoad] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [showDialogDeleteItem, setShowDialogDeleteItem] = useState(false);
  const { findOne, create, updateEntity, deleteEntity, entity, loading } =
    useEntity("coupon");

  const discountTypeOptions = [
    {
      label: t("Fixed Percentage"),
      value: "percent",
    },
    {
      label: t("Fixed Amount"),
      value: "amount",
    },
  ];
  const today = new Date();
  const defaultDate = today.setMonth(today.getMonth() + 1);

  const initialValues: CreateDiscount = {
    discountCode: "",
    discountType: "",
    discountValue: 0,
    discountExpiry: new Date(defaultDate),
    status: true,
  };

  const validationSchema = Yup.object({
    discountCode: Yup.string()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9]+$/,
        `${t("Enter valid discount code")}. ${t(
          "Discount code should not contain special characters or spaces."
        )}`
      )
      .required(`${t("Discount code is required")}`)
      .max(20, "Discount code must not be greater than 20"),
    discountType: Yup.string().required(`${t("Discount Type is required")}`),
    discountValue: Yup.number()
      .test(
        t("Is positive?"),
        t("Discount value must be greater than 0"),
        (value) => value > 0
      )
      .when("discountType", {
        is: "percent",
        then: Yup.number().test(
          t("Is valid percentage?"),
          t(
            "Discount value must be a valid percentage with max 2 digits before and after decimal"
          ),
          (number) => {
            const parts = String(number).split(".");
            return parts[0].length <= 2 && (!parts[1] || parts[1].length <= 2);
          }
        ),
      })
      .required(t("Discount value is required")),
    discountExpiry: Yup.date()
      .required(t("Expiry is required"))
      .typeError(t("Expiry is required")),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      setLoad(true);

      const data = {
        companyRef: companyRef,
        company: {
          name: companyName,
        },
        code: values.discountCode.trim(),
        discount: values.discountValue,
        discountType: values.discountType,
        expiry: values.discountExpiry,
        status: values.status ? "active" : "inactive",
      };

      try {
        if (id) {
          await updateEntity(id?.toString(), { ...data });
        } else {
          await create({ ...data });
        }

        toast.success(
          id != null
            ? t("Discount Details Updated").toString()
            : t("New Discount Code Created").toString()
        );
        if (origin == "company") {
          changeTab("discounts", Screens?.companyDetail);
        }
        router.back();
      } catch (err) {
        if (err.message === "duplicate_record") {
          toast.error(t("Discount already exists."));
        } else {
          toast.error(err.message);
        }
      } finally {
        setLoad(false);
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

  useEffect(() => {
    if (id != null) {
      findOne(id?.toString());
    }
  }, [id]);

  useEffect(() => {
    if (entity != null) {
      formik.setValues({
        discountCode: entity?.code,
        discountType: entity?.discountType,
        discountValue: entity?.discount,
        discountExpiry: entity?.expiry,
        status: entity?.status == "active" ? true : false,
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

  if (!canAccessModule("discounts")) {
    return <UpgradePackage />;
  }

  return (
    <>
      <Seo title={id ? `${t("Edit Discount")}` : `${t("Create Discount")}`} />
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
              <Box sx={{ maxWidth: 60, cursor: "pointer" }}>
                <Link
                  color="textPrimary"
                  component="a"
                  sx={{
                    alignItems: "center",
                    display: "flex",
                  }}
                  onClick={() => {
                    if (origin == "company") {
                      changeTab("discounts", Screens?.companyDetail);
                    }
                    router.back();
                  }}
                >
                  <ArrowBackIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "#6B7280" }}
                  />
                  <Typography variant="subtitle2">{t("Discounts")}</Typography>
                </Link>
              </Box>

              <Typography variant="h4">
                {id != null ? t("Edit Discount") : t("Create Discount")}
              </Typography>
            </Stack>

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4} sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">
                          {t("Discount Details")}
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
                            fullWidth
                            label={t("Discount Code")}
                            name="discountCode"
                            error={Boolean(
                              formik.touched.discountCode &&
                                formik.errors.discountCode
                            )}
                            helperText={
                              (formik.touched.discountCode &&
                                formik.errors.discountCode) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              // if (/^[a-zA-Z0-9]*$/.test(e.target.value)) {
                              formik.handleChange(e);
                              // }
                            }}
                            required
                            disabled={id != null}
                            // onKeyDown={(event): void => {
                            //   event.preventDefault();
                            // }}
                            value={formik.values.discountCode}
                          />
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            error={
                              !!(
                                formik.touched.discountType &&
                                formik.errors.discountType
                              )
                            }
                            fullWidth
                            label="Discount Type"
                            name="discountType"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            select
                            value={formik.values.discountType}
                            disabled={id != null}
                            required
                          >
                            {discountTypeOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextFieldWrapper>
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            required
                            fullWidth
                            type="number"
                            label={
                              formik.values.discountType == "percent"
                                ? t("Discount Value (in %)")
                                : formik.values.discountType ==
                                  "variablePercentage"
                                ? t("Enter the value at billing")
                                : t(`Discount Value (in ${currency})`)
                            }
                            name="discountValue"
                            onBlur={formik.handleBlur}
                            onWheel={(event: any) => {
                              event.preventDefault();
                              event.target.blur();
                            }}
                            error={Boolean(
                              formik.touched.discountValue &&
                                formik.errors.discountValue
                            )}
                            helperText={
                              (formik.touched.discountValue &&
                                formik.errors.discountValue) as any
                            }
                            onKeyDown={(event) => {
                              if (event.key === ".") event.preventDefault();
                            }}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            disabled={id != null}
                            value={formik.values.discountValue}
                          />
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <DatePicker
                            disabled={id != null && !canUpdate}
                            open={openDatePicker}
                            onOpen={() => setOpenDatePicker(true)}
                            onClose={() => setOpenDatePicker(false)}
                            label="Expiry Date"
                            inputFormat="dd/MM/yyyy"
                            onChange={(date: Date | null): void => {
                              formik.setFieldValue("discountExpiry", date);
                            }}
                            //{/*
                            // @ts-ignore */}
                            inputProps={{ disabled: true }}
                            minDate={new Date()}
                            disablePast
                            value={formik.values.discountExpiry}
                            renderInput={(
                              params: JSX.IntrinsicAttributes & TextFieldProps
                            ) => (
                              <TextFieldWrapper
                                required
                                fullWidth
                                onClick={() =>
                                  setOpenDatePicker(!openDatePicker)
                                }
                                {...params}
                                error={Boolean(
                                  formik.touched.discountExpiry &&
                                    formik.errors.discountExpiry
                                )}
                                helperText={
                                  (formik.touched.discountExpiry &&
                                    formik.errors.discountExpiry) as any
                                }
                                onBlur={formik.handleBlur("discountExpiry")}
                              />
                            )}
                          />
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
                              {t("Change the status of the Discount Code")}
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
                  {Boolean(!id) && (
                    <Button
                      color="inherit"
                      onClick={() => {
                        if (origin == "company") {
                          changeTab("discounts", Screens?.companyDetail);
                        }
                        router.back();
                      }}
                    >
                      {t("Cancel")}
                    </Button>
                  )}
                  <Box></Box>
                  {/* {id && (
                    <LoadingButton
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        if (origin == "company") {
                          changeTab("discount", Screens?.companyDetail);
                        }
                        setShowDialogDeleteItem(true);
                      }}
                      sx={{ ml: 1 }}
                    >
                      {t("Delete")}
                    </LoadingButton>
                  )} */}
                  <Box>
                    {id && (
                      <Button
                        color="inherit"
                        onClick={() => {
                          if (origin == "company") {
                            changeTab("discounts", Screens?.companyDetail);
                          }
                          router.back();
                        }}
                      >
                        {t("Cancel")}
                      </Button>
                    )}

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
                  </Box>
                </Stack>
              </Stack>
            </form>
          </Stack>
        </Container>
      </Box>
      {/* <ConfirmationDialog
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
      /> */}
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
