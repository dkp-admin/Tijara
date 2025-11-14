import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import InfoCircle from "@untitled-ui/icons-react/build/esm/InfoCircle";
import { ApexOptions } from "apexcharts";
import PropTypes from "prop-types";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { currencyValue } from "src/utils/currency-value-changer";
import { Chart } from "../chart";
import NoDataAnimation from "../widgets/animations/NoDataAnimation";
import { useCurrency } from "src/utils/useCurrency";

const useChartOptions = (labels: string[]): ApexOptions => {
  const theme = useTheme();

  return {
    chart: {
      background: "transparent",
    },
    colors: [
      "#E74C3C",
      "#3498DB",
      "#2ECC71",
      "#F39C12",
      "#9B59B6",
      "#1ABC9C",
      "#34495E",
      "#D35400",
      "#C0392B",
      "#16A085",
      "#2980B9",
      "#8E44AD",
      "#27AE60",
      "#D35400",
      "#7F8C8D",
      "#F1C40F",
      "#E67E22",
      "#95A5A6",
      "#D81B60",
      "#00ACC1",
      "#5E35B1",
      "#FB8C00",
      "#43A047",
      "#1E88E5",
      "#546E7A",
      "#6D4C41",
      "#00897B",
      "#FDD835",
      "#8D6E63",
      "#78909C",
    ],
    dataLabels: {
      enabled: false,
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

interface TransactionModeProps {
  loading?: boolean;
  chartSeries: ChartSeries;
  labels: string[];
}

export const TransactionByMode: FC<TransactionModeProps> = (props) => {
  const { t } = useTranslation();

  const { chartSeries, labels, loading } = props;

  const currency = useCurrency();

  const chartOptions = useChartOptions(labels);

  return (
    <Card>
      <CardHeader
        title={t("Transactions By Mode")}
        action={
          <Tooltip title="Showing all mode">
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
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <CardContent>
            {chartSeries?.length > 0 ? (
              <Chart
                height={240}
                options={chartOptions}
                series={chartSeries as any}
                type="donut"
              />
            ) : (
              <Box sx={{ mt: 6, mb: 4 }}>
                <NoDataAnimation
                  text={
                    <Typography variant="h6" textAlign="center" sx={{ mt: 2 }}>
                      {t("No Transaction!")}
                    </Typography>
                  }
                />
              </Box>
            )}

            {chartSeries?.length > 0 && (
              <Table>
                <TableHead
                  sx={{
                    [`& .${tableCellClasses.root}`]: {
                      background: "transparent",
                    },
                  }}
                >
                  <TableRow>
                    <TableCell>{t("Payment Type")}</TableCell>
                    <TableCell align="right">{t("Amount")}</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody
                  sx={{
                    [`& .${tableCellClasses.root}`]: {
                      border: 0,
                    },
                  }}
                >
                  {chartSeries.map((item, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Box
                            sx={{
                              alignItems: "center",
                              display: "flex",
                            }}
                          >
                            <Box
                              sx={{
                                backgroundColor: chartOptions.colors![index],
                                borderRadius: "50%",
                                height: 8,
                                mr: 1,
                                width: 8,
                              }}
                            />
                            <Typography variant="subtitle2">
                              {labels[index]}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography color="text.secondary" variant="body2">
                            {`${currency} ${currencyValue(item)}`}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
};

TransactionByMode.propTypes = {
  chartSeries: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
};
