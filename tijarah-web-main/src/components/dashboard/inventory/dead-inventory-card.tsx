import { Box, Card, Typography } from "@mui/material";
import { useMemo, type FC } from "react";
import { useTranslation } from "react-i18next";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { SuperTable } from "../../widgets/super-table";
import { ExpiringProductsRowLoading } from "./expiring-product-row-loading";

export const DeadStockProductsCard: FC<any> = (props) => {
  const { t } = useTranslation();

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
  ];

  const getDeadProductCount: any = (variants: any) => {
    const subtotal = variants.reduce((acc: number, variant: any) => {
      let stocCount = variant?.stockConfiguration?.reduce(
        (a: number, stock: any) => {
          return a + stock.count;
        },
        0
      );
      return acc + stocCount;
    }, 0);
    return subtotal;
  };

  const getDeadProductAmount: any = (variants: any) => {
    const subtotal = variants.reduce(
      (total: number, variant: any) => total + variant?.costPrice,
      0
    );
    return toFixedNumber(subtotal);
  };

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
              variant="subtitle2">
              {d?.name?.en || "-"}
            </Typography>
            <Typography
              sx={{ textTransform: "capitalize" }}
              color="inherit"
              variant="subtitle2">
              {`${d?.variants?.[0]?.name?.en}, ${d?.variants?.[0]?.sku} `}
            </Typography>
          </Box>
        ),
        quantity: (
          <Box>
            <Typography color="GrayText" variant="body2">
              {getDeadProductCount(d?.variants) || 0}
            </Typography>
          </Box>
        ),
        value: (
          <Box>
            <Typography variant="subtitle2">
              {toFixedNumber(
                d?.variants?.[0]?.costPrice *
                  (d?.variants?.[0]?.stockConfiguration?.[0]?.count || 0)
              ) || 0.0}
              {/* {getDeadProductAmount(d?.variants) > 0
                ? `SAR ${toFixedNumber(
                    getDeadProductAmount(d?.variants) *
                      getDeadProductCount(d?.variants)
                  )}`
                : "-"} */}
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
        }}>
        <Typography variant="h6">{t("Dead Stock Products")}</Typography>
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
};
