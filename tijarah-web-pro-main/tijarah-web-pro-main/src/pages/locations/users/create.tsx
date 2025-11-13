import { Visibility, VisibilityOff } from "@mui/icons-material";
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
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import CompanyDropdown from "src/components/input/company-auto-complete";
import LocationAutoCompleteDropdown from "src/components/input/location-singleSelect";
import RolesDropdown from "src/components/input/role-auto-complete";
import PhoneInput from "src/components/phone-input";
import { ProfileChooser } from "src/components/profile-chooser";
import PermissionTab from "src/components/rolesAndPermissionTabs/permission-tab";
import { Seo } from "src/components/seo";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { PermissionContext } from "src/contexts/permission-context";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import i18n from "src/i18n";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import { UserTypeEnum } from "src/types/userTypes";
import { USER_TYPES } from "src/utils/constants";
import parsePhoneNumber from "src/utils/parse-phone-number";
import { Screens } from "src/utils/screens-names";
import useActiveTabs from "src/utils/use-active-tabs";
import * as Yup from "yup";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import UpgradePackage from "src/pages/upgrade-package";
import LocationMultiSelect from "src/components/input/location-multiSelect";
import { FileUploadNamespace } from "src/utils/uploadToS3";
export interface CreateUser {
  // showLocation?: boolean;
  editCredentials?: boolean;
  loginPinValid?: boolean;
  roleRef?: string;
  role?: string;
  permissions?: string[];
  isDefault?: boolean;
  defaultPermissions?: string[];
  userType?: string;
  location?: string;
  locationRef: string;
  locations?: string[];
  locationRefs: string[];
  assignedToAllLocation: boolean;
  profilePicture: string;
  email: string;
  fullName: string;
  phone: string;
  password?: string;
  loginPin: string;
  confirmPassword?: string;
  status: boolean;
}
const TabContents: any = {
  admin: PermissionTab,
  pos: PermissionTab,
};

const tabs = [
  {
    label: i18n.t("Web"),
    value: "admin",
  },
  {
    label: i18n.t("POS"),
    value: "pos",
  },
];

const validationSchema = Yup.object({
  assignedToAll: Yup.boolean(),
  locationRefs: Yup.array().when(["assignedToAll", "userType"], {
    is: (assignedToAll: boolean, userType: string) =>
      assignedToAll === true || userType === "app:admin",
    then: Yup.array().optional(),
    otherwise: Yup.array()
      .required(i18n.t("Locations is required"))
      .min(1, i18n.t("Locations is required")),
  }),
  roleRef: Yup.string().required(i18n.t("Role is required")),
  fullName: Yup.string()
    .matches(
      /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
      i18n.t("Enter valid name")
    )
    .max(60, i18n.t("Name must not be greater than 60 characters"))
    .required(`${i18n.t("Full Name is required")}`),
  email: Yup.string()
    .email(`${i18n.t("Must be a valid email")}`)
    .max(70)
    .required(`${i18n.t("Email is required")}`),
  phone: Yup.string()
    .min(9, `${i18n.t("Phone Number should be minimum 9 digits")}`)
    .max(12, i18n.t("Phone Number should not be maximum 12 digits"))
    .required(`${i18n.t("Phone number is required")}`),
  loginPinValid: Yup.boolean(),
  editCredentials: Yup.boolean(),
  password: Yup.string().when("editCredentials", {
    is: true,
    then: Yup.string()
      .min(8, `${i18n.t("Password must be at least 8 characters")}`)
      .max(20, `${i18n.t("Password must be at most 20 characters")}`)
      .required(`${i18n.t("Password is required")}`)
      .matches(/^\S*$/, `${i18n.t("Password cannot contain spaces")}`),
    otherwise: Yup.string(),
  }),
  confirmPassword: Yup.string().when("editCredentials", {
    is: true,
    then: Yup.string()
      .required(`${i18n.t("Please confirm the password")}`)
      .oneOf([Yup.ref("password")], `${i18n.t("Passwords must match")}`),
    otherwise: Yup.string(),
  }),
  loginPin: Yup.string().when("loginPinValid", {
    is: true,
    then: Yup.string()
      .min(4, `${i18n.t("Login Pin should be of 4 digits")}`)
      .max(4, `${i18n.t("Login Pin should be of 4 digits")}`)
      .required(`${i18n.t("Login Pin is required")}`),
    otherwise: Yup.string(),
  }),
});

