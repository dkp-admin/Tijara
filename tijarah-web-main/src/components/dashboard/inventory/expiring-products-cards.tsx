import { Box, Card, Typography } from "@mui/material";
import { useMemo, type FC } from "react";
import { useTranslation } from "react-i18next";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { SuperTable } from "../../widgets/super-table";
import { ExpiringProductsRowLoading } from "./expiring-product-row-loading";
import { useCurrency } from "src/utils/useCurrency";

export const ExpiringProductsCard: FC<any> = (props) => {
  const { t } = useTranslation();

  const { products, loading } = props;

  const currency = useCurrency();

  const availableProducts = products?.filter(
    (product: any) => product?.totalAvailableQty > 0
  );

  const headers = [
    {
      key: "product",
      label: t("Product"),
    },
    {
      key: "quantity",
      label: `${t("QTY")}`,
    },
    {
      key: "value",
      label: t("Value"),
    },
  ];

  const transformedData = useMemo(() => {
    let arr: any[] = [];

    availableProducts?.map((d: any) => {
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
              {`${d?.product?.en || "-"}, ${d?.variant?.en}`}
            </Typography>
          </Box>
        ),
        value: (
          <Box>
            <Typography variant="subtitle2">
              {d?.costPrice
                ? `${currency} ${toFixedNumber(
                    d?.costPrice * d?.totalAvailableQty || 0.0
                  )}`
                : "-"}
            </Typography>
          </Box>
        ),
        quantity: (
          <Box>
            <Typography color="GrayText" variant="body2">
              {d?.totalAvailableQty || 0}
            </Typography>
          </Box>
        ),
      });
    });

    return arr;
  }, [availableProducts]);

  return (
    <Card>
      <Box
        sx={{
          display: "flex",
          m: 2,
          mt: 4,
        }}
      >
        <Typography variant="h6">{t("Expiring Products")}</Typography>
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
