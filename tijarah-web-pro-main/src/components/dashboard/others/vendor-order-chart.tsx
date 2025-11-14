import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
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
import { Chart } from "../../chart";
import { useCurrency } from "src/utils/useCurrency";

const useChartOptions = (labels: string[]): ApexOptions => {
  const theme = useTheme();

  return {
    chart: {
      background: "transparent",
    },
    colors: ["#0C7CD5", "#FFB547", "#7BC67E"],
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
    },
  };
};

type ChartSeries = number[];

interface TransactionModeProps {
  chartSeries: ChartSeries;
  labels: string[];
}

export const VendorOrderChart: FC<TransactionModeProps> = (props) => {
  const { t } = useTranslation();

  const { chartSeries, labels } = props;
  const chartOptions = useChartOptions(labels);
  const currency = useCurrency();

  return (
    <Card>
      <CardHeader
        title={t("Vendor Orders")}
        action={
          <Tooltip title="Showing vendor order">
            <SvgIcon color="action">
              <InfoCircle />
            </SvgIcon>
          </Tooltip>
        }
      />

      <CardContent>
        <Box
          sx={{
            mt: -3,
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button sx={{ width: "10%", mr: 2 }} variant="outlined">
            {t("Most")}
          </Button>
          <Button sx={{ width: "10%" }} variant="outlined">
            {t("Least")}
          </Button>
        </Box>

        <Chart
          height={236}
          options={chartOptions}
          series={chartSeries}
          type="donut"
        />

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
                      {`${currency} ${item}`}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

VendorOrderChart.propTypes = {
  chartSeries: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
};
