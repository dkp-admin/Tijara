import { Box, Card, Typography } from "@mui/material";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { SuperTable } from "../../widgets/super-table";
import { ExpiringProductsRowLoading } from "./expiring-product-row-loading";

function LowInStockTab(props: any) {
  const { t } = useTranslation();

  const { data, loading } = props;

  const headers = [
    {
      key: "product",
      label: t("Product"),
    },
    {
      key: "quantity",
      label: `${t("QTY")}.`,
    },
    // {
    //   key: "value",
    //   label: t("Value"),
    // },
  ];

  const transformedData = useMemo(() => {
    let arr: any[] = [];

    data?.lowStockProducts?.map((d: any) => {
      arr.push({
        key: d?._id,
        _id: d?._id,
        product: (
          <Box>
            <Typography
              sx={{ textTransform: "capitalize" }}
              color="inherit"
              variant="subtitle2">
              {d?.name?.en || "NA"}
            </Typography>
            <Typography
              sx={{ textTransform: "capitalize" }}
              color="inherit"
              variant="subtitle2">
              {`${d?.variants?.name?.en || "NA"}, ${d?.variants?.sku}`}
            </Typography>
          </Box>
        ),
        sku: (
          <Box>
            <Typography color="inherit" variant="subtitle2">
              {d?.variants?.sku || "N/A"}
            </Typography>
          </Box>
        ),
        // value: (
        //   <Box>
        //     <Typography variant="subtitle2">
        //       {t("SAR")} {toFixedNumber(d?.price || 0.0)}
        //     </Typography>
        //   </Box>
        // ),
        quantity: (
          <Box>
            <Typography color="GrayText" variant="body2">
              {d?.variants?.stockConfiguration?.lowStockCount || 0}
            </Typography>
          </Box>
        ),
      });
    });

    return arr;
  }, []);

  return (
    <Card>
      <Box
        sx={{
          display: "flex",
          m: 2,
        }}>
        <Typography variant="h6">{t("Low in Stocks")}</Typography>
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
                  {t("No Low in Stocks Products!")}
                </Typography>
              }
            />
          </Box>
        }
      />
    </Card>
  );
}

export default LowInStockTab;
