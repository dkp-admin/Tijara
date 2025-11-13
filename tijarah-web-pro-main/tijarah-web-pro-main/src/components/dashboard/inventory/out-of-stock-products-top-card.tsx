import { alpha, Grid, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import ProductIcon from "../../../icons/product";
import { CardWithIconDescription } from "../../card-with-icon-description";

export const OutOfStockProductsTopCard = (props: any) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { data, loading } = props;

  return (
    <Grid container spacing={3}>
      <Grid item lg={6} md={6} sm={12} sx={{ width: "100%" }}>
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
              {t("Out of Stock")}
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
          heading={data?.outOfStock || 0}
        />
      </Grid>

      <Grid item lg={6} md={6} sm={12} sx={{ width: "100%" }}>
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
              {t("Low in Stock")}
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
          heading={data?.lowStock || 0}
        />
      </Grid>
    </Grid>
  );
};
