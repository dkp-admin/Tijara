import ProductionQuantityLimitsIcon from "@mui/icons-material/ProductionQuantityLimits";
import ReportGmailerrorredTwoToneIcon from "@mui/icons-material/ReportGmailerrorredTwoTone";
import { alpha, Grid, SvgIcon, Typography } from "@mui/material";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { CardWithIconDescription } from "src/components/card-with-icon-description";
import ShoppingBag03Icon from "src/icons/untitled-ui/duocolor/shopping-bag-03";
import { green } from "src/theme/colors";

interface InventoryChangeTopCardProps {
  inventoryChangeStats: any;
}

export const InventoryChangeReportTopCard: FC<InventoryChangeTopCardProps> = (
  props
) => {
  const { t } = useTranslation();
  const { inventoryChangeStats } = props;

  return (
    <Grid container spacing={3}>
      <Grid item lg={3} md={6} sm={12} sx={{ width: "100%" }}>
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
              {t("Total Added")}
            </Typography>
          }
          icon={
            <SvgIcon fontSize="small">
              <ShoppingBag03Icon />
            </SvgIcon>
          }
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha(green.main, 0.1),
            color: `${green.main}`,
            mr: 1,
          }}
          heading={inventoryChangeStats?.totalStockAdded || 0.0}
          description={`Variants: `}
          descriptionValue={inventoryChangeStats?.totalVariants || 0.0}
          showButton={false}
        />
      </Grid>

      <Grid item lg={3} md={6} sm={12} sx={{ width: "100%" }}>
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
              {t("Total Removed")}
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
          heading={inventoryChangeStats?.totalStockRemoved || 0}
          description={`Net Quantity Change: `}
          descriptionValue={inventoryChangeStats?.netQtyChange || 0}
          showButton={false}
        />
      </Grid>

      <Grid item lg={3} md={6} sm={12} sx={{ width: "100%" }}>
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
              {t("Total Restocked")}
            </Typography>
          }
          icon={
            <SvgIcon fontSize="small">
              <ShoppingBag03Icon />
            </SvgIcon>
          }
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha(green.main, 0.1),
            color: `${green.main}`,
            mr: 1,
          }}
          heading={inventoryChangeStats?.totalStockRestocked || 0}
          description={`Net Value Change: `}
          descriptionValue={inventoryChangeStats?.netValueChange || 0}
          showButton={false}
        />
      </Grid>

      <Grid item lg={3} md={6} sm={12} sx={{ width: "100%" }}>
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
              {t("Total Qty Sold")}
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
          heading={inventoryChangeStats?.totalStockSold || 0}
          description={`Total Product Sold: `}
          descriptionValue={inventoryChangeStats?.totalProductSold || 0}
          showButton={false}
        />
      </Grid>
    </Grid>
  );
};
