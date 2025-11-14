import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Card,
  CircularProgress,
  Divider,
  Modal,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { usePageView } from "src/hooks/use-page-view";
import { getItemVAT } from "src/utils/get-price";
import { ItemRowCard } from "../orders/item-row-card";
import RestockItemsModal from "./restock-items-modal";

interface IssueRefundModalProps {
  open: boolean;
  order: any;
  handleClose: () => void;
  handleIssueRefund: () => void;
}

const IssueRefundModal: React.FC<IssueRefundModalProps> = ({
  open,
  order,
  handleClose,
  handleIssueRefund,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [itemList, setItemList] = useState<any[]>([]);
  const [openRestockItems, setOpenRestockItems] = useState(false);

  const isNearpay =
    order.payment.breakup?.findIndex(
      (t: any) => t.providerName === "nearpay"
    ) !== -1;

  usePageView();

  const handleSelection = (selected: boolean) => {
    const data = itemList.map((item: any) => {
      if (!item?.isFree) return { ...item, selected: selected };
      else return { ...item, selected: false };
    });

    setItemList(data);
  };

  const handleSingleSelection = (dataObj: any, selected: boolean) => {
    const data = itemList.map((item: any) => {
      if (dataObj.id == item.id) {
        return { ...item, selected: selected };
      } else {
        return item;
      }
    });

    setItemList(data);
  };

  const getAmount = () => {
    const items = itemList?.filter((item: any) => item.selected);

    return items.reduce((prev: any, cur: any) => prev + Number(cur.amount), 0);
  };

  const getVat = () => {
    const items = itemList?.filter((item: any) => item.selected);

    return items.reduce((prev: any, cur: any) => prev + Number(cur.vat), 0);
  };

  const getVatWithoutDiscount = () => {
    const items = itemList?.filter((item: any) => item.selected);

    return items.reduce(
      (prev: any, cur: any) => prev + Number(cur.vatWithoutDiscount),
      0
    );
  };

  const getDiscountAmount = () => {
    const items = itemList?.filter((item: any) => item.selected);

    return items.reduce(
      (prev: any, cur: any) => prev + Number(cur.discountAmount),
      0
    );
  };

  useEffect(() => {
    if (open) {
      setLoading(true);

      let idx = 0;
      const itemsData: any = [];

      order.items?.map((item: any) => {
        let count = 0;

        if (
          item.variant.unit === "perItem" ||
          item.variant?.type === "box" ||
          item.variant?.type === "crate"
        ) {
          count = item.quantity;
        } else {
          count = 1;
        }

        if (count != 0) {
          for (let index = 0; index < count; index++) {
            const quantity =
              item.variant.unit === "perItem" ||
              item.variant?.type === "box" ||
              item.variant?.type === "crate"
                ? 1
                : item.quantity;

            itemsData.push({
              id: idx,
              productRef: item.productRef,
              categoryRef: item.categoryRef,
              productName: { en: item.name.en, ar: item.name.ar },
              category: { name: item?.category?.name || "" },
              variantName: {
                en: item.variant.name.en,
                ar: item.variant.name.ar,
              },
              nameEn:
                `${item.name.en}` +
                `${
                  item.hasMultipleVariants ? " - " + item.variant.name.en : ""
                }`,
              nameAr:
                `${item.name.ar}` +
                `${
                  item.hasMultipleVariants ? " - " + item.variant.name.ar : ""
                }`,
              qty: quantity,
              type: item.variant?.type || "item",
              sku: item.variant.sku,
              parentSku:
                item.variant?.type === "box" || item.variant?.type === "crate"
                  ? item.variant.parentSku
                  : item.variant.sku,
              boxSku: item.variant.boxSku,
              crateSku: item.variant.crateSku,
              boxRef: item.variant?.boxRef ? item.variant.boxRef : null,
              crateRef: item.variant?.crateRef ? item.variant.crateRef : null,
              unit: item.variant.unit,
              unitCount: item.variant.unitCount,
              isFree: item?.isFree,
              isQtyFree: item?.isQtyFree,
              amount: Number(
                item.billing.total /
                  (item.variant.unit === "perItem" ||
                  item.variant?.type === "box" ||
                  item.variant?.type === "crate"
                    ? item.quantity
                    : 1)
              ),
              vatWithoutDiscount: Number(
                getItemVAT(
                  Number(item.billing.total + item.billing.discountAmount),
                  Number(item.billing.vatPercentage)
                ) /
                  (item.variant.unit === "perItem" ||
                  item.variant.type === "box" ||
                  item.variant?.type === "crate"
                    ? item.quantity
                    : 1)
              ),
              discountAmount: Number(
                item.billing.discountAmount /
                  (item.variant.unit === "perItem" ||
                  item.variant?.type === "box" ||
                  item.variant?.type === "crate"
                    ? item.quantity
                    : 1)
              ),
              discountPercentage: item?.billing?.discountPercentage || 0,
              costPrice: item.variant.costPrice,
              vat: Number(
                item.billing.vatAmount /
                  (item.variant.unit === "perItem" ||
                  item.variant.type === "box" ||
                  item.variant?.type === "crate"
                    ? item.quantity
                    : 1)
              ),
              selected: false,
              isOpenItem: item.variant.sku === "Open Item",
              hasMultipleVariants: item.hasMultipleVariants,
              availability: item.variant?.stock?.availability,
              stockCount: item.variant?.stock?.count,
              tracking: item.variant?.stock?.tracking,
              modifiers: item?.modifiers || [],
            });

            idx += 1;
          }
        }
      });

      setLoading(false);
      setItemList(itemsData || []);
    }
  }, [open]);

  return (
    <>
      <Modal open={open}>
        <Box>
          <Card
            sx={{
              visibility: "visible",
              scrollbarColor: "transparent",
              scrollBehavior: "auto",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: {
                xs: "100vw",
                sm: "100vw",
                md: "70vw",
                lg: "50vw",
              },
              bgcolor: "background.paper",
              maxHeight: {
                xs: "100vh",
                sm: "100vh",
                md: "90vh",
                lg: "90vh",
              },
              borderRadius: {
                xs: "0px",
                sm: "0px",
                md: "20px",
                lg: 1,
              },
              py: 2,
            }}
          >
            {/* header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                mt: -2,

                background: theme.palette.mode !== "dark" ? `#fff` : "#111927",

                borderRadius: "20px",
              }}
            >
              <Box
                style={{
                  display: "flex",
                }}
              ></Box>

              <Typography variant="h6" sx={{ mr: 0 }}>
                {t("Issue Refund")}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": {
                    backgroundColor: "action.hover",
                    cursor: "pointer",
                    opacity: 0.5,
                  },
                }}
              >
                <CloseIcon fontSize="medium" onClick={handleClose} />
              </Box>
            </Box>

            <Divider />

            <Box
              sx={{
                px: 3,
                pt: 3,
                pb: 3,
                height: {
                  xs: "100vh",
                  sm: "100vh",
                  md: "73vh",
                  lg: "75vh",
                },
                width: "100%",
                // flex: "1 1 auto",
                overflow: "scroll",
                overflowX: "hidden",
              }}
            >
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  pb: 4,
                  mb: 3,
                }}
              >
                <Typography variant="subtitle1" color="neutral.600">
                  {`${t("Note")}: ${t("Refund can only be processed once")}`}
                </Typography>

                <Typography
                  sx={{ mt: 3 }}
                  variant="subtitle1"
                  color="neutral.600"
                >
                  {`#${order?.orderNum}`}
                </Typography>

                <Typography sx={{ mt: 3.5, mb: 1, ml: 2 }} variant="subtitle2">
                  {t("ITEMS")}
                </Typography>

                {loading ? (
                  <Box
                    sx={{
                      height: "100vh",
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <CircularProgress />
                  </Box>
                ) : (
                  <ItemRowCard
                    items={itemList}
                    handleAllCheck={(val: boolean) => handleSelection(val)}
                    handleSingleCheck={(data: any, val: boolean) =>
                      handleSingleSelection(data, val)
                    }
                  />
                )}
              </Box>
            </Box>
            <Divider />
            {/* footer */}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "end",
                p: 2,
                zIndex: 1,
                background: theme.palette.mode !== "dark" ? `#fff` : "#111927",
                borderRadius: "5px",
              }}
            >
              <LoadingButton
                sx={{ borderRadius: 1 }}
                variant="contained"
                type="submit"
                onClick={() => {
                  const selectedItem = itemList.filter(
                    (item: any) => item.selected
                  );

                  if (selectedItem.length === 0) {
                    toast.error(t("Please Select Item"));
                    return;
                  }

                  setOpenRestockItems(true);
                }}
                size="medium"
              >
                {t("Next")}
              </LoadingButton>
            </Box>
          </Card>
        </Box>
      </Modal>

      <RestockItemsModal
        data={{
          order: order,
          selectedItems: itemList,
          amount: Number(getAmount())?.toFixed(2),
          vat: Number(getVat())?.toFixed(2),
          discountAmount: Number(getDiscountAmount())?.toFixed(2),
          vatWithoutDiscount: Number(getVatWithoutDiscount())?.toFixed(2),
        }}
        open={openRestockItems}
        handleClose={() => setOpenRestockItems(false)}
        handleRestockItems={() => {
          handleIssueRefund();
          setOpenRestockItems(false);
        }}
      />
    </>
  );
};

export default IssueRefundModal;
