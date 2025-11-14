import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Grid,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import InfoCircle from "@untitled-ui/icons-react/build/esm/InfoCircle";
import { ApexOptions } from "apexcharts";
import PropTypes from "prop-types";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { Chart } from "../chart";
import NoDataAnimation from "../widgets/animations/NoDataAnimation";
import { currencyValue } from "src/utils/currency-value-changer";
import LoaderAnimation from "../widgets/animations/loader";

const useChartOptions = (labels: string[]): ApexOptions => {
  const theme = useTheme();

  return {
    chart: {
      background: "transparent",
      stacked: false,
      toolbar: {
        show: false,
      },
    },
    colors: ["#4263EB", "#907FFA", "#CCCACF", "#211F32"],
    dataLabels: {
      enabled: false,
    },
    fill: {
      opacity: 1,
      type: "solid",
    },
    labels,
    legend: {
      show: false,
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
      },
    },
    states: {
      active: {
        filter: {
          type: "none",
        },
      },
      hover: {
        filter: {
          type: "none",
        },
      },
    },
    stroke: {
      width: 0,
    },
    theme: {
      mode: theme.palette.mode,
    },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: function (
          value: any,
          { series, seriesIndex, dataPointIndex, w }
        ) {
          return `${currencyValue(value)}`;
        },
      },
    },
  };
};

type ChartSeries = number[];

interface TopCategoriesProps {
  loading?: boolean;
  chartSeries: ChartSeries;
  labels: string[];
}

export const TopCategories: FC<TopCategoriesProps> = (props) => {
  const { t } = useTranslation();

  const { chartSeries, labels, loading } = props;

  const chartOptions = useChartOptions(labels);

  return (
    <Card>
      <CardHeader
        title={t("Top Categories")}
        action={
          <Tooltip title={t("Showing top categories")}>
            <SvgIcon color="action">
              <InfoCircle />
            </SvgIcon>
          </Tooltip>
        }
      />

      {loading ? (
        <Box
          sx={{
            height: "50vh",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <CardContent>
            {chartSeries?.length > 0 ? (
              <Chart
                height={200}
                options={chartOptions}
                series={chartSeries}
                type="donut"
              />
            ) : (
              <Box sx={{ mt: 6, mb: 4 }}>
                <NoDataAnimation
                  text={
                    <Typography variant="h6" textAlign="center" sx={{ mt: 2 }}>
                      {t("No Top Categories!")}
                    </Typography>
                  }
                />
              </Box>
            )}

            {chartSeries?.length > 0 && (
              <Grid container spacing={1} sx={{ mt: 2 }}>
                {chartSeries.map((item, index) => (
                  <Grid key={index} xs={12} sm={6}>
                    <Stack alignItems="center" direction="row" spacing={1}>
                      <Box
                        sx={{
                          backgroundColor: chartOptions.colors![index],
                          borderRadius: "50%",
                          height: 8,
                          width: 8,
                        }}
                      />
                      <Typography variant="subtitle2">
                        {labels[index]}
                      </Typography>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
};

TopCategories.propTypes = {
  chartSeries: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
};
