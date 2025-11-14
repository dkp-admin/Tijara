import type { Theme } from "@mui/material";
import {
  Box,
  Card,
  CardHeader,
  Divider,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { ChangeEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BrandsRowLoading } from "src/components/brands/brands-row-loading";
import { PropertyList } from "src/components/property-list";
import { PropertyListItem } from "src/components/property-list-item";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

interface RefundCardProps {
  data: any;
  loading?: boolean;
}

type Driver = { driverName: string; todaysRevenue: number; totalVat: number };

export const DriverCard = (props: RefundCardProps) => {
  const { t } = useTranslation();
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));
  const { data, loading } = props;
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const currency = useCurrency();

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const transformedData = useMemo(() => {
    let arr: any[] = [];

    data?.netSalesByDriver?.map((d: any) => {
      arr.push({
        key: d?._id,
        _id: d?._id,
        driver: (
          <Box>
            <Typography color="inherit" variant="body2">
              {d?.driverName}
            </Typography>
          </Box>
        ),
        amount: (
          <Box>
            <Typography color="inherit" variant="body2">
              {`${currency} ${toFixedNumber(
                toFixedNumber(d?.todaysRevenue + d?.totalVat)
              )}`}
            </Typography>
          </Box>
        ),
      });
    });

    return arr;
  }, [data?.netSalesByDriver]);

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedItems = transformedData?.slice(startIndex, endIndex);

  const tableHeaders = [
    {
      key: "driver",
      label: t("Driver"),
    },
    {
      key: "amount",
      label: t("Amount"),
    },
  ];

  return (
    <Card sx={{ width: "100%" }}>
      <CardHeader title="Drivers" />
      <SuperTable
        cellWidth={"100%"}
        isLoading={loading}
        loaderComponent={BrandsRowLoading}
        items={paginatedItems}
        headers={tableHeaders}
        total={data?.netSalesByDriver?.length || 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPage={rowsPerPage}
        page={page}
        noDataPlaceholder={
          <Box sx={{ mt: 6, mb: 4 }}>
            <NoDataAnimation
              text={
                <Typography variant="h6" textAlign="center" sx={{ mt: 2 }}>
                  {t("No Data!")}
                </Typography>
              }
            />
          </Box>
        }
      />
      {/* <PropertyList>
        {data?.netSalesByDriver?.map((driver: Driver, idx: number) => {
          return (
            <PropertyListItem
              key={idx}
              from={"salesSummary"}
              loading={loading}
              align={"horizontal"}
              divider
              label={driver?.driverName}
              value={`${currency} ${toFixedNumber(
                toFixedNumber(driver?.todaysRevenue + driver?.totalVat)
              )}`}
            />
          );
        })}
      </PropertyList> */}
    </Card>
  );
};
