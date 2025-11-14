import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import { useState, useContext } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Seo } from "src/components/seo";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import type { Page as PageType } from "src/types/page";
import { useRouter } from "next/router";
import * as Yup from "yup";
import { AccountContext } from "src/contexts/account-context";
import { AuthContext } from "src/contexts/auth/jwt-context";
import serviceCaller from "src/api/serviceCaller";
import endpoint from "src/api/endpoints";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { MoleculeType } from "src/permissionManager";
import TextFieldWrapper from "../text-field-wrapper";

interface AccountSecurityProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Page: PageType = () => {
  const { t } = useTranslation();
  const accountContext = useContext<any>(AccountContext);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const canAccess = usePermissionManager();
  const canUpdate =
    canAccess(MoleculeType["account:update"]) ||
    canAccess(MoleculeType["account:manage"]);

  const [, setLoad] = useState(false);

  const handleEdit = () => {
    if (!canUpdate) {
      return toast.error(t("You don't have access"));
    }
    formik.resetForm();
    setIsEditing(!isEditing);
  };

  const initialValues: AccountSecurityProps = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const validationSchema = Yup.object({
    currentPassword: Yup.string().required(
      `${t("Current Password is required")}`
    ),
    newPassword: Yup.string()
      .min(8, `${t("New Password must be at least 8 characters")}`)
      .max(20)
      .required(`${t("New Password is required")}`)
      .matches(/^\S*$/, `${t("Password cannot contain spaces")}`),
    confirmPassword: Yup.string()
      .oneOf(
        [Yup.ref("newPassword"), null],
        `${t("New & Confirm Password must be match")}`
      )
      .required(`${t("Confirm Password is required")}`),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      setLoad(true);

      try {
        const res = await serviceCaller(endpoint.changePassword.path, {
          method: endpoint.changePassword.method,
          body: {
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
          },
        });
        accountContext.onRefresh();
        formik.resetForm();
        toast.success(t("Password updated successfully").toString());
        setIsEditing(false);
        setShowCurrentPassword(false);
      } catch (err) {
        if (err.message == "bad_password_message") {
          toast.error(`${"Wrong Current Password"}`);
        } else {
          toast.error(err.message || err.code);
        }
      } finally {
        setLoad(false);
      }
    },
  });

  return (
    <>
      <Card>
        <CardContent>
          <Grid container>
            <Grid xs={12} md={4}>
              <Typography variant="h6">{t("Change password")}</Typography>
            </Grid>
            <Grid xs={12} sm={12} md={8}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <TextFieldWrapper
                  disabled={!isEditing}
                  label={t("Current Password")}
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  error={Boolean(
                    formik.touched.currentPassword &&
                      formik.errors.currentPassword
                  )}
                  required
                  helperText={
                    formik.touched.currentPassword &&
                    formik.errors.currentPassword
                  }
                  value={formik.values.currentPassword}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  sx={{
                    flexGrow: 1,
                    ...(!isEditing && {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderStyle: "dotted",
                      },
                    }),
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          onMouseDown={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                        >
                          {isEditing &&
                            (!showCurrentPassword ? (
                              <Visibility />
                            ) : (
                              <VisibilityOff />
                            ))}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {isEditing && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <TextFieldWrapper
                    disabled={!isEditing}
                    error={Boolean(
                      formik.touched.newPassword && formik.errors.newPassword
                    )}
                    required
                    helperText={
                      formik.touched.newPassword && formik.errors.newPassword
                    }
                    label={t("New Password")}
                    name="newPassword"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    type={showNewPassword ? "text" : "password"}
                    value={formik.values.newPassword}
                    sx={{
                      flexGrow: 1,
                      mt: 3,
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            onMouseDown={() =>
                              setShowNewPassword(!showNewPassword)
                            }
                          >
                            {isEditing &&
                              (!showNewPassword ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              ))}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              )}

              {isEditing && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <TextFieldWrapper
                    disabled={!isEditing}
                    error={Boolean(
                      formik.touched.confirmPassword &&
                        formik.errors.confirmPassword
                    )}
                    required
                    helperText={
                      formik.touched.confirmPassword &&
                      formik.errors.confirmPassword
                    }
                    label={t("Confirm Password")}
                    name="confirmPassword"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    type={showConfirmPassword ? "text" : "password"}
                    value={formik.values.confirmPassword}
                    sx={{
                      flexGrow: 1,
                      mt: 3,
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            onMouseDown={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {isEditing &&
                              (!showConfirmPassword ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              ))}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              )}

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
                    onClick={() => handleEdit()}
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
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
