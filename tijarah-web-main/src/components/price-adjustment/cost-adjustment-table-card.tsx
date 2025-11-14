import { Box, Card, IconButton, SvgIcon, Typography } from "@mui/material";
import { useRouter } from "next/router";
import {
  ChangeEvent,
  FC,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { TransformedArrowIcon } from "src/components/TransformedIcons";
import { format } from "date-fns";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { Sort } from "src/types/sortoption";
import { USER_TYPES, sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";
import { CompanyContext } from "src/contexts/company-context";
import { AuthContext } from "src/contexts/auth/jwt-context";
import { CostAdjustmentRowLoading } from "./cost-adjustment-row-loading";

interface CostAdjustmentTableCardProps {
  companyRef?: string;
  companyName?: string;
  origin?: string;
  isSaptco?: boolean;
}

export const CostAdjustmentTableCard: FC<CostAdjustmentTableCardProps> = (
  props
) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { companyRef, companyName, origin, isSaptco } = props;
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [filter, setFilter] = useState<any>([]);
  const router = useRouter();
  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["bulk-price-update:create"]);
  const { find, updateEntity, loading, entities } =
    useEntity("price-adjustment");

  const companyContext = useContext(CompanyContext) as any;

  localStorage.setItem("companyContext", JSON.stringify(companyContext));

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

  const tableHeaders = [
    {
      key: "reference",
      label: t("Reference"),
    },
    {
      key: "status",
      label: t("status"),
    },
    {
      key: "date",
      label: t("Date"),
    },
    {
      key: "action",
      label: t(""),
    },
  ];

  const transformedData = useMemo(() => {
    let arr: any[] = [];
    entities?.results?.map((d) => {
      arr.push({
        key: d?._id,
        _id: d._id,

        reference: (
          <Typography variant="body2" color="success.main">
            {d?.name}
          </Typography>
        ),
        status: (
          <>
            <Typography
              variant="body2"
              style={{
                textTransform: "capitalize",
              }}
            >{`${d?.status}`}</Typography>
          </>
        ),
        date: (
          <>
            <Typography variant="body2">{`${format(
              new Date(d?.createdAt),
              "dd/MM/yyyy"
            )}`}</Typography>
          </>
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
                // if (!canUpdate) {
                //   return toast.error(t("You don't have access"));
                // }
                router.push({
                  pathname: tijarahPaths?.catalogue?.priceAdjustment?.create,
                  query: {
                    id: d?._id,
                    companyRef: companyRef,
                    companyName: companyName,
                    origin: origin ? origin : "",
                    isSaptco: isSaptco,
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
      limit: rowsPerPage,
      companyRef: companyRef?.toString(),
    });
  }, [page, sort, rowsPerPage, companyRef]);

  return (
    <>
      <Card>
        <SuperTable
          isLoading={loading}
          loaderComponent={CostAdjustmentRowLoading}
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
                    {t("No price adjustments!")}
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
