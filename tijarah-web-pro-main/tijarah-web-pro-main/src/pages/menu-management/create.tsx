import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Link,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ConfirmationDialog from "src/components/confirmation-dialog";
import CategoryDropdownMenuManagement from "src/components/input/add-category-auto-complete-menu-management";
import AddProductTextInputMenuManagement from "src/components/input/add-product-auto-complete-menu-management";
import LocationAutoCompleteDropdown from "src/components/input/location-singleSelect";
import OrderTypeSelect from "src/components/input/order-type-select";
import CategoryDNDCard from "src/components/menu-management/category-dnd-card";
import EditLayoutModal from "src/components/menu-management/edit-layout-modal";
import { Seo } from "src/components/seo";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import useWarnIfUnsavedChanges from "src/hooks/check-if-changed";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import { PencilAlt } from "src/icons/pencil-alt";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import UpgradePackage from "src/pages/upgrade-package";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import {
  ChannelsForRestaurant,
  ChannelsName,
  USER_TYPES,
} from "src/utils/constants";
import { Screens } from "src/utils/screens-names";
import useActiveTabs from "src/utils/use-active-tabs";
interface CreateMenu {
  orderType: string;
  categories: any[];
  categoryRefs: any[];
  products: any[];
  productRefs: any[];
  locationRef: string;
  location: string;
}

