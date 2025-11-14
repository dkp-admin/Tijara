import ControlPointRoundedIcon from "@mui/icons-material/ControlPointRounded";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import {
  Box,
  Card,
  Container,
  IconButton,
  Stack,
  SvgIcon,
  Typography,
  useTheme,
} from "@mui/material";
import Image01Icon from "@untitled-ui/icons-react/build/esm/Image01";
import { useRouter } from "next/router";
import { ChangeEvent, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { TransformedArrowIcon } from "src/components/TransformedIcons";
import { GlobalProductsRowLoading } from "src/components/modals/platform/global-products/global-product-row-loading";
import { SingleProductImportModal } from "src/components/modals/singleProductImport-modal";
import { RouterLink } from "src/components/router-link";
import { Seo } from "src/components/seo";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { CompanyContext } from "src/contexts/company-context";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { useGlobalProduct } from "src/hooks/use-global-check";
import { usePageView } from "src/hooks/use-page-view";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { green } from "src/theme/colors";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useDebounce } from "use-debounce";
import withPermission from "../permissionManager/restrict-page";
import { useCurrency } from "src/utils/useCurrency";

function SingleGlobalProductTab({ origin = "company" }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const { find, loading, entities } = useEntity("global-products");
  const { isAlreadyImported } = useGlobalProduct();
  const [productData, setProductData] = useState<any>(null);
  const [openImportProductModal, setOpenImportProductModal] = useState(false);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [filter, setFilter] = useState<any>([]);
  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };
  const currency = useCurrency();
  const companyContext = useContext<any>(CompanyContext);

  const canAccess = usePermissionManager();

  const canImport =
    canAccess(MoleculeType["product:import"]) ||
    canAccess(MoleculeType["product:manage"]);

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  usePageView();

  const handleQueryChange = (value: string): void => {
    if (value != undefined) {
      setQueryText(value);
      if (page > 0) {
        setPage(0);
      }
    }
  };

  const handleSortChange = (value: any) => {
    setSort(value);
  };

  const handleFilterChange = (changedFilter: any) => {
    setPage(0);
    setFilter(changedFilter);
  };

  const tableHeaders = [
    {
      key: "add",
      label: "",
    },
    {
      key: "product",
      label: t("Product Name"),
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
      label: t("Action"),
    },
  ];

  const getItemPrice = (variants: Array<any>) => {
    const allPrices: any = variants.flatMap((variant: any) => variant.price);
    const sortedPice = allPrices.sort(
      (p1: any, p2: any) => (p1 || 0) - (p2 || 0)
    );
    const hasZero =
      sortedPice.findIndex(
        (t: any) => !t || t === null || t == undefined || t == 0
      ) !== -1;
    const filteredArray = sortedPice.filter((p: any) => p > 0);
    let str = ``;
    if (filteredArray.length === 1) {
      str += `${currency} ${toFixedNumber(filteredArray[0])}`;
    } else if (filteredArray.length > 1) {
      str += `${currency} ${toFixedNumber(
        filteredArray[0]
      )} - ${currency} ${toFixedNumber(
        filteredArray[filteredArray.length - 1]
      )}`;
    }

    if (hasZero) {
      if (filteredArray.length > 0) {
        str += ` , `;
      }
      str += `Custom Price`;
    }

    return str;
  };

  const transformedData = useMemo(() => {
    let arr: any[] = [];
    entities?.results?.map(async (d) => {
      arr.push({
        key: d?._id,
        _id: d?._id,
        add: (
          <IconButton
            onClick={async () => {
              if (!canImport) {
                toast.error(t("You don't have access"));
              }
              const res: any = await isAlreadyImported(d?._id);
              if (res?.exists) {
                toast.error("Already Imported");
                return;
              }
              setProductData(d);
              setOpenImportProductModal(true);
            }}
            sx={{ ml: 0.7, mr: -4, cursor: "pointer" }}
          >
            <ControlPointRoundedIcon color="primary" fontSize="large" />
          </IconButton>
        ),
        product: (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
            }}
          >
            {d?.image ? (
              <Box
                sx={{
                  alignItems: "center",
                  backgroundColor: "neutral.50",
                  backgroundImage: `url(${d.image})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  borderRadius: 1,
                  display: "flex",
                  height: 80,
                  justifyContent: "center",
                  overflow: "hidden",
                  width: 80,
                }}
              />
            ) : (
              <Box
                sx={{
                  alignItems: "center",
                  backgroundColor: "neutral.50",
                  borderRadius: 1,
                  display: "flex",
                  height: 80,
                  justifyContent: "center",
                  width: 80,
                }}
              >
                <SvgIcon>
                  <Image01Icon />
                </SvgIcon>
              </Box>
            )}
            <Box
              sx={{
                cursor: "pointer",
                ml: 2,
              }}
            >
              <Typography variant="subtitle2">{d?.name?.en}</Typography>
            </Box>
          </Box>
        ),
        brand: (
          <Typography variant="body2">{d?.brand?.name || "NA"}</Typography>
        ),
        category: (
          <Typography variant="body2">{d?.category?.name || "NA"}</Typography>
        ),
        price: (
          <Typography variant="body2">{getItemPrice(d?.variants)}</Typography>
        ),
        action: (
          <Box
            sx={{
              display: "flex",
              justifyContent: "end",
            }}
          >
            <IconButton
              onClick={() => {
                router.push({
                  pathname: tijarahPaths?.catalogue?.globalProducts?.view,
                  query: {
                    id: d?._id,
                    origin: origin,
                  },
                });
              }}
            >
              <SvgIcon>
                <TransformedArrowIcon name="arrow-right" />
              </SvgIcon>
            </IconButton>
          </Box>
        ),
      });
    });

    return arr;
  }, [entities?.results]);

  useEffect(() => {
    find({
      page: page,
      sort: sort,
      activeTab: "active",
      limit: rowsPerPage,
      _q: debouncedQuery,
      businessTypeRefs: [user?.company?.businessTypeRef],
    });
  }, [page, sort, debouncedQuery, rowsPerPage, filter]);

  return (
    <>
      <Seo title={`${t("Global Products")}`} />

      <Card sx={{ my: 4 }}>
        <SuperTableHeader
          onQueryChange={handleQueryChange}
          onFiltersChange={handleFilterChange}
          showFilter={false}
          searchPlaceholder={t("Search with Product Name/SKU")}
          onSortChange={handleSortChange}
          sort={sort}
          sortOptions={sortOptions}
        />

        <SuperTable
          isLoading={loading}
          loaderComponent={GlobalProductsRowLoading}
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
                  <Typography variant="h6" textAlign="center" sx={{ mt: 2 }}>
                    {t("No Global Products!")}
                  </Typography>
                }
              />
            </Box>
          }
        />
      </Card>

      <SingleProductImportModal
        companyRef={companyContext?._id}
        companyName={companyContext?.name?.en}
        product={productData}
        open={openImportProductModal}
        handleClose={() => setOpenImportProductModal(false)}
      />
    </>
  );
}

export default withPermission(
  SingleGlobalProductTab,
  MoleculeType["global-product:read"]
);
