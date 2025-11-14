import { Box, Card, Typography } from "@mui/material";
import { useMemo, type FC } from "react";
import { useTranslation } from "react-i18next";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { SuperTable } from "../../widgets/super-table";
import { ExpiringProductsRowLoading } from "./expiring-product-row-loading";
import { useCurrency } from "src/utils/useCurrency";

export const LostAndDamagedProductsCard: FC<any> = (props) => {
  const { t } = useTranslation();
  const currency = useCurrency();

  const { products, loading } = props;

  const headers = [
    {
      key: "product",
      label: t("Product"),
    },
    {
      key: "quantity",
      label: `${t("QTY")}.`,
    },
    {
      key: "value",
      label: t("Value"),
    },
    {
      key: "potentialProfit",
      label: t("Potential Profit"),
    },
  ];

  const transformedData = useMemo(() => {
    let arr: any[] = [];

    products?.map((d: any) => {
      arr.push({
        key: d?._id,
        _id: d?._id,
        product: (
          <Box>
            <Typography
              sx={{ textTransform: "capitalize" }}
              color="inherit"
              variant="subtitle2"
            >
              {d?.productName?.en || "-"}
            </Typography>
            <Typography
              sx={{ textTransform: "capitalize" }}
              color="inherit"
              variant="subtitle2"
            >
              {`${d?.variantName?.en || "-"}, ${d?.sku} `}
            </Typography>
          </Box>
        ),
        sku: (
          <Box>
            <Typography color="inherit" variant="subtitle2">
              {d?.sku || "-"}
            </Typography>
          </Box>
        ),
        quantity: (
          <Box>
            <Typography color="GrayText" variant="body2">
              {d?.totalQty || 0}
            </Typography>
          </Box>
        ),
        value: (
          <Box>
            <Typography variant="subtitle2">
              {currency}
              {d?.valueOfProduct
                ? toFixedNumber(
                    d?.valueOfProduct * d?.uniqueProductCount || 0.0
                  )
                : "-"}
            </Typography>
          </Box>
        ),
        potentialProfit: (
          <Box>
            <Typography variant="subtitle2">
              {currency} {toFixedNumber(d?.potentialProfit || 0.0)}
            </Typography>
          </Box>
        ),
      });
    });

    return arr;
  }, [products]);

  return (
    <Card>
      <Box
        sx={{
          display: "flex",
          m: 2,
          mt: 4,
        }}
      >
        <Typography variant="h6">{t("Lost / Damaged Products")}</Typography>
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
                  {t("No Lost or Damaged Products!")}
                </Typography>
              }
            />
          </Box>
        }
      />
    </Card>
  );
};
