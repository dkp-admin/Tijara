import AccountBalanceWalletTwoToneIcon from "@mui/icons-material/AccountBalanceWalletTwoTone";
import ProductionQuantityLimitsIcon from "@mui/icons-material/ProductionQuantityLimits";
import ReportGmailerrorredTwoToneIcon from "@mui/icons-material/ReportGmailerrorredTwoTone";
import { alpha, Grid, SvgIcon, Typography } from "@mui/material";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { CardWithIconDescription } from "src/components/card-with-icon-description";
import { green } from "src/theme/colors";
import { useCurrency } from "src/utils/useCurrency";

interface VoidCompTopCardProps {
  voidCompStats: any;
  loading?: any;
  type?: string;
}

export const VoidCompReportTopCard: FC<VoidCompTopCardProps> = (props) => {
  const { t } = useTranslation();
  const { voidCompStats, loading, type } = props;
  const lng = localStorage.getItem("currentLanguage");
  const currency = useCurrency();

  return (
    <Grid container spacing={3} sx={{ mt: -2, mb: 1 }}>
      <Grid item lg={3} md={6} sm={12} sx={{ width: "100%" }}>
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
              {type === "Void"
                ? t("Top Reason for Void")
                : t("Top Reason for Comp")}
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
          heading={
            type === "Void"
              ? (lng === "ar"
                  ? voidCompStats?.mostVoidReason?.mostCommonReasonAr
                  : voidCompStats?.mostVoidReason?.mostCommonReasonEn) || "NA"
              : (lng === "ar"
                  ? voidCompStats?.mostCompReason?.mostCommonReasonAr
                  : voidCompStats?.mostCompReason?.mostCommonReasonEn) || "NA"
          }
          description={`${t("No. of Times")}: ${
            type === "Void"
              ? voidCompStats?.mostVoidReason?.reasonCount || "0"
              : voidCompStats?.mostCompReason?.reasonCount || "0"
          }`}
          showButton={false}
        />
      </Grid>

      <Grid item lg={3} md={6} sm={12} sx={{ width: "100%" }}>
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
              {t(`Most ${type === "Void" ? "Voided" : "Comp"} Item`)}
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
          heading={
            type === "Void"
              ? lng === "ar"
                ? voidCompStats?.mostVoid?.productNameAr
                  ? `${voidCompStats?.mostVoid?.productNameAr || "NA"},${
                      voidCompStats?.mostVoid?.variantNameAr || ""
                    }`
                  : "NA"
                : voidCompStats?.mostVoid?.productNameEn
                ? `${voidCompStats?.mostVoid?.productNameEn || "NA"},${
                    voidCompStats?.mostVoid?.variantNameEn || ""
                  }`
                : "NA"
              : lng === "ar"
              ? voidCompStats?.mostComp?.productNameAr
                ? `${voidCompStats?.mostComp?.productNameAr},${voidCompStats?.mostComp?.variantNameAr}`
                : "NA"
              : voidCompStats?.mostComp?.productNameEn
              ? `${voidCompStats?.mostComp?.productNameEn},${voidCompStats?.mostComp?.variantNameEn}`
              : "NA"
          }
          description={`${t("No. of Times")}: ${
            type === "Void"
              ? voidCompStats?.mostVoid?.voidCount || "0"
              : voidCompStats?.mostComp?.compCount || "0"
          }`}
          showButton={false}
        />
      </Grid>

      <Grid item lg={3} md={6} sm={12} sx={{ width: "100%" }}>
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
              {t(`Todays ${type === "Void" ? "Voided" : "Comp"} Amount`)}
            </Typography>
          }
          icon={
            <SvgIcon fontSize="small">
              <AccountBalanceWalletTwoToneIcon />
            </SvgIcon>
          }
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha(green.main, 0.1),
            color: `${green.main}`,
            mr: 1,
          }}
          heading={`${currency} ${Number(
            type === "Void"
              ? voidCompStats?.stats?.totalAmountVoid?.toFixed(2) || 0
              : voidCompStats?.stats?.totalAmountComp?.toFixed(2) || 0
          )}`}
          showButton={false}
        />
      </Grid>
      <Grid item lg={3} md={6} sm={12} sx={{ width: "100%" }}>
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
              {type === "Void"
                ? t("No. of Orders Void (Today)")
                : t("No. of Orders Comp (Today)")}
            </Typography>
          }
          icon={
            <SvgIcon fontSize="small">
              <ProductionQuantityLimitsIcon />
            </SvgIcon>
          }
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha(green.main, 0.1),
            color: `${green.main}`,
            mr: 1,
          }}
          heading={voidCompStats?.stats?.totalOrders || 0}
          showButton={false}
        />
      </Grid>
    </Grid>
  );
};
