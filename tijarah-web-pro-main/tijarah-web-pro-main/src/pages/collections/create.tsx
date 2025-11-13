import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteOutlineTwoToneIcon from "@mui/icons-material/DeleteOutlineTwoTone";
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
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { CollectionProductRowLoading } from "src/components/collections/collection-product-row-loading";
import ConfirmationDialog from "src/components/confirmation-dialog";
import CollectionProductMultiSelect from "src/components/input/collection-product-multiSelect";
import CompanyDropdown from "src/components/input/company-auto-complete";
import { ImageCropModal } from "src/components/modals/image-crop-modal";
import { ProductDropzone } from "src/components/product-dropzone";
import { Seo } from "src/components/seo";
import TextFieldWrapper from "src/components/text-field-wrapper";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import UpgradePackage from "src/pages/upgrade-package";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import { USER_TYPES } from "src/utils/constants";
import { getUploadedDocName } from "src/utils/get-uploaded-file-name";
import { Screens } from "src/utils/screens-names";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { FileUploadNamespace } from "src/utils/uploadToS3";
import useActiveTabs from "src/utils/use-active-tabs";
import * as Yup from "yup";
import { useCurrency } from "src/utils/useCurrency";

interface CreateCollectionProps {
  collectionNameEn: string;
  collectionNameAr: string;
  logoFile: any[];
  logo: string;
  products: any[];
  productsRefs: string[];
  status: boolean;
}

