import { alpha, Button, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { ArrowRight as ArrowRightIcon } from "src/icons/arrow-right";
import { tijarahPaths } from "src/paths";
import { currencyValue } from "src/utils/currency-value-changer";
import RefundIcon from "../../icons/refund";
import { CardWithIconDescription } from "../card-with-icon-description";
import { useCurrency } from "src/utils/useCurrency";

interface TotalSaleCardProps {
  stats: any;
  loading: boolean;
}

export const TotalRefundCard = ({ loading, stats }: TotalSaleCardProps) => {
  const currency = useCurrency();
  const { t } = useTranslation();
  const router = useRouter();

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
          {t("Refund")}
        </Typography>
      }
      icon={<RefundIcon fontSize="small" />}
      iconStyles={{
        my: 1,
        backgroundColor: (theme: any) => alpha("#272727", 0.1),
        color: "#272727",
        mr: 1,
      }}
      heading={`${currency} ${currencyValue(
        stats?.refundData?.reduce(
          (acc: any, refund: { totalRefund: any }) => acc + refund.totalRefund,
          0
        )
      )}`}
      description={
        stats?.refundData?.length
          ? `${stats?.refundData?.reduce(
              (acc: any, refund: { refundCount: any }) =>
                acc + Number(refund.refundCount),
              0
            )} ${t("Refunded Items")}`
          : `0 ${t("Refunded Items")}`
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
