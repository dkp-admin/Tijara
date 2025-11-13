import { Box, Card, Typography } from "@mui/material";
import { ChangeEvent, FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ProductListSearch } from "src/components/product/product-list-search";
import { ProductsRowLoading } from "src/components/product/product-row-loading";
import { ProductListTable } from "src/components/product/products-list-table";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";
import { CompositeProductListTable } from "./composite-products-list-table";

interface CompositeProductTableCardProps {
  companyRef?: string;
  companyName?: string;
  industry?: string;
  origin?: string;
}

export const CompositeProductTableCard: FC<CompositeProductTableCardProps> = (
  props
) => {
  const { t } = useTranslation();
  const { companyRef, companyName, origin, industry } = props;

  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [filter, setFilter] = useState<any>([]);

  const { find, loading, entities } = useEntity("product");

  usePageView();

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleQueryChange = (value: string): void => {
    if (value != undefined) {
      setQueryText(value);
      if (page > 0) {
        setPage(0);
      }
    }
  };

  const handlePageChange = (event: any, newPage: number): void => {
    setPage(newPage);
  };

  const handleSortChange = (value: any) => {
    setSort(value);
  };

  const handleFilterChange = (changedFilter: any) => {
    setPage(0);
    setFilter(changedFilter);
  };

  useEffect(() => {
    find({
      page: page,
      sort: sort,
      activeTab: filter?.status?.length > 0 ? filter.status[0] : "all",
      limit: rowsPerPage,
      _q: debouncedQuery,
      categoryRefs: filter?.category,
      companyRef: companyRef,
      brandRefs: filter?.brand,
      isSellable:
        filter?.sellable?.length > 0 && filter?.sellable?.includes("sellable")
          ? "false"
          : filter?.sellable?.length > 0 &&
            filter?.sellable?.includes("nonSellable")
          ? "true"
          : undefined,
      isComposite: true,
    });
  }, [page, sort, debouncedQuery, rowsPerPage, filter, companyRef]);

  return (
    <>
      <Card>
        <ProductListSearch
          companyRef={companyRef}
          onQueryChange={handleQueryChange}
          onFiltersChange={handleFilterChange}
          onSortChange={handleSortChange}
          sort={sort}
        />
        <CompositeProductListTable
          origin={origin}
          companyRef={companyRef}
          companyName={companyName}
          industry={industry}
          isLoading={loading}
          loaderComponent={ProductsRowLoading}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          page={page}
          items={entities?.results || []}
          count={entities?.total || 0}
          rowsPerPage={rowsPerPage}
          noDataPlaceholder={
            <Box sx={{ mt: 6, mb: 4 }}>
              <NoDataAnimation
                text={
                  <Typography variant="h6" textAlign="center" sx={{ mt: 2 }}>
                    {t("No Composite Products!")}
                  </Typography>
                }
              />
            </Box>
          }
        />
      </Card>
    </>
  );
};
