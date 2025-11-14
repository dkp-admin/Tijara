import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Modal,
  Stack,
  SvgIcon,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useFormik } from "formik";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Seo } from "src/components/seo";
import { usePageView } from "src/hooks/use-page-view";
import * as Yup from "yup";
import DefaultOptionsDropdown from "../input/default-options-auto-complete";
import ExcludedOptionsMultiSelect from "../input/excluded-option-multiSelect";

interface EditModifiers {
  min: number;
  max: number;
  noOfFreeModifier: number;
  default: string;
  excluded: string[];
}

const validationSchema = Yup.object({
  min: Yup.number()
    .required("Minimum options should not be less than zero.")
    .min(0),
  max: Yup.number()
    .required("Maximum options should not be less than one.")
    .min(1),
  noOfFreeModifier: Yup.number().required(),
});

const EditModifiersModal = (props: any) => {
  const { handleClose, open, EditModData, handleEditModifier, id } = props;

  const { t } = useTranslation();
  const theme = useTheme();

  usePageView();
  const initialValues: EditModifiers = {
    min: 0,
    max: 1,
    noOfFreeModifier: 0,
    default: "",
    excluded: [],
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      if (values.min > values.max) {
        toast.error(t("Min options must be <= to max options"));
        return;
      }

      if (values.noOfFreeModifier > 0 && values.noOfFreeModifier > values.max) {
        toast.error(
          `${t("Free options must be less than")} ${Number(values.max) + 1} ${t(
            "option(s)"
          )}`
        );
        return;
      }

      try {
        const data: any = {
          ...EditModData,
          min: values.min ? values.min : 0,
          max: values.max ? values.max : 1,
          noOfFreeModifier: values.noOfFreeModifier
            ? values.noOfFreeModifier
            : 0,
          default: values.default ? values.default : "",
          excluded: values.excluded ? values.excluded : [],
        };

        handleEditModifier({ ...data });
        toast.success(t("Modifier Updated successfully").toString());
        formik.resetForm();
        handleClose();
      } catch (err) {
        toast.error(
          err.code === "duplicate_record"
            ? t("Already Exist")
            : t("Something went wrong")
        );
      }
    },
  });

  useEffect(() => {
    if (open && EditModData) {
      formik.setFieldValue("min", EditModData?.min);
      formik.setFieldValue("max", EditModData?.max);
      formik.setFieldValue(
        "noOfFreeModifier",
        EditModData?.noOfFreeModifier || 0
      );
      formik.setFieldValue("default", EditModData?.default || "");
      formik.setFieldValue("excluded", EditModData?.excluded || []);
    }
  }, [open, id, EditModData]);

  // useEffect(() => {
  //   if (open && !id) {
  //     formik.resetForm();
  //   }
  // }, [open]);

  return (
    <Modal open={open}>
      <Box>
        <Card
          sx={{
            visibility: "visible",
            scrollbarColor: "transpatent",
            position: "fixed ",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "90vw",
              sm: "70vw",
              md: "60vw",
            },
            bgcolor: "background.paper",
            overflowY: "hidden",
            height: {
              xs: "80vh",
              md: "85vh",
              lg: "89vh",
            },
            p: 2,
          }}
        >
          {/* header */}

          <Box
            style={{
              marginTop: 15,
              padding: 10,
              display: "flex",
              zIndex: 999,
              alignItems: "center",
              backgroundColor:
                theme.palette.mode === "light" ? "#fff" : "#111927",
              width: "94.5%",
              position: "fixed",
              top: 0,
            }}
          >
            <XCircle
              fontSize="small"
              onClick={() => handleClose()}
              style={{ cursor: "pointer", flex: 0.6 }}
            />

            <Typography variant="h5" align="left" sx={{ flex: 1 }}>
              {t("Edit Modifier")}
            </Typography>
          </Box>

          {/* Body */}

          <Box
            style={{
              overflow: "scroll",
              overflowX: "hidden",
              height: "100%",
              width: "100%",
            }}
          >
            <Seo title={`${t("Edit Modifier")}`} />

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4} sx={{ mt: 4, mb: 4 }}>
                <Card style={{ boxShadow: "none" }}>
                  <CardContent>
                    <Stack spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">
                          {t("Modifier Details")}
                        </Typography>
                      </Grid>
                      <Grid item md={8} xs={12}>
                        <Box
                          sx={{ mx: 0.5 }}
                          alignItems="center"
                          style={{ display: "flex" }}
                        >
                          <TextField
                            onWheel={(event: any) => {
                              event.preventDefault();
                              event.target.blur();
                            }}
                            required
                            autoComplete="off"
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            fullWidth
                            label={t("Minimum options")}
                            name="min"
                            error={Boolean(
                              formik.touched.min && formik.errors.min
                            )}
                            helperText={
                              (formik.touched.min && formik.errors.min) as any
                            }
                            onBlur={formik.handleBlur}
                            onKeyPress={(event): void => {
                              const ascii = event.charCode;
                              const value = (event.target as HTMLInputElement)
                                .value;
                              // const decimalCheck = value.indexOf(".") !== -1;

                              // if (decimalCheck) {
                              //   const decimalSplit = value.split(".");
                              //   const decimalLength = decimalSplit[1].length;
                              //   if (decimalLength > 1 || ascii === 46) {
                              //     event.preventDefault();
                              //   } else if (ascii < 48 || ascii > 57) {
                              //     event.preventDefault();
                              //   }
                              // } else
                              if (value.length > 5 && ascii !== 46) {
                                event.preventDefault();
                              } else if (
                                (ascii < 48 || ascii > 57) &&
                                ascii !== 46
                              ) {
                                event.preventDefault();
                              }
                            }}
                            onKeyDown={(event) => {
                              if (event.key === ".") event.preventDefault();
                            }}
                            onChange={(e) => {
                              if (
                                Number(e.target.value) >
                                Number(formik.values.max)
                              ) {
                                toast.error(
                                  t("Min options must be <= to max options")
                                );
                                return;
                              }

                              formik.handleChange(e);
                              formik.setFieldValue("excluded", []);
                            }}
                            value={formik.values.min}
                          />
                          <Tooltip
                            title={t(
                              "The value represents the lowest number of allowed options for this modifier set."
                            )}
                            style={{ marginLeft: "6px", maxWidth: "50px" }}
                          >
                            <SvgIcon color="action">
                              <InfoCircleIcon />
                            </SvgIcon>
                          </Tooltip>
                        </Box>
                        <Box
                          sx={{ mt: 3, mx: 0.5 }}
                          alignItems="center"
                          style={{ display: "flex" }}
                        >
                          <TextField
                            onWheel={(event: any) => {
                              event.preventDefault();
                              event.target.blur();
                            }}
                            required
                            autoComplete="off"
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            fullWidth
                            label={t("Maximum options")}
                            name="max"
                            error={Boolean(
                              formik.touched.max && formik.errors.max
                            )}
                            helperText={
                              (formik.touched.max && formik.errors.max) as any
                            }
                            onBlur={formik.handleBlur}
                            onKeyPress={(event): void => {
                              const ascii = event.charCode;
                              const value = (event.target as HTMLInputElement)
                                .value;
                              // const decimalCheck = value.indexOf(".") !== -1;

                              // if (decimalCheck) {
                              //   const decimalSplit = value.split(".");
                              //   const decimalLength = decimalSplit[1].length;
                              //   if (decimalLength > 1 || ascii === 46) {
                              //     event.preventDefault();
                              //   } else if (ascii < 48 || ascii > 57) {
                              //     event.preventDefault();
                              //   }
                              // } else
                              if (value.length > 5 && ascii !== 46) {
                                event.preventDefault();
                              } else if (
                                (ascii < 48 || ascii > 57) &&
                                ascii !== 46
                              ) {
                                event.preventDefault();
                              }
                            }}
                            onKeyDown={(event) => {
                              if (event.key === ".") event.preventDefault();
                            }}
                            onChange={(e) => {
                              if (
                                Number(e.target.value) >
                                EditModData?.values?.length
                              ) {
                                toast.error(
                                  `${t("You can set maximum")} ${
                                    EditModData?.values?.length
                                  } ${t("option(s)")}`
                                );
                                return;
                              }

                              formik.handleChange(e);
                            }}
                            value={formik.values.max}
                          />
                          <Tooltip
                            title={t(
                              "The value represents the highest number of allowed options that you can pick for this modifier."
                            )}
                            style={{ marginLeft: "6px", maxWidth: "50px" }}
                          >
                            <SvgIcon color="action">
                              <InfoCircleIcon />
                            </SvgIcon>
                          </Tooltip>
                        </Box>

                        {/* <Box
                          sx={{ mt: 3, mx: 0.5 }}
                          alignItems="center"
                          style={{ display: "flex" }}
                        >
                          <TextField
                            onWheel={(event: any) => {
                              event.preventDefault();
                              event.target.blur();
                            }}
                            required
                            autoComplete="off"
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            fullWidth
                            label={t("Free options")}
                            name="noOfFreeModifier"
                            error={Boolean(
                              formik.touched.noOfFreeModifier &&
                                formik.errors.noOfFreeModifier
                            )}
                            helperText={
                              (formik.touched.noOfFreeModifier &&
                                formik.errors.noOfFreeModifier) as any
                            }
                            onBlur={formik.handleBlur}
                            onKeyPress={(event): void => {
                              const ascii = event.charCode;
                              const value = (event.target as HTMLInputElement)
                                .value;
                              //  const decimalCheck = value.indexOf(".") !== -1;

                              // if (decimalCheck) {
                              //   const decimalSplit = value.split(".");
                              //   const decimalLength = decimalSplit[1].length;
                              //   if (decimalLength > 1 || ascii === 46) {
                              //     event.preventDefault();
                              //   } else if (ascii < 48 || ascii > 57) {
                              //     event.preventDefault();
                              //   }
                              // } else
                              if (value.length > 5 && ascii !== 46) {
                                event.preventDefault();
                              } else if (
                                (ascii < 48 || ascii > 57) &&
                                ascii !== 46
                              ) {
                                event.preventDefault();
                              }
                            }}
                            onKeyDown={(event) => {
                              if (event.key === ".") event.preventDefault();
                            }}
                            onChange={(e) => {
                              if (
                                Number(e.target.value) >
                                Number(formik.values.max)
                              ) {
                                toast.error(
                                  `${t("You can set maximum")} ${Number(
                                    formik.values.max
                                  )} ${t("option(s)")}`
                                );
                                return;
                              }

                              formik.handleChange(e);
                            }}
                            value={formik.values.noOfFreeModifier}
                          />
                          <Tooltip
                            title={t(
                              "The value represents the number of options that the price does not apply to this modifier."
                            )}
                            style={{ marginLeft: "6px", maxWidth: "50px" }}
                          >
                            <SvgIcon color="action">
                              <InfoCircleIcon />
                            </SvgIcon>
                          </Tooltip>
                        </Box> */}

                        <Box
                          sx={{ mt: 3, mx: 0.5 }}
                          alignItems="center"
                          style={{ display: "flex" }}
                        >
                          <DefaultOptionsDropdown
                            data={EditModData?.values}
                            error={
                              formik?.touched?.default && formik.errors.default
                            }
                            onChange={(id, name) => {
                              formik.handleChange("default")(id || "");
                            }}
                            selectedId={formik.values.default}
                            selectedName={formik.values.default}
                            label={t("Default Option")}
                            id="default-options-dropdown"
                          />
                          <Tooltip
                            title={t(
                              "This is for selecting the option as default within the modifier for this product."
                            )}
                            style={{ marginLeft: "6px", maxWidth: "50px" }}
                          >
                            <SvgIcon color="action">
                              <InfoCircleIcon />
                            </SvgIcon>
                          </Tooltip>
                        </Box>

                        <Box
                          sx={{ mt: 3, mx: 0.5 }}
                          alignItems="center"
                          style={{ display: "flex" }}
                        >
                          <ExcludedOptionsMultiSelect
                            data={EditModData?.values}
                            // showAllModifiers={
                            //   false
                            //   // formik.values.assignedToAllBusinessTypes
                            // }
                            selectedIds={formik?.values?.excluded as any}
                            id={"excluded-options-multi-select"}
                            error={
                              formik?.touched?.excluded &&
                              formik.errors.excluded
                            }
                            onChange={(option: any, id: string) => {
                              if (option?.length > 0) {
                                const exclude =
                                  formik.values.min === 0
                                    ? EditModData?.values?.length -
                                        formik?.values?.excluded?.length <=
                                      1
                                    : EditModData?.values?.length -
                                        formik?.values?.excluded?.length <=
                                      formik.values.min;

                                if (
                                  !formik.values.excluded?.includes(id) &&
                                  exclude
                                ) {
                                  toast.error(
                                    `${t(
                                      "Since the 'Minimum options' value equals the total number of modifier options, excluding an option is no longer possible"
                                    )}.`
                                  );
                                  return;
                                }

                                const ids = option?.map((option: any) => {
                                  return option._id;
                                });

                                formik.setFieldValue("excluded", ids);
                              } else {
                                formik.setFieldValue("excluded", []);
                              }
                            }}
                          />
                          <Tooltip
                            title={t(
                              "This is for choosing the options within the modifier set that should not be shown for this product."
                            )}
                            style={{ marginLeft: "6px", maxWidth: "50px" }}
                          >
                            <SvgIcon color="action">
                              <InfoCircleIcon />
                            </SvgIcon>
                          </Tooltip>
                        </Box>

                        {formik.values.excluded?.includes(
                          formik.values.default
                        ) && (
                          <Typography
                            sx={{ ml: 1 }}
                            fontSize="14px"
                            variant="body2"
                            color="warning.main"
                          >
                            {`${t(
                              "You're excluding the modifier option that was set as default, this will result in the removal of default option"
                            )}.`}
                          </Typography>
                        )}
                      </Grid>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </form>
          </Box>

          <div
            style={{
              flex: 1,
              padding: 5,
              zIndex: 999,
              width: "94.5%",
              position: "fixed",
              bottom: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor:
                theme.palette.mode === "light" ? "#fff" : "#111927",
            }}
          >
            <Button
              color="inherit"
              onClick={() => {
                handleClose();
              }}
            >
              {t("Cancel")}
            </Button>

            <LoadingButton
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                formik.handleSubmit();
              }}
              loading={formik.isSubmitting}
              sx={{ m: 1 }}
              variant="contained"
            >
              {t("Update")}
            </LoadingButton>
          </div>
        </Card>
      </Box>
    </Modal>
  );
};

export default EditModifiersModal;
