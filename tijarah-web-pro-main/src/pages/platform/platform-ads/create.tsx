import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControlLabel,
  Grid,
  Link,
  MenuItem,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ConfirmationDialog from "src/components/confirmation-dialog";
import BusinessTypeMultiSelect from "src/components/input/business-type-multiSelect";
import CompanyMultiSelect from "src/components/input/company-multiselect";
import LocationMultiSelect from "src/components/input/location-multiSelect";
import AdsList from "src/components/platform/ads/ads-list";
import AddSlidesModal from "src/components/platform/ads/create-ad-modal";
import { RouterLink } from "src/components/router-link";
import { Seo } from "src/components/seo";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import i18n from "src/i18n";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import { USER_TYPES } from "src/utils/constants";
import * as Yup from "yup";

const daysOfWeekOptions = [
  {
    label: i18n.t("Weekdays"),
    value: "weekdays",
  },
  {
    label: i18n.t("Weekend"),
    value: "weekend",
  },
  // {
  //   label: i18n.t("Everyday"),
  //   value: "everyday",
  // },
];

interface CreateAdsProps {
  assignedToAllBusinessTypes?: boolean;
  assignedToAllCompanies?: boolean;
  assignedToAllLocations?: boolean;
  excludedBusinessTypeRefs?: string[];
  includedBusinessTypeRefs?: string[];
  excludedLocationRefs?: string[];
  includedLocationRefs?: string[];
  excludedCompanyRefs?: string[];
  includedCompanyRefs?: string[];
  daysOfWeek: string;
  adNameEn: string;
  adNameAr: string;
  startDate: Date;
  endDate: Date;
  fixed: boolean;
  dynamic: boolean;
  slidesData: any[];
  type: string;
  status: string;
}

const initialValues: CreateAdsProps = {
  assignedToAllBusinessTypes: true,
  assignedToAllCompanies: true,
  assignedToAllLocations: true,
  excludedBusinessTypeRefs: [],
  includedBusinessTypeRefs: [],
  excludedCompanyRefs: [],
  includedCompanyRefs: [],
  excludedLocationRefs: [],
  includedLocationRefs: [],
  daysOfWeek: "weekdays",
  adNameEn: "",
  adNameAr: "",
  startDate: null,
  endDate: null,
  fixed: true,
  dynamic: false,
  slidesData: [],
  type: "",
  status: "",
};

const validationSchema = Yup.object({
  adNameEn: Yup.string()
    .matches(
      /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
      i18n.t("Enter valid business type")
    )
    .required(i18n.t("Name (English) is required"))
    .max(60, i18n.t("Name must not be greater than 60 characters")),
  adNameAr: Yup.string()
    .matches(
      /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
      i18n.t("Enter valid business type")
    )
    .required(i18n.t("Name (Arabic) is required"))
    .max(60, i18n.t("Name must not be greater than 60 characters")),

  startDate: Yup.date().required(i18n.t("Start Date is required")).nullable(),
  endDate: Yup.date().required(i18n.t("End Date is required")).nullable(),
});

