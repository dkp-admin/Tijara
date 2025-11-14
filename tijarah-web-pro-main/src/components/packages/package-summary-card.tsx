import { Mode } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

export function PackageSummaryCard({ formik }: { formik: any }) {
  const { t } = useTranslation();
  const currency = useCurrency();

  // Get base package prices and discounts
  const getBasePriceInfo = (type: string) => {
    const priceObj = formik.values.prices.find((p: any) => p.type === type);
    if (!priceObj) return { price: 0, originalPrice: 0 };

    const originalPrice = priceObj.price;
    const discountPercentage = priceObj.discountPercentage || 0;
    const price = originalPrice * (1 - discountPercentage / 100);

    return { price, originalPrice };
  };

  const monthlyBase = getBasePriceInfo("monthly");
  const quarterlyBase = getBasePriceInfo("quarterly");
  const annualBase = getBasePriceInfo("annually");

  // Calculate addon prices and discounts
  const calculateAddonTotal = (type: string) => {
    return formik.values.addons.reduce(
      (acc: { price: number; originalPrice: number }, addon: any) => {
        // Check if addon has prices array
        if (!addon.prices || !Array.isArray(addon.prices)) return acc;

        const priceObj = addon.prices.find((p: any) => p.type === type);
        if (!priceObj || !priceObj.price) return acc;

        const originalPrice = Number(priceObj.price);
        const discountPercentage = priceObj.discountPercentage || 0;
        const price = originalPrice * (1 - discountPercentage / 100);

        if (addon.key === "location_addon") {
          const qty = Number(addon.qty) || 1;
          return {
            price: acc.price + price * qty,
            originalPrice: acc.originalPrice + originalPrice * qty,
          };
        }

        if (addon.key === "device_addon") {
          const qty = Number(addon.qty) || 1;
          return {
            price: acc.price + price * qty,
            originalPrice: acc.originalPrice + originalPrice * qty,
          };
        }

        return {
          price: acc.price + price,
          originalPrice: acc.originalPrice + originalPrice,
        };
      },
      { price: 0, originalPrice: 0 }
    );
  };

  const monthlyAddons = calculateAddonTotal("monthly");
  const quarterlyAddons = calculateAddonTotal("quarterly");
  const annualAddons = calculateAddonTotal("annually");

  // Calculate hardware total (no discounts applicable)
  const hardwareTotal =
    formik.values.hardwares?.reduce(
      (total: number, hardware: any) => total + (Number(hardware.price) || 0),
      0
    ) || 0;

  // Calculate grand totals
  const monthlyTotal = monthlyBase.price + monthlyAddons.price;
  const quarterlyTotal = quarterlyBase.price + quarterlyAddons.price;
  const annualTotal = annualBase.price + annualAddons.price;

  // Render price with discount if applicable
  const renderPrice = (price: number, originalPrice: number) => {
    if (originalPrice > price) {
      return (
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textDecoration: "line-through" }}
          >
            {`${currency} ${toFixedNumber(originalPrice)}`}
          </Typography>
          <Typography variant="body2" color="success.main">
            {`${currency} ${toFixedNumber(price)}`}
          </Typography>
        </Box>
      );
    }
    return (
      <Typography variant="body2">
        {`${currency} ${toFixedNumber(price)}`}
      </Typography>
    );
  };

  // Billing summary line items
  const billingItems = [
    {
      title: t("Base Package"),
      monthly: monthlyBase.price,
      quarterly: quarterlyBase.price,
      annual: annualBase.price,
      monthlyOriginal: monthlyBase.originalPrice,
      quarterlyOriginal: quarterlyBase.originalPrice,
      annualOriginal: annualBase.originalPrice,
    },
    {
      title: t("Addons"),
      monthly: monthlyAddons.price,
      quarterly: quarterlyAddons.price,
      annual: annualAddons.price,
      monthlyOriginal: monthlyAddons.originalPrice,
      quarterlyOriginal: quarterlyAddons.originalPrice,
      annualOriginal: annualAddons.originalPrice,
    },
    {
      title: t("Hardware (One-time)"),
      monthly: hardwareTotal,
      quarterly: hardwareTotal,
      annual: hardwareTotal,
      monthlyOriginal: hardwareTotal,
      quarterlyOriginal: hardwareTotal,
      annualOriginal: hardwareTotal,
    },
  ];

  // Render a billing line item
  const renderBillingItem = (item: any, index: number) => (
    <Box key={index} sx={{ py: 1.5 }}>
      <Grid container alignItems="center">
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            {item.title}
          </Typography>
        </Grid>
        {/* Monthly price temporarily disabled
        <Grid item xs={2} textAlign="right">
          {renderPrice(item.monthly, item.monthlyOriginal)}
        </Grid>
        */}
        <Grid item xs={3} textAlign="right">
          {renderPrice(item.quarterly, item.quarterlyOriginal)}
        </Grid>
        <Grid item xs={3} textAlign="right">
          {renderPrice(item.annual, item.annualOriginal)}
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t("Package Summary")}
        </Typography>

        <Paper
          elevation={0}
          sx={{ p: 2, bgcolor: "background.neutral", mb: 3 }}
        >
          {/* Header */}
          <Grid container sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                {t("Item")}
              </Typography>
            </Grid>
            {/* Monthly column temporarily disabled
            <Grid item xs={2} textAlign="right">
              <Typography variant="subtitle2" color="text.secondary">
                {t("Monthly")}
              </Typography>
            </Grid>
            */}
            <Grid item xs={3} textAlign="right">
              <Typography variant="subtitle2" color="text.secondary">
                {t("Quarterly")}
              </Typography>
            </Grid>
            <Grid item xs={3} textAlign="right">
              <Typography variant="subtitle2" color="text.secondary">
                {t("Annual")}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 1 }} />

          {/* Billing Items */}
          {billingItems.map(renderBillingItem)}

          <Divider sx={{ my: 1 }} />

          {/* Totals */}
          <Box sx={{ py: 1.5 }}>
            <Grid container alignItems="center">
              <Grid item xs={6}>
                <Typography variant="subtitle2">
                  {t("Subscription Total")}
                </Typography>
              </Grid>
              {/* Monthly total temporarily disabled
              <Grid item xs={2} textAlign="right">
                <Typography variant="subtitle2">
                  {`${t("SAR")} ${toFixedNumber(monthlyTotal + hardwareTotal)}`}
                </Typography>
              </Grid>
              */}
              <Grid item xs={3} textAlign="right">
                <Typography variant="subtitle2">
                  {`${currency} ${toFixedNumber(
                    quarterlyTotal + hardwareTotal
                  )}`}
                </Typography>
              </Grid>
              <Grid item xs={3} textAlign="right">
                <Typography variant="subtitle2">
                  {`${currency} ${toFixedNumber(annualTotal + hardwareTotal)}`}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Additional Information */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t("Package includes")}:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mt: 1 }}>
            <Box component="li">
              <Typography variant="body2" color="text.secondary">
                {t("Trial period")}: {formik.values.trialDays} {t("days")}
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body2" color="text.secondary">
                {t("Device limit")}: {formik.values.deviceLimit}
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body2" color="text.secondary">
                {t("Location limit")}: {formik.values.locationLimit}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
