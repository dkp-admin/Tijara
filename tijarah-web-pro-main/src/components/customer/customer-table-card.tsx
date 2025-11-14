import { Box, Card, IconButton, SvgIcon, Typography } from "@mui/material";
import { format } from "date-fns";
import { useRouter } from "next/router";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CustomersRowLoading } from "src/components/customer/customers-row-loading";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useDebounce } from "use-debounce";
import { TransformedArrowIcon } from "../TransformedIcons";
import NoPermission from "src/pages/no-permission";
import { useCurrency } from "src/utils/useCurrency";

interface CaustomerTableCardProps {
  groupId?: string;
  companyRef?: string;
  companyName?: string;
  origin?: string;
}

export const CustomersTableCard: FC<CaustomerTableCardProps> = (props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { groupId, companyRef, companyName, origin } = props;
  const currency = useCurrency();

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [filter, setFilter] = useState<any>([]);
  const canAccess = usePermissionManager();
  const canCreate = canAccess(MoleculeType["customer:create"]);
  const canReadCustomer = canAccess(MoleculeType["customer:read"]);

  const { find, loading, entities } = useEntity("customer");

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

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
      key: "customer",
      label: t("Customer Name"),
    },
    {
      key: "totalSpent",
      label: t("Total Spent"),
    },
    {
      key: "totalOrders",
      label: t("Total Orders"),
    },
    {
      key: "lastOrder",
      label: t("Last Order"),
    },
    // {
    //   key: "walletAmount",
    //   label: t("Wallet Balance"),
    // },
    {
      key: "refundedAmount",
      label: t("Refunded Amount"),
    },
    {
      key: "action",
      label: t("Action"),
    },
  ];

  const transformedData = useMemo(() => {
    let arr: any[] = [];
    entities?.results?.map((d) => {
      arr.push({
        key: d._id,
        _id: d?._id,
        customer: (
          <>
            <Typography variant="body2">{d?.name}</Typography>
            <Typography variant="body2" color="gray">
              {d?.phone}
            </Typography>
          </>
        ),
        totalSpent: (
          <Typography variant="body2" sx={{ minWidth: "110px" }}>
            {`${currency} ${toFixedNumber(d?.totalSpent || 0)}`}
          </Typography>
        ),
        totalOrders: (
          <Typography variant="body2">{d?.totalOrder || 0}</Typography>
        ),
        lastOrder: (
          <Typography variant="body2">
            {d?.lastOrderDate
              ? format(
                  new Date(d?.lastOrderDate || new Date()),
                  "dd/MM/yyyy, hh:mm a"
                )
              : "NA"}
          </Typography>
        ),
        // walletAmount: (
        //   <Box>
        //     <WalletBalance companyRef={companyRef} customerRef={d?._id} />
        //   </Box>
        // ),
        refundedAmount: (
          <Typography variant="body2">
            {`${currency} ${toFixedNumber(d?.totalRefunded || 0)}`}
          </Typography>
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
                  pathname: tijarahPaths?.management?.customers?.create,
                  query: {
                    id: d?._id,
                    companyRef: companyRef,
                    companyName: companyName,
                    origin: origin ? origin : "",
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
    if (canReadCustomer) {
      find({
        page: page,
        sort: sort,
        activeTab: filter?.status?.length > 0 ? filter?.status[0] : "all",
        locationRefs: filter?.location || [],
        limit: rowsPerPage,
        groupRef: filter?.group?.length > 0 ? filter?.group[0] : "",
        _q: debouncedQuery,
        companyRef: companyRef,
      });
    }
  }, [page, sort, debouncedQuery, rowsPerPage, filter, companyRef, filter]);

  if (!canAccess(MoleculeType["customer:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Card>
        <SuperTableHeader
          groupId={groupId}
          showGroupFilter={true}
          showStatusFilter={false}
          companyRef={companyRef}
          onQueryChange={handleQueryChange}
          onFiltersChange={handleFilterChange}
          searchPlaceholder={t("Search with Customer Name, Phone Number")}
          onSortChange={handleSortChange}
          sort={sort}
          sortOptions={sortOptions}
        />

        <SuperTable
          isLoading={loading}
          loaderComponent={CustomersRowLoading}
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
                    {t("No Customers!")}
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
