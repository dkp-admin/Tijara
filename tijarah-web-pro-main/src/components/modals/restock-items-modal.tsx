import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  Divider,
  Modal,
  Typography,
  useTheme,
} from "@mui/material";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { usePageView } from "src/hooks/use-page-view";
import { ItemRowCard } from "../orders/item-row-card";
import RefundReasonModal from "./refund-reason-modal";
import CloseIcon from "@mui/icons-material/Close";

interface RestockItemsModalProps {
  open: boolean;
  data: any;
  handleClose: () => void;
  handleRestockItems: () => void;
}

const RestockItemsModal: React.FC<RestockItemsModalProps> = ({
  open,
  data,
  handleClose,
  handleRestockItems,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [itemList, setItemList] = useState<any>([]);
  const [restockData, setRestockData] = useState<any>({});
  const [openIssueReason, setOpenIssueReason] = useState(false);

  usePageView();

  const handleSelection = (selected: boolean) => {
    const data = itemList.map((item: any) => {
      return { ...item, selected: selected };
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

  useEffect(() => {
    if (open) {
      const itemsData = data.selectedItems.filter((item: any) => item.selected);

      setItemList(itemsData || []);
      setRestockData({
        order: data.order,
        restockItems: [],
        selectedItems: data.selectedItems,
        amount: data.amount,
        vat: data.vat,
        discountAmount: data.discountAmount,
        vatWithoutDiscount: data.vatWithoutDiscount,
      });
    }
  }, [open]);

  return (
    <>
      <Modal open={open} hideBackdrop>
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
                lg: "20px",
              },
              py: 2,
            }}
          >
            {/* <Box
              sx={{
                py: 1.5,
                pl: 2.5,
                pr: 2.5,
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1,
                flex: "0 0 auto",
                position: "fixed",
                background: theme.palette.mode !== "dark" ? `#fff` : "#111927",
              }}>
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-evenly",
                }}>
                <XCircle
                  fontSize="small"
                  onClick={handleClose}
                  style={{ cursor: "pointer" }}
                />

                <Box style={{ flex: 1 }}>
                  <Typography variant="h5" align="center" sx={{ mr: 4 }}>
                    {t("Restock Items")}
                  </Typography>
                </Box>
              </Box>
            </Box> */}

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
                {t("Restock Items")}
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
                mb: 3,
                height: {
                  xs: "85vh",
                  sm: "85vh",
                  md: "70vh",
                  lg: "72vh",
                },
                width: "100%",
                flex: "1 1 auto",
                overflow: "scroll",
                overflowX: "hidden",
              }}
            >
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  pb: 4,
                  mb: 4,
                }}
              >
                <Typography variant="subtitle1" color="neutral.600">
                  {`#${data.order.orderNum}`}
                </Typography>

                <Typography sx={{ mt: 2.5 }} variant="h6">
                  {t("Select Items to Restock")}
                </Typography>

                <Typography
                  sx={{ mt: 1.5 }}
                  variant="subtitle2"
                  color="neutral.600"
                >
                  {t("Items will be restocked in their respective batches")}
                </Typography>

                <Typography sx={{ mt: 4, mb: 1, ml: 2 }} variant="subtitle2">
                  {t("ITEMS")}
                </Typography>

                <ItemRowCard
                  items={itemList}
                  handleAllCheck={(val: boolean) => handleSelection(val)}
                  handleSingleCheck={(data: any, val: boolean) =>
                    handleSingleSelection(data, val)
                  }
                />
              </Box>
            </Box>

            {/* <Box
              sx={{
                py: 3,
                px: 3,
                bottom: 0,
                width: "100%",
                height: "95px",
                position: "absolute",
                display: "flex",
                justifyContent: "space-between",
                background: theme.palette.mode !== "dark" ? `#fff` : "#111927",
              }}>
              <Button
                sx={{ flex: 1, py: 1.5 }}
                variant="outlined"
                onClick={() => {
                  setRestockData({
                    order: data.order,
                    restockItems: [],
                    selectedItems: data.selectedItems,
                    amount: data.amount,
                    vat: data.vat,
                    discountAmount: data.discountAmount,
                    vatWithoutDiscount: data.vatWithoutDiscount,
                  });
                  setOpenIssueReason(true);
                }}>
                {t("Skip")}
              </Button>

              <LoadingButton
                sx={{ ml: 3, py: 1.5, flex: 1 }}
                type="submit"
                variant="contained"
                onClick={(e) => {
                  e.preventDefault();

                  const selectedItem = itemList.filter(
                    (item: any) => item.selected
                  );

                  if (selectedItem.length === 0) {
                    toast.error(t("Please Select Item"));
                    return;
                  }

                  const restockItems = itemList.filter(
                    (item: any) => item.selected && item.tracking
                  );

                  setRestockData({
                    order: data.order,
                    restockItems: restockItems,
                    selectedItems: data.selectedItems,
                    amount: data.amount,
                    vat: data.vat,
                    discountAmount: data.discountAmount,
                    vatWithoutDiscount: data.vatWithoutDiscount,
                  });
                  setOpenIssueReason(true);
                }}
                disabled={itemList.length === 0}>
                {t("Restock")}
              </LoadingButton>
            </Box> */}
            <Divider />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                zIndex: 1,
                background: theme.palette.mode !== "dark" ? `#fff` : "#111927",
                borderRadius: "5px",
              }}
            >
              <Button
                sx={{ borderRadius: 1 }}
                variant="outlined"
                onClick={() => {
                  setRestockData({
                    order: data.order,
                    restockItems: [],
                    selectedItems: data.selectedItems,
                    amount: data.amount,
                    vat: data.vat,
                    discountAmount: data.discountAmount,
                    vatWithoutDiscount: data.vatWithoutDiscount,
                  });
                  setOpenIssueReason(true);
                }}
              >
                {t("Skip")}
              </Button>

              <LoadingButton
                sx={{ borderRadius: 1 }}
                type="submit"
                variant="contained"
                onClick={(e) => {
                  e.preventDefault();

                  const selectedItem = itemList.filter(
                    (item: any) => item.selected
                  );

                  if (selectedItem.length === 0) {
                    toast.error(t("Please Select Item"));
                    return;
                  }

                  const restockItems = itemList.filter(
                    (item: any) => item.selected && item.tracking
                  );

                  setRestockData({
                    order: data.order,
                    restockItems: restockItems,
                    selectedItems: data.selectedItems,
                    amount: data.amount,
                    vat: data.vat,
                    discountAmount: data.discountAmount,
                    vatWithoutDiscount: data.vatWithoutDiscount,
                  });
                  setOpenIssueReason(true);
                }}
                disabled={itemList.length === 0}
              >
                {t("Restock")}
              </LoadingButton>
            </Box>
          </Card>
        </Box>
      </Modal>

      <RefundReasonModal
        data={restockData}
        open={openIssueReason}
        handleClose={() => setOpenIssueReason(false)}
        handleIssueRefund={() => {
          handleRestockItems();
          setOpenIssueReason(false);
        }}
      />
    </>
  );
};

export default RestockItemsModal;
