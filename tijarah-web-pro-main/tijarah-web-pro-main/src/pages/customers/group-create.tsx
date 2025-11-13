import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteOutlineTwoToneIcon from "@mui/icons-material/DeleteOutlineTwoTone";
import { LoadingButton } from "@mui/lab";
import {
  Card,
  CardContent,
  Grid,
  IconButton,
  Link,
  Stack,
  SvgIcon,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Container } from "@mui/system";
import { FormikProps, useFormik } from "formik";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { CustomersInGroupRowLoading } from "src/components/customer/customer-in-group-row-loading";
import CustomerMultiSelect from "src/components/input/customer-multiSelect";
import { Seo } from "src/components/seo";
import TextFieldWrapper from "src/components/text-field-wrapper";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import { useUserType } from "src/hooks/use-user-type";
import i18n from "src/i18n";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import * as Yup from "yup";

interface GroupProps {
  groupName: string;
  customerRefs?: string[];
  customers?: string[];
}

const validationSchema = Yup.object({
  groupName: Yup.string()
    .required(i18n.t("Name is required"))
    .max(60, i18n.t("Name must not be greater than 60 characters"))
    .matches(
      /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
      i18n.t("Enter valid name")
    ),
});

const Page: PageType = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { userType } = useUserType();
  const canAccess = usePermissionManager();
  const canCreate = canAccess(MoleculeType["group:create"]);
  const canUpdate = canAccess(MoleculeType["group:update"]);
  const router = useRouter();
  const { id, open, companyRef, companyName } = router.query;
  const { findOne, create, updateEntity, entity } = useEntity("customer-group");
  const { create: customerAssign } = useEntity("customer-group/assign");
  const { create: deleteEntity } = useEntity("customer-group/remove");
  const {
    find: findCustomer,
    entities: customer,
    loading,
  } = useEntity("customer");

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const queryClient = useQueryClient();

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const initialValues: GroupProps = {
    groupName: "",
    customerRefs: [],
    customers: [],
  };

  const formik: FormikProps<GroupProps> = useFormik<GroupProps>({
    initialValues,
    validationSchema,

    onSubmit: async (values) => {
      const dataObj = {
        companyRef: companyRef,
        company: {
          name: companyName,
        },
        // customerRefs: values.customerRefs,
        // customers: values.customers,
        name: values.groupName,
        status: "active",
      };
      console.log(dataObj);

      try {
        if (id) {
          await updateEntity(id?.toString(), { ...dataObj });
        } else {
          await create({ ...dataObj });
        }

        toast.success(id ? `${t("Group Updated")}` : `${t("Group Created")}`);

        router.back();
      } catch (error) {
        toast.error(error.message);
      }
    },
  });

  const handleAddCustomer = async () => {
    //  setLoadUpdateProduct(true);

    try {
      const data = {
        groupRef: id?.toString(),
        customerRefs: formik.values.customerRefs,
      };

      await customerAssign(data);
      formik.setFieldValue("customerRefs", []);
      toast.success(t("Customer added to Group"));
      queryClient.invalidateQueries("find-customer");
    } catch (error) {
      toast.error(error.message || error.code);
    } finally {
      //  setLoadUpdateProduct(false);
    }
  };

  const handleRemoveCustomer = async (data: any) => {
    try {
      await deleteEntity({
        groupRef: id.toString(),
        customerRef: data?.toString(),
      });

      queryClient.invalidateQueries("find-customer");
    } catch (error) {
      toast.error(error.message || error.code);
    }
  };

  const headers = [
    {
      key: "customer",
      label: t("Customer"),
    },
    {
      key: "phone",
      label: t("Phone"),
    },

    {
      key: "action",
      label: "",
    },
  ];

  const transformedData = useMemo(() => {
    const arr: any[] = customer?.results?.map((d: any) => {
      return {
        customer: (
          <Box>
            <Typography>{d?.name}</Typography>
          </Box>
        ),
        phone: <Typography variant="body2">{d?.phone || "NA"}</Typography>,

        action: (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton
              onClick={(e) => {
                if (!canUpdate) {
                  return toast.error(t("You don't have access"));
                }
                e.preventDefault();
                handleRemoveCustomer(d?._id);
              }}
              sx={{ mr: 0.7 }}
            >
              <SvgIcon>
                <DeleteOutlineTwoToneIcon color="error" />
              </SvgIcon>
            </IconButton>
          </Box>
        ),
      };
    });

    return arr;
  }, [customer?.results, entity?.customer]);

  useEffect(() => {
    formik.resetForm();

    if (id !== "" && id !== undefined) {
      findOne(id?.toString());
    }
  }, [open, id]);

  useEffect(() => {
    if (id) {
      findCustomer({
        page: page,
        sort: sort,
        activeTab: "all",
        limit: rowsPerPage,
        groupRef: id?.toString(),
        _q: "",
        companyRef: companyRef.toString(),
      });
    }
  }, [id, companyRef, page, rowsPerPage]);

  useEffect(() => {
    if (entity !== null) {
      formik.setFieldValue("groupName", entity?.name);
    }
  }, [entity]);

  return (
    <>
      <Seo
        title={id != null ? `${t("Edit Groups")}` : `${t("Create Groups")}`}
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
            <Stack spacing={1}>
              <Box
                sx={{
                  cursor: "pointer",
                  mb: 3,
                  maxWidth: "10%",
                }}
                onClick={() => {
                  if (origin == "company") {
                    // changeTab("catalogue", Screens?.companyDetail);
                  }
                  router.back();
                }}
              >
                <Link
                  color="textPrimary"
                  component="a"
                  sx={{
                    alignItems: "center",
                    display: "flex",
                  }}
                >
                  <ArrowBackIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "#6B7280" }}
                  />
                  <Typography variant="subtitle2">{t("Groups")}</Typography>
                </Link>
              </Box>
              <Typography variant="h4">
                {id != null ? t("Edit Groups") : t("Create Groups")}
              </Typography>
            </Stack>

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4} sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">
                          {t("Group Details")}
                        </Typography>
                      </Grid>

                      <Grid item md={8} xs={12}>
                        <Box sx={{}}>
                          <TextFieldWrapper
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            fullWidth
                            required
                            label={t("Name")}
                            name="groupName"
                            sx={{
                              mt: 1,
                              flexGrow: 1,
                            }}
                            error={Boolean(
                              formik.touched.groupName &&
                                formik.errors.groupName
                            )}
                            helperText={
                              formik.touched.groupName &&
                              formik.errors.groupName
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            value={formik.values.groupName}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {id != null && (
                  <Card>
                    <CardContent>
                      <Grid xs={12} md={12}>
                        <Stack spacing={1}>
                          <Typography variant="h6">
                            {t("Add Customers")}
                          </Typography>
                        </Stack>
                      </Grid>

                      <Grid
                        container
                        sx={{ mt: 3 }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Grid item xs={10} md={10}>
                          <Stack spacing={1}>
                            <Box>
                              <CustomerMultiSelect
                                companyRef={companyRef}
                                groupRef={id}
                                id="customer-multi-select"
                                selectedIds={formik.values.customerRefs}
                                onChange={(option: any) => {
                                  if (option?.length > 0) {
                                    const ids = option?.map((option: any) => {
                                      return option._id;
                                    });

                                    formik.setFieldValue("customerRefs", ids);
                                  } else {
                                    formik.setFieldValue("customerRefs", []);
                                  }
                                }}
                              />
                            </Box>
                          </Stack>
                        </Grid>

                        <Grid item xs={2} md={2}>
                          <Stack
                            sx={{ mt: 1 }}
                            alignItems="flex-end"
                            spacing={1}
                          >
                            <LoadingButton
                              type="submit"
                              variant="contained"
                              onClick={(e) => {
                                e.preventDefault();

                                // if (id != null && !canUpdate) {
                                //   return toast.error(
                                //     t("You don't have access")
                                //   );
                                // }

                                handleAddCustomer();
                              }}
                              // loading={loadUpdateProduct}
                              sx={{ mt: -1, width: "80%" }}
                              // disabled={formik.values.productRefs?.length === 0}
                            >
                              {t("Add")}
                            </LoadingButton>
                          </Stack>
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 4, mb: -3 }}>
                        <SuperTable
                          headers={headers}
                          isLoading={loading}
                          loaderComponent={CustomersInGroupRowLoading}
                          items={transformedData}
                          total={customer?.total || 0}
                          onPageChange={handlePageChange}
                          onRowsPerPageChange={handleRowsPerPageChange}
                          rowsPerPage={rowsPerPage}
                          page={page}
                          noDataPlaceholder={
                            <Box sx={{ mt: 6, mb: 4 }}>
                              <NoDataAnimation
                                text={
                                  <Typography
                                    variant="h6"
                                    textAlign="center"
                                    sx={{ mt: 2 }}
                                  >
                                    {t("No Customers!")}
                                  </Typography>
                                }
                              />
                            </Box>
                          }
                        />
                      </Box>
                    </CardContent>
                  </Card>
                )}

                <Stack
                  alignItems="center"
                  direction="row"
                  justifyContent="space-between"
                  spacing={1}
                  style={{
                    marginTop: id ? "30px" : "220px",
                    marginRight: "10px",
                    marginLeft: "10px",
                  }}
                  sx={{ mx: 6 }}
                >
                  <LoadingButton
                    color="inherit"
                    onClick={() => {
                      if (origin == "company") {
                        // changeTab("catalogue", Screens?.companyDetail);
                      }
                      router.back();
                    }}
                  >
                    {t("Cancel")}
                  </LoadingButton>

                  <LoadingButton
                    type="submit"
                    variant="contained"
                    loading={formik.isSubmitting}
                    onClick={() => {
                      // if ((id != null && !canUpdate) || !canCreate) {
                      //   return toast.error(t("You don't have access"));
                      // }
                      formik.handleSubmit();
                    }}
                  >
                    {id ? t("Update") : t("Create")}
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

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
