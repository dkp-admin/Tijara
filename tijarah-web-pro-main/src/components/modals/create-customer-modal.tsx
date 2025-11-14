import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  MenuItem,
  Modal,
  Stack,
  SvgIcon,
  Table,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ConfirmationDialog from "src/components/confirmation-dialog";
import { CustomerEventCard } from "src/components/customer/customer-event-card";
import CompanyDropdown from "src/components/input/company-auto-complete";
import { CustomerEventModal } from "src/components/modals/customer-event-modal";
import PhoneInput from "src/components/phone-input";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import i18n from "src/i18n";
import { MoleculeType } from "src/permissionManager";
import { EventNames } from "src/types/customer";
import { USER_TYPES } from "src/utils/constants";
import countries from "src/utils/countries.json";
import parsePhoneNumber from "src/utils/parse-phone-number";
import useActiveTabs from "src/utils/use-active-tabs";
import * as Yup from "yup";
import TextFieldWrapper from "../text-field-wrapper";
import CloseIcon from "@mui/icons-material/Close";

interface CreateCustomer {
  company?: string;
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
  specialEvents: any[];
  status: boolean;
  vat: number;
}

const validationSchema = Yup.object({
  fullName: Yup.string()
    .required(`${i18n.t("Full Name is required")}`)
    .max(60, i18n.t("Full name must not be greater than 60 characters")),
  phone: Yup.string()
    .min(9, `${i18n.t("Phone Number should be minimum 9 digits")}`)
    .max(12, i18n.t("Phone Number should not be maximum 12 digits"))
    .required(`${i18n.t("Phone number is required")}`),
  email: Yup.string()
    .email(`${i18n.t("Must be a valid email")}`)
    .max(70),
  addressLine1: Yup.string().max(
    60,
    i18n.t("Address Line must not be greater than 60 characters")
  ),
  postalCode: Yup.string().max(
    10,
    i18n.t("Postal code must not be greater than 10 digits")
  ),
  city: Yup.string().max(
    40,
    i18n.t("City must not be greater than 40 characters")
  ),
  country: Yup.string(),
  vat: Yup.string()
    .typeError(i18n.t("Vat should be a number"))
    .matches(
      /^3[0-9]{13}3$/,
      "must start and end with 3 and have 15 characters"
    )
    .nullable(),
});

