import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ApexOptions } from "apexcharts";
import { type FC } from "react";
import { useTranslation } from "react-i18next";
import { Chart } from "src/components/chart";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";

const useChartOptions = (): ApexOptions => {
  const theme = useTheme();

  return {
    chart: {
      background: "transparent",
      stacked: false,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: true,
      },
    },
    colors: [theme.palette.primary.main, "#b4e4cd"],
    dataLabels: {
      enabled: false,
    },
    fill: {
      opacity: 0.9,
      type: "solid",
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 2,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    legend: {
      horizontalAlign: "right",
      labels: {
        colors: theme.palette.text.secondary,
      },
      position: "top",
      show: true,
    },
    markers: {
      hover: {
        size: undefined,
        sizeOffset: 2,
      },
      radius: 2,
      shape: "circle",
      size: 4,
      strokeWidth: 0,
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        borderRadiusApplication: "end",
        // columnWidth: "70%",
      },
    },
    stroke: {
      curve: "smooth",
      dashArray: [0, 1],
      lineCap: "butt",
      width: 1,
    },
    theme: {
      mode: theme.palette.mode,
    },
    xaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      categories: [],
      labels: {
        style: {
          colors: theme.palette.text.secondary,
        },
      },
    },
    yaxis: [
      {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          show: true,
        },
      },
    ],
  };
};

type ChartSeries = {
  name: string;
  data: (number | null)[];
}[];

interface RevenueProps {
  loading?: boolean;
  chartSeries: ChartSeries;
  chartType: string;
  title?: string;
  categories: string[];
}

export const SalesUsage: FC<RevenueProps> = (props) => {
  const { chartSeries, chartType, categories, title, loading } = props;

  const { t } = useTranslation();

  const chartOptions = useChartOptions();

  if (categories.length > 0 && chartOptions.xaxis) {
    chartOptions.xaxis.categories = categories;
  }

  return (
    <Grid container spacing={3} sx={{ mt: -2 }}>
      <Grid item lg={12} md={12} sm={12} sx={{ width: "100%" }}>
        <Card>
          <CardHeader title={title || t("Sales")} />

          {loading ? (
            <Box
              sx={{
                height: "50vh",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <CardContent sx={{ pt: 0 }}>
              {(chartType == "bar" || chartType == "line") &&
                (chartSeries[0].data?.length > 0 ? (
                  <Chart
                    height={350}
                    options={chartOptions}
                    series={chartSeries}
                    type={chartType}
                  />
                ) : (
                  <Box sx={{ mt: 6, mb: 4 }}>
                    <NoDataAnimation
                      text={
                        <Typography
                          variant="h6"
                          textAlign="center"
                          sx={{ mt: 2 }}
                        >
                          {t("No Daily Sales Avilable!")}
                        </Typography>
                      }
                    />
                  </Box>
                ))}
            </CardContent>
          )}
        </Card>
      </Grid>
    </Grid>
  );
};