const Page: PageType = () => {
  useWarnIfUnsavedChanges("Menu");

  const { user } = useAuth();
  const { userType } = useUserType();
  const { t } = useTranslation();
  const [openModal, setOpenModal] = useState(false);
  const theme = useTheme();
  const [showDirtyDialogEvent, setShowDirtyDialogEvent] = useState(false);
  const [combinedCategories, setCombinedCategories] = useState([]);
  const [combinedProducts, setCombinedProducts] = useState([]);
  const [ischangedMenu, setIschangedMenu] = useState(false);
  const { changeTab } = useActiveTabs();
  const { canAccessModule } = useFeatureModuleManager();
  const canAccess = usePermissionManager();
  const canCreate = canAccess(MoleculeType["menu:create"]);
  const router = useRouter();
  const { id, newid, companyRef, companyName, origin } = router.query;
  const [channels, setChannels] = useState<any[]>([]);
  const [initialized, setInitialized] = useState(false);

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
      <HomeIcon sx={{ mr: 0.5, mt: 0.8 }} fontSize="inherit" />
    </Link>,
    <Link
      underline="hover"
      key="2"
      color="inherit"
      onClick={() => {
        if (origin == "company") {
          changeTab("menuManagement", Screens?.companyDetail);
        }
        if (localStorage.getItem("isChangeinMenu") === "true") {
          setShowDirtyDialogEvent(true);
          setIschangedMenu(true);
        } else {
          router.back();
        }
      }}
    >
      {t("Menu")}
    </Link>,
    <Typography key="2" color="inherit">
      {id != null ? t("Edit Menu") : t("Create Menu")}
    </Typography>,
  ];

  const handleDirtyConfirmation = () => {
    localStorage.setItem("isChangeinMenu", "false");
    setShowDirtyDialogEvent(false);
    setIschangedMenu(false);
    formik.handleSubmit();
  };
  const handleDirtyConfirmationDiscard = () => {
    localStorage.setItem("isChangeinMenu", "false");
    setShowDirtyDialogEvent(false);
    setIschangedMenu(false);
    router.back();
  };

  const {
    findOne: company,
    entity: companyEntity,
    loading: companyLoading,
  } = useEntity("company");
  const {
    find: findMenu,
    entities,
    findOne,
    entity,
    create: createMenu,
    updateEntity,
    loading,
  } = useEntity("menu-management");

  const formik = useFormik<CreateMenu>({
    initialValues: {
      orderType: "",
      categories: [],
      categoryRefs: [],
      products: [],
      productRefs: [],
      locationRef: "",
      location: "",
    },
    onSubmit: async (values) => {
      if (values?.categories?.length === 0) {
        toast.error("Menu cannot be empty");
        return;
      }

      if (values.orderType === "" || !values.orderType) {
        toast.error("Order Type cannot be empty");

        localStorage.setItem("isChangeinMenu", "true");

        return;
      }
      const categoryPos = values?.categories?.map((cat: any, idx: number) => {
        const obj = { ...cat, sortOrder: idx };
        return obj;
      });

      const productsPos = values?.products?.map((cat: any, idx: number) => {
        const obj = { ...cat, sortOrder: idx };
        return obj;
      });

      try {
        const menu = {
          categories: categoryPos,
          products: productsPos,
          orderType: values.orderType,
          companyRef: companyRef,
          company: { name: companyName },
          location: { name: values?.location },
          locationRef: values?.locationRef,
        };

        if (id != null) {
          await updateEntity(id.toString(), { ...menu });
          toast.success("Menu updated successfully");
          if (origin == "company") {
            changeTab("menuManagement", Screens?.companyDetail);
          }
          router.back();
        } else {
          await createMenu({ ...menu });
          toast.success("Menu created successfully");
          if (origin == "company") {
            changeTab("menuManagement", Screens?.companyDetail);
          }
          router.back();
        }
      } catch (error) {
        if (error?._err?.message?.[0]?.property) {
          toast.error(t("Order type not exits for menu creation"));
        } else {
          toast.error(error?.error.message);
        }
      }
    },
  });

  usePageView();

  const {
    find,
    entities: product,
    loading: productsLoading,
  } = useEntity("product");

  useEffect(() => {
    if (id != null) {
      findOne(id.toString());
    }
  }, [id]);

  const {
    find: findCategories,
    entities: categoriesData,
    loading: categoriesLoading,
  } = useEntity("category");

  useEffect(() => {
    if (companyRef !== "") {
      findCategories({
        page: 0,
        limit: 200,
        _q: "",
        activeTab: "all",
        sort: "asc",
        companyRef: companyRef?.toString(),
      });
    }

    find({
      page: 0,
      limit: 999,
      _q: "",
      activeTab: "active",
      sort: "asc",
      companyRef: companyRef?.toString(),
      locationRef: formik.values?.locationRef,
    });
  }, [companyRef, formik.values]);

  useEffect(() => {
    if (companyRef != null && userType === USER_TYPES.SUPERADMIN) {
      company(companyRef?.toString());
    }
  }, [companyRef]);

  useEffect(() => {
    const existingChannels = entities?.results?.map((e: any) => {
      return e?.orderType;
    });

    if (!id && userType === USER_TYPES.SUPERADMIN) {
      const Channels =
        companyEntity?.channel?.length > 0
          ? companyEntity?.channel?.map((channel: any) => {
              return {
                label: ChannelsName[channel.name] || channel.name,
                value: channel.name,
              };
            })
          : ChannelsForRestaurant;

      const filteredChannels = Channels?.filter(
        (ec: any) => !existingChannels?.includes(ec?.value)
      );

      setChannels(filteredChannels || []);
      return;
    } else if (id != null && userType === USER_TYPES.SUPERADMIN) {
      const channelOptions =
        companyEntity?.channel?.length > 0
          ? companyEntity?.channel?.map((channel: any) => {
              return {
                label: ChannelsName[channel.name] || channel.name,
                value: channel.name,
              };
            })
          : ChannelsForRestaurant;

      setChannels(channelOptions || []);
      return;
    } else if (id != null && userType === USER_TYPES.ADMIN) {
      const channelOptions =
        user?.company?.channel?.length > 0
          ? user?.company?.channel?.map((channel: any) => {
              return {
                label: ChannelsName[channel.name] || channel.name,
                value: channel.name,
              };
            })
          : ChannelsForRestaurant;

      setChannels(channelOptions || []);
      return;
    }

    const Channels =
      user?.company?.channel?.length > 0
        ? user?.company?.channel?.map((channel: any) => {
            return {
              label: ChannelsName[channel.name] || channel.name,
              value: channel.name,
            };
          })
        : ChannelsForRestaurant;

    if (id != null) {
      setChannels(Channels || []);
    } else {
      const filteredChannels = Channels?.filter(
        (ec: any) => !existingChannels?.includes(ec?.value)
      );

      setChannels(filteredChannels || []);
    }
  }, [
    companyEntity,
    user?.company,
    formik.values.locationRef,
    entities?.results,
    userType,
    id,
  ]);

  useEffect(() => {
    let combinedProducts: any = [];
    formik.values?.products?.forEach((flatten: any) => {
      combinedProducts.push(flatten._id);
    });
    setCombinedProducts(combinedProducts);

    let combinedCategories: any = [];

    formik.values?.categories?.flatMap((flatten: any) => {
      return combinedCategories.push(flatten?.categoryRef);
    });
    setCombinedCategories(combinedCategories);
  }, [formik.values]);

  useEffect(() => {
    if (entity && !initialized) {
      formik.setFieldValue("categories", entity?.categories);
      formik.setFieldValue("products", entity?.products);
      formik.setFieldValue("location", entity?.location?.name);
      formik.setFieldValue("locationRef", entity?.locationRef);
      formik.setFieldValue("orderType", newid ? "" : entity?.orderType);
      setInitialized(true);
    }
  }, [entity, id, initialized, channels]);

  useEffect(() => {
    const handleBeforeUnload = (event: any) => {
      if (localStorage.getItem("isChangeinMenu") === "true") {
        event.preventDefault();
        event.returnValue = "";
        const confirmationMessage =
          "Are you sure you want to leave? Your changes may not be saved.";
        (event || window.event).returnValue = confirmationMessage;

        return confirmationMessage;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("isChangeinMenu", "false");
  }, []);

  useEffect(() => {
    if (newid != null) {
      findOne(newid?.toString());
      localStorage.setItem("isChangeinMenu", "true");
    }
  }, [newid]);

  useEffect(() => {
    findMenu({
      page: 0,
      sort: "asc",
      activeTab: "all",
      limit: 100,
      _q: "",
      companyRef: companyRef?.toString(),
      locationRef: formik?.values?.locationRef?.toString() || "",
    });
  }, [companyRef, formik.values.locationRef]);

  if (!canAccessModule("menu_management")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["menu:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Menu")}`} />
      <Box component="main" sx={{ mb: 2, py: 2, flexGrow: 1 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Grid
                container
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Grid item>
                  <Typography variant="h4">
                    {id != null ? t("Edit Menu ") : t("Create Menu ")}
                  </Typography>
                </Grid>
                <Grid item>
                  <Stack
                    spacing={3}
                    display="flex"
                    direction="row"
                    alignItems="center"
                    justifyContent="flex-end"
                    sx={{ width: { xs: "100%", md: "auto" } }}
                  >
                    <Button
                      onClick={() => {
                        setOpenModal(true);
                      }}
                      sx={{ pr: { xs: 0, md: 4 }, pl: { xs: 1, md: 4 } }}
                      variant="outlined"
                      startIcon={
                        <SvgIcon>
                          <PencilAlt />
                        </SvgIcon>
                      }
                    >
                      <Typography
                        sx={{ display: { xs: "none", md: "inline" } }}
                      >
                        {t("Category Layout")}
                      </Typography>
                    </Button>
                    <Button
                      startIcon={
                        <SvgIcon>
                          <PlusIcon />
                        </SvgIcon>
                      }
                      variant="contained"
                      onClick={() => {
                        if (!canCreate) {
                          return toast.error(t("You don't have access"));
                        }
                        if (formik.values.locationRef?.length === 0) {
                          toast.error(t("Select a location to create menu!"));
                        }
                        localStorage.setItem("isChangeinMenu", "false");

                        formik.handleSubmit();
                      }}
                      sx={{ pr: { xs: 0, md: 4 }, pl: { xs: 1, md: 4 } }}
                      disabled={formik.isSubmitting}
                    >
                      <Typography
                        sx={{ display: { xs: "none", md: "inline" } }}
                      >
                        {id != null ? t("Update Menu") : t("Create Menu")}
                      </Typography>
                    </Button>
                  </Stack>
                </Grid>
              </Grid>

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
                    alignItems: "center",
                    flexDirection: "row",
                    width: 520,
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
            </Stack>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Box sx={{ width: { xs: "190px", md: "290px" }, ml: 0.5 }}>
                  <LocationAutoCompleteDropdown
                    disabled={id != null}
                    required
                    showAllLocation={false}
                    companyRef={companyRef}
                    onChange={(id, name) => {
                      formik.setFieldValue("locationRef", id);
                      formik.setFieldValue("location", name?.en);
                    }}
                    selectedId={formik.values.locationRef as string}
                    label={t("Location")}
                    id="location"
                  />
                </Box>
                <Box sx={{ width: { xs: "190px", md: "290px" }, ml: 0.5 }}>
                  <OrderTypeSelect
                    disabled={id ? true : !formik.values.locationRef}
                    required
                    industry="restaurant"
                    orderTypes={channels}
                    selectedIds={formik.values.orderType}
                    id={"order-types-multi-select"}
                    onChange={(e) => {
                      formik.setFieldValue("orderType", e);
                    }}
                    label={t("Order Types")}
                  />
                </Box>
              </Box>
            </Box>
          </Stack>

          {loading || productsLoading || categoriesLoading ? (
            <>
              <Box
                sx={{
                  height: "60vh",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress />
              </Box>
            </>
          ) : (
            <>
              <Card
                sx={{
                  mt: 4,
                  overflow: "auto",
                }}
              >
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Stack spacing={1} direction="row">
                        <Typography variant="h6">
                          {t("Add Category")}
                        </Typography>
                        {!id && (
                          <Tooltip
                            title={t(
                              "Please select a location to add categories"
                            )}
                            style={{ marginLeft: "6px", maxWidth: "50px" }}
                          >
                            <SvgIcon color="action">
                              <InfoCircleIcon />
                            </SvgIcon>
                          </Tooltip>
                        )}
                      </Stack>
                      <Stack>
                        <Box sx={{ mt: 2 }}>
                          <CategoryDropdownMenuManagement
                            selectedCategories={combinedCategories}
                            disabled={!formik.values.locationRef}
                            defaultSelectedValue={{}}
                            companyRef={companyRef as string}
                            required
                            error={null}
                            onChange={(id, name, image) => {
                              const categoryProducts = product.results
                                .filter((pro: any) => pro?.categoryRef === id)
                                .map((productData: any, idx: number) => {
                                  const obj = {
                                    productRef: productData?._id,
                                    variants: productData?.variants,
                                    companyRef: productData?.companyRef,
                                    company: productData?.company,
                                    boxes: productData?.boxes,
                                    name: productData?.name,
                                    _id: productData?._id,
                                    sortOrder: idx,
                                    categoryRef: productData?.categoryRef,
                                    category: productData?.category,
                                    ...productData,
                                  };
                                  return obj;
                                });

                              if (categoryProducts?.length <= 0 && id) {
                                toast.error(
                                  "This category doesn't have products!"
                                );
                                return;
                              }

                              const categoryRefs = formik.values.categoryRefs;

                              categoryRefs.push(id);

                              const categories = formik.values.categories || [];

                              let products = formik.values.products || [];

                              const category = categories?.find(
                                (cat: any) => cat.categoryRef === id
                              );

                              if (
                                !category &&
                                name &&
                                id &&
                                categoryProducts?.length > 0
                              ) {
                                categories?.push({
                                  categoryRef: id,
                                  name,
                                  sortOrder: 0,
                                  image,
                                });

                                products = [...products, ...categoryProducts];

                                formik.setFieldValue("categories", categories);
                                formik.setFieldValue("products", products);
                                formik.setFieldValue(
                                  "categoryRefs",
                                  categoryRefs
                                );
                              }
                              toast.success(`Category is added to the list`);

                              localStorage.setItem("isChangeinMenu", "true");
                            }}
                            // selectedId={formik?.values?.categoryRefs as any}
                            label={t("Add Category")}
                            id="category"
                          />
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={4}>
                      <Stack spacing={1} direction="row">
                        <Typography variant="h6">{t("Add Product")}</Typography>
                        {!id && (
                          <Tooltip
                            title={t(
                              "Please select a location to add products"
                            )}
                            style={{ marginLeft: "6px", maxWidth: "50px" }}
                          >
                            <SvgIcon color="action">
                              <InfoCircleIcon />
                            </SvgIcon>
                          </Tooltip>
                        )}
                      </Stack>
                      <Stack spacing={1}>
                        <Box sx={{ mt: 2 }}>
                          <AddProductTextInputMenuManagement
                            disabled={!formik.values.locationRef}
                            selectedProducts={combinedProducts}
                            onProductSelect={(selectedProduct: any) => {
                              const selectedCats =
                                formik?.values?.categories?.findIndex(
                                  (cats: any) =>
                                    cats.categoryRef ===
                                    selectedProduct.categoryRef
                                );

                              if (selectedCats !== -1) {
                                const menuData = formik?.values?.products;

                                const selectedProds = menuData.findIndex(
                                  (cats: any) =>
                                    cats.productRef ===
                                    selectedProduct.productRef
                                );

                                if (selectedProds === -1) {
                                  menuData.push({
                                    ...selectedProduct,
                                  });

                                  formik.setFieldValue("products", menuData);
                                }
                              } else {
                                const categoryRefs = formik.values.categoryRefs;

                                categoryRefs.push(selectedProduct?.categoryRef);

                                const categories = formik.values.categories;

                                const cat = categoriesData?.results?.find(
                                  (cat) =>
                                    cat?._id === selectedProduct?.categoryRef
                                );

                                categories.push({
                                  categoryRef: selectedProduct?.categoryRef,
                                  name: cat?.name,
                                  image: cat?.image,
                                });

                                const products = [
                                  selectedProduct,
                                  ...formik.values?.products,
                                ];

                                formik.setFieldValue("products", products);
                                formik.setFieldValue("categories", categories);
                                formik.setFieldValue(
                                  "categoryRefs",
                                  categoryRefs
                                );
                              }
                              toast.success(`Product is added to the list`);
                              localStorage.setItem("isChangeinMenu", "true");
                            }}
                            companyRef={companyRef as string}
                            locationRef={formik.values?.locationRef as string}
                            label={t("Search using Product Name")}
                            id="Products"
                          />
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              {formik.values?.categories?.length > 0 ? (
                <>
                  {formik.values?.categories?.map(
                    (item: any, index: number) => {
                      return (
                        <CategoryDNDCard
                          formik={formik}
                          item={item}
                          index={index}
                          key={index}
                        />
                      );
                    }
                  )}
                </>
              ) : (
                <Box sx={{ mt: 6, mb: 4 }}>
                  <NoDataAnimation
                    text={
                      <Typography
                        variant="h6"
                        textAlign="center"
                        sx={{ mt: 2 }}
                      >
                        {t("No Data!")}
                      </Typography>
                    }
                  />
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>
      <EditLayoutModal
        data={formik.values.categories}
        open={openModal}
        handleClose={() => setOpenModal(false)}
        formik={formik}
      />
      <ConfirmationDialog
        show={showDirtyDialogEvent}
        ischangedProduct={ischangedMenu}
        toggle={() => setShowDirtyDialogEvent(!showDirtyDialogEvent)}
        onOk={handleDirtyConfirmation}
        onDiscard={handleDirtyConfirmationDiscard}
        okButtonText={`${t("Save changes")}`}
        okButtonPrimaryColor
        cancelButtonText={t("Discard")}
        cancelButtonErrorColor
        title={t("Confirmation")}
        text={t(`Changes are made are you sure want to go back`)}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