const CreateCustomerModal = (props: any) => {
  const { t } = useTranslation();
  const { setOpenCreateCustomerModal, open, companyRef, companyName } = props;
  const theme = useTheme();
  const { user } = useAuth();
  const { userType } = useUserType();
  const router = useRouter();
  const { changeTab } = useActiveTabs();

  const canAccess = usePermissionManager();

  const canUpdate =
    canAccess(MoleculeType["customer:update"]) ||
    canAccess(MoleculeType["customer:manage"]);

  usePageView();

  const [country, setCountry] = useState("+966");
  const [load, setLoad] = useState(false);
  const [openCustomerEventModal, setOpenCustomerEventModal] = useState(false);
  const [customerEventID, setCustomerEventID] = useState(-1);

  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);

  const [showDialogCustomerEvent, setShowDialogCustomerEvent] = useState(false);
  const lng = localStorage.getItem("currentLanguage");
  const { create: CreateCustomer, loading } = useEntity("customer");
  const { findOne: company, entity: companyEntity } = useEntity("company");

  const handleDeleteCustomerEvent = () => {
    if (customerEventID != null) {
      const data = formik.values.specialEvents;
      data.splice(customerEventID, 1);
      formik.setFieldValue("specialEvents", data);
      setShowDialogCustomerEvent(false);
      toast.success("Customer Event Deleted!");
    }
  };

  const handleEditCustomerEvent = (index: any) => {
    setCustomerEventID(index);

    setOpenCustomerEventModal(true);
  };

  const handleChangeCountry = (event: any) => {
    setCountry(event.target.value);
  };

  const initialValues: CreateCustomer = {
    company: "",
    fullName: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    postalCode: "",
    city: "",
    state: "",
    country: "",
    specialEvents: [],
    status: true,
    vat: null,
  };

  const formik: any = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      setLoad(true);

      const data = {
        name: values.fullName,
        phone: parsePhoneNumber(country, values.phone),
        email: values.email,
        companyRef: companyRef,
        company: {
          name: companyName,
        },
        vat: values.vat,
        address: {
          address1: values.addressLine1,
          address2: values.addressLine2,
          country: values.country,
          postalCode: values.postalCode,
          state: values.state,
          city: values.city,
        },
        specialEvents: values.specialEvents,
        status: values.status ? "active" : "inactive",
      };

      try {
        await CreateCustomer({ ...data });

        toast.success(t("New Customer Created"));
        setOpenCreateCustomerModal(false);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoad(false);
      }
    },
  });

  const handleAdd = (data: any) => {
    let customerEvent = formik.values.specialEvents;
    customerEvent = [...customerEvent, { ...data }];

    formik.setFieldValue("specialEvents", customerEvent);
    setAdding(false);
  };

  const handleEdit = (data: any) => {
    let customerEvent = formik.values.specialEvents;

    const idx = customerEvent?.findIndex((d: any) => d?.name == data?.name);

    customerEvent.splice(idx, 1, data);
    formik.setFieldValue("specialEvents", customerEvent);
    setEditing(false);
  };

  useEffect(() => {
    formik.resetForm();

    formik.setFieldValue("specialEvents", [
      {
        name: "Date of birth",
        date: null,
        type: EventNames.dateOfBirth,
      },
      {
        name: "Anniversary",
        date: null,
        type: EventNames.anniversary,
      },
    ]);
  }, [open]);

  useEffect(() => {
    if (companyRef != null && userType === USER_TYPES.SUPERADMIN) {
      company(companyRef?.toString());
    }
  }, [companyRef]);

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
      <Dialog fullWidth maxWidth="md" open={open}>
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
            {t("Create a Customer")}
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
            <CloseIcon
              fontSize="medium"
              onClick={() => {
                setOpenCreateCustomerModal(false);
              }}
            />
          </Box>
        </Box>
        <Divider />
        <DialogContent sx={{ p: 1 }}>
          <form noValidate onSubmit={formik.handleSubmit}>
            <Stack spacing={4}>
              <Card style={{ boxShadow: "none" }}>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item md={4} xs={12}>
                      <Typography variant="h6">{t("Basic Details")}</Typography>
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
                          inputProps={{
                            style: { textTransform: "capitalize" },
                          }}
                          fullWidth
                          label={t("Full Name")}
                          name="fullName"
                          error={Boolean(
                            formik.touched.fullName && formik.errors.fullName
                          )}
                          helperText={
                            (formik.touched.fullName &&
                              formik.errors.fullName) as any
                          }
                          onBlur={formik.handleBlur}
                          onChange={(e) => {
                            formik.handleChange(e);
                          }}
                          required
                          value={formik.values.fullName}
                        />
                      </Box>

                      <Box sx={{ mt: 3 }}>
                        <PhoneInput
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

                      <Box sx={{ mt: 3 }}>
                        <TextFieldWrapper
                          fullWidth
                          label={t("Email")}
                          name="email"
                          error={Boolean(
                            formik.touched.email && formik.errors.email
                          )}
                          helperText={
                            (formik.touched.email && formik.errors.email) as any
                          }
                          onBlur={formik.handleBlur}
                          onChange={(e) => {
                            formik.handleChange(e);
                          }}
                          value={formik.values.email}
                        />
                      </Box>
                      <Box sx={{ mt: 3 }}>
                        <TextFieldWrapper
                          fullWidth
                          label={t("VAT Number")}
                          name="vat"
                          error={Boolean(
                            formik.touched.vat && formik.errors.vat
                          )}
                          helperText={
                            (formik.touched.vat && formik.errors.vat) as any
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
                          value={formik.values.vat}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card style={{ boxShadow: "none" }}>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item md={4} xs={12}>
                      <Typography variant="h6">
                        {t("Customer Address")}
                      </Typography>
                    </Grid>
                    <Grid item md={8} xs={12}>
                      <Box sx={{ mt: 3 }}>
                        <TextFieldWrapper
                          inputProps={{
                            style: { textTransform: "capitalize" },
                          }}
                          error={
                            !!(formik.touched.country && formik.errors.country)
                          }
                          fullWidth
                          label={t("Country")}
                          name="country"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          select
                          value={formik.values.country}
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
                          value={formik.values.addressLine1}
                        />
                      </Box>

                      <Box sx={{ mt: 3 }}>
                        <TextFieldWrapper
                          inputProps={{
                            style: { textTransform: "capitalize" },
                          }}
                          fullWidth
                          label={t("Address Line 2")}
                          name="addressLine2"
                          error={Boolean(
                            formik.touched.addressLine2 &&
                              formik.errors.addressLine2
                          )}
                          helperText={
                            (formik.touched.addressLine2 &&
                              formik.errors.addressLine2) as any
                          }
                          onBlur={formik.handleBlur}
                          onChange={(e) => {
                            formik.handleChange(e);
                          }}
                          value={formik.values.addressLine2}
                        />
                      </Box>

                      <Box sx={{ mt: 3 }}>
                        <TextFieldWrapper
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
                            const value = e.target.value;
                            if (value) {
                              // remove all non numeric characters
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
                          value={formik.values.postalCode}
                        />
                      </Box>

                      <Box sx={{ mt: 3 }}>
                        <TextFieldWrapper
                          inputProps={{
                            style: { textTransform: "capitalize" },
                          }}
                          fullWidth
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

              <Card
                style={{ boxShadow: "none" }}
                sx={{
                  mt: 2,
                }}
              >
                <CardContent>
                  <Grid container>
                    <Grid xs={12} md={8}>
                      <Stack spacing={1}>
                        <Typography variant="h6">
                          {t("Special Events")}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          {t("You can add dates of special events here")}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Stack
                        alignItems="center"
                        justifyContent="flex-end"
                        direction="row"
                        spacing={3}
                      >
                        <LoadingButton
                          startIcon={
                            <SvgIcon>
                              <PlusIcon />
                            </SvgIcon>
                          }
                          onClick={() => {
                            if (!canUpdate) {
                              return toast.error(t("You don't have access"));
                            }
                            setAdding(true);
                            setCustomerEventID(-1);
                            setOpenCustomerEventModal(true);
                          }}
                          variant="outlined"
                        >
                          {t("Add")}
                        </LoadingButton>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>

                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("Event")}</TableCell>
                      <TableCell>{t("Date")}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>

                  <CustomerEventCard
                    handleEdit={(idx: any) => {
                      setEditing(true);

                      handleEditCustomerEvent(idx);
                    }}
                    setCustomerEventID={() => setCustomerEventID}
                    setShowDialogCustomerEvent={setShowDialogCustomerEvent}
                    customerEventsList={formik.values.specialEvents}
                  />
                </Table>
              </Card>

              <CustomerEventModal
                open={openCustomerEventModal}
                handleClose={() => {
                  setAdding(false);
                  setEditing(false);
                  setOpenCustomerEventModal(false);
                }}
                modalData={
                  customerEventID == -1
                    ? {}
                    : formik.values.specialEvents[customerEventID]
                }
                onSuccess={(data: any) => {
                  if (adding) {
                    handleAdd(data);
                  } else if (editing) {
                    handleEdit(data);
                  }
                }}
              />
            </Stack>
          </form>

          <ConfirmationDialog
            show={showDialogCustomerEvent}
            toggle={() => setShowDialogCustomerEvent(!showDialogCustomerEvent)}
            onOk={() => {
              handleDeleteCustomerEvent();
            }}
            okButtonText={`${t("Yes")}, ${t("Delete")}`}
            cancelButtonText={t("Cancel")}
            title={t("Confirmation")}
            text={t("Are you sure you want to delete this event?")}
          />
        </DialogContent>
        <Divider />
        {/* footer */}
        <DialogActions
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
            p: 2,
          }}
        >
          <LoadingButton
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              formik.handleSubmit();
            }}
            loading={formik.isSubmitting}
            variant="contained"
          >
            {"Create"}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateCustomerModal;
