import {
  Box,
  Button,
  CircularProgress,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { FC, useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Scrollbar } from "src/components/scrollbar";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { useEntity } from "src/hooks/use-entity";
import useItems from "src/hooks/use-items";
import { usePageView } from "src/hooks/use-page-view";
import cart from "src/utils/cart";
import { trigger } from "src/utils/custom-event";
import { useCurrency } from "src/utils/useCurrency";

interface BillingDiscountProps {
  companyRef: string;
}

export const BillingDiscount: FC<BillingDiscountProps> = (props) => {
  const { t } = useTranslation();
  const { companyRef } = props;
  usePageView();
  const { totalDiscount, discountsApplied, totalAmount } = useItems();
  const currency = useCurrency();

  const { find, entities: discounts, loading } = useEntity("coupon");

  const checkDiscountApplicable = (data: any) => {
    let discount = 0;

    const totalPercent = Number(
      ((totalDiscount * 100) / totalAmount)?.toFixed(0)
    );

    if (data.discountType === "percent") {
      const discountAmount = (totalAmount * Number(data.discount)) / 100;
      discount = Number(totalDiscount) + Number(discountAmount);
    } else if (data.discountType === "amount") {
      discount = Number(totalDiscount) + Number(data.discount);
    }

    if (totalAmount > discount) {
      if (totalPercent > 99) {
        toast.error(t("Discount must be applied for less than 100%"));
      } else {
        const idx = discountsApplied.findIndex(
          (dis: any) => dis._id == data._id
        );

        if (idx === -1) {
          if (cart.cartItems.length >= 0) {
            cart.applyDiscount(data, (discounts: any) => {
              trigger("discountApplied", null, discounts, null, null);
            });
          }
        } else {
          toast.error(t("Discount coupon already applied"));
        }
      }
    } else {
      toast.error(t("Discount amount must be less than total amount"));
    }
  };

  useEffect(() => {
    find({
      page: 0,
      sort: "asc",
      activeTab: "active",
      limit: 100,
      _q: "",
      companyRef: companyRef,
    });
  }, [companyRef]);

  return (
    <>
      <Box sx={{ p: 0 }}>
        <Scrollbar sx={{ maxHeight: "calc(100vh - 150px)" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ pl: 2.5 }}>{t("Discount Name")}</TableCell>
                  <TableCell>{t("Discount Value")}</TableCell>
                  <TableCell>{t("Expiry")}</TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      style={{ textAlign: "center", borderBottom: "none" }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          width: "100%",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "450px",
                        }}
                      >
                        <CircularProgress />
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  discounts?.results &&
                  (discounts?.results?.length > 0 ? (
                    discounts?.results?.map((discount: any, index: number) => {
                      return (
                        <TableRow key={index} hover>
                          <TableCell sx={{ pl: 2.5 }}>
                            <Typography variant="subtitle2">
                              {discount?.code}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {discount?.discountType === "amount"
                                ? currency + " "
                                : ""}
                              {discount?.discount}
                              {discount?.discountType === "percent" ? "%" : ""}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {discount?.expiry &&
                                new Date(discount?.expiry).toLocaleDateString(
                                  "en-GB"
                                )}
                            </Typography>
                          </TableCell>

                          <TableCell align="right">
                            <Button
                              variant="outlined"
                              onClick={() => {
                                if (cart.cartItems?.length === 0) {
                                  toast.error(
                                    t(
                                      "Please add item in the cart for discount"
                                    )
                                  );
                                  return;
                                }

                                checkDiscountApplicable(discount);
                              }}
                              sx={{
                                p: 1,
                                borderRadius: 1,
                                minWidth: "auto",
                              }}
                              startIcon={
                                <SvgIcon
                                  color={
                                    discountsApplied.findIndex(
                                      (dis: any) => dis._id == discount._id
                                    ) !== -1
                                      ? "disabled"
                                      : "primary"
                                  }
                                  fontSize="medium"
                                  sx={{
                                    m: "auto",
                                    cursor: "pointer",
                                  }}
                                >
                                  <PlusIcon />
                                </SvgIcon>
                              }
                            >
                              <Typography
                                sx={{
                                  color:
                                    discountsApplied.findIndex(
                                      (dis: any) => dis._id == discount._id
                                    ) !== -1
                                      ? "grey"
                                      : "inherit",
                                }}
                              >
                                {t("Apply")}
                              </Typography>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        style={{ textAlign: "center", borderBottom: "none" }}
                      >
                        <Box sx={{ mt: 10, mb: 6 }}>
                          <NoDataAnimation
                            text={
                              <Typography
                                variant="h6"
                                textAlign="center"
                                sx={{ mt: 5 }}
                              >
                                {t("No Discounts!")}
                              </Typography>
                            }
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
      </Box>
    </>
  );
};
