import { alpha, Grid, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import ProductIcon from "../../../icons/product";
import { CardWithIconDescription } from "../../card-with-icon-description";

export const PurchaseOrderTopCard = (props: any) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { data, loading } = props;

  return (
    <Grid container spacing={3}>
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
              {t("Open Orders")}
            </Typography>
          }
          icon={<ProductIcon fontSize="small" />}
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) =>
              alpha(theme.palette.mode === "dark" ? "#0C9356" : "#006C35", 0.1),
            color: theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
            mr: 1,
          }}
          heading={data?.open?.orderCount || 0}
          description={`${data?.open?.totalItem || 0} ${t("Qty")}`}
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
              {t("Overdue Orders")}
            </Typography>
          }
          icon={<ProductIcon fontSize="small" />}
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) =>
              alpha(theme.palette.mode === "dark" ? "#0C9356" : "#006C35", 0.1),
            color: theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
            mr: 1,
          }}
          heading={data?.overdue?.orderCount || 0}
          description={`${data?.overdue?.totalItem || 0} ${t("Qty")}`}
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
              {t("Partially Delivered")}
            </Typography>
          }
          icon={<ProductIcon fontSize="small" />}
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) =>
              alpha(theme.palette.mode === "dark" ? "#0C9356" : "#006C35", 0.1),
            color: theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
            mr: 1,
          }}
          heading={data?.partiallyReceived?.orderCount || 0}
          description={`${data?.partiallyReceived?.totalItem || 0} ${t("Qty")}`}
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
              {t("Completed")}
            </Typography>
          }
          icon={<ProductIcon fontSize="small" />}
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) =>
              alpha(theme.palette.mode === "dark" ? "#0C9356" : "#006C35", 0.1),
            color: theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
            mr: 1,
          }}
          heading={data?.completed?.orderCount || 0}
          description={`${data?.completed?.totalItem || 0} ${t("Qty")}`}
        />
      </Grid>
    </Grid>
  );
};
