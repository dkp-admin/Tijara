import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import PhoneInput from "src/components/phone-input";
import { AccountContext } from "src/contexts/account-context";
import { useEntity } from "src/hooks/use-entity";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import type { Page as PageType } from "src/types/page";
import parsePhoneNumber from "src/utils/parse-phone-number";
import * as Yup from "yup";
import { ProfileChooser } from "../profile-chooser";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { MoleculeType } from "src/permissionManager";
import TextFieldWrapper from "../text-field-wrapper";
import { useAuth } from "src/hooks/use-auth";
import { AuthContext } from "src/contexts/auth/jwt-context";
import { FileUploadNamespace } from "src/utils/uploadToS3";

export interface AccountProfileProps {
  profilePicture?: string;
  fullName: string;
  email: string;
  phone: string;
  userRole: string;
}

const Page: PageType = () => {
  const { t } = useTranslation();
  const accountContext = useContext<any>(AccountContext);
  const { user } = useAuth();
  const authContext = useContext(AuthContext);

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [country, setCountry] = useState("+966");
  const [, setLoad] = useState(false);
  const canAccess = usePermissionManager();
  const canUpdate =
    canAccess(MoleculeType["account:update"]) ||
    canAccess(MoleculeType["account:manage"]);

  const { updateEntity } = useEntity("user");

  const handleChangeCountry = (event: any) => {
    setCountry(event.target.value);
  };

  const handleEdit = () => {
    if (!canUpdate) {
      return toast.error(t("You don't have access"));
    }
    setIsEditing(!isEditing);
  };

  const initialValues: AccountProfileProps = {
    profilePicture: "",
    fullName: "",
    email: "",
    phone: "",
    userRole: "",
  };

  const validationSchema = Yup.object({
    fullName: Yup.string()
      .max(60)
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid name")
      )
      .required(`${t("Name is required")}`),
    email: Yup.string()
      .email(`${t("Must be a valid email")}`)
      .max(70)
      .required(`${t("Email is required")}`),
    phone: Yup.string()
      .min(9, `${t("Phone Number should be minimum 9 digits")}`)
      .max(12, t("Phone Number should not be maximum 12 digits"))
      .required(`${t("Phone number is required")}`),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      setLoad(true);

      const data = {
        name: values.fullName.trim(),
        email: values.email,
        profilePicture: values.profilePicture,
        phone: parsePhoneNumber(country, values.phone),
      };

      try {
        if (accountContext?._id) {
          const res = await updateEntity(accountContext._id?.toString(), {
            ...data,
          });

          localStorage.setItem(
            "user",
            JSON.stringify({ ...user, profilePicture: res?.profilePicture })
          );
          authContext.updateUser({
            ...user,
            profilePicture: res?.profilePicture,
          });
        }

        toast.success(t("Details Updated").toString());
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoad(false);
        setIsEditing(false);
      }
    },
  });

  useEffect(() => {
    if (accountContext != null) {
      const phoneNumber = accountContext.phone
        ? accountContext.phone?.toString().split("-")[1]
        : "";

      setCountry(
        phoneNumber ? accountContext.phone?.toString().split("-")[0] : "+966"
      );

      formik.setValues({
        profilePicture: accountContext?.profilePicture,
        fullName: accountContext?.name,
        email: accountContext?.email,
        phone: phoneNumber,
        userRole: accountContext?.roleRef
          ? accountContext?.role?.name
          : accountContext?.userType === "app:admin"
          ? "Admin"
          : "Super Admin",
      });
    }
  }, [accountContext]);

  return (
    <>
      <Box>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={4} xs={12}>
                <Typography variant="h6">{t("Basic Details")}</Typography>
              </Grid>
              <Grid item md={8} xs={12}>
                <ProfileChooser
                  disabled={!isEditing}
                  imageUploadUrl={
                    formik.values.profilePicture != null &&
                    formik.values.profilePicture
                  }
                  onSuccess={(url: any) =>
                    formik.handleChange("profilePicture")(url)
                  }
                  namespace={FileUploadNamespace["user-profile-images"]}
                />

                <TextFieldWrapper
                  required
                  fullWidth
                  disabled={!isEditing}
                  label={t("Full Name")}
                  name="fullName"
                  onChange={formik.handleChange}
                  error={Boolean(
                    formik.touched.fullName && formik.errors.fullName
                  )}
                  helperText={formik.touched.fullName && formik.errors.fullName}
                  onBlur={formik.handleBlur}
                  value={formik.values.fullName}
                  sx={{ mt: 3 }}
                />

                <TextFieldWrapper
                  fullWidth
                  disabled
                  label={t("Role")}
                  name="userRole"
                  onChange={formik.handleChange}
                  error={Boolean(
                    formik.touched.userRole && formik.errors.userRole
                  )}
                  helperText={formik.touched.userRole && formik.errors.userRole}
                  onBlur={formik.handleBlur}
                  value={formik.values.userRole}
                  sx={{ mt: 3 }}
                />

                <PhoneInput
                  onChange={formik.handleChange("phone")}
                  touched={formik.touched.phone}
                  error={formik.errors.phone}
                  value={formik.values.phone}
                  onBlur={formik.handleBlur("phone")}
                  country={country}
                  handleChangeCountry={handleChangeCountry}
                  label={t("Phone Number")}
                  disabled={true}
                  required={true}
                  style={{ mt: 1.5 }}
                />

                <TextFieldWrapper
                  required
                  fullWidth
                  disabled={!isEditing}
                  label={t("Email Address")}
                  name="email"
                  onChange={formik.handleChange}
                  error={Boolean(formik.touched.email && formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  sx={{ mt: 3 }}
                />

                <Box
                  sx={{
                    mt: 4,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  {isEditing && (
                    <Button
                      sx={{
                        mr: 2,
                        borderColor: "neutral.500",
                        color: "neutral.500",
                        "&:hover": {
                          borderColor: "neutral.500",
                          color: "neutral.500",
                          backgroundColor: "neutral.100",
                        },
                      }}
                      variant="outlined"
                      onClick={() => {
                        // formik.setFieldValue(
                        //   "profilePicture",
                        //   isCustomer
                        //     ? context?.profilePicture
                        //     : context?.owner?.profilePicture
                        // );
                        handleEdit();
                      }}
                    >
                      {t("Cancel")}
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      if (isEditing) {
                        formik.handleSubmit();
                      } else {
                        handleEdit();
                      }
                    }}
                    variant={!isEditing ? "outlined" : "contained"}
                  >
                    {isEditing ? t("Save") : t("Edit")}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
