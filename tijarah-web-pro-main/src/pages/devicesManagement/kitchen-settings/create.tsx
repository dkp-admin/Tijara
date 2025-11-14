import DeleteOutlineTwoToneIcon from "@mui/icons-material/DeleteOutlineTwoTone";
import HomeIcon from "@mui/icons-material/Home";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  Link,
  Stack,
  SvgIcon,
  Typography,
  useTheme,
} from "@mui/material";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { CollectionProductRowLoading } from "src/components/collections/collection-product-row-loading";
import KitchenProductSelect from "src/components/input/kitchen-product-select";
import LocationAutoCompleteDropdown from "src/components/input/location-singleSelect";
import { Seo } from "src/components/seo";
import TextFieldWrapper from "src/components/text-field-wrapper";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { usePageView } from "src/hooks/use-page-view";
import i18n from "src/i18n";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import UpgradePackage from "src/pages/upgrade-package";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { green } from "src/theme/colors";
import type { Page as PageType } from "src/types/page";
import { USER_TYPES } from "src/utils/constants";
import { Screens } from "src/utils/screens-names";
import useActiveTabs from "src/utils/use-active-tabs";
import { useCurrency } from "src/utils/useCurrency";
import * as Yup from "yup";

interface CreateKitchenProps {
  location: string;
  locationRef: string;
  kitchenNameEn: string;
  kitchenNameAr: string;
  description: string;
  appliedToProduct: boolean;
  appliedToCategory: boolean;
  assignedToAllCategories: boolean;
  productRefs: string[];
  newProductRefs: string[];
  products: any[];
  categoryRefs: string[];
  categories: any[];
  status: boolean;
}

const initialValues: CreateKitchenProps = {
  location: "",
  locationRef: "",
  kitchenNameEn: "",
  kitchenNameAr: "",
  description: "",
  appliedToProduct: false,
  appliedToCategory: false,
  assignedToAllCategories: false,
  productRefs: [],
  newProductRefs: [],
  products: [],
  categoryRefs: [],
  categories: [],
  status: true,
};

const validationSchema = Yup.object({
  locationRef: Yup.string().required(`${i18n.t("Please select location")}`),
  kitchenNameEn: Yup.string()
    .matches(
      /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
      i18n.t("Enter valid kitchen name")
    )
    .required(`${i18n.t("Kitchen Name is required in English")}`)
    .max(60, i18n.t("Kitchen name must not be greater than 60 characters")),
  kitchenNameAr: Yup.string()
    .matches(
      /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
      i18n.t("Enter valid kitchen name")
    )
    .required(`${i18n.t("Kitchen Name is required in Arabic")}`)
    .max(60, i18n.t("Kitchen name must not be greater than 60 characters")),
  description: Yup.string().max(
    50,
    i18n.t("Description must not be greater than 50 characters")
  ),
});

const headers = [
  {
    key: "product",
    label: i18n.t("Product"),
  },
  {
    key: "brand",
    label: i18n.t("Brand"),
  },
  {
    key: "category",
    label: i18n.t("Category"),
  },
  {
    key: "price",
    label: i18n.t("Price"),
  },
  {
    key: "action",
    label: "",
  },
];

