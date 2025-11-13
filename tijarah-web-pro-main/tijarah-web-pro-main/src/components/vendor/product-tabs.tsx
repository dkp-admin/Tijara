import {
  Card,
  Container,
  Stack,
  Typography,
  Box,
  Button,
  SvgIcon,
  IconButton,
} from "@mui/material";
import Edit02Icon from "@untitled-ui/icons-react/build/esm/Edit02";
import { DeleteOutlined } from "@mui/icons-material";
import ConfirmationDialog from "src/components/confirmation-dialog";
import { useRouter } from "next/router";
import { usePageView } from "src/hooks/use-page-view";
import { VendorProductModal } from "src/components/modals/vendor-product-modal";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { useEntity } from "src/hooks/use-entity";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";
import { t } from "i18next";
import NoDataAnimation from "../widgets/animations/NoDataAnimation";
import { SuperTable } from "../widgets/super-table";
import { SuperTableHeader } from "../widgets/super-table-header";
import { VendorRowLoading } from "./vendor-row-loading";
import toast from "react-hot-toast";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { MoleculeType } from "src/permissionManager";
import withPermission from "../permissionManager/restrict-page";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

interface CaustomerTableCardProps {
  companyRef?: string;
  companyName?: string;
}

const ProductTab: FC<CaustomerTableCardProps> = (props) => {
  const router = useRouter();
  const canAccess = usePermissionManager();
  const canCreate =
    canAccess(MoleculeType["vendor-product:create"]) ||
    canAccess(MoleculeType["vendor-product:manage"]);

  const canDelete =
    canAccess(MoleculeType["vendor-product:delete"]) ||
    canAccess(MoleculeType["vendor-product:manage"]);

  const canUpdate =
    canAccess(MoleculeType["vendor-product:update"]) ||
    canAccess(MoleculeType["vendor-product:manage"]);

  const { id, companyRef, companyName, origin } = router.query;
  const [openVendorProductModal, setOpenVendorProductModal] = useState(false);
  const [showDialogCustomerEvent, setShowDialogCustomerEvent] = useState(false);
  const [isCancelAllClicked] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [queryText, setQueryText] = useState("");
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [filter, setFilter] = useState<any>([]);
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [filteredVariants, setFilteredVariants] = useState([]);
  const { find, findOne, updateEntity, deleteEntity, loading, entities } =
    useEntity("vendor-product");
  const lng = localStorage.getItem("currentLanguage");
  const currency = useCurrency();

  const [entitiesData, setEntitiesData] = useState<any>(null);
  usePageView();

  const filterVariants = () => {
    const variantSkus = entities?.results?.flatMap((entity) =>
      entity.variants.map((variant: any) => variant.sku)
    );
    setFilteredVariants(variantSkus);
  };

  const handleDeleteCustomerEvent = async () => {
    try {
      const itemIndex = entitiesData.results.findIndex(
        (item: any) => item._id === data.itemId
      );

      if (itemIndex !== -1) {
        const itemToDelete = { ...entitiesData.results[itemIndex] };

        const variantIndex = itemToDelete.variants.findIndex(
          (variant: any) => variant.sku === data.variantSku
        );

        if (variantIndex !== -1) {
          itemToDelete.variants.splice(variantIndex, 1);

          if (itemToDelete.variants.length === 0) {
            const updatedEntitiesData = [...entitiesData.results];
            updatedEntitiesData.splice(itemIndex, 1);

            setEntitiesData({ ...entitiesData, results: updatedEntitiesData });

            await deleteEntity(data.itemId);
          } else {
            const updatedEntitiesData = [...entitiesData.results];
            updatedEntitiesData[itemIndex] = itemToDelete;
            setEntitiesData({ ...entitiesData, results: updatedEntitiesData });

            await updateEntity(data.itemId, itemToDelete);
          }

          setShowDialogCustomerEvent(false);
          toast.success(t("Removed").toString());
        } else {
          toast.error(`${t("Variant not found in the item")}`);
        }
      } else {
        toast.error(`${t("Item not found")}`);
      }
    } catch (err) {
      setData(null);
      setShowDialogCustomerEvent(false);
      toast.error(err.message);
    }
  };

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleQueryChange = (value: string): void => {
    if (value != undefined) {
      setQueryText(value);
    }
  };

  const handleSortChange = (value: any) => {
    setSort(value);
  };

  const handleFilterChange = (changedFilter: any) => {
    setPage(0);
    setFilter(changedFilter);
  };

  useEffect(() => {
    if (data?.itemId != null) {
      findOne(data?.itemId?.toString());
    }
  }, [data?.itemId]);

  const tableHeaders = [
    {
      key: "name",
      label: t("Variant"),
    },
    {
      key: "sku",
      label: t("SKU"),
    },
    {
      key: "costPrice",
      label: t("cost Price"),
    },
    {
      key: "price",
      label: t("selling Price"),
    },
    {
      key: "type",
      label: t("Type"),
    },
    {
      key: "action",
      label: t("Action"),
    },
  ];

  const transformedData = useMemo(() => {
    if (!entities) {
      return [];
    }

    setEntitiesData(entities);

    return entities?.results?.flatMap((item) => {
      const variantsRows = item.variants?.map((variant: any) => ({
        key: variant.sku,

        name: (
          <>
            <Box>
              <Typography variant="body2">
                {item.product?.name[lng] || item.product?.name?.en}{" "}
                {item.hasMultipleVariants
                  ? variant.name[lng] || variant.name?.en
                  : ""}
              </Typography>
            </Box>
          </>
        ),
        sku: (
          <Typography variant="body2" sx={{ minWidth: "110px" }}>
            {variant.sku}
          </Typography>
        ),
        costPrice: (
          <Typography variant="body2">
            {variant.costPrice
              ? `${currency} ${toFixedNumber(variant.costPrice)}`
              : "NA"}
          </Typography>
        ),
        price: (
          <Typography variant="body2">
            {variant.price
              ? `${currency} ${toFixedNumber(variant.price)}`
              : "NA"}
          </Typography>
        ),
        type: (
          <Typography variant="body2">
            {variant.type ? variant.type : "item"}
          </Typography>
        ),
        action: (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <IconButton
              sx={{ mr: 0.7 }}
              onClick={() => {
                if (!canUpdate) {
                  return toast.error(t("You don't have access"));
                }
                setModalData({
                  item: item,
                  sku: variant.sku,
                  itemId: item._id,
                });
                setOpenVendorProductModal(true);
              }}
            >
              <SvgIcon>
                <Edit02Icon fontSize="small" />
              </SvgIcon>
            </IconButton>

            <IconButton
              onClick={(e) => {
                if (!canDelete) {
                  return toast.error(t("You don't have access"));
                }
                e.preventDefault();
                setData({ itemId: item._id, variantSku: variant.sku });
                setShowDialogCustomerEvent(true);
              }}
              style={{
                pointerEvents: "painted",
              }}
            >
              <DeleteOutlined fontSize="medium" color={"error"} />
            </IconButton>
          </Box>
        ),
      }));

      const boxesRows = item.boxes?.map((box: any) => ({
        key: box.sku,

        name: (
          <>
            <Box>
              <Typography variant="body2">
                {item.product?.name[lng] || item.product?.name?.en}{" "}
                {item.hasMultipleVariants
                  ? box.parentName?.[lng] || box.parentName?.en
                  : ""}{" "}
                ({box?.unitCount} {t("units")})
              </Typography>
            </Box>
          </>
        ),
        sku: (
          <Typography variant="body2" sx={{ minWidth: "110px" }}>
            {box.sku}
          </Typography>
        ),
        costPrice: (
          <Typography variant="body2">
            {`${currency} ${toFixedNumber(box.costPrice)}`}
          </Typography>
        ),
        price: (
          <Typography variant="body2">
            {`${currency} ${toFixedNumber(box.price)}` || "NA"}
          </Typography>
        ),
        type: <Typography variant="body2">{box.type}</Typography>,
        action: (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <IconButton
              sx={{ mr: 0.7 }}
              onClick={() => {
                if (!canUpdate) {
                  return toast.error(t("You don't have access"));
                }
                setModalData({ item: item, sku: box.sku, itemId: item._id });
                setOpenVendorProductModal(true);
              }}
            >
              <SvgIcon>
                <Edit02Icon fontSize="small" />
              </SvgIcon>
            </IconButton>

            <IconButton
              onClick={(e) => {
                e.preventDefault();
                if (!canDelete) {
                  return toast.error(t("You don't have access"));
                }
                setData({ itemId: item._id, variantSku: box.parentSku });
                setShowDialogCustomerEvent(true);
              }}
              style={{
                pointerEvents: "painted",
              }}
            >
              <DeleteOutlined fontSize="medium" color={"error"} />
            </IconButton>
          </Box>
        ),
      }));

      return [...variantsRows, ...boxesRows];
    });
  }, [entities.results]);

  useEffect(() => {
    find({
      page: debouncedQuery?.length > 0 ? 0 : page,
      sort: sort,
      activeTab: filter?.status?.length > 0 ? filter?.status[0] : "all",
      limit: rowsPerPage,
      _q: debouncedQuery,
      companyRef: companyRef?.toString(),
      vendorRef: id?.toString(),
    });
  }, [page, sort, debouncedQuery, rowsPerPage, filter, id]);

  return (
    <>
      <Container maxWidth="xl">
        <Stack spacing={2}>
          <Stack
            display={"flex"}
            alignItems={"flex-end"}
            justifyContent={"flex-end"}
          >
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
                filterVariants();
                setOpenVendorProductModal(true);
              }}
            >
              {t("Add Product")}
            </Button>
          </Stack>

          <VendorProductModal
            open={openVendorProductModal}
            handleClose={() => {
              setModalData(null);
              setOpenVendorProductModal(false);
            }}
            modalData={modalData}
            filteredVariants={filteredVariants}
          />
          <ConfirmationDialog
            show={showDialogCustomerEvent}
            toggle={() => {
              setData(null);
              setShowDialogCustomerEvent(!showDialogCustomerEvent);
            }}
            onOk={() => {
              handleDeleteCustomerEvent();
            }}
            okButtonText={`${t("Yes")}, ${t("Delete")}`}
            cancelButtonText={t("Cancel")}
            title={t("Confirmation")}
            text={t(
              `Are you sure you want to delete this Product?
              It will remove the variant as well as boxes`
            )}
          />
          <Card>
            <SuperTableHeader
              onQueryChange={handleQueryChange}
              showFilter={false}
              onFiltersChange={handleFilterChange}
              searchPlaceholder={t("Search using Product/SKU or Box SKU")}
              onSortChange={handleSortChange}
              sort={sort}
              sortOptions={sortOptions}
            />

            <SuperTable
              isLoading={loading}
              loaderComponent={VendorRowLoading}
              items={transformedData}
              headers={tableHeaders}
              total={entities?.total || 0}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPage={rowsPerPage}
              page={page}
              isCancelAllClicked={isCancelAllClicked}
              noDataPlaceholder={
                <Box sx={{ mt: 6, mb: 4 }}>
                  <NoDataAnimation
                    text={
                      <Typography
                        variant="h6"
                        textAlign="center"
                        sx={{ mt: 2 }}
                      >
                        {t("No Vendor Product")}
                      </Typography>
                    }
                  />
                </Box>
              }
            />
          </Card>
        </Stack>
      </Container>
    </>
  );
};

export default withPermission(ProductTab, MoleculeType["vendor-product:read"]);
