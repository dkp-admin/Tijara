import {
  Box,
  Card,
  CardHeader,
  Divider,
  SvgIcon,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import type { ApexOptions } from "apexcharts";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Chart } from "../chart";
import { Scrollbar } from "../scrollbar";

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

export const WeeklyEarnings: FC<WeeklyEarningsProps> = (props) => {
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
    <Card>
      <CardHeader
        title={t("Days of the Week")}
        action={
          <Tooltip title={t("Showing weekly earnings")}>
            <SvgIcon color="action">
              <InfoCircleIcon />
            </SvgIcon>
          </Tooltip>
        }
      />

      <Divider />

      <Scrollbar>
        <Box sx={{ px: 2, height: 336 }}>
          <Chart
            height={300}
            options={chartOptions}
            series={chartSeries}
            type="bar"
          />
        </Box>
      </Scrollbar>
    </Card>
  );
};