const Page: PageType = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { changeTab } = useActiveTabs();
  const queryClient = useQueryClient();
  const { id, origin, companyRef, companyName } = router.query;
  const { canAccessModule } = useFeatureModuleManager();
  const userIsAdmin =
    user.userType === USER_TYPES.ADMIN ||
    user.userType === USER_TYPES.SUPERADMIN;

  usePageView();

  const { findOne, create, entity, loading, updateEntity } =
    useEntity("kitchen-management");
  const { updateEntity: updateCategory } = useEntity("category");
  const { create: assign } = useEntity("kitchen-management/assign");
  const { create: remove, loading: removeLoading } = useEntity(
    "kitchen-management/remove"
  );

  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["kitchen:update"]);
  const canCreate = canAccess(MoleculeType["kitchen:create"]);

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  const breadcrumbs = [
    <Link
      underline="hover"
      key="1"
      color="inherit"
      onClick={() => {
        router.push({
          pathname: tijarahPaths.dashboard.salesDashboard,
        });
      }}
    >
      <HomeIcon sx={{ mr: 0.5, mt: 0.75 }} fontSize="inherit" />
    </Link>,
    <Link
      underline="hover"
      key="2"
      color="inherit"
      onClick={() => {
        if (origin == "company") {
          changeTab("devices", Screens?.companyDetail);
        }

        router.back();
      }}
    >
      {t("Kitchen Management")}
    </Link>,
    <Link underline="hover" key="2" color="inherit" href="#">
      {id != null ? t("Edit Kitchen") : t("Create Kitchen")}
    </Link>,
  ];

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      try {
        const data = {
          company: { name: companyName },
          companyRef: companyRef,
          location: { name: values.location },
          locationRef: values.locationRef,
          name: {
            en: values.kitchenNameEn,
            ar: values.kitchenNameAr,
          },
          description: values.description,
        };

        await create({ ...data });

        if (origin == "company") {
          changeTab("devices", Screens?.companyDetail);
        }
        router.back();
      } catch (err) {
        if (err.message == "sku_exists_message") {
          toast.error(`${"SKU already exists"}`);
        } else {
          toast.error(err.message || err.code);
        }
      }
    },
  });

  const handleUpdate = async (
    type: string,
    products?: any[],
    categories?: any[],
    productRefs?: string[],
    categoryRefs?: string[]
  ) => {
    try {
      const data = {
        productsData: products,
        productRefs: productRefs,
        kitchenRef: id,
        name: {
          en: formik.values.kitchenNameEn,
          ar: formik.values.kitchenNameAr,
        },
        description: formik.values.description,
        allCategories: formik.values.assignedToAllCategories,
        categoryRefs: categoryRefs,
        categoriesData: categories,
      };

      await assign(data);
      formik.setFieldValue("productRefs", []);
      formik.setFieldValue("products", []);
      toast.success(
        type === "product"
          ? t("Product's added to Kitchen Group")
          : type === "category"
          ? t("Category's added to Kitchen Group")
          : t("Kitchen updated")
      );
      queryClient.invalidateQueries("find-product");
      queryClient.invalidateQueries("find-category");
      queryClient.invalidateQueries("find-one-kitchen-management");
    } catch (error) {
      toast.error(error.message || error.code);
    }
  };

  const handleRemoveProduct = async (productRef: any) => {
    try {
      const filteredProducts = entity.products.filter(
        (product: any) => product.productRef === productRef
      );

      if (filteredProducts.length > 0) {
        const sameCatProduct = entity.products.filter(
          (product: any) =>
            product.category.name === filteredProducts[0].category.name
        );

        if (filteredProducts?.length === sameCatProduct?.length) {
          const filteredCategories = entity.categories.filter(
            (category: any) =>
              category.name === filteredProducts[0].category.name
          );

          const productData = filteredProducts[0];
          const categoryData = filteredCategories[0];

          await remove({
            productsData: productData,
            kitchenRef: id,
          });

          if (categoryData) {
            const idx = entity.categories.findIndex(
              (cat: any) => cat.name === categoryData.name
            );

            const category = entity.categories.filter(
              (cat: any) => cat.name !== categoryData.name
            );

            const categoryRefs = [...entity.categoryRefs];
            const categoryRef = categoryRefs.splice(idx, 1);

            await updateEntity(id?.toString(), {
              kitchenRef: id,
              categories: category,
              categoryRefs: category?.length === 0 ? [] : categoryRef,
            });

            await updateCategory(categoryRef?.toString(), {
              kitchenRefs: [],
              kitchens: [],
            });
          } else {
            queryClient.invalidateQueries("find-one-kitchen-management");
          }
        } else {
          const productData = filteredProducts[0];

          const data = {
            productsData: productData,
            kitchenRef: id,
          };

          await remove(data);
          queryClient.invalidateQueries("find-one-kitchen-management");
        }

        toast.success("Product removed successfully");
        queryClient.invalidateQueries("find-product");
      } else {
        toast.error(t("Product with the given reference not found"));
      }
    } catch (error) {
      toast.error(error.message || error.code);
    }
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const lng = localStorage.getItem("currentLanguage");
  const currency = useCurrency();

  const transformedData = useMemo(() => {
    const arr: any[] = entity?.products?.map((d: any) => {
      return {
        key: d.productRef,
        _id: d.productRef,
        product: (
          <Box>
            <Typography>{d.name[lng] || d.name.en}</Typography>
          </Box>
        ),
        category: (
          <Typography variant="body2">{d.category.name || "NA"}</Typography>
        ),
        brand: <Typography variant="body2">{d.brand.name || "NA"}</Typography>,
        price: (
          <Typography variant="body2">{`${currency} ${d.price}`}</Typography>
        ),
        action: (
          <IconButton
            onClick={(e) => {
              if (!canUpdate) {
                return toast.error(t("You don't have access"));
              }
              e.preventDefault();
              handleRemoveProduct(d.productRef);
            }}
            disabled={removeLoading}
            sx={{ mr: 0.7 }}
          >
            {removeLoading ? (
              <CircularProgress size={20} />
            ) : (
              <SvgIcon>
                <DeleteOutlineTwoToneIcon color="error" />
              </SvgIcon>
            )}
          </IconButton>
        ),
      };
    });

    return arr;
  }, [entity?.products, removeLoading]);

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedItems = transformedData?.slice(startIndex, endIndex);

  useEffect(() => {
    if (entity != null) {
      formik.setFieldValue("location", entity?.location?.name);
      formik.setFieldValue("locationRef", entity?.locationRef);
      formik.setFieldValue("kitchenNameEn", entity?.name?.en);
      formik.setFieldValue("kitchenNameAr", entity?.name?.ar);
      formik.setFieldValue("description", entity?.description);
      formik.setFieldValue("appliedToProduct", entity?.productRefs?.length > 0);
      formik.setFieldValue(
        "appliedToCategory",
        entity?.categoryRefs?.length > 0
      );
      formik.setFieldValue("assignedToAllCategories", entity?.allCategories);
      formik.setFieldValue("newProductRefs", entity?.productRefs);
      formik.setFieldValue("products", entity?.products || []);
      formik.setFieldValue("categoryRefs", entity?.categoryRefs || []);
      formik.setFieldValue("categories", entity?.categories || []);
      formik.setFieldValue("status", entity?.status === "active");
    }
  }, [entity]);

  useEffect(() => {
    if (id == null && !userIsAdmin) {
      formik.setFieldValue("locationRef", user.locationRef);
      formik.setFieldValue("location", user.location.name);
    }
  }, [id, userIsAdmin]);

  useEffect(() => {
    if (id != null) {
      formik.setFieldValue("appliedToProduct", true);
      findOne(id.toString());
    }
  }, [id]);

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

  if (!canAccessModule("kitchens")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["kitchen:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo
        title={
          id
            ? `${t("Edit Kitchen Management")}`
            : `${t("Create Kitchen Management")}`
        }
      />
      <Box component="main" sx={{ flexGrow: 1, pt: 5, pb: 3, mb: 4 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack spacing={4}>
              <Box
                sx={{
                  maxWidth: 80,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Stack
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    width: 400,
                    mt: 1,
                  }}
                >
                  <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    aria-label="breadcrumb"
                  >
                    {breadcrumbs}
                  </Breadcrumbs>
                </Stack>
              </Box>

              <Typography variant="h4">
                {id != null ? t("Edit Kitchen") : t("Create Kitchen")}
              </Typography>
            </Stack>

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4}>
                <Card>
                  <CardContent>
                    <Grid item container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">
                          {t("Basic Details")}
                        </Typography>
                      </Grid>

                      <Grid item md={8} xs={12}>
                        <LocationAutoCompleteDropdown
                          disabled={false}
                          showAllLocation={false}
                          companyRef={companyRef}
                          required
                          error={
                            formik?.touched?.locationRef &&
                            formik?.errors?.locationRef
                          }
                          onChange={(id: any, name: any) => {
                            formik.handleChange("locationRef")(id || "");
                            formik.handleChange("location")(name?.en || "");
                          }}
                          selectedId={formik?.values?.locationRef}
                          label={t("Location")}
                          id="locationRef"
                        />

                        <TextFieldWrapper
                          sx={{ mt: 3 }}
                          autoComplete="off"
                          inputProps={{
                            style: { textTransform: "capitalize" },
                          }}
                          fullWidth
                          label={t("Kitchen (English)")}
                          name="kitchenNameEn"
                          error={Boolean(
                            formik.touched.kitchenNameEn &&
                              formik.errors.kitchenNameEn
                          )}
                          helperText={
                            (formik.touched.kitchenNameEn &&
                              formik.errors.kitchenNameEn) as any
                          }
                          onBlur={formik.handleBlur}
                          onChange={(e) => {
                            formik.handleChange(e);
                          }}
                          required
                          value={formik.values.kitchenNameEn}
                        />

                        <TextFieldWrapper
                          sx={{ mt: 3 }}
                          autoComplete="off"
                          inputProps={{
                            style: { textTransform: "capitalize" },
                          }}
                          fullWidth
                          label={t("Kitchen (Arabic)")}
                          name="kitchenNameAr"
                          error={Boolean(
                            formik.touched.kitchenNameAr &&
                              formik.errors.kitchenNameAr
                          )}
                          helperText={
                            (formik.touched.kitchenNameAr &&
                              formik.errors.kitchenNameAr) as any
                          }
                          onBlur={formik.handleBlur}
                          onChange={(e) => {
                            formik.handleChange(e);
                          }}
                          required
                          value={formik.values.kitchenNameAr}
                        />

                        <TextFieldWrapper
                          sx={{ mt: 3 }}
                          autoComplete="off"
                          label={t("Description")}
                          name="description"
                          multiline
                          rows={3}
                          fullWidth
                          error={Boolean(
                            formik.touched.description &&
                              formik.errors.description
                          )}
                          helperText={
                            (formik.touched.description &&
                              formik.errors.description) as any
                          }
                          onChange={(e) => {
                            formik.handleChange(e);
                          }}
                          value={formik.values.description}
                        />

                        {entity?.printerId && (
                          <TextFieldWrapper
                            sx={{ mt: 3 }}
                            autoComplete="off"
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            fullWidth
                            label={t("Kitchen Printer Id")}
                            name="printerId"
                            disabled
                            value={entity?.printerId}
                          />
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {id == null && (
                  <Box
                    sx={{
                      py: 1,
                      px: 2,
                      display: "flex",
                      backgroundColor:
                        theme.palette.mode !== "dark"
                          ? `${green.light}`
                          : "neutral.900",
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "row" }}>
                      <SvgIcon fontSize="small">
                        <InfoTwoToneIcon color="primary" />
                      </SvgIcon>

                      <Typography
                        variant="body2"
                        color="gray"
                        sx={{ pl: 1, fontSize: "13px", fontWeight: "bold" }}
                      >
                        {t("Note: ")}
                      </Typography>

                      <Typography
                        color="gray"
                        variant="body2"
                        sx={{ fontSize: "13px", pl: 0.5 }}
                      >
                        {` ${t(
                          "After creation you can come back later for adding product and category for this kicthen"
                        )}`}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {id != null && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6">
                        {t("Kitchen Products")}
                      </Typography>

                      <Box>
                        <Grid
                          container
                          sx={{ mt: 3 }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Grid item xs={12} md={12}>
                            <KitchenProductSelect
                              id="kitchen-product-select"
                              companyRef={companyRef}
                              locationRef={entity?.locationRef}
                              onChange={(
                                option: any,
                                type: any,
                                products: any
                              ) => {
                                if (option) {
                                  if (type === "product") {
                                    const variant = option?.variants?.find(
                                      (v: any) =>
                                        v.locationRefs.includes(
                                          entity?.locationRef
                                        )
                                    );

                                    const data = {
                                      productRef: option._id,
                                      name: option.name,
                                      categoryRef: option.categoryRef,
                                      category: {
                                        name: option.category?.name,
                                      },
                                      brand: { name: option.brand?.name },
                                      price: variant?.price || 0,
                                      sku: variant?.sku || "",
                                    };

                                    formik.setFieldValue("productRefs", [
                                      option._id,
                                    ]);
                                    formik.setFieldValue("products", [data]);

                                    handleUpdate(
                                      type,
                                      [data],
                                      [],
                                      [option._id],
                                      []
                                    );
                                  } else {
                                    const ids = products?.map(
                                      (product: any) => {
                                        return product._id;
                                      }
                                    );

                                    const selectedProducts = products?.map(
                                      (product: any) => {
                                        const variant = product?.variants?.find(
                                          (v: any) =>
                                            v.locationRefs.includes(
                                              entity?.locationRef
                                            )
                                        );

                                        return {
                                          productRef: product._id,
                                          categoryRef: product.categoryRef,
                                          name: product.name,
                                          category: {
                                            name: product.category?.name,
                                          },
                                          brand: { name: product.brand?.name },
                                          price: variant?.price || 0,
                                          sku: variant?.sku || "",
                                        };
                                      }
                                    );

                                    formik.setFieldValue("productRefs", ids);
                                    formik.setFieldValue(
                                      "products",
                                      selectedProducts
                                    );

                                    formik.setFieldValue("categoryRefs", [
                                      ...formik.values.categoryRefs,
                                      option._id,
                                    ]);
                                    formik.setFieldValue("categories", [
                                      ...formik.values.categories,
                                      {
                                        name: option.name.en,
                                        categoryRef: option._id,
                                      },
                                    ]);

                                    handleUpdate(
                                      type,
                                      selectedProducts,
                                      [
                                        ...formik.values.categories,
                                        {
                                          name: option.name.en,
                                          categoryRef: option._id,
                                        },
                                      ],
                                      ids,
                                      [
                                        ...formik.values.categoryRefs,
                                        option._id,
                                      ]
                                    );
                                  }
                                }
                              }}
                            />
                          </Grid>
                        </Grid>

                        <Box sx={{ mt: 4, mb: -3 }}>
                          <SuperTable
                            isLoading={loading}
                            loaderComponent={CollectionProductRowLoading}
                            items={paginatedItems}
                            headers={headers}
                            total={entity?.products?.length || 0}
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
                                      sx={{ mt: 2 }}
                                      textAlign="center"
                                    >
                                      {t("No Products!")}
                                    </Typography>
                                  }
                                />
                              </Box>
                            }
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {id != null && (
                  <Box
                    sx={{
                      py: 1,
                      px: 2,
                      display: "flex",
                      backgroundColor:
                        theme.palette.mode !== "dark"
                          ? `${green.light}`
                          : "neutral.900",
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "row" }}>
                      <SvgIcon fontSize="small">
                        <InfoTwoToneIcon color="primary" />
                      </SvgIcon>

                      <Typography
                        variant="body2"
                        color="gray"
                        sx={{ pl: 1, fontSize: "13px", fontWeight: "bold" }}
                      >
                        {t("Note: ")}
                      </Typography>

                      <Typography
                        color="gray"
                        variant="body2"
                        sx={{ fontSize: "13px", pl: 0.5 }}
                      >
                        {` ${t(
                          "You can configure KOT printer for this kitchen from POS printer settings"
                        )}`}
                      </Typography>
                    </Box>
                  </Box>
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
                  <LoadingButton
                    color="inherit"
                    onClick={() => {
                      if (origin == "company") {
                        changeTab("devices", Screens?.companyDetail);
                      }

                      router.back();
                    }}
                  >
                    {t("Cancel")}
                  </LoadingButton>

                  <LoadingButton
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      if (id != null && !canUpdate) {
                        return toast.error(t("You don't have access"));
                      } else if (!id && !canCreate) {
                        return toast.error(t("You don't have access"));
                      }
                      if (id != null) {
                        handleUpdate("");
                        router.back();
                      } else {
                        formik.handleSubmit();
                      }
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

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