const Page: PageType = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { userType } = useUserType();
  const { user } = useAuth();
  const { id, role } = router.query;
  usePageView();
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);
  const [open, setOpen] = useState(false);
  const [slidesDataIndex, setSlidesDataIndex] = useState(-1);
  const [showDialogDeleteItem, setShowDialogDeleteItem] = useState(false);
  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["ads:update"]);
  const canCreate = canAccess(MoleculeType["ads:create"]);

  const { findOne, create, updateEntity, deleteEntity, entity } =
    useEntity("ads-management");

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const fromDate = new Date(values.startDate);
      fromDate.setHours(0, 0, 0, 0);

      const toDate = new Date(values.endDate);
      toDate.setHours(23, 59, 0, 0);

      try {
        console.log(user?.company?._id);

        const data = {
          sentToPos: false,
          createdByName:
            userType === USER_TYPES.SUPERADMIN ? "" : user?.company?.name?.en,
          createdByRole:
            userType === USER_TYPES.SUPERADMIN ? "super-admin" : "merchant",
          createdByRef:
            userType === USER_TYPES.SUPERADMIN ? null : user?.company?._id,
          name: {
            en: values.adNameEn,
            ar: values.adNameAr,
          },
          type: "dynamic",
          locationRefs:
            userType != USER_TYPES.SUPERADMIN
              ? values.assignedToAllLocations
                ? []
                : values.includedLocationRefs
              : [],
          excludedLocationRefs:
            userType != USER_TYPES.SUPERADMIN
              ? values.excludedLocationRefs
              : [],
          companyRefs:
            userType != USER_TYPES.SUPERADMIN
              ? [user.company._id]
              : values.assignedToAllCompanies
              ? []
              : values.includedCompanyRefs,
          excludedCompanyRefs:
            userType != USER_TYPES.SUPERADMIN ? [] : values.excludedCompanyRefs,
          businessTypeRefs:
            userType != USER_TYPES.SUPERADMIN
              ? [user.company.businessTypeRef]
              : formik.values.assignedToAllBusinessTypes
              ? []
              : values.includedBusinessTypeRefs,
          excludedBusinessTypeRefs:
            userType != USER_TYPES.SUPERADMIN
              ? []
              : values.excludedBusinessTypeRefs,
          status: id != null ? values.status : "ongoing",
          daysOfWeek: values.daysOfWeek,
          dateRange: {
            from: fromDate,
            to: toDate,
          },
          slidesData: values?.slidesData?.map((slides) => {
            const obj: any = {
              contentType: slides.contentType,
              duration: slides.duration,
              imageUrl: slides.imageUrl || "",
              videoUrl: slides.videoUrl || slides.link || "",
              displayBrandLogo: slides.displayBrandLogo || false,
              desciption: slides.desciption || "",
              icon: slides.icon || "",
              qrImage: slides.qrImage || "",
              mute: slides.mute || false,
            };

            if (
              slides?.heading?.en?.length > 0 &&
              slides?.heading?.ar?.length > 0
            ) {
              obj["heading"] = {
                en: slides?.heading?.en || "",
                ar: slides?.heading?.ar || "",
              };
            }
            return obj;
          }),
        };

        if (id) {
          await updateEntity(id?.toString(), { ...data });
        } else {
          await create({ ...data });
        }

        toast.success(
          id != null ? t("Ad Updated").toString() : t("Ad Created").toString()
        );

        router.push(tijarahPaths?.platform?.adsManagement?.index);
      } catch (err) {
        toast.error(err.message);
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

  const handleSaveSlides = (slidesData?: any) => {
    let data: any = formik.values.slidesData;

    if (slidesDataIndex == -1) {
      data = [...data, { ...slidesData, _id: data?.length }];
    } else {
      data?.splice(slidesDataIndex, 1, { ...slidesData, _id: slidesDataIndex });
    }

    formik?.setFieldValue("slidesData", data);

    setOpen(false);
  };

  const handleDragEnd = (e: any) => {
    if (!e.destination) return;
    let tempData = Array.from(formik?.values?.slidesData);
    let [source_data] = tempData.splice(e.source.index, 1);
    tempData.splice(e.destination.index, 0, source_data);

    formik.setFieldValue("slidesData", tempData);
  };

  useEffect(() => {
    if (id != null) {
      formik.setValues({
        excludedBusinessTypeRefs: entity?.excludedBusinessTypeRefs || [],
        includedBusinessTypeRefs: entity?.businessTypeRefs || [],
        excludedLocationRefs: entity?.excludedLocationRefs || [],
        includedLocationRefs: entity?.locationRefs || [],
        excludedCompanyRefs: entity?.excludedCompanyRefs || [],
        includedCompanyRefs: entity?.companyRefs || [],
        daysOfWeek: entity?.daysOfWeek,
        adNameEn: entity?.name?.en,
        adNameAr: entity?.name?.ar,
        startDate: entity?.dateRange?.from,
        endDate: entity?.dateRange?.to,
        fixed: entity?.type === "fixed",
        dynamic: entity?.type === "dynamic",
        slidesData: entity?.slidesData,
        type: entity?.type,
        assignedToAllCompanies: entity?.companyRefs?.length <= 0 ? true : false,
        assignedToAllLocations:
          entity?.locationRefs?.length <= 0 ? true : false,
        assignedToAllBusinessTypes:
          entity?.businessTypeRefs?.length <= 0 ? true : false,
        status: entity?.status,
      });
    }
  }, [entity]);

  useEffect(() => {
    if (!id) {
      if (formik.values.assignedToAllBusinessTypes) {
        formik.setFieldValue("includedBusinessTypeRefs", []);
      }
      if (formik.values.assignedToAllCompanies) {
        formik.setFieldValue("includedCompanyRefs", []);
      }
      if (formik.values.assignedToAllLocations) {
        formik.setFieldValue("includedLocationRefs", []);
      }
    }
  }, []);

  useEffect(() => {
    if (id != null) {
      findOne(id?.toString());
    }
  }, [id]);

  if (!canAccess(MoleculeType["ads:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo
        title={
          id != null
            ? `${t("Edit Platform Ads")}`
            : `${t("Create Platform Ads")}`
        }
      />
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
              <Box sx={{ cursor: "pointer", maxWidth: "15%" }}>
                <Link
                  color="textPrimary"
                  component="a"
                  sx={{
                    alignItems: "center",
                    display: "flex",
                  }}
                  onClick={() => {
                    router.push({
                      pathname: tijarahPaths.platform.adsManagement.index,
                    });
                  }}
                >
                  <ArrowBackIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "#6B7280" }}
                  />
                  <Typography variant="subtitle2">
                    {t("Ads Manangement")}
                  </Typography>
                </Link>
              </Box>
              <Typography variant="h4">
                {id != null ? t("Edit Platform Ads") : t("Create Platform Ads")}
              </Typography>
            </Stack>

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4} sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">{t("Ads Details")}</Typography>
                      </Grid>
                      <Grid item md={8} xs={12}>
                        <Box sx={{ mt: 2 }}>
                          <TextFieldWrapper
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            autoComplete="off"
                            fullWidth
                            label={t("Ad Name (English)")}
                            name="adNameEn"
                            error={Boolean(
                              formik.touched.adNameEn && formik.errors.adNameEn
                            )}
                            helperText={
                              (formik.touched.adNameEn &&
                                formik.errors.adNameEn) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            required
                            value={formik.values.adNameEn}
                          />
                        </Box>
                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            fullWidth
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            autoComplete="off"
                            label={t("Ad Name (Arabic)")}
                            name="adNameAr"
                            error={Boolean(
                              formik.touched.adNameAr && formik.errors.adNameAr
                            )}
                            helperText={
                              (formik.touched.adNameAr &&
                                formik.errors.adNameAr) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            required
                            value={formik.values.adNameAr}
                          />
                        </Box>

                        {/* <Box sx={{ mt: 2 }}>
                          <FormControlLabel
                            onClick={() => {
                              formik.setFieldValue("fixed", true);
                              formik.setFieldValue("dynamic", false);
                            }}
                            control={
                              <Radio
                                checked={formik.values.fixed}
                                value={formik.values.fixed}
                              />
                            }
                            label={t("Fixed")}
                            sx={{
                              flexGrow: 1,
                              mr: 0,
                            }}
                          />

                          <FormControlLabel
                            onClick={() => {
                              formik.setFieldValue("dynamic", true);
                              formik.setFieldValue("fixed", false);
                            }}
                            control={
                              <Radio
                                checked={formik.values.dynamic}
                                value={formik.values.dynamic}
                              />
                            }
                            label={t("Dynamic")}
                            sx={{
                              flexGrow: 1,
                              mr: 0,
                              mx: 2,
                            }}
                          />
                        </Box> */}

                        <Grid
                          sx={{
                            display: "flex",
                            mt: 3,
                          }}
                        >
                          <Box>
                            <DatePicker
                              // @ts-ignore
                              inputProps={{ disabled: true }}
                              minDateTime={new Date()}
                              label={t("Starts Date")}
                              inputFormat="dd/MM/yyyy"
                              disablePast
                              onChange={(date) => {
                                formik.setFieldValue("startDate", date);
                                formik.setFieldValue("endDate", null);
                              }}
                              value={formik.values.startDate}
                              renderInput={(params) => (
                                <TextFieldWrapper
                                  {...params}
                                  fullWidth
                                  required
                                  name="startDate"
                                  error={Boolean(
                                    formik.touched.startDate &&
                                      formik.errors.startDate
                                  )}
                                  helperText={
                                    (formik.touched.startDate &&
                                      formik.errors.startDate) as any
                                  }
                                  onBlur={formik.handleBlur}
                                  onClick={() => {
                                    setOpenStartDate(!openStartDate);
                                  }}
                                />
                              )}
                            />
                          </Box>

                          <Box sx={{ mx: 2 }}>
                            <DatePicker
                              // @ts-ignore
                              inputProps={{ disabled: true }}
                              minDateTime={formik.values.startDate}
                              label={t("End Date")}
                              inputFormat="dd/MM/yyyy"
                              disablePast
                              onChange={(date) => {
                                formik.setFieldValue("endDate", date);
                              }}
                              value={formik.values.endDate}
                              renderInput={(params) => (
                                <TextFieldWrapper
                                  {...params}
                                  fullWidth
                                  required
                                  name="endDate"
                                  error={Boolean(
                                    formik.touched.endDate &&
                                      formik.errors.endDate
                                  )}
                                  helperText={
                                    (formik.touched.endDate &&
                                      formik.errors.endDate) as any
                                  }
                                  onBlur={formik.handleBlur}
                                  onClick={() => {
                                    setOpenEndDate(!openEndDate);
                                  }}
                                />
                              )}
                            />
                          </Box>
                        </Grid>

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            fullWidth
                            label={t("Days of week")}
                            name="daysOfWeek"
                            select
                            value={formik.values.daysOfWeek}
                            onChange={formik.handleChange}
                            required
                          >
                            {daysOfWeekOptions.map((type) => (
                              <MenuItem key={type.value} value={type.value}>
                                {type.label}
                              </MenuItem>
                            ))}
                          </TextFieldWrapper>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">
                          {t("Ad Inclusion Settings")}
                        </Typography>
                      </Grid>
                      <Grid item md={8} xs={12}>
                        {userType == USER_TYPES.SUPERADMIN && (
                          <Box sx={{ mt: 3 }}>
                            <BusinessTypeMultiSelect
                              showAllBusinessTypes={
                                formik.values.assignedToAllBusinessTypes
                              }
                              selectedIds={
                                formik?.values?.includedBusinessTypeRefs as any
                              }
                              required
                              id={"business-multi-select"}
                              error={
                                formik?.touched?.includedBusinessTypeRefs &&
                                formik.errors.includedBusinessTypeRefs
                              }
                              onChange={(option: any, total: number) => {
                                if (option?.length > 0) {
                                  const ids = option?.map((option: any) => {
                                    return option._id;
                                  });

                                  const names = option?.map((option: any) => {
                                    return option.name.en;
                                  });

                                  if (ids.length == total) {
                                    formik.setFieldValue(
                                      "assignedToAllBusinessTypes",
                                      true
                                    );
                                  } else {
                                    formik.setFieldValue(
                                      "assignedToAllBusinessTypes",
                                      false
                                    );
                                    formik.setFieldValue(
                                      "excludedBusinessTypeRefs",
                                      []
                                    );
                                  }

                                  formik.setFieldValue(
                                    "includedBusinessTypeRefs",
                                    ids
                                  );
                                  formik.setFieldValue(
                                    "includedBusinessTypes",
                                    names
                                  );
                                } else {
                                  formik.setFieldValue(
                                    "includedBusinessTypeRefs",
                                    []
                                  );
                                  formik.setFieldValue(
                                    "includedBusinessTypes",
                                    []
                                  );
                                  formik.setFieldValue(
                                    "assignedToAllBusinessTypes",
                                    false
                                  );
                                }
                              }}
                            />
                          </Box>
                        )}
                        {userType == USER_TYPES.SUPERADMIN && (
                          <Box sx={{ mt: 2 }}>
                            <CompanyMultiSelect
                              showAllCompanies={
                                formik.values.assignedToAllCompanies
                              }
                              businessTypeRefs={
                                formik.values.includedBusinessTypeRefs
                                  ? formik.values.includedBusinessTypeRefs
                                  : []
                              }
                              error={
                                formik?.touched?.includedCompanyRefs &&
                                formik.errors.includedCompanyRefs
                              }
                              selectedIds={
                                formik?.values?.includedCompanyRefs as any
                              }
                              required
                              id={"company-multi-select"}
                              onChange={(option: any, total: number) => {
                                if (option?.length > 0) {
                                  const ids = option?.map((option: any) => {
                                    return option._id;
                                  });

                                  const names = option?.map((option: any) => {
                                    return option.name.en;
                                  });

                                  if (ids.length == total) {
                                    formik.setFieldValue(
                                      "assignedToAllCompanies",
                                      true
                                    );
                                  } else {
                                    formik.setFieldValue(
                                      "assignedToAllCompanies",
                                      false
                                    );
                                    formik.setFieldValue(
                                      "excludedCompanyRefs",
                                      []
                                    );
                                  }

                                  formik.setFieldValue(
                                    "includedCompanyRefs",
                                    ids
                                  );
                                  formik.setFieldValue(
                                    "includedCompanies",
                                    names
                                  );
                                } else {
                                  formik.setFieldValue(
                                    "includedCompanyRefs",
                                    []
                                  );
                                  formik.setFieldValue("includedCompanies", []);
                                  formik.setFieldValue(
                                    "assignedToAllCompanies",
                                    false
                                  );
                                }
                              }}
                            />
                          </Box>
                        )}
                        {userType != USER_TYPES.SUPERADMIN && (
                          <Box sx={{ mt: 2 }}>
                            <LocationMultiSelect
                              showAllLocation={
                                formik.values.assignedToAllLocations
                              }
                              companyRef={user?.company?._id}
                              selectedIds={formik.values.includedLocationRefs}
                              required
                              id={"locations"}
                              error={
                                formik.touched.includedLocationRefs &&
                                formik.errors.includedLocationRefs
                              }
                              onChange={(option: any, total: number) => {
                                if (option?.length > 0) {
                                  const ids = option.map((option: any) => {
                                    return option._id;
                                  });

                                  const names = option.map((option: any) => {
                                    return option.name.en;
                                  });

                                  if (ids.length == total) {
                                    formik.setFieldValue(
                                      "assignedToAllLocations",
                                      true
                                    );
                                  } else {
                                    formik.setFieldValue(
                                      "assignedToAllLocations",
                                      false
                                    );
                                  }

                                  formik.setFieldValue(
                                    "includedLocationRefs",
                                    ids
                                  );
                                } else {
                                  formik.setFieldValue(
                                    "includedLocationRefs",
                                    []
                                  );

                                  formik.setFieldValue(
                                    "assignedToAllLocations",
                                    false
                                  );
                                }
                              }}
                            />
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {(formik.values.assignedToAllBusinessTypes ||
                  formik.values.assignedToAllCompanies ||
                  (userType !== USER_TYPES.SUPERADMIN &&
                    formik.values.assignedToAllLocations)) && (
                  <Card>
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <Typography variant="h6">
                            {t("Ad Exclusion Settings")}
                          </Typography>
                        </Grid>
                        <Grid item md={8} xs={12}>
                          {userType === USER_TYPES.SUPERADMIN &&
                            formik.values.assignedToAllBusinessTypes && (
                              <Box sx={{ mt: 3 }}>
                                <BusinessTypeMultiSelect
                                  dontShowAll={true}
                                  error={
                                    formik?.touched?.excludedBusinessTypeRefs &&
                                    formik.errors.excludedBusinessTypeRefs
                                  }
                                  selectedIds={
                                    formik?.values
                                      ?.excludedBusinessTypeRefs as any
                                  }
                                  id={"business-multi-select"}
                                  onChange={(option: any) => {
                                    if (option?.length > 0) {
                                      const ids = option?.map((option: any) => {
                                        return option._id;
                                      });

                                      const names = option?.map(
                                        (option: any) => {
                                          return option.name.en;
                                        }
                                      );

                                      formik.setFieldValue(
                                        "excludedBusinessTypeRefs",
                                        ids
                                      );
                                      formik.setFieldValue(
                                        "excludedBusinessTypes",
                                        names
                                      );
                                    } else {
                                      formik.setFieldValue(
                                        "excludedBusinessTypeRefs",
                                        []
                                      );
                                      formik.setFieldValue(
                                        "excludedBusinessTypes",
                                        []
                                      );
                                    }
                                  }}
                                />
                              </Box>
                            )}

                          {userType === USER_TYPES.SUPERADMIN &&
                            formik.values.assignedToAllCompanies && (
                              <Box sx={{ mt: 2 }}>
                                <CompanyMultiSelect
                                  dontShowAll={true}
                                  businessTypeRefs={
                                    formik.values.includedBusinessTypeRefs
                                      ? formik.values.includedBusinessTypeRefs
                                      : []
                                  }
                                  selectedIds={
                                    formik?.values?.excludedCompanyRefs as any
                                  }
                                  id={"company-multi-select"}
                                  error={
                                    formik?.touched?.excludedCompanyRefs &&
                                    formik.errors.excludedCompanyRefs
                                  }
                                  onChange={(option: any, total: number) => {
                                    formik.setFieldValue(
                                      "excludedCompanyRefs",
                                      option
                                    );

                                    if (option?.length > 0) {
                                      const ids = option?.map((option: any) => {
                                        return option._id;
                                      });

                                      const names = option?.map(
                                        (option: any) => {
                                          return option.name.en;
                                        }
                                      );

                                      formik.setFieldValue(
                                        "excludedCompanyRefs",
                                        ids
                                      );
                                      formik.setFieldValue(
                                        "excludedCompanies",
                                        names
                                      );
                                    } else {
                                      formik.setFieldValue(
                                        "excludedCompanyRefs",
                                        []
                                      );
                                      formik.setFieldValue(
                                        "excludedCompanies",
                                        []
                                      );
                                    }
                                  }}
                                />
                              </Box>
                            )}

                          {userType != USER_TYPES.SUPERADMIN &&
                            formik.values.assignedToAllLocations && (
                              <Box sx={{ mt: 2 }}>
                                <LocationMultiSelect
                                  showAll={false}
                                  companyRef={user?.company?._id}
                                  selectedIds={
                                    formik.values.excludedLocationRefs
                                  }
                                  id={"locations"}
                                  error={
                                    formik.touched.excludedLocationRefs &&
                                    formik.errors.excludedLocationRefs
                                  }
                                  onChange={(option: any, total: number) => {
                                    formik.setFieldValue(
                                      "selectedLocations",
                                      option
                                    );
                                    if (option?.length > 0) {
                                      const ids = option.map((option: any) => {
                                        return option._id;
                                      });

                                      const names = option.map(
                                        (option: any) => {
                                          return option.name.en;
                                        }
                                      );

                                      // if (ids.length == total) {
                                      //   formik.setFieldValue("assignedToAll", true);
                                      // } else {
                                      //   formik.setFieldValue("assignedToAll", false);
                                      // }

                                      formik.setFieldValue(
                                        "excludedLocationRefs",
                                        ids
                                      );
                                      // formik.setFieldValue("locations", names);
                                    } else {
                                      formik.setFieldValue(
                                        "excludedLocationRefs",
                                        []
                                      );
                                      // formik.setFieldValue("locations", []);
                                      // formik.setFieldValue("assignedToAll", false);
                                    }
                                  }}
                                />
                              </Box>
                            )}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                        mt: -2,
                      }}
                    >
                      <Stack spacing={1}>
                        <Typography variant="h6">{t("Add Slides")}</Typography>
                        <Typography color="text.secondary" variant="body2">
                          {t("You can add upto 5 variants here")}
                        </Typography>
                      </Stack>
                      <Button
                        onClick={() => {
                          if (id != null && !canUpdate) {
                            return toast.error(t("You don't have access"));
                          } else if (!id && !canCreate) {
                            return toast.error(t("You don't have access"));
                          }
                          if (
                            formik?.values?.slidesData?.length >= 0 &&
                            formik?.values?.slidesData?.length < 5
                          ) {
                            setSlidesDataIndex(-1);
                            setOpen(true);
                          }
                        }}
                      >
                        {t("Add")}
                      </Button>
                    </Box>
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <AdsList
                        slidesData={formik.values.slidesData}
                        handleEdit={(index: number) => {
                          if (id != null && !canUpdate) {
                            return toast.error(t("You don't have access"));
                          } else if (!id && !canCreate) {
                            return toast.error(t("You don't have access"));
                          }
                          setSlidesDataIndex(index);
                          setOpen(true);
                        }}
                        handleDelete={(index: number) => {
                          if (id != null && !canUpdate) {
                            return toast.error(t("You don't have access"));
                          }
                          formik.values.slidesData?.splice(index, 1);

                          formik?.setFieldValue(
                            "slidesData",
                            formik.values.slidesData
                          );
                        }}
                      />
                    </DragDropContext>
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
                              {t("Change the status of the Ad")}
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
                                  formik.values.status == "ongoing"
                                    ? true
                                    : false
                                }
                                color="primary"
                                edge="end"
                                name="status"
                                onChange={() => {
                                  if (id != null && !canUpdate) {
                                    return toast.error(
                                      t("You don't have access")
                                    );
                                  }
                                  if (formik.values.status == "ongoing") {
                                    formik.setFieldValue("status", "paused");
                                  } else {
                                    formik.setFieldValue("status", "ongoing");
                                  }
                                }}
                                sx={{
                                  mr: 0.2,
                                }}
                              />
                            }
                            label={
                              formik.values.status == "ongoing"
                                ? t("Ongoing")
                                : formik.values.status == "paused"
                                ? t("Paused")
                                : t("Completed")
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
                  {/* {id && (
                    <LoadingButton
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        setShowDialogDeleteItem(true);
                      }}
                      sx={{ ml: 1 }}
                    >
                      {t("Delete")}
                    </LoadingButton>
                  )} */}

                  {/* {Boolean(!id) && ( */}
                  <Button
                    color="inherit"
                    component={RouterLink}
                    href={tijarahPaths.platform.adsManagement.index}
                  >
                    {t("Cancel")}
                  </Button>
                  {/* )} */}
                  <Box>
                    {/* {id && (
                      <Button
                        color="inherit"
                        component={RouterLink}
                        href={tijarahPaths.platform.adsManagement.index}
                      >
                        {t("Cancel")}
                      </Button>
                    )} */}

                    <LoadingButton
                      disabled={
                        userType === USER_TYPES.SUPERADMIN &&
                        role === "merchant"
                      }
                      onClick={() => {
                        if (id != null && !canUpdate) {
                          return toast.error(t("You don't have access"));
                        } else if (!id && !canCreate) {
                          return toast.error(t("You don't have access"));
                        }
                        if (formik.values.slidesData?.length <= 0) {
                          return toast.error(
                            t("Add atleast one slide to create an Ad.")
                          );
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

            <AddSlidesModal
              handleAddSlides={(data: any) => {
                handleSaveSlides(data);
              }}
              modalData={formik?.values?.slidesData?.[slidesDataIndex]}
              open={open}
              setOpen={(val: any) => {
                setOpen(val);
              }}
            />
          </Stack>
        </Container>
      </Box>
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

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
