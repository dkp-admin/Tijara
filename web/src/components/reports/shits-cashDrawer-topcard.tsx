import { alpha, Grid, SvgIcon, Typography } from "@mui/material";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { CardWithIconDescription } from "src/components/card-with-icon-description";
import ReportGmailerrorredTwoToneIcon from "@mui/icons-material/ReportGmailerrorredTwoTone";
import { StyledCurrencyFormatter } from "src/components/styled-currency-formatter";
import SwapVertTwoToneIcon from "@mui/icons-material/SwapVertTwoTone";
import { green } from "src/theme/colors";

interface ShiftCashTopCardProps {
  shiftStats: any;
}

export const ShiftsCashDrawerTopCard: FC<ShiftCashTopCardProps> = (props) => {
  const { t } = useTranslation();
  const { shiftStats } = props;

  return (
    <Grid container spacing={3} sx={{ mt: 3 }}>
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
              {t("Total Difference Amount")}
            </Typography>
          }
          icon={
            <SvgIcon fontSize="small">
              <SwapVertTwoToneIcon />
            </SvgIcon>
          }
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha(green.main, 0.1),
            color: `${green.main}`,
            mr: 1,
          }}
          heading={StyledCurrencyFormatter(
            shiftStats?.totalDifference?.toFixed(2) || 0.0
          )}
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
              {t("Number of Ended Sessions")}
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
          heading={shiftStats?.totalEndedSession || 0}
        />
      </Grid>
    </Grid>
  );
};
