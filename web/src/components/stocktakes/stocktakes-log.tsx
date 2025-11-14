import { Box, Card, Grid, Typography } from "@mui/material";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { usePageView } from "src/hooks/use-page-view";
import { format } from "date-fns";
import { StocktakesLogsRowLoading } from "src/components/stocktakes/stocktakes-log-row-loading";

import { useDebounce } from "use-debounce";

import { useRouter } from "next/router";
import { useEntity } from "src/hooks/use-entity";

export function StocktakesLog() {
  const { t } = useTranslation();
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);

  const router = useRouter();
  const { id, companyRef, companyName } = router.query;

  const { find, updateEntity, loading, entities } =
    useEntity("po-activity-log");

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

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
      key: "dateTime",
      label: t("Date Time"),
    },
    {
      key: "updatedBy",
      label: t("Updated By"),
    },
    {
      key: "events",
      label: t("Events"),
    },
  ];

  useEffect(() => {
    find({
      page: debouncedQuery?.length > 0 ? 0 : page,
      limit: rowsPerPage,
      sort: "desc",
      _q: debouncedQuery,
      companyRef: companyRef?.toString(),
      poRef: id?.toString(),
    });
  }, [page, debouncedQuery, companyRef, id, rowsPerPage]);

  const transformedData = useMemo(() => {
    let arr: any[] = [];

    entities?.results?.map((d) => {
      arr.push({
        key: d._id,
        _id: d?._id,
        dateTime: (
          <Typography variant="body2">
            {d?.updatedAt
              ? format(new Date(d?.updatedAt), "dd/MM/yyyy, h:mm a")
              : format(new Date(), "dd/MM/yyyy | h:mm a")}
          </Typography>
        ),
        updatedBy: (
          <Typography color="text.secondary" variant="caption">
            {d?.userName || "-"}
          </Typography>
        ),
        events: (
          <Typography color="text.secondary" variant="caption">
            {`${d?.orderType.toUpperCase()} ${d?.event
              .replace(/(\w)-(\w)/g, "$1 $2")
              .replace(/-/g, " ")} by - ${d?.userEmail}` || "--"}
          </Typography>
        ),
      });
    });

    return arr;
  }, [entities?.results]);

  return (
    <>
      {id != null && (
        <Card sx={{ mt: 0, p: 0 }}>
          <Box
            sx={{
              display: "flex",
              m: 2,
              mb: -1,
            }}
          >
            <Typography variant="h6">{t("Action Log")}</Typography>
          </Box>

          <SuperTable
            isLoading={loading}
            loaderComponent={StocktakesLogsRowLoading}
            items={transformedData}
            headers={tableHeaders}
            total={entities?.total || 0}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPage={rowsPerPage}
            page={page}
            isCancelAllClicked={false}
            noDataPlaceholder={
              <Box sx={{ mt: 6, mb: 4 }}>
                <NoDataAnimation
                  text={
                    <Typography variant="h6" textAlign="center" sx={{ mt: 2 }}>
                      {t("No activity")}
                    </Typography>
                  }
                />
              </Box>
            }
          />
        </Card>
      )}
    </>
  );
}
