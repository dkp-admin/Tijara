import { Box, Card, Grid, Typography } from "@mui/material";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { usePageView } from "src/hooks/use-page-view";
import { format } from "date-fns";
import { PoGrnLogsRowLoading } from "src/components/purchase-order/pogrn-log-row-loading";

import { useDebounce } from "use-debounce";

import { useRouter } from "next/router";

export function PoGrnLog() {
  const { t } = useTranslation();
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);

  const router = useRouter();
  const { id, companyRef, companyName } = router.query;

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

  // useEffect(() => {
  //   find({
  //     page: debouncedQuery?.length > 0 ? 0 : page,
  //     _limit: rowsPerPage,
  //     q: debouncedQuery,
  //   });
  // }, [page, debouncedQuery, rowsPerPage]);

  const transformedData = useMemo(() => {
    let arr: any[] = [];

    []?.map((d) => {
      arr.push({
        key: d._id,
        _id: d?._id,
        dateTime: (
          <Typography variant="body2">
            {d?.date
              ? format(new Date(d?.date), "dd/MM/yyyy, HH:mm")
              : format(new Date(), "dd/MM/yyyy | HH:mm")}
          </Typography>
        ),
        updatedBy: (
          <Typography color="text.secondary" variant="caption">
            {d.name || "Name"}
          </Typography>
        ),
        events: (
          <Typography color="text.secondary" variant="caption">
            {`${d.type} ${d.action} by - ${d.email}` || "--"}
          </Typography>
        ),
      });
    });

    return arr;
  }, []);

  return (
    <>
      {id != null && (
        <Card sx={{ mt: 4 }}>
          <Grid xs={12} md={12}>
            <SuperTable
              // isLoading={loading}
              loaderComponent={PoGrnLogsRowLoading}
              items={transformedData}
              headers={tableHeaders}
              total={0}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPage={rowsPerPage}
              page={page}
              isCancelAllClicked={false}
              noDataPlaceholder={
                <Box sx={{ mt: 6, mb: 4 }}>
                  <NoDataAnimation
                    text={
                      <Typography
                        variant="h6"
                        textAlign="center"
                        sx={{ mt: 2 }}
                      >
                        {t("No activity")}
                      </Typography>
                    }
                  />
                </Box>
              }
            />
          </Grid>
        </Card>
      )}
    </>
  );
}
