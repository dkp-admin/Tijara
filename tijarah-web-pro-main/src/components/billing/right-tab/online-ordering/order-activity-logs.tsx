import { Box, Card, Typography } from "@mui/material";
import { format } from "date-fns";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PoGrnLogsRowLoading } from "src/components/purchase-order/pogrn-log-row-loading";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";

export function OrderActivityLogs({
  orderId,
  companyRef,
}: {
  orderId: string;
  companyRef: string;
}) {
  const { t } = useTranslation();

  usePageView();

  // const { find, loading, entities } = useEntity("order-activity-log");

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

  const transformedData = useMemo(() => {
    const arr: any[] = [
      {
        _id: "66952940e5ea857477341a0b",
        poRef: "66952940e5ea857477341a07",
        companyRef: "668390d3ab563f4264cf6fd6",
        updatedBy: "66838f8817a160546a3269fe",
        userName: "Super Admin",
        orderType: "po",
        userEmail: "admin@tijarah360.com",
        event: "discount-applied-of--10%",
        createdAt: "2024-07-15T13:50:56.832Z",
        updatedAt: "2024-07-15T13:50:56.832Z",
        __v: 0,
      },
      {
        _id: "66952940e5ea857477341a09",
        poRef: "66952940e5ea857477341a07",
        companyRef: "668390d3ab563f4264cf6fd6",
        updatedBy: "66838f8817a160546a3269fe",
        userName: "Super Admin",
        orderType: "po",
        userEmail: "admin@tijarah360.com",
        event: "created",
        createdAt: "2024-07-15T13:50:56.830Z",
        updatedAt: "2024-07-15T13:50:56.830Z",
        __v: 0,
      },
    ]?.map((d) => {
      return {
        key: d._id,
        _id: d._id,
        dateTime: (
          <Typography variant="body2">
            {d?.updatedAt
              ? format(new Date(d.updatedAt), "dd/MM/yyyy, h:mm a")
              : format(new Date(), "dd/MM/yyyy | h:mm a")}
          </Typography>
        ),
        updatedBy: (
          <Typography variant="body2">{d?.userName || "-"}</Typography>
        ),
        events: (
          <Typography variant="body2">
            {`${d?.event.replace(/(\w)-(\w)/g, "$1 $2").replace(/-/g, " ")}`}
          </Typography>
        ),
      };
    });

    return arr;
  }, []); //entities?.results

  // useEffect(() => {
  //   find({
  //     _q: "",
  //     page: page,
  //     sort: "desc",
  //     limit: rowsPerPage,
  //     orderRef: orderId,
  //     companyRef: companyRef,
  //   });
  // }, [page, orderId, companyRef, rowsPerPage]);

  return (
    <Card sx={{ mt: 0, p: 0 }}>
      <SuperTable
        isLoading={false} //{loading}
        loaderComponent={PoGrnLogsRowLoading}
        items={transformedData}
        headers={tableHeaders}
        total={0} //{entities?.total || 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        isCancelAllClicked={false}
        noDataPlaceholder={
          <Box sx={{ mt: 6, mb: 4 }}>
            <NoDataAnimation
              text={
                <Typography variant="h6" textAlign="center" sx={{ mt: 2 }}>
                  {t("No activity logs!")}
                </Typography>
              }
            />
          </Box>
        }
      />
    </Card>
  );
}
