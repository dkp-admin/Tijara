import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  FormHelperText,
  Grid,
  Link,
  MenuItem,
  Stack,
  SvgIcon,
  Switch,
  Tab,
  Tabs,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { RouterLink } from "src/components/router-link";
import { Seo } from "src/components/seo";
import { usePageView } from "src/hooks/use-page-view";
import { ProfileChooser } from "src/components/profile-chooser";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import { tijarahPaths } from "src/paths";
import type { Page as PageType } from "src/types/page";
import * as Yup from "yup";
import React from "react";
import { CustomerEventModal } from "src/components/modals/customer-event-modal";
import ConfirmationDialog from "src/components/confirmation-dialog";
import { USER_TYPES } from "src/utils/constants";
import { useEntity } from "src/hooks/use-entity";
import { useAuth } from "src/hooks/use-auth";
import { useUserType } from "src/hooks/use-user-type";
import PhoneInput from "src/components/phone-input";
import parsePhoneNumber from "src/utils/parse-phone-number";
import CompanyDropdown from "src/components/input/company-auto-complete";

interface CreateLocation {
  company?: string;
  locationRefs?: string[];
  locations?: string[];
  fullName: string;
  vendorId: string;
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
}

const Page: PageType = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { userType } = useUserType();
  const router = useRouter();
  const { id, companyRef, companyName } = router.query;
  usePageView();

  const [country, setCountry] = useState("+966");
  const [formValues, setFormValues] = useState("");
  const [showError, setShowError] = useState(false);
  const [load, setLoad] = useState(false);
  const [openCustomerEventModal, setOpenCustomerEventModal] = useState(false);
  const [customerEventID, setCustomerEventID] = useState(-1);
  const [showDialogCustomerEvent, setShowDialogCustomerEvent] = useState(false);

  const { findOne, create, updateEntity, entity, loading } =
    useEntity("customer");

  const handleDeleteCustomerEvent = () => {
    if (customerEventID != null) {
      const data = formik.values.specialEvents;
      data.splice(customerEventID, 1);
      formik.setFieldValue("specialEvents", data);
      setShowDialogCustomerEvent(false);
      toast.success("Vendor Event Deleted!");
    }
  };

  const handleChangeCountry = (event: any) => {
    setCountry(event.target.value);
  };

  const handleChangevID = (event: any) => {
    setFormValues(event.target.value);
  };

  const generateNumber = () => {
    const min = 10000;
    const max = 99999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const initialValues: CreateLocation = {
    company: "",
    locationRefs: [],
    locations: [],
    fullName: "",
    vendorId: "",
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
  };

  const validationSchema = Yup.object({
    fullName: Yup.string().required(`${t("Name is required")}`),
    locationRefs: Yup.array()
      .required(`${t("Please Select Locations")}`)
      .min(1, `${t("Please Select Locations")}`),
    phone: Yup.string()
      .min(9, `${t("Phone Number should be minimum 9 digits")}`)
      .required(`${t("Phone number is required")}`),
    email: Yup.string()
      .email(`${t("Must be a valid email")}`)
      .max(255)
      .required(`${t("Email is required")}`),
    addressLine1: Yup.string().required(`${t("Address Line is required")}`),
    postalCode: Yup.string().required(`${t("Postal Code is required")}`),
    city: Yup.string().required(`${t("City is required")}`),
    state: Yup.string().required(`${t("State is required")}`),
    country: Yup.string().required(`${t("Country is required")}`),
  });

  const formik: any = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      setLoad(true);

      console.log("Create CS", values);
      const data = {
        name: values.fullName,
        vendorid: values.vendorId,
        phone: parsePhoneNumber(country, values.phone),
        email: values.email,
        companyRef:
          userType == USER_TYPES.ADMIN ? user.company?._id : companyRef,
        company: {
          name:
            userType == USER_TYPES.ADMIN ? user.company.name.en : companyName,
        },
        locationRefs: values?.locationRefs,
        locations: [
          {
            name: {
              en: values.locations,
            },
          },
        ],
        address: {
          address1: values.addressLine1,
          address2: values.addressLine2,
          country: values.country,
          postalCode: values.postalCode,
          state: values.state,
          city: values.city,
        },
        specialEvents: values.specialEvents?.map((event) => {
          return { name: event.name, date: event.date };
        }),
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
            ? t("Vendor Details Updated").toString()
            : t("New Vendor Created").toString()
        );

        router.back();
      } catch (err) {
        toast.error(err.message);
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
    if (entity != null) {
      const phoneNumber = entity.phone
        ? entity.phone?.toString().split("-")[1]
        : "";

      setCountry(phoneNumber ? entity.phone?.toString().split("-")[0] : "+966");

      formik.setValues({
        locationRefs: entity.locationRefs,
        locations: entity.locations[0]?.name.en,
        fullName: entity.name,
        vendorId: entity.name,
        phone: phoneNumber,
        email: entity.email,
        addressLine1: entity.address?.address1,
        addressLine2: entity.address?.address2 || "",
        postalCode: entity.address?.postalCode || "",
        city: entity.address.city,
        state: entity.address.state,
        country: entity.address.country,
        specialEvents: entity.specialEvents?.map(
          (event: any, index: number) => {
            return { id: index, name: event.name, date: event.date };
          }
        ),
        status: entity?.status == "active" ? true : false,
      });
    }
  }, [entity]);

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
                      <Typography variant="h6">{t("Payment Tabs")}</Typography>
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

                      <Box
                        sx={{
                          alignItems: "center",
                          display: "flex",
                          mt: 3,
                        }}
                      ></Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

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
                  component={RouterLink}
                  href={tijarahPaths?.management?.customers?.index}
                >
                  {t("Cancel")}
                </Button>

                <LoadingButton
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowError(true);
                    formik.handleSubmit();
                  }}
                  loading={load}
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
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
