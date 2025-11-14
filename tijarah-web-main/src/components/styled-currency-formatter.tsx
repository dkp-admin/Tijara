import { Box, Typography, useTheme } from "@mui/material";
import { useCurrency } from "src/utils/useCurrency";

export const StyledCurrencyFormatter = (number: any) => {
  const theme = useTheme();
  const currencySymbol = useCurrency();

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "SAR",
  });

  const currency = Number(Number(number || 0).toFixed(2));
  let value = formatter.format(currency);
  //@ts-ignore
  value = value.split(/(\s+)/);

  const styledCurrency = (
    <Typography
      variant={"subtitle2"}
      sx={{
        color:
          theme.palette.mode == "dark"
            ? theme.palette.text.primary
            : theme.palette.neutral[700],
        mb: -1,
        mr: 1,
      }}
    >
      {currencySymbol}
    </Typography>
  );

  const isNegative = currency < 0;
  const data = value[2]?.split(".");
  const displayValue = isNegative
    ? `-${data[0].replace("-", "")}.`
    : `${data[0]}.`;

  return (
    <Box sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}>
      <Typography variant="subtitle2" color="text.primary">
        {styledCurrency}
      </Typography>
      <span>
        {displayValue}
        <sup
          style={{
            verticalAlign: "super",
            position: "relative",
            top: 1,
            fontSize: "18px",
          }}
        >{`${data[1]}`}</sup>
      </span>
    </Box>
  );
};
