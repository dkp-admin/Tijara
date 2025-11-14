import {
  Avatar,
  Box,
  Card,
  CardActions,
  CardHeader,
  Divider,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import ChevronDown from "@untitled-ui/icons-react/build/esm/ChevronDown";
import ChevronUp from "@untitled-ui/icons-react/build/esm/ChevronUp";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import type { ApexOptions } from "apexcharts";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Chart } from "../chart";
import { Scrollbar } from "../scrollbar";
import { StyledCurrencyFormatter } from "../styled-currency-formatter";

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
    colors: [theme.palette.primary.main],
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
          colors: "#555555",
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "80px",
      },
    },
    yaxis: {
      labels: {
        offsetX: -12,
        style: {
          colors: "#555555",
        },
      },
    },
  };
};

interface CurrentMonthEarningsProps {
  earnings?: any[];
  labels?: string[];
}

export const CurrentMonthEarnings: FC<CurrentMonthEarningsProps> = (props) => {
  const { earnings, labels } = props;
  const { t } = useTranslation();

  const data = {
    series: [{ data: earnings }],
    categories: labels,
  };

  const chartOptions = useChartOptions(data.categories);

  const monthlyDataArr = data?.series[0]?.data.map((s: any) => {
    return s;
  });

  const chartSeries = [
    {
      data: monthlyDataArr,
      name: t("Earnings"),
    },
  ];

  return (
    <Card sx={{ mt: 4 }}>
      <CardHeader
        title={t("This Month Earnings")}
        action={
          <Tooltip title={t("Showing this month earnings")}>
            <SvgIcon color="action">
              <InfoCircleIcon />
            </SvgIcon>
          </Tooltip>
        }
      />

      <Typography sx={{ ml: 3, display: "flex" }} variant="h4">
        {StyledCurrencyFormatter("72100.00")}
      </Typography>

      <Stack sx={{ mb: 2 }}>
        <CardActions
          sx={{
            alignItems: "center",
            display: "flex",
            px: 0,
            ml: 3,
            mt: 1,
          }}>
          <Avatar
            sx={{
              backgroundColor: (theme) =>
                alpha(theme.palette.success.main, 0.16),
              color: `${true ? "success.main" : "error.main"}`,
              height: 36,
              width: 36,
            }}>
            {true ? (
              <ChevronUp fontSize="small" />
            ) : (
              <ChevronDown fontSize="small" />
            )}
          </Avatar>

          <Typography
            sx={{ ml: 1, mr: 1 }}
            color={`${true ? "success.main" : "error.main"}`}
            variant="body1"
            fontWeight="700">
            {"2.69%"}
          </Typography>
        </CardActions>

        <Typography sx={{ ml: 4 }} color="neutral.400" variant="caption">
          {"vs Last Month"}
        </Typography>
      </Stack>

      <Divider />

      <Scrollbar>
        <Box sx={{ px: 2, height: 336 }}>
          <Chart
            height={300}
            options={chartOptions}
            series={chartSeries}
            type="area"
          />
        </Box>
      </Scrollbar>
    </Card>
  );
};
