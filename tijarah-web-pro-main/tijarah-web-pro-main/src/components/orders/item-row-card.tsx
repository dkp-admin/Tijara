import {
  Box,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { toFixedNumber } from "src/utils/toFixedNumber";
import NoDataAnimation from "../widgets/animations/NoDataAnimation";
import { useCurrency } from "src/utils/useCurrency";

export function ItemRowCard({
  items,
  handleAllCheck,
  handleSingleCheck,
}: {
  items: any;
  handleAllCheck: any;
  handleSingleCheck: any;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const currency = useCurrency();
  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const getItemName = (item: any) => {
    const box =
      item.type === "box"
        ? `, (${t("Box")} - ${item.unitCount} ${t("Units")})`
        : item.type === "crate"
        ? `, (${t("Crate")} - ${item.unitCount} ${t("Units")})`
        : "";

    if (isRTL) {
      return item.nameAr + box;
    } else {
      return item.nameEn + box;
    }
  };

  const selectedItem = items?.filter((item: any) => item.selected)?.length;

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell
            padding="checkbox"
            style={{
              width: "5%",
              background:
                theme.palette.mode === "dark" ? "#0C93561A" : "#006C351A",
            }}
          >
            <Checkbox
              checked={
                selectedItem === items?.filter((op: any) => !op?.isFree)?.length
              }
              onChange={(event) => handleAllCheck(event.target.checked)}
              value={selectedItem === items?.length}
            />
          </TableCell>
          <TableCell
            style={{
              width: "70%",
              background:
                theme.palette.mode === "dark" ? "#0C93561A" : "#006C351A",
            }}
          >
            {t("Items")}
          </TableCell>
          <TableCell
            align="right"
            style={{
              width: "25%",
              background:
                theme.palette.mode === "dark" ? "#0C93561A" : "#006C351A",
            }}
          >
            {t("Price")}
          </TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {items?.length > 0 ? (
          items.map((item: any) => {
            return (
              <TableRow key={item.id} selected={item.selected}>
                <TableCell padding="checkbox" style={{ width: "5%" }}>
                  <Checkbox
                    disabled={item?.disableCheckbox || item?.isFree}
                    checked={item.selected}
                    onChange={(event) =>
                      handleSingleCheck(item, event.target.checked)
                    }
                    value={item.selected}
                  />
                </TableCell>

                <TableCell style={{ width: "70%" }}>
                  <Typography variant="body2">{getItemName(item)}</Typography>
                </TableCell>

                <TableCell align="right" style={{ width: "25%" }}>
                  {item?.isFree ? (
                    <>
                      <Typography variant="body2">{"FREE"}</Typography>
                      <del>
                        <Typography variant="body2">
                          {`${currency} ${toFixedNumber(item.amount)}`}
                        </Typography>
                      </del>
                    </>
                  ) : (
                    <Typography variant="body2">
                      {`${currency} ${toFixedNumber(item.amount)}`}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={3} style={{ textAlign: "center" }}>
              <Box sx={{ mt: 6, mb: 6 }}>
                <NoDataAnimation
                  text={
                    <Typography variant="h6" textAlign="center" sx={{ mt: 5 }}>
                      {t("No Items!")}
                    </Typography>
                  }
                />
              </Box>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
