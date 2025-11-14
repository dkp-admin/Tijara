import ReorderRoundedIcon from "@mui/icons-material/ReorderRounded";
import {
  FormControlLabel,
  IconButton,
  SvgIcon,
  Switch,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { UNIT_VALUES } from "src/utils/constants";
import { trimText } from "src/utils/trim-text";
import { useCurrency } from "src/utils/useCurrency";

export function VariantLists({ variants }: any) {
  const { t } = useTranslation();
  const currency = useCurrency();

  return (
    <TableBody>
      {variants?.length > 0 ? (
        variants.map((variant: any, idx: any) => {
          return (
            <TableRow key={idx}>
              <TableCell>
                <Typography variant="body2">
                  <IconButton sx={{ mr: 0.7, ml: -1 }}>
                    <SvgIcon>
                      <ReorderRoundedIcon fontSize="small" />
                    </SvgIcon>
                  </IconButton>
                  {variant.name.en}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {trimText(variant.sku, 18)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {UNIT_VALUES[variant?.unit]}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {currency} {variant?.price || 0}
                </Typography>
                {variant?.oldPrice && (
                  <Typography
                    variant="body2"
                    style={{ textDecoration: "line-through" }}
                  >
                    {currency} {variant?.oldPrice || 0}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {currency} {variant?.costPrice || 0}
                </Typography>
                {variant?.oldCostPrice && (
                  <Typography
                    variant="body2"
                    style={{ textDecoration: "line-through" }}
                  >
                    {currency} {variant?.oldCostPrice || 0}
                  </Typography>
                )}
              </TableCell>

              <TableCell>
                <FormControlLabel
                  disabled
                  sx={{
                    minWidth: "100px",
                    display: "flex",
                    flexDirection: "row",
                  }}
                  control={
                    <Switch
                      checked={variant?.status === "active" ? true : false}
                      color="primary"
                      edge="end"
                      name="variantStatus"
                      value={variant?.status === "active" ? true : false}
                      sx={{
                        mr: 0.2,
                      }}
                    />
                  }
                  label={
                    variant?.status === "active"
                      ? t("Active")
                      : t("Deactivated")
                  }
                />
              </TableCell>
            </TableRow>
          );
        })
      ) : (
        <TableRow>
          <TableCell colSpan={5} style={{ textAlign: "center" }}>
            {t("Currently, no variants available")}
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}
