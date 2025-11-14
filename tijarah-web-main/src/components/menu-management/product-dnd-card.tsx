import ReorderRoundedIcon from "@mui/icons-material/ReorderRounded";
import {
  Card,
  CardContent,
  Divider,
  IconButton,
  SvgIcon,
  Tooltip,
  Typography,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import Trash02 from "@untitled-ui/icons-react/build/esm/Trash02";
import { t } from "i18next";
import { Draggable } from "react-beautiful-dnd";
import { useCurrency } from "src/utils/useCurrency";
import TextFieldWrapper from "../text-field-wrapper";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";

const ProductDNDCard = ({
  item,
  index,
  remove,
  formik,
  categoryIndex,
}: {
  item: any;
  index: number;
  categoryIndex: number;
  remove: any;
  formik: any;
}) => {
  const currency = useCurrency();

  const getVariants = () => {
    const variants = item?.variants?.filter((v: any) => {
      return (
        !v?.nonSaleable &&
        // v?.unit === "perItem" &&
        v?.prices?.find((p: any) => {
          return (
            p?.locationRef?.toString() ===
              formik?.values?.locationRef?.toString() && Number(p?.price) >= 0
          );
        })
      );
    });

    return variants;
  };

  return (
    <Draggable key={item._id} draggableId={item._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card
            sx={{
              borderRadius: 0,
              boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <CardContent sx={{ p: 0.5, pb: "0!important" }}>
              <Stack direction="row" spacing={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={0}
                  sx={{ width: "100%" }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={5}
                  >
                    <ReorderRoundedIcon />
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        {item?.name?.en}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={0}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        // maxWidth: "350px",
                        p: 1,
                      }}
                    >
                      {item?.variants?.map((d: any, idx: number) => {
                        const overridenPrice = d?.prices?.find(
                          (op: any) =>
                            op?.locationRef?.toString() ===
                            formik?.values?.locationRef?.toString()
                        );

                        return (
                          <Box
                            key={idx}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              mb: 1,
                              pr: 1,
                              width: 150,
                            }}
                          >
                            <Typography variant="body2">
                              {d?.name?.en}
                            </Typography>
                            <TextFieldWrapper
                              style={{ marginTop: 1 }}
                              fullWidth
                              label={t("Price")}
                              name={`categories[${categoryIndex}]?.products[${index}]?.variants?.[${idx}]?.price`}
                              onBlur={formik.handleBlur}
                              onWheel={(event: any) => {
                                event.preventDefault();
                                event.target.blur();
                              }}
                              onKeyPress={(event: any): void => {
                                const ascii = event.charCode;
                                const value = (event.target as HTMLInputElement)
                                  .value;
                                const decimalCheck = value.indexOf(".") !== -1;

                                if (decimalCheck) {
                                  const decimalSplit = value.split(".");
                                  const decimalLength = decimalSplit[1].length;
                                  if (decimalLength > 1 || ascii === 46) {
                                    event.preventDefault();
                                  } else if (ascii < 48 || ascii > 57) {
                                    event.preventDefault();
                                  }
                                } else if (value.length > 5 && ascii !== 46) {
                                  event.preventDefault();
                                } else if (
                                  (ascii < 48 || ascii > 57) &&
                                  ascii !== 46
                                ) {
                                  event.preventDefault();
                                }
                              }}
                              InputProps={{
                                startAdornment: (
                                  <Typography
                                    color="textSecondary"
                                    variant="body2"
                                    sx={{ mr: 1, mt: 2.4 }}
                                  >
                                    {currency}
                                  </Typography>
                                ),
                              }}
                              onChange={(e) => {
                                const value = e.target.value;

                                const newValues = { ...formik.values };

                                const prices = newValues.products[
                                  index
                                ].variants[idx].prices?.map((price: any) => {
                                  return {
                                    ...price,
                                    price: Number(value),
                                    priceOverridenFromMenu: true,
                                  };
                                });

                                newValues.products[index].variants[idx].price =
                                  Number(value);

                                newValues.products[
                                  index
                                ].priceOverridenFromMenu = true;

                                newValues.products[index].variants[idx].prices =
                                  prices;

                                formik.setValues(newValues);
                              }}
                              value={
                                overridenPrice?.price ||
                                formik.values?.products[index]?.variants[idx]
                                  ?.price
                              }
                            />
                          </Box>
                        );
                      })}
                    </Box>

                    <Box>
                      <IconButton color="default" onClick={() => remove()}>
                        <Trash02 />
                      </IconButton>
                    </Box>
                    {formik.values.products[index].priceOverridenFromMenu && (
                      <Box sx={{ marginTop: 1 }}>
                        <Tooltip title={t("Price is overriden from menu.")}>
                          <SvgIcon color="action">
                            <InfoCircleIcon />
                          </SvgIcon>
                        </Tooltip>
                      </Box>
                    )}
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
            <Divider />
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export default ProductDNDCard;