const CreateUsers: PageType = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { userType } = useUserType();
  const router = useRouter();
  const { id, companyRef, companyName, origin } = router.query;
  const { canAccessModule } = useFeatureModuleManager();
  usePageView();

  const [showPermissions, setShowPermissions] = useState(false);
  const [country, setCountry] = useState("+966");
  const [showError, setShowError] = useState(false);
  const [, setLoad] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editDetails, setEditDetails] = useState(false);
  const [defaultPermission, setDefaultPermission] = useState([]);
  const [hideLocation, setHideLocation] = useState(false);

  const { changeTab, getTab } = useActiveTabs();

  const userIsAdmin =
    user.userType === USER_TYPES.ADMIN ||
    user.userType === USER_TYPES.SUPERADMIN;
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["user:update"]);
  const canCreate = canAccess(MoleculeType["user:create"]);

  const { findOne, create, updateEntity, entity, loading } = useEntity("user");
  const { findOne: findRole, entity: role } = useEntity("role");

  const handleChangeCountry = (event: any) => {
    setCountry(event.target.value);
  };

  const Component = TabContents["admin"];

  const handleTabsChange = (event: ChangeEvent<any>, value: string): void => {
    changeTab(value, Screens.rolesAndPermissions);
  };

  const initialValues: CreateUser = {
    // showLocation: true,
    editCredentials: false,
    loginPinValid: false,
    roleRef: "",
    role: "",
    permissions: [],
    isDefault: false,
    defaultPermissions: [],
    userType: "",
    location: "",
    locationRef: "",
    locations: [],
    locationRefs: [],
    assignedToAllLocation: false,
    profilePicture: "",
    email: "",
    fullName: "",
    phone: "",
    password: "",
    loginPin: "",
    confirmPassword: "",
    status: true,
  };

  const handleTabPermissionsChange = (permissions: Array<string>) => {
    formik.setFieldValue("permissions", [...permissions]);
  };

  const handlePOSLogin: any = (login: boolean) => {
    formik.setFieldValue("posLogin", login);
  };

  const handleDefault = () => {
    formik.setFieldValue("isDefault", true);
    formik.setFieldValue("permissions", formik.values.defaultPermissions);
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      setLoad(true);

      const data: any = {
        role: {
          name: values.role,
        },
        roleRef: values.roleRef,
        permissions: values.permissions,
        userType: values.userType,
        companyRef: companyRef,
        assignedToAllLocation: values.assignedToAllLocation || hideLocation,
        company: {
          name: companyName,
        },
        location: {
          name: values.locations?.[0],
        },
        locationRef: values.locationRefs?.[0],
        locations: values.locations.map((t) => {
          return {
            name: t,
          };
        }),
        locationRefs: values.locationRefs,
        name: values.fullName.trim(),
        email: values.email.trim(),
        profilePicture: values.profilePicture,
        phone: parsePhoneNumber(country, values.phone),
        pin: values.loginPin,
        status: values.status ? "active" : "inactive",
      };

      // if (values.showLocation) {
      //   data.location = {
      //     name: values.location,
      //   };
      //   data.locationRef = values.locationRef;
      // }

      if (values.editCredentials) {
        data.password = values.password;
      }

      try {
        if (id) {
          await updateEntity(id?.toString(), { ...data });
        } else {
          await create({ ...data });
        }

        toast.success(
          id != null
            ? t("User Details Updated").toString()
            : t("New User Created").toString()
        );
        if (origin == "company") {
          changeTab("users", Screens?.companyDetail);
        }
        router.back();
      } catch (err) {
        if (err?.error?.code === "duplicate_record") {
          if (err?.error?.field == "phone") {
            toast.error(t("Phone no already exist!"));
          } else if (err?.error?.field == "email") {
            toast.error(t("Email already exist!"));
          }
        } else {
          toast.error(t("Something went wrong"));
        }
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
    if (id != null && formik.values.roleRef) {
      findRole(formik.values.roleRef?.toString());
    }
  }, [id, formik.values.roleRef]);

  useEffect(() => {
    if (id) {
      formik.setFieldValue("editCredentials", false);
      formik.setFieldValue("loginPinValid", false);
      setEditDetails(false);
      return;
    } else {
      formik.setFieldValue("editCredentials", true);
      formik.setFieldValue("loginPinValid", true);
      setEditDetails(true);
      return;
    }
  }, [id]);

  useEffect(() => {
    if (id != null && role) {
      setDefaultPermission(role?.permissions);
    }
  }, [role, formik.values.permissions]);

  useEffect(() => {
    if (entity != null) {
      const phoneNumber = entity.phone
        ? entity.phone?.toString().split("-")[1]
        : "";

      setCountry(phoneNumber ? entity.phone?.toString().split("-")[0] : "+966");
      formik.setValues({
        location: entity?.location?.[0]?.name,
        locationRef: entity?.locationRef?.[0]?.name,
        locations: entity?.locations?.map((t: any) => t.name) || [],
        locationRefs: entity?.locationRefs || [entity?.locationRef] || [],
        profilePicture: entity?.profilePicture,
        userType: entity?.userType,
        role: entity?.role?.name,
        roleRef: entity?.roleRef,
        permissions: entity?.permissions,
        email: entity?.email,
        fullName: entity?.name,
        phone: phoneNumber,
        loginPin: entity?.pin,
        status: entity?.status == "active" ? true : false,
        assignedToAllLocation: entity?.assignedToAllLocation || false,
      });
    }
  }, [entity]);

  // useEffect(() => {
  //   if (formik.values.userType && formik.values.userType !== USER_TYPES.ADMIN) {
  //     formik.setFieldValue("showLocation", false);
  //     return;
  //   }
  //   formik.setFieldValue("showLocation", true);
  // }, [formik.values.userType, formik.values.roleRef]);

  useEffect(() => {
    if (formik.values.userType === "app:admin") {
      setHideLocation(true);
    }
  }, [formik.values]);

  console.log("::::", formik.values.locationRefs, entity);

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

  if (!canAccessModule("users")) {
    return <UpgradePackage />;
  }

  return (
    <>
      <Seo title={id ? `${t("Edit Users")}` : `${t("Create User")}`} />
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
              <Box sx={{ maxWidth: 50, cursor: "pointer" }}>
                <Link
                  color="textPrimary"
                  component="a"
                  sx={{
                    alignItems: "center",
                    display: "flex",
                  }}
                  onClick={() => {
                    if (origin == "company") {
                      changeTab("users", Screens?.companyDetail);
                    }
                    router.back();
                  }}
                >
                  <ArrowBackIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "#6B7280" }}
                  />
                  <Typography variant="subtitle2">{t("Users")}</Typography>
                </Link>
              </Box>

              <Typography variant="h4">
                {id != null ? t("Edit Users") : t("Create New User")}
              </Typography>
            </Stack>

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={3} sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">
                          {t("User Details")}
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

                        <Box
                          sx={{
                            alignItems: "center",
                            display: "flex",
                            mt: 3,
                          }}
                        >
                          <ProfileChooser
                            disabled={!editDetails}
                            imageUploadUrl={
                              formik.values.profilePicture != null &&
                              formik.values.profilePicture
                            }
                            onSuccess={(url: any) =>
                              formik.handleChange("profilePicture")(url)
                            }
                            namespace={
                              FileUploadNamespace["user-profile-images"]
                            }
                          />
                        </Box>
                        {showError && formik.errors.profilePicture && (
                          <Box sx={{ mt: 3 }}>
                            <FormHelperText error>
                              {formik.errors.profilePicture}
                            </FormHelperText>
                          </Box>
                        )}

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={!editDetails}
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            required
                            error={
                              !!(
                                formik.touched.fullName &&
                                formik.errors.fullName
                              )
                            }
                            fullWidth
                            helperText={
                              !!(
                                formik.touched.fullName &&
                                formik.errors.fullName
                              )
                            }
                            label={t("Full Name")}
                            name="fullName"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.fullName}
                          />
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={!editDetails}
                            required
                            error={
                              !!(formik.touched.email && formik.errors.email)
                            }
                            fullWidth
                            helperText={
                              formik.touched.email && formik.errors.email
                            }
                            label={t("Email Address")}
                            name="email"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            type="email"
                            value={formik.values.email}
                          />
                        </Box>

                        <Box sx={{ mt: 1.3 }}>
                          <PhoneInput
                            disabled={!editDetails}
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
                        <Box>
                          <Box sx={{ mt: 3 }}>
                            <RolesDropdown
                              disabled={!editDetails}
                              from={UserTypeEnum["app:admin"]}
                              required
                              error={
                                formik.touched.roleRef && formik.errors.roleRef
                              }
                              onChange={(id, name, permissions, userType) => {
                                if (userType === "app:admin") {
                                  setHideLocation(true);
                                } else {
                                  setHideLocation(false);
                                }
                                if (id) {
                                  setDefaultPermission(permissions);
                                  formik.setFieldValue("roleRef", id);
                                  formik.setFieldValue("role", name);
                                  formik.setFieldValue(
                                    "defaultPermissions",
                                    permissions
                                  );
                                  formik.setFieldValue(
                                    "permissions",
                                    permissions
                                  );
                                  formik.setFieldValue("userType", userType);
                                }
                                formik.setFieldValue(
                                  "assignedToAllLocation",
                                  false
                                );

                                formik.setFieldValue("locations", []);

                                formik.setFieldValue("locationRefs", []);
                              }}
                              selectedId={formik?.values?.roleRef || ""}
                              label={t("Roles")}
                              id="roleRef"
                            />
                            {id !== null && (
                              <small style={{ padding: 5, color: "grey" }}>
                                Note: customized permissions will be reset after
                                changing role.
                              </small>
                            )}
                          </Box>
                          {!hideLocation && (
                            <Box sx={{ mt: 3 }}>
                              <LocationMultiSelect
                                disabled={!editDetails}
                                showAllLocation={
                                  formik.values.assignedToAllLocation
                                }
                                showAll={
                                  formik.values?.role?.toLowerCase() !==
                                    "cashier" &&
                                  formik.values?.role?.toLowerCase() !==
                                    "manager"
                                }
                                companyRef={companyRef}
                                required
                                error={
                                  formik?.touched?.locationRefs &&
                                  formik?.errors?.locationRefs
                                }
                                selectedIds={formik.values.locationRefs}
                                onChange={(selected, total) => {
                                  const names = selected?.map(
                                    (sel: any) => sel?.name?.en
                                  );
                                  const ids = selected?.map(
                                    (sel: any) => sel?._id
                                  );
                                  if (ids.length === total) {
                                    formik.setFieldValue(
                                      "assignedToAllLocation",
                                      true
                                    );
                                  } else {
                                    formik.setFieldValue(
                                      "assignedToAllLocation",
                                      false
                                    );
                                  }
                                  formik.setFieldValue("locations", [...names]);

                                  formik.setFieldValue("locationRefs", [
                                    ...ids,
                                  ]);
                                }}
                                label={t("Locations")}
                                id="locationRefs"
                              />
                            </Box>
                          )}
                        </Box>
                        {formik?.values?.permissions?.length > 0 &&
                          editDetails &&
                          user?._id != id && (
                            <Box
                              sx={{
                                mt: 3,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                              }}
                            >
                              <Button
                                onClick={() => {
                                  if (!showPermissions) {
                                    setShowPermissions(true);
                                  } else {
                                    setShowPermissions(false);
                                  }
                                }}
                              >
                                {!showPermissions
                                  ? t("Edit Permissions")
                                  : t("Hide permissions")}
                              </Button>
                            </Box>
                          )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {showPermissions && (
                  <Box>
                    <Tabs
                      indicatorColor="primary"
                      onChange={handleTabsChange}
                      scrollButtons="auto"
                      textColor="primary"
                      value={getTab(Screens.rolesAndPermissions)}
                      variant="scrollable"
                    >
                      {tabs.map((tab) => (
                        <Tab
                          key={tab.value}
                          label={tab.label}
                          value={tab.value}
                        />
                      ))}
                    </Tabs>
                    <Box sx={{ width: "100%" }}>
                      <PermissionContext.Provider
                        value={{
                          permissions: formik.values.permissions,
                          tabChange: (tab: any) => handleTabsChange(null, tab),
                        }}
                      >
                        <Component
                          from={"user"}
                          showDefault={true}
                          isDefault={formik.values.isDefault}
                          handleDefault={handleDefault}
                          selectedTab={getTab(Screens.rolesAndPermissions)}
                          handlePermissionChange={handleTabPermissionsChange}
                          permissionsList={formik.values.permissions}
                          handlePOSLogin={handlePOSLogin}
                          selectedRolePermission={defaultPermission}
                        />
                      </PermissionContext.Provider>
                    </Box>
                  </Box>
                )}

                <Box
                  sx={{
                    display: !id ? "none" : "flex",
                    alignItems: "center",
                    justifyContent: "right",
                  }}
                >
                  <Button
                    onClick={() => {
                      if (id != null && !canUpdate) {
                        return toast.error(t("You don't have access"));
                      }
                      if (editDetails) {
                        return setEditDetails(false);
                      }
                      setEditDetails(true);
                    }}
                  >
                    {editDetails ? t("Cancel") : t("Edit")}
                  </Button>
                </Box>

                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">{t("Credentials")}</Typography>
                      </Grid>
                      <Grid item md={8} xs={12}>
                        <Box>
                          <TextField
                            disabled={!formik.values.editCredentials}
                            required
                            fullWidth
                            error={
                              (formik.touched.password &&
                                formik.errors.password) as any
                            }
                            helperText={
                              formik.touched.password && formik.errors.password
                            }
                            label={t("Web Password")}
                            name="password"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            type={showPassword ? "text" : "password"}
                            value={
                              formik.values.editCredentials
                                ? formik.values.password || ""
                                : "00000000"
                            }
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                    onMouseDown={() =>
                                      setShowPassword(!showPassword)
                                    }
                                  >
                                    {!showPassword ? (
                                      <Visibility />
                                    ) : (
                                      <VisibilityOff />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Box>
                        <Box
                          sx={{
                            mt: 3,
                            display: !formik.values.editCredentials
                              ? "none"
                              : "flex",
                          }}
                        >
                          <TextField
                            disabled={!formik.values.editCredentials}
                            required
                            fullWidth
                            error={
                              (formik.touched.confirmPassword &&
                                formik.errors.confirmPassword) as any
                            }
                            helperText={
                              formik.touched.confirmPassword &&
                              formik.errors.confirmPassword
                            }
                            label={t("Confirm Web Password")}
                            name="confirmPassword"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            type={showConfirmPassword ? "text" : "password"}
                            value={formik.values.confirmPassword}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={() =>
                                      setShowConfirmPassword(
                                        !showConfirmPassword
                                      )
                                    }
                                    onMouseDown={() =>
                                      setShowConfirmPassword(
                                        !showConfirmPassword
                                      )
                                    }
                                  >
                                    {!showConfirmPassword ? (
                                      <Visibility />
                                    ) : (
                                      <VisibilityOff />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextField
                            type={id != null ? "password" : "text"}
                            required
                            error={Boolean(
                              formik.touched.loginPin && formik.errors.loginPin
                            )}
                            helperText={
                              (formik.touched.loginPin &&
                                formik.errors.loginPin) as any
                            }
                            fullWidth
                            label={t("POS Pin")}
                            name="loginPin"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={id != null ? "0000" : formik.values.loginPin}
                            disabled={id != null}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                <Box
                  sx={{
                    display: !id ? "none" : "flex",
                    alignItems: "center",
                    justifyContent: "right",
                  }}
                >
                  <Button
                    onClick={() => {
                      if (id != null && !canUpdate) {
                        return toast.error(t("You don't have access"));
                      }
                      if (formik.values.editCredentials) {
                        formik.setFieldValue("editCredentials", false);
                        return;
                      }
                      formik.setFieldValue("editCredentials", true);
                    }}
                  >
                    {formik.values.editCredentials ? t("Cancel") : t("Edit")}
                  </Button>
                </Box>

                {id != null && (
                  <Card>
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={8}>
                          <Stack spacing={1}>
                            <Typography variant="h6">{t("Status")}</Typography>
                            <Typography color="text.secondary" variant="body2">
                              {t("Change the status of the User")}
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
                                disabled={user._id === entity?._id}
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
                  <Button
                    color="inherit"
                    onClick={() => {
                      if (origin == "company") {
                        changeTab("users", Screens?.companyDetail);
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

CreateUsers.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default CreateUsers;
