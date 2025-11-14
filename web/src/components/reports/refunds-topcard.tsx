import { alpha, Box, Grid, SvgIcon, Typography } from "@mui/material";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import CurrencyExchangeIcon from "@untitled-ui/icons-react/build/esm/Repeat01";
import { CardWithIconDescription } from "src/components/card-with-icon-description";
import ReportGmailerrorredTwoToneIcon from "@mui/icons-material/ReportGmailerrorredTwoTone";
import { StyledCurrencyFormatter } from "src/components/styled-currency-formatter";
import { green } from "src/theme/colors";
import { useCurrency } from "src/utils/useCurrency";

export const RefundsReportTopCard: FC = () => {
  const { t } = useTranslation();
  const currency = useCurrency();

  return (
    <Grid
      container
      spacing={3}
      sx={{
        mt: -5,
        mb: -3,
      }}
    >
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
              {t("Today's Refunds")}
            </Typography>
          }
          icon={
            <SvgIcon fontSize="small">
              <ReportGmailerrorredTwoToneIcon />
            </SvgIcon>
          }
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha(green.main, 0.1),
            color: `${green.main}`,
            mr: 1,
          }}
          heading={"2"}
          description={`Total Refunds: `}
          descriptionValue={`13`}
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
              {t("Today's Refund Amount")}
            </Typography>
          }
          icon={
            <SvgIcon fontSize="small">
              <CurrencyExchangeIcon />
            </SvgIcon>
          }
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha(green.main, 0.1),
            color: `${green.main}`,
            mr: 1,
          }}
          heading={StyledCurrencyFormatter("172.00")}
          description={`Total Refund Amount: `}
          descriptionValue={`${currency} 1,934.00`}
          showButton={false}
        />
      </Grid>
    </Grid>
  );
};
