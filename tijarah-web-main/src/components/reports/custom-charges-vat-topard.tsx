import CategoryTwoToneIcon from "@mui/icons-material/CategoryTwoTone";
import EmojiEventsTwoToneIcon from "@mui/icons-material/EmojiEventsTwoTone";
import { alpha, Grid, SvgIcon, Typography } from "@mui/material";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { CardWithIconDescription } from "src/components/card-with-icon-description";
import { green } from "src/theme/colors";
import { currencyValue } from "src/utils/currency-value-changer";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

interface CustomChargesVATTopCardProps {
  customChargeVATStats: any;
}

export const CustomChargesVATReportTopCard: FC<CustomChargesVATTopCardProps> = (
  props
) => {
  const { t } = useTranslation();
  const { customChargeVATStats } = props;
  const currency = useCurrency();

  return (
    <Grid container spacing={3} sx={{ mt: -2, mb: 1 }}>
      <Grid item md={6} sm={12} sx={{ width: "100%" }}>
        <CardWithIconDescription
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
              {t("Total VAT")}
            </Typography>
          }
          icon={
            <SvgIcon fontSize="small">
              <CategoryTwoToneIcon />
            </SvgIcon>
          }
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha(green.main, 0.1),
            color: `${green.main}`,
            mr: 1,
          }}
          heading={`${currency} ${currencyValue(
            customChargeVATStats?.chargeVat || 0
          )}`}
          description={`${t("Total Charges (Including VAT)")}: ${currency} ${
            toFixedNumber(customChargeVATStats?.chargeTotal) || 0
          }`}
          showButton={false}
        />
      </Grid>

      <Grid item md={6} sm={12} sx={{ width: "100%" }}>
        <CardWithIconDescription
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
              {t("Most used charge")}
            </Typography>
          }
          icon={
            <SvgIcon fontSize="small">
              <EmojiEventsTwoToneIcon />
            </SvgIcon>
          }
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha(green.main, 0.1),
            color: `${green.main}`,
            mr: 1,
          }}
          heading={customChargeVATStats?.mostUsedCharge?.chargeNameEn || "-"}
          description={`${t("No. of charges")}: ${
            customChargeVATStats?.numberOfCharges &&
            customChargeVATStats?.numberOfCharges?.length > 0
              ? customChargeVATStats?.numberOfCharges[0]?.usageCount
              : 0.0
          }`}
          showButton={false}
        />
      </Grid>
    </Grid>
  );
};
