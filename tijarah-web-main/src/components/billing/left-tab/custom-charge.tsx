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
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import useCartStore from "src/store/cart-item";
import cart from "src/utils/cart";
import { trigger } from "src/utils/custom-event";
import { getItemVAT } from "src/utils/get-price";
import { useCurrency } from "src/utils/useCurrency";

interface BillingCustomChargeProps {
  companyRef: string;
  company: any;
  location: any;
}

export const BillingCustomCharge: FC<BillingCustomChargeProps> = (props) => {
  const { t } = useTranslation();
  const { companyRef, company, location } = props;
  usePageView();
  const { subTotalWithoutDiscount, chargesApplied } = useItems();
  const { find, entities: customCharges, loading } = useEntity("custom-charge");
  const currency = useCurrency();
  const { channel } = useCartStore() as any;
  const { canAccessModule } = useFeatureModuleManager();
  const getChargeValue = (data: any) => {
    const maxText = data.chargeType === "custom" ? `${t("Max")}. ` : "";

    if (data.type === "percentage") {
      return maxText + `${data.value}%`;
    } else {
      return maxText + `${currency} ${Number(data.value)?.toFixed(2)}`;
    }
  };

  const handleAddButtonPress = (data: any) => {
    if (cart.cartItems?.length === 0) {
      toast.error(t("Please add item in the cart for custom charge"));
      return;
    }

    const idx = chargesApplied.findIndex(
      (charge: any) => charge.chargeId === data._id
    );

    if (idx === -1) {
      const vat = Number(company.vat.percentage);

      const price =
        data.type === "percentage"
          ? (subTotalWithoutDiscount * data.value) / 100
          : data.value;

      const chargeData = {
        name: { en: data.name.en, ar: data.name.ar },
        total: Number(price?.toFixed(2)),
        vat: getItemVAT(price, data?.taxRef ? data.tax?.percentage || 0 : vat),
        type: data.type,
        chargeType: data.chargeType,
        value: data.value,
        chargeId: data._id,
      };

      if (cart.cartItems.length >= 0) {
        cart.applyCharges(chargeData, (charges: any) => {
          trigger("chargeApplied", null, charges, null, null);
        });
      }
    } else {
      toast.error(t("Charge already applied"));
    }
  };
  console.log(location, "locationRef");

  useEffect(() => {
    find({
      page: 0,
      sort: "asc",
      activeTab: "active",
      limit: 100,
      _q: "",
      companyRef: companyRef,
      channel: channel,
      locationRef: location?._id,
    });
  }, [companyRef, channel, location]);

  if (!canAccessModule("custom_charges")) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "calc(100vh - 150px)",
          p: 3,
        }}
      >
        <NoDataAnimation
          text={
            <Typography variant="h6" textAlign="center" sx={{ mt: 5 }}>
              {t("Upgrade your package to access this module")}
            </Typography>
          }
        />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ p: 0 }}>
        <Scrollbar sx={{ maxHeight: "calc(100vh - 150px)" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ pl: 2.5 }}>{t("Charge Name")}</TableCell>
                  <TableCell>{t("Charge Value")}</TableCell>
                  <TableCell>{t("Charge Type")}</TableCell>
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
                  customCharges?.results &&
                  (customCharges?.results?.length > 0 ? (
                    customCharges?.results?.map(
                      (charge: any, index: number) => {
                        return (
                          <TableRow key={index} hover>
                            <TableCell sx={{ pl: 2.5 }}>
                              <Typography variant="subtitle2">
                                {charge.name.en}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2">
                                {getChargeValue(charge)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="subtitle2"
                                sx={{ textTransform: "capitalize" }}
                              >
                                {charge.type}
                              </Typography>
                            </TableCell>

                            <TableCell align="right">
                              <Button
                                variant="outlined"
                                onClick={() => {
                                  handleAddButtonPress(charge);
                                }}
                                sx={{
                                  p: 1,
                                  borderRadius: 1,
                                  minWidth: "auto",
                                }}
                                startIcon={
                                  <SvgIcon
                                    color={
                                      chargesApplied.findIndex(
                                        (data: any) =>
                                          data.chargeId == charge._id
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
                                      chargesApplied.findIndex(
                                        (data: any) =>
                                          data.chargeId == charge._id
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
                      }
                    )
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
                                {t("No Custom Charges!")}
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
