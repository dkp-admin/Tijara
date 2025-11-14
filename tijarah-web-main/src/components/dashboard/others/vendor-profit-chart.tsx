import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  SvgIcon,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import InfoCircle from "@untitled-ui/icons-react/build/esm/InfoCircle";
import type { ApexOptions } from "apexcharts";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Chart } from "../../chart";

const useChartOptions = (category: string[]): ApexOptions => {
  const theme = useTheme();

  return {
    chart: {
      background: "transparent",
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    colors: [theme.palette.mode === "dark" ? "#0C9356" : "#006C35"],
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
        borderRadius: 15,
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

interface WeeklyEarningsProps {
  weeklyEarnings?: any[];
}

export const VendorProfitChart: FC<WeeklyEarningsProps> = (props) => {
  const { weeklyEarnings } = props;
  const { t } = useTranslation();

  const data = {
    series: [{ data: weeklyEarnings }],
    categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  };

  const chartOptions = useChartOptions(data.categories);

  const weeklyDataArr = data?.series[0]?.data.map((s: any) => {
    return s;
  });

  const chartSeries = [
    {
      data: weeklyDataArr,
      name: t("Earnings"),
    },
  ];

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <CardContent>
        <CardHeader
          sx={{ mt: -4 }}
          title={t("Vendor Profits")}
          action={
            <Tooltip title="Showing vendor Profit">
              <SvgIcon color="action">
                <InfoCircle />
              </SvgIcon>
            </Tooltip>
          }
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button sx={{ width: "25%", mr: 2 }} variant="outlined">
            {t("Most Profits")}
          </Button>
          <Button sx={{ width: "30%", mr: 2 }} variant="outlined">
            {t("Most Profitable %")}
          </Button>
          <Button sx={{ width: "30%" }} variant="outlined">
            {t("Least Profitable %")}
          </Button>
        </Box>

        <Chart
          width={600}
          height={400}
          options={chartOptions}
          series={chartSeries}
          type="bar"
        />
      </CardContent>
    </Card>
  );
};
