import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteOutlineTwoToneIcon from "@mui/icons-material/DeleteOutlineTwoTone";
import ReorderRoundedIcon from "@mui/icons-material/ReorderRounded";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControlLabel,
  Grid,
  IconButton,
  Link,
  Stack,
  SvgIcon,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Edit02Icon from "@untitled-ui/icons-react/build/esm/Edit02";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  DraggableStateSnapshot,
  Droppable,
} from "react-beautiful-dnd";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ConfirmationDialog from "src/components/confirmation-dialog";
import CompanyDropdown from "src/components/input/company-auto-complete";
import { CreateModifierModal } from "src/components/modals/create-modiifer-modal";
import { Seo } from "src/components/seo";
import TextFieldWrapper from "src/components/text-field-wrapper";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import { USER_TYPES } from "src/utils/constants";
import { Screens } from "src/utils/screens-names";
import { toFixedNumber } from "src/utils/toFixedNumber";
import useActiveTabs from "src/utils/use-active-tabs";
import * as Yup from "yup";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import UpgradePackage from "src/pages/upgrade-package";
import { useCurrency } from "src/utils/useCurrency";
interface ModifierOptions {
  name: string;
  contains: string;
  kitchenName: string;
  price: number;
  taxRef: string;
  tax: { percentage: number };
  status: string;
}

interface ModifierCreateProps {
  name: string;
  displayName: string;
  modifierOptions: ModifierOptions[];
  status: boolean;
}

const containsName: any = {
  veg: "Veg",
  "non-veg": "Non-Veg",
  egg: "Egg",
};

