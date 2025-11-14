import {
  Box,
  Card,
  CardHeader,
  CircularProgress,
  Divider,
  SvgIcon,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import type { ApexOptions } from "apexcharts";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Chart } from "../chart";
import { Scrollbar } from "../scrollbar";
import NoDataAnimation from "../widgets/animations/NoDataAnimation";
import { useCurrency } from "src/utils/useCurrency";

const checkKMB = (money: any) => {
  const newMoney = Number(money);

  if (newMoney < 1000) {
    return ``;
  } else if (newMoney >= 1000 && newMoney <= 999999) {
    return `K`;
  } else if (newMoney > 999999 && newMoney <= 999999999) {
    return `M`;
  } else {
    return `B`;
  }
};

const checkValue = (money: any) => {
  const newMoney = Number(money);

  if (money < 1000) {
    return `${newMoney.toFixed(2)}`;
  } else if (newMoney >= 1000 && newMoney <= 999999) {
    return `${(newMoney / 1000).toFixed(2)}`;
  } else if (newMoney > 999999 && newMoney <= 999999999) {
    return `${(newMoney / 1000000).toFixed(2)}`;
  } else {
    return `${(newMoney / 1000000000).toFixed(2)}`;
  }
};

const useChartOptions = (category: string[]): ApexOptions => {
  const theme = useTheme();
  const currency = useCurrency();
  return {
    chart: {
      background: "transparent",
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    colors: ["#007AFFE5"],
    dataLabels: {
      enabled: false,
    },
    fill: {
      opacity: 1,
    },
    grid: {
      borderColor: theme.palette.divider,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
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
    legend: {
      show: false,
    },
    stroke: {
      colors: ["transparent"],
      show: true,
      width: 2,
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
          return `${currency} ${checkValue(value) + checkKMB(value)} `;
        },
      },
    },
    xaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      categories: category,
      labels: {
        style: {
          colors: "#A3A3A3",
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "80px",
        borderRadius: 7,
        borderRadiusApplication: "end",
      },
    },
    yaxis: {
      labels: {
        offsetX: -12,
        style: {
          colors: "#A3A3A3",
        },
      },
    },
  };
};

interface MonthlyEarningsProps {
  loading?: boolean;
  monthlyEarnings?: any[];
  category?: any[];
}

export const MonthlyEarnings: FC<MonthlyEarningsProps> = (props) => {
  const { monthlyEarnings, category, loading } = props;

  const { t } = useTranslation();

  const monthlyDataArr = monthlyEarnings.map((s: any) => {
    return s.toFixed(2);
  });

  const data = {
    series: [{ data: monthlyEarnings }],
    categories: category,
  };

  const chartOptions = useChartOptions(data.categories);

  const chartSeries = [
    {
      data: monthlyDataArr,
      name: t("Sales"),
    },
  ];

  return (
    <Card>
      <CardHeader
        title={t("Datewise Sales")}
        action={
          <Tooltip title={t("Showing last 7 days earnings")}>
            <SvgIcon color="action">
              <InfoCircleIcon />
            </SvgIcon>
          </Tooltip>
        }
      />

      <Divider />
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
          <Scrollbar>
            <Box sx={{ px: 2, height: 336 }}>
              {monthlyEarnings?.length > 0 ? (
                <Chart
                  height={300}
                  options={chartOptions}
                  series={chartSeries as any}
                  type="bar"
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
                        {t("No Monthly Earnings!")}
                      </Typography>
                    }
                  />
                </Box>
              )}
            </Box>
          </Scrollbar>
        </>
      )}
    </Card>
  );
};