const CreateCollections: PageType = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { canAccessModule } = useFeatureModuleManager();
  const { userType } = useUserType();
  const { id, companyRef, companyName, origin } = router.query;
  const { changeTab } = useActiveTabs();
  const queryClient = useQueryClient();
  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["collection:update"]);
  const canCreate = canAccess(MoleculeType["collection:create"]);

  const {
    findOne,
    create,
    updateEntity,
    deleteEntity: deleteCollection,
    entity,
    loading,
  } = useEntity("collection");
  const { create: collectionAssign } = useEntity("collection/assign");
  const { create: deleteEntity } = useEntity("collection/remove");
  const {
    find,
    entities,
    loading: loadingProduct,
    updateEntity: updateProduct,
  } = useEntity("product");

  usePageView();

  const [, setShowError] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [openCropModal, setOpenCropModal] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [loadUpdateProduct, setLoadUpdateProduct] = useState(false);
  const [showDialogDeleteItem, setShowDialogDeleteItem] = useState(false);
  const currency = useCurrency();

  const headers = [
    {
      key: "product",
      label: t("Product"),
    },
    {
      key: "brand",
      label: t("Brand"),
    },
    {
      key: "category",
      label: t("Category"),
    },
    {
      key: "price",
      label: t("Price"),
    },
    {
      key: "action",
      label: "",
    },
  ];

  const initialValues: CreateCollectionProps = {
    collectionNameEn: "",
    collectionNameAr: "",
    logoFile: [],
    logo: "",
    productsRefs: [],
    products: [],
    status: true,
  };

  const validationSchema = Yup.object({
    collectionNameEn: Yup.string()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid collection name")
      )
      .required(`${t("Collection Name is required in English")}`)
      .max(60, t("Collection name must not be greater than 60 characters")),
    collectionNameAr: Yup.string()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid collection name")
      )
      .required(`${t("Collection Name is required in Arabic")}`)
      .max(60, t("Collection name must not be greater than 60 characters")),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const data = {
        image: values.logo,
        name: {
          en: values.collectionNameEn,
          ar: values.collectionNameAr,
        },
        status: values.status ? "active" : "inactive",
        companyRef: companyRef,
        company: { name: companyName },
      };

      try {
        if (id) {
          await updateEntity(id?.toString(), { ...data });
        } else {
          await create({ ...data });
        }

        toast.success(
          id == null
            ? `${t("Collection Created")}`
            : `${t("Collection Updated")}`
        );
        if (origin == "company") {
          changeTab("catalogue", Screens?.companyDetail);
        }
        router.back();
      } catch (err) {
        if (
          err?.code === "collection_already_exists" ||
          err?.message === "collection_already_exists"
        ) {
          toast.error(t("Collection already exists."));
        } else {
          toast.error(err.message);
        }
      }
    },
  });

  const handleDeleteItem = async () => {
    try {
      await deleteCollection(id.toString());
      toast.success(`${t("Item Deleted")}`);
      setShowDialogDeleteItem(false);
      router.back();
    } catch (error) {
      toast.error(error.message);
      setShowDialogDeleteItem(false);
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

  const companyLogoFileRemove = (): void => {
    formik.setFieldValue("logoFile", []);
    formik.setFieldValue("logo", "");
  };
  const companyLogoFileDrop = (newFiles: any): void => {
    if (newFiles?.length > 1) {
      toast.error(t("Please select one image to upload"));
      return;
    }

    formik.setFieldValue("logoFile", newFiles);
    if (newFiles[0]) {
      setOpenCropModal(true);
    } else {
      toast.error(
        `${t("File type not supported or limit the image size within 1 MB")}`
      );
    }
  };
  const logoFileRemoveAll = (): void => {
    formik.setFieldValue("logoFile", []);
  };

  const handleUpload = async (files: any) => {
    setIsUploading(true);
    try {
      const file = files[0];
      const tempUrl = URL.createObjectURL(file);
      setImgSrc(tempUrl);
      setIsUploaded(true);
      setIsUploading(false);
    } catch (error) {
      toast.error(error.message);
      setIsUploading(false);
    }
  };

  const handleCroppedImage = (croppedImageUrl: any) => {
    formik.setFieldValue("logo", croppedImageUrl);
  };

  const getItemPrice = (variants: Array<any>) => {
    const allPrices: any = variants?.flatMap((variant: any) => variant?.price);
    const sortedPice = allPrices?.sort(
      (p1: any, p2: any) => (p1 || 0) - (p2 || 0)
    );
    const hasZero =
      sortedPice?.findIndex(
        (t: any) => !t || t === null || t == undefined || t == 0
      ) !== -1;
    const filteredArray = sortedPice?.filter((p: any) => p > 0);
    let str = ``;
    if (filteredArray?.length === 1) {
      str += `${currency} ${toFixedNumber(filteredArray[0])}`;
    } else if (filteredArray?.length > 1) {
      str += `${currency} ${toFixedNumber(
        filteredArray[0]
      )} - ${currency} ${toFixedNumber(
        filteredArray[filteredArray.length - 1]
      )}`;
    }

    if (hasZero) {
      if (filteredArray?.length > 0) {
        str += ` , `;
      }
      str += `Custom Price`;
    }

    return str;
  };

  const handleAddProduct = async () => {
    setLoadUpdateProduct(true);
    try {
      const data = {
        productsData: formik.values.products,
        collectionRef: id,
      };

      await collectionAssign(data);
      formik.setFieldValue("productsRefs", []);
      formik.setFieldValue("products", []);
      toast.success(t("Product's added to Collection"));
      queryClient.invalidateQueries("find-one-collection");
    } catch (error) {
      toast.error(error.message || error.code);
    } finally {
      setLoadUpdateProduct(false);
    }
  };

  const handleRemoveProduct = async (productRef: any) => {
    try {
      const filteredProducts = entity.products.filter(
        (product: any) => product.productRef === productRef
      );

      if (filteredProducts.length > 0) {
        const productData = filteredProducts[0];

        const data = {
          productsData: productData,
          collectionRef: id,
        };

        await deleteEntity(data);

        toast.success("Product removed successfully");
        queryClient.invalidateQueries("find-one-collection");
      } else {
        toast.error("Product with the given reference not found");
      }
    } catch (error) {
      toast.error(error.message || error.code);
    }
  };

  const lng = localStorage.getItem("currentLanguage");

  const transformedData = useMemo(() => {
    const arr: any[] = entity?.products?.map((d: any) => {
      return {
        key: d?.productRef,
        _id: d?.productRef,
        product: (
          <Box>
            <Typography>{d?.name[lng] || d?.name?.en}</Typography>
          </Box>
        ),
        category: (
          <Typography variant="body2">{d?.category?.name || "NA"}</Typography>
        ),
        brand: (
          <Typography variant="body2">{d?.brand?.name || "NA"}</Typography>
        ),
        price: (
          <Typography variant="body2">{`${currency} ${d?.price}`}</Typography>
        ),
        action: (
          <IconButton
            onClick={(e) => {
              if (!canUpdate) {
                return toast.error(t("You don't have access"));
              }
              e.preventDefault();
              handleRemoveProduct(d?.productRef);
              console.log(d?.productRef);
            }}
            sx={{ mr: 0.7 }}
          >
            <SvgIcon>
              <DeleteOutlineTwoToneIcon color="error" />
            </SvgIcon>
          </IconButton>
        ),
      };
    });

    return arr;
  }, [entity?.products]);

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedItems = transformedData?.slice(startIndex, endIndex);

  useEffect(() => {
    if (id != null) {
      findOne(id?.toString());
    }
  }, [id]);

  useEffect(() => {
    if (id != null) {
      find({
        page: page,
        sort: "desc",
        activeTab: "all",
        limit: rowsPerPage,
        _q: "",
        companyRef: companyRef as string,
        collectionRef: formik.values?.productsRefs as string[],
      });
    }
  }, [id, page, companyRef, rowsPerPage, formik.values.productsRefs]);

  useEffect(() => {
    if (entity != null) {
      formik.setFieldValue("logo", entity?.image || "");
      formik.setFieldValue("collectionNameEn", entity?.name?.en);
      formik.setFieldValue("collectionNameAr", entity?.name?.ar);
      formik.setFieldValue("productsRefs", []);
      formik.setFieldValue("products", []);
      formik.setFieldValue("status", entity?.status == "active" ? true : false);
    }
  }, [entity]);

  console.log(formik.values);

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

  if (!canAccessModule("collections")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["collection:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo
        title={
          id != null ? `${t("Edit Collections")}` : `${t("Create Collections")}`
        }
      />
      <Box component="main" sx={{ py: 8, flexGrow: 1 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Box
                sx={{ mb: 3, maxWidth: 100, cursor: "pointer" }}
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
                  sx={{ display: "flex", lignItems: "center" }}
                >
                  <ArrowBackIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "#6B7280" }}
                  />
                  <Typography variant="subtitle2">
                    {t("Collections")}
                  </Typography>
                </Link>
              </Box>
              <Typography variant="h4">
                {id != null ? t("Edit Collections") : t("Create Collections")}
              </Typography>
            </Stack>

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4} sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">
                          {t("Collection Details")}
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
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box sx={{ flex: 0.9, pr: 1 }}>
                            <Box>
                              <TextFieldWrapper
                                disabled={id != null && !canUpdate}
                                autoComplete="off"
                                inputProps={{
                                  style: { textTransform: "capitalize" },
                                }}
                                fullWidth
                                label={t("Collection (English)")}
                                name="collectionNameEn"
                                error={Boolean(
                                  formik.touched.collectionNameEn &&
                                    formik.errors.collectionNameEn
                                )}
                                helperText={
                                  formik.touched.collectionNameEn &&
                                  formik.errors.collectionNameEn
                                }
                                onBlur={formik.handleBlur}
                                onChange={(e) => {
                                  formik.handleChange(e);
                                }}
                                required
                                value={formik.values.collectionNameEn}
                              />
                            </Box>

                            <Box sx={{ mt: 3 }}>
                              <TextFieldWrapper
                                disabled={id != null && !canUpdate}
                                autoComplete="off"
                                inputProps={{
                                  style: { textTransform: "capitalize" },
                                }}
                                fullWidth
                                label={t("Collection (Arabic)")}
                                name="collectionNameAr"
                                error={Boolean(
                                  formik.touched.collectionNameAr &&
                                    formik.errors.collectionNameAr
                                )}
                                helperText={
                                  formik.touched.collectionNameAr &&
                                  formik.errors.collectionNameAr
                                }
                                onBlur={formik.handleBlur}
                                onChange={(e) => {
                                  formik.handleChange(e);
                                }}
                                required
                                value={formik.values.collectionNameAr}
                              />
                            </Box>
                          </Box>

                          <Box
                            sx={{
                              mt: 2,
                              flex: 0.2,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <ProductDropzone
                              disabled={id != null && !canUpdate}
                              // @ts-ignore
                              accept={{
                                "image/*": [],
                              }}
                              files={formik.values.logoFile}
                              imageName={getUploadedDocName(formik.values.logo)}
                              uploadedImageUrl={formik.values.logo}
                              onDrop={companyLogoFileDrop}
                              onUpload={handleUpload}
                              onRemove={companyLogoFileRemove}
                              onRemoveAll={logoFileRemoveAll}
                              maxFiles={1}
                              maxSize={999999}
                              isUploaded={isUploaded}
                              setIsUploaded={setIsUploaded}
                              isUploading={isUploading}
                              fileDataTestId="company-logo-file"
                            />
                          </Box>
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
                            {t("Add Products")}
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
                              <CollectionProductMultiSelect
                                companyRef={companyRef}
                                collectionRef={entity?.productsRefs}
                                id="collection-product-multi-select"
                                selectedIds={formik.values?.productsRefs}
                                onChange={(option: any) => {
                                  if (option?.length > 0) {
                                    const selectedProducts = option?.map(
                                      (optionItem: any) => ({
                                        productRef: optionItem._id,
                                        name: optionItem.name,
                                        category: {
                                          name: optionItem.category?.name,
                                        },
                                        brand: { name: optionItem.brand?.name },
                                        price:
                                          optionItem?.variants?.[0]?.price || 0,
                                      })
                                    );
                                    const ids = option?.map((option: any) => {
                                      return option._id;
                                    });

                                    formik.setFieldValue("productsRefs", ids);
                                    formik.setFieldValue(
                                      "products",
                                      selectedProducts
                                    );
                                  } else {
                                    formik.setFieldValue("productsRefs", []);
                                    formik.setFieldValue("products", []);
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
                                setShowError(true);

                                if (id != null && !canUpdate) {
                                  return toast.error(
                                    t("You don't have access")
                                  );
                                }

                                handleAddProduct();
                              }}
                              loading={loadUpdateProduct}
                              sx={{ mt: -1, width: "80%" }}
                              disabled={
                                formik.values.productsRefs?.length === 0
                              }
                            >
                              {t("Add")}
                            </LoadingButton>
                          </Stack>
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 4, mb: -3 }}>
                        <SuperTable
                          isLoading={loadingProduct}
                          loaderComponent={CollectionProductRowLoading}
                          items={paginatedItems}
                          headers={headers}
                          total={entity?.products.length || 0}
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
                                    {t("No Products!")}
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
                {id != null && (
                  <Card>
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={8}>
                          <Stack spacing={1}>
                            <Typography variant="h6">{t("Status")}</Typography>
                            <Typography color="text.secondary" variant="body2">
                              {t("Change the status of the Collection")}
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid
                          item
                          xs={4}
                          sx={{ display: "flex", justifyContent: "flex-end" }}
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
                                sx={{ mr: 0.2 }}
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
                  {/* {Boolean(!id) && ( */}
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
                  {/* )} */}
                  {/* {id && (
                    <LoadingButton
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        if (origin == "company") {
                          changeTab("customers", Screens?.companyDetail);
                        }
                        setShowDialogDeleteItem(true);
                      }}
                      sx={{ ml: 1 }}
                    >
                      {t("Delete")}
                    </LoadingButton>
                  )} */}

                  <Box>
                    {/* {id && (
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
                    )} */}

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
                  </Box>
                </Stack>
              </Stack>
            </form>
          </Stack>
        </Container>
      </Box>
      <ImageCropModal
        open={openCropModal}
        handleClose={() => {
          setOpenCropModal(false);
          setImgSrc(null);
        }}
        handleCroppedImage={handleCroppedImage}
        imgSrcUrl={imgSrc}
        fileUploadNameSpace={FileUploadNamespace["collection-images"]}
      />
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

CreateCollections.getLayout = (page) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default CreateCollections;
