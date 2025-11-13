import {
  Box,
  Stack,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useCurrency } from "src/utils/useCurrency";

export function DeletedItemCard({ items }: { items: any[] }) {
  const { t } = useTranslation();

  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";
  const currency = useCurrency();

  const getProductNameInitial = (product: any) => {
    const name = product.name.en?.split(" ");

    return name?.length > 1
      ? name[0]?.charAt(0)?.toUpperCase() + name[1]?.charAt(0)?.toUpperCase()
      : name[0]?.charAt(0)?.toUpperCase();
  };

  const getItemName = (data: any) => {
    let units = "";

    if (data.variant.type === "box") {
      units = `, (${t("Box")} - ${data.variant.unitCount} ${t("Units")})`;
    }

    if (data.variant.type === "crate") {
      units = `, (${t("Crate")} - ${data.noOfUnits} ${t("Units")})`;
    }

    const variantNameEn = data.hasMultipleVariants
      ? ` - ${data.variant.name.en}`
      : "";
    const variantNameAr = data.hasMultipleVariants
      ? ` - ${data.variant.name.ar}`
      : "";

    if (isRTL) {
      return `${data.name.ar}${variantNameAr}${units}`;
    } else {
      return `${data.name.en}${variantNameEn}${units}`;
    }
  };

  const getModifierName = (data: any) => {
    let name = "";

    data?.modifiers?.map((mod: any) => {
      name += `${name === "" ? "" : ", "}${mod.optionName}`;
    });

    return name;
  };

  return (
    <TableBody>
      {items?.length > 0 ? (
        items.map((item: any) => {
          return (
            <TableRow key={item.productRef} sx={{ opacity: 0.5 }}>
              <TableCell>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ mt: 1, mb: 1, alignItems: "center" }}
                >
                  {item?.image ? (
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 1,
                        display: "flex",
                        overflow: "hidden",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundColor: "neutral.50",
                        backgroundImage: `url(${item.image})`,
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "#0C935680"
                            : "#006C3580",
                      }}
                    >
                      <Typography fontWeight="700" variant="h6" color="#fff">
                        {getProductNameInitial(item)}
                      </Typography>
                    </Box>
                  )}

                  <div>
                    <Typography variant="body2">{getItemName(item)}</Typography>

                    <Typography variant="body2" color="text.secondary">
                      {getModifierName(item)}
                    </Typography>
                  </div>
                </Stack>
              </TableCell>

              <TableCell>
                <Typography sx={{ ml: 1 }} variant="body2">
                  {item.quantity}
                </Typography>
              </TableCell>

              <TableCell align="right">
                {item?.isFree ? (
                  <Box>
                    <Typography variant="body2">{"FREE"}</Typography>

                    <del>
                      <Typography
                        fontSize="14px"
                        variant="body2"
                        color="text.secondary"
                      >
                        {`${currency} ${Number(item.billing.total)?.toFixed(
                          2
                        )}`}
                      </Typography>
                    </del>
                  </Box>
                ) : item?.isQtyFree ? (
                  <Typography variant="body2">
                    {Number(
                      item.billing.total - item.billing.discountAmount
                    ).toFixed(2)}
                  </Typography>
                ) : (
                  <Typography variant="body2">
                    {`${currency} ${Number(item.billing.total)?.toFixed(2)}`}
                  </Typography>
                )}
              </TableCell>
            </TableRow>
          );
        })
      ) : (
        <TableRow>
          <TableCell colSpan={5} style={{ textAlign: "center" }}>
            {t("Currently, there are no deleted items")}
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}