const Page: PageType = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { userType } = useUserType();
  const { changeTab } = useActiveTabs();
  const { id, companyRef, companyName, origin } = router.query;
  const { canAccessModule } = useFeatureModuleManager();
  usePageView();

  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["modifier:update"]);
  const canCreate = canAccess(MoleculeType["modifier:create"]);
  const currency = useCurrency();

  const { findOne, create, updateEntity, deleteEntity, entity, loading } =
    useEntity("modifier");

  const [, setShowError] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [modifierOptionId, setModifierOptionId] = useState(-1);
  const [openModifierOptionModal, setOpenModifierOptionModal] = useState(false);
  const [showDialogModifierEvent, setShowDialogModifierEvent] = useState(false);

  const initialValues: ModifierCreateProps = {
    name: "",
    displayName: "",
    modifierOptions: [],
    status: true,
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid modifier name")
      )
      .required(`${t("Modifier Name is required")}`)
      .max(30, t("Modifier name must not be greater than 30 characters")),
    displayName: Yup.string()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid display name")
      )
      .required(`${t("Display Name is required")}`)
      .max(30, t("Display name must not be greater than 30 characters")),
  });

  const formik: any = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      if (values.modifierOptions?.length === 0) {
        toast.error(t("Add atleast one modifier option"));
        return;
      }

      const data = {
        name: values.name,
        displayName: values.displayName,
        companyRef: companyRef,
        company: { name: companyName },
        values: values.modifierOptions,
        status: values.status ? "active" : "inactive",
      };

      try {
        if (id) {
          await updateEntity(id?.toString(), { ...data });
        } else {
          await create({ ...data });
        }

        toast.success(
          id == null ? t("Modifier Created") : t("Modifier Updated")
        );
        formik.resetForm();
        if (origin == "company") {
          changeTab("catalogue", Screens?.companyDetail);
        }
        router.back();
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    let tempData = Array.from(formik?.values?.modifierOptions);
    let [source_data] = tempData.splice(result.source.index, 1);
    tempData.splice(result.destination.index, 0, source_data);

    formik.setFieldValue("modifierOptions", tempData);
  };

  const handleDelete = async () => {
    setLoadingDelete(true);

    try {
      await deleteEntity(id?.toString());
      toast.success(t("Modifier Deleted"));
      setShowDialogModifierEvent(false);

      if (origin == "company") {
        changeTab("catalogue", Screens?.companyDetail);
      }
      router.back();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingDelete(false);
    }
  };

  useEffect(() => {
    if (id != null) {
      findOne(id?.toString());
    }
  }, [id]);

  useEffect(() => {
    if (entity != null) {
      formik.setFieldValue("name", entity.name);
      formik.setFieldValue("displayName", entity.displayName);
      formik.setFieldValue("modifierOptions", entity.values);
      formik.setFieldValue("status", entity?.status == "active" ? true : false);
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

  if (!canAccessModule("modifiers")) {
    return <UpgradePackage />;
  }

  return (
    <>
      <Seo
        title={id != null ? `${t("Edit Modifier")}` : `${t("Create Modifier")}`}
      />
      <Box component="main" sx={{ py: 8, flexGrow: 1 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Box
                sx={{ mb: 3, cursor: "pointer", maxWidth: 90 }}
                onClick={() => {
                  if (origin == "company") {
                    changeTab("catalogue", Screens?.companyDetail);
                  }
                  router.back();
                }}
              >
                <Link
                  component="a"
                  color="textPrimary"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <ArrowBackIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "#6B7280" }}
                  />
                  <Typography variant="subtitle2">{t("Modifiers")}</Typography>
                </Link>
              </Box>
              <Typography variant="h4">
                {id != null ? t("Edit Modifier") : t("Create Modifier")}
              </Typography>
            </Stack>

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4} sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">
                          {t("Modifer Details")}
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
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "start",
                          }}
                        >
                          <Grid item container spacing={3}>
                            <Grid item md={6} xs={12}>
                              <TextFieldWrapper
                                required
                                fullWidth
                                name="name"
                                label={t("Modifier Name")}
                                value={formik.values.name}
                                disabled={id != null && !canUpdate}
                                error={Boolean(
                                  formik.touched.name && formik.errors.name
                                )}
                                helperText={
                                  formik.touched.name && formik.errors.name
                                }
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                              />
                            </Grid>

                            <Grid item md={6} xs={12}>
                              <TextFieldWrapper
                                required
                                fullWidth
                                name="displayName"
                                label={t("Display Name")}
                                disabled={id != null && !canUpdate}
                                error={Boolean(
                                  formik.touched.displayName &&
                                    formik.errors.displayName
                                )}
                                helperText={
                                  formik.touched.displayName &&
                                  formik.errors.displayName
                                }
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.displayName}
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Grid container>
                      <Grid xs={12} md={8}>
                        <Stack spacing={1}>
                          <Typography variant="h6">
                            {t("Modifier Options")}
                          </Typography>
                          <Typography color="text.secondary" variant="body2">
                            {t("You can add modifier options here")}
                          </Typography>
                        </Stack>
                      </Grid>

                      <Grid xs={12} md={4}>
                        <Stack
                          spacing={3}
                          direction="row"
                          alignItems="center"
                          justifyContent="flex-end"
                        >
                          <LoadingButton
                            startIcon={
                              <SvgIcon>
                                <PlusIcon />
                              </SvgIcon>
                            }
                            onClick={() => {
                              if (id != null && !canUpdate) {
                                return toast.error(t("You don't have access"));
                              }
                              setModifierOptionId(-1);
                              setOpenModifierOptionModal(true);
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
                        <TableCell width="25%">
                          {t("Modifier Option")}
                        </TableCell>
                        <TableCell width="13%">{t("Contains")}</TableCell>
                        <TableCell width="22%">{t("Kitchen Name")}</TableCell>
                        <TableCell width="10%">{t("Price")}</TableCell>
                        <TableCell width="10%">{t("VAT")}</TableCell>
                        <TableCell width="15%">{t("Status")}</TableCell>
                        <TableCell width="5%"></TableCell>
                      </TableRow>
                    </TableHead>

                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="modifierOptionsDroppable">
                        {(provided) => (
                          <TableBody
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {formik.values.modifierOptions?.length > 0 ? (
                              formik.values.modifierOptions.map(
                                (option: any, index: any) => {
                                  return (
                                    <Draggable
                                      key={index}
                                      draggableId={index.toString()}
                                      index={index}
                                    >
                                      {(
                                        provided,
                                        snapshot: DraggableStateSnapshot
                                      ) => {
                                        return (
                                          <TableRow
                                            key={index}
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{
                                              ...provided.draggableProps.style,
                                              background: snapshot.isDragging
                                                ? "rgba(245,245,245, 0.75)"
                                                : "none",
                                            }}
                                          >
                                            <TableCell width="25%">
                                              <Typography variant="body2">
                                                <IconButton
                                                  sx={{ mr: 0.7, ml: -1 }}
                                                >
                                                  <SvgIcon>
                                                    <ReorderRoundedIcon fontSize="small" />
                                                  </SvgIcon>
                                                </IconButton>
                                                {option.name}
                                              </Typography>
                                            </TableCell>

                                            <TableCell width="13%">
                                              <Typography variant="body2">
                                                {containsName[
                                                  option?.contains
                                                ] || "-"}
                                              </Typography>
                                            </TableCell>

                                            <TableCell width="22%">
                                              <Typography variant="body2">
                                                {option.kitchenName}
                                              </Typography>
                                            </TableCell>

                                            <TableCell width="10%">
                                              <Typography variant="body2">
                                                {`${currency} ${toFixedNumber(
                                                  option.price
                                                )}`}
                                              </Typography>
                                            </TableCell>

                                            <TableCell width="10%">
                                              <Typography variant="body2">
                                                {`${option.tax.percentage}%`}
                                              </Typography>
                                            </TableCell>

                                            <TableCell width="15%">
                                              <FormControlLabel
                                                sx={{
                                                  display: "flex",
                                                  flexDirection: "row",
                                                }}
                                                control={
                                                  <Switch
                                                    edge="end"
                                                    name="status"
                                                    color="primary"
                                                    checked={
                                                      option.status === "active"
                                                    }
                                                    onChange={(e) => {
                                                      if (!canUpdate) {
                                                        return toast.error(
                                                          t(
                                                            "You don't have access"
                                                          )
                                                        );
                                                      }

                                                      formik.values.modifierOptions[
                                                        index
                                                      ].status = e.target
                                                        .checked
                                                        ? "active"
                                                        : "inactive";

                                                      formik.setFieldValue(
                                                        "modifierOptions",
                                                        formik.values
                                                          .modifierOptions
                                                      );
                                                    }}
                                                    value={
                                                      option.status === "active"
                                                        ? true
                                                        : false
                                                    }
                                                    sx={{ mr: 0.2 }}
                                                  />
                                                }
                                                label={
                                                  option.status === "active"
                                                    ? t("In stock")
                                                    : t("Sold out")
                                                }
                                              />
                                            </TableCell>

                                            <TableCell width="5%">
                                              <Box
                                                sx={{
                                                  display: "flex",
                                                  justifyContent: "flex-end",
                                                }}
                                              >
                                                <IconButton
                                                  sx={{ mr: 0.7 }}
                                                  onClick={() => {
                                                    setModifierOptionId(index);
                                                    setOpenModifierOptionModal(
                                                      true
                                                    );
                                                  }}
                                                >
                                                  <SvgIcon>
                                                    <Edit02Icon fontSize="small" />
                                                  </SvgIcon>
                                                </IconButton>

                                                <IconButton
                                                  onClick={(e) => {
                                                    if (!canUpdate) {
                                                      return toast.error(
                                                        t(
                                                          "You don't have access"
                                                        )
                                                      );
                                                    }
                                                    e.preventDefault();

                                                    formik.values.modifierOptions?.splice(
                                                      index,
                                                      1
                                                    );
                                                    formik?.setFieldValue(
                                                      "modifierOptions",
                                                      formik.values
                                                        .modifierOptions
                                                    );
                                                    toast.success(
                                                      t(
                                                        "Modifier option deleted"
                                                      )
                                                    );
                                                  }}
                                                  style={{
                                                    pointerEvents: "painted",
                                                  }}
                                                >
                                                  <DeleteOutlineTwoToneIcon color="error" />
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
                                  colSpan={7}
                                  style={{
                                    textAlign: "center",
                                    borderBottom: "none",
                                  }}
                                >
                                  <Box sx={{ mt: 4, mb: 4 }}>
                                    <NoDataAnimation
                                      text={
                                        <Typography
                                          variant="h5"
                                          textAlign="center"
                                          sx={{ mt: 5 }}
                                        >
                                          {t("No Modifier Options!")}
                                        </Typography>
                                      }
                                    />
                                  </Box>
                                </TableCell>
                              </TableRow>
                            )}
                            {provided.placeholder}
                          </TableBody>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </Table>
                </Card>

                {/* <Card sx={{ mt: 3 }}>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={12} xs={12}>
                        <Stack spacing={1}>
                          <Typography align="left" variant="h6">
                            {t("Settings")}
                          </Typography>
                        </Stack>
                      </Grid>

                      <Grid item md={12} xs={12}>
                        <Stack spacing={1}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box sx={{ mr: 10 }}>
                              <Typography
                                align="left"
                                gutterBottom
                                variant="subtitle1"
                              >
                                {t("Customer can only select one modifier")}
                              </Typography>
                              <Typography
                                align="left"
                                color="text.secondary"
                                variant="body2"
                              >
                                {t(
                                  "Customers will be required to make a selection. The first modifier in your set will be the default selection."
                                )}
                              </Typography>
                            </Box>
                            <Box>
                              <Switch
                                checked={formik.values.enableCredit}
                                color="primary"
                                edge="start"
                                name="enableCredit"
                                onChange={() => {
                                  if (formik.values.enableCredit) {
                                    // return setShowDialogCreditEvent(true);
                                  }
                                  formik.setFieldValue(
                                    "enableCredit",
                                    !formik.values.enableCredit
                                  );
                                  formik.handleSubmit();
                                }}
                                value={formik.values.enableCredit}
                              />
                            </Box>
                          </Box>
                        </Stack>
                      </Grid>

                      <Grid item md={12} xs={12}>
                        <Stack spacing={1}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box sx={{ mr: 10 }}>
                              <Typography
                                align="left"
                                gutterBottom
                                variant="subtitle1"
                              >
                                {t("Use Conversational Modifiers on POS")}
                              </Typography>
                              <Typography
                                align="left"
                                color="text.secondary"
                                variant="body2"
                              >
                                {t(
                                  "Modifier operators (“Add”, “Extra”, “No”, etc.) will appear when viewing this modifier set with the Restaurant POS."
                                )}
                              </Typography>
                            </Box>
                            <Box>
                              <Switch
                                checked={formik.values.enableCredit}
                                color="primary"
                                edge="start"
                                name="enableCredit"
                                onChange={() => {
                                  if (formik.values.enableCredit) {
                                    // return setShowDialogCreditEvent(true);
                                  }
                                  formik.setFieldValue(
                                    "enableCredit",
                                    !formik.values.enableCredit
                                  );
                                  formik.handleSubmit();
                                }}
                                value={formik.values.enableCredit}
                              />
                            </Box>
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card> */}

                {/* <Card sx={{ mt: 4 }}>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={12} xs={12}>
                        <Stack spacing={1}>
                          <Typography align="left" variant="h6">
                            {t("Apply to sales locations")}
                          </Typography>
                          <Typography
                            align="left"
                            color="text.secondary"
                            variant="body2"
                          >
                            {t(
                              "This modifier set will only be visible on sales flows at the selected locations below"
                            )}
                          </Typography>
                        </Stack>
                      </Grid>

                      <Grid item md={12} xs={12}>
                        <Stack spacing={1}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box sx={{ mr: 10 }}>
                              <Typography
                                align="left"
                                gutterBottom
                                variant="subtitle1"
                              >
                                {t("Location")}
                              </Typography>
                            </Box>
                            <Box>
                              <Checkbox />
                            </Box>
                          </Box>
                        </Stack>
                      </Grid>

                      <Grid item md={12} xs={12}>
                        <Stack spacing={1}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box sx={{ mr: 10 }}>
                              <Typography
                                align="left"
                                gutterBottom
                                variant="subtitle1"
                              >
                                {t("Location 2")}
                              </Typography>
                            </Box>
                            <Box>
                              <Checkbox />
                            </Box>
                          </Box>
                        </Stack>
                      </Grid>
                      <Divider />
                      <Grid item md={12} xs={12}>
                        <Stack spacing={1}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box sx={{ mr: 10 }}>
                              <Typography
                                align="left"
                                gutterBottom
                                variant="subtitle1"
                              >
                                {t("Available at all future locations")}
                              </Typography>
                            </Box>
                            <Box>
                              <Checkbox />
                            </Box>
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card> */}

                {id != null && (
                  <Card>
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={8}>
                          <Stack spacing={1}>
                            <Typography variant="h6">{t("Status")}</Typography>
                            <Typography color="text.secondary" variant="body2">
                              {t("Change the status of the modifier")}
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
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                  style={{
                    marginRight: "10px",
                    marginLeft: "10px",
                  }}
                  sx={{ mx: 6 }}
                >
                  <LoadingButton
                    color="inherit"
                    onClick={() => {
                      if (origin == "company") {
                        changeTab("catalogue", Screens?.companyDetail);
                      }
                      router.back();
                    }}
                  >
                    {t("Cancel")}
                  </LoadingButton>

                  <Stack direction="row" alignItems="center">
                    <Box></Box>
                    {/* {id != null && (
                      <LoadingButton
                        sx={{ m: 1 }}
                        type="submit"
                        color="error"
                        variant="outlined"
                        loading={loadingDelete}
                        onClick={(e) => {
                          e.preventDefault();
                          if (!canDelete) {
                            return toast.error(t("You don't have access"));
                          }
                          setShowDialogModifierEvent(true);
                        }}
                      >
                        {t("Delete")}
                      </LoadingButton>
                    )} */}

                    <LoadingButton
                      sx={{ m: 1 }}
                      type="submit"
                      variant="contained"
                      loading={formik.isSubmitting}
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
                    >
                      {id != null ? t("Update") : t("Create")}
                    </LoadingButton>
                  </Stack>
                </Stack>
              </Stack>
            </form>
          </Stack>
        </Container>
      </Box>

      <CreateModifierModal
        open={openModifierOptionModal}
        modifier={formik.values.modifierOptions[modifierOptionId]}
        handleClose={() => setOpenModifierOptionModal(false)}
        handleAddEditModifier={(modifier: any) => {
          let data = formik.values.modifierOptions;

          if (modifierOptionId == -1) {
            data = [...data, modifier];
            toast.success(t("Modifier option added"));
          } else {
            data?.splice(modifierOptionId, 1, modifier);
            toast.success(t("Modifier option updated"));
          }

          formik?.setFieldValue("modifierOptions", data);

          setModifierOptionId(-1);
          setOpenModifierOptionModal(false);
        }}
      />

      <ConfirmationDialog
        show={showDialogModifierEvent}
        toggle={() => {
          setShowDialogModifierEvent(false);
        }}
        onOk={() => {
          handleDelete();
        }}
        okButtonText={`${t("Yes")}, ${t("Delete")}`}
        cancelButtonText={t("Cancel")}
        title={t("Confirmation")}
        text={t(`Are you sure you want to delete this modifier?`)}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
