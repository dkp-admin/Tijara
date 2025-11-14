import { Box, Card, Typography } from "@mui/material";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { SuperTable } from "../../widgets/super-table";
import { ExpiringProductsRowLoading } from "./expiring-product-row-loading";
import { format } from "date-fns";

function OutOfStockTab(props: any) {
  const { t } = useTranslation();

  const { data, loading } = props;

  const headers = [
    {
      key: "product",
      label: t("Product"),
    },

    // {
    //   key: "lastDate",
    //   label: t("Last available date"),
    // },
  ];

  const transformedData = useMemo(() => {
    let arr: any[] = [];

    data?.outOfStockProducts?.map((d: any) => {
      arr.push({
        key: d?._id,
        _id: d?._id,
        product: (
          <Box>
            <Typography
              sx={{ textTransform: "capitalize" }}
              color="inherit"
              variant="subtitle2">
              {d?.name?.en || "-"}
            </Typography>
            <Typography
              sx={{ textTransform: "capitalize" }}
              color="inherit"
              variant="subtitle2">
              {`${d?.variant?.en || "-"}, ${d?.sku}`}
            </Typography>
          </Box>
        ),
        // lastDate: (
        //   <Box>
        //     <Typography>{d?.variant?.expiry || "-"}</Typography>
        //   </Box>
        // ),
      });
    });

    return arr;
  }, [data?.outOfStockProducts]);

  return (
    <Card>
      <Box
        sx={{
          display: "flex",
          m: 2,
        }}>
        <Typography variant="h6">{t("Out of Stocks")}</Typography>
      </Box>
      <SuperTable
        isLoading={loading}
        loaderComponent={ExpiringProductsRowLoading}
        showPagination={false}
        headers={headers}
        items={transformedData || []}
        noDataPlaceholder={
          <Box sx={{ mt: 6, mb: 4 }}>
            <NoDataAnimation
              text={
                <Typography variant="h6" textAlign="center" sx={{ mt: 2 }}>
                  {t("No Expiring Products!")}
                </Typography>
              }
            />
          </Box>
        }
      />
    </Card>
  );
}

export default OutOfStockTab;
