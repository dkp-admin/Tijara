import { alpha, Button, Typography, useTheme } from "@mui/material";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { currencyValue } from "src/utils/currency-value-changer";
import SaleIcon from "../../icons/sale";
import { CardWithIconDescription } from "../card-with-icon-description";
import { tijarahPaths } from "src/paths";
import { ArrowRight as ArrowRightIcon } from "src/icons/arrow-right";
import { useCurrency } from "src/utils/useCurrency";

interface TotalSaleCardProps {
  stats: any;
  loading: boolean;
}

export const TotalSaleCard = ({ stats, loading }: TotalSaleCardProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const currency = useCurrency();

  return (
    <CardWithIconDescription
      loading={loading}
      showLabel={true}
      labelText={
        <Typography
          variant="subtitle2"
          sx={{
            mt: 0.5,
            fontSize: "12px",
            color: "neutral.500",
            textTransform: "uppercase",
          }}
        >
          {t("Sale")}
        </Typography>
      }
      icon={<SaleIcon fontSize="small" />}
      iconStyles={{
        my: 1,
        backgroundColor: (theme: any) =>
          alpha(theme.palette.mode === "dark" ? "#0C9356" : "#006C35", 0.1),
        color: theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
        mr: 1,
      }}
      heading={`${currency} ${currencyValue(
        stats?.netSales +
          stats?.totalVat +
          stats?.chargesWithoutVat -
          stats?.refundedCharges || 0
      )}`}
      description={
        stats?.totalOrder ? `${stats?.totalOrder} ${t("Orders")}` : "0"
      }
      showButton={true}
      button={
        <Button
          onClick={() => {
            router.push(tijarahPaths.reports.salesReport);
          }}
          endIcon={<ArrowRightIcon fontSize="small" />}
          sx={{ mt: 1, mb: -1 }}
        >
          {t("View Report")}
        </Button>
      }
    />
  );
};
