import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Modal,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";
import { Scrollbar } from "src/components/scrollbar";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
// import useItems from "src/hooks/use-items";
// import useCartStore from "src/store/cart-item";
import useTicketStore from "src/store/ticket-store";
// import { autoApplyCustomCharges } from "src/utils/auto-apply-custom-charge";
import cart from "src/utils/cart";
import { trigger } from "src/utils/custom-event";
// import { getItemSellingPrice } from "src/utils/get-price";
import { toFixedNumber } from "src/utils/toFixedNumber";
import CloseIcon from "@mui/icons-material/Close";
import { useCurrency } from "src/utils/useCurrency";

interface SavedTicketModalProps {
  open: boolean;
  handleClose: any;
  handleTicketRowTap: any;
}

export const SavedTicketModal: React.FC<SavedTicketModalProps> = ({
  open = false,
  handleClose,
  handleTicketRowTap,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { tickets, removeSingleTicket } = useTicketStore();
  // const { customCharges } = useCartStore();
  // const { totalCharges, chargesApplied, totalAmount, subTotalWithoutDiscount } =
  //   useItems();
  const currency = useCurrency();

  const totalTicketAmount = (ticket: any) => {
    if (ticket?.items?.length > 0) {
      return ticket.items.reduce(
        (prev: any, cur: any) => prev + Number(cur.total),
        0
      );
    }
    return 0;
  };

  const addTicketToCart = (ticket: any) => {
    if (cart.cartItems.length === 0) {
      cart.addItemsToCart(ticket.items, (items: any) => {
        trigger("itemAdded", null, items, null, null);
      });

      // ticket.items.forEach((ticketItem: any) => {
      //   autoApplyCustomCharges(
      //     ticketItem.total + totalAmount - totalCharges + totalCharges,
      //     customCharges,
      //     chargesApplied,
      //     getItemSellingPrice(ticketItem.total, ticketItem.vat) +
      //       subTotalWithoutDiscount
      //   );
      // });
      return;
    }

    ticket.items.forEach((ticketItem: any) => {
      const idx = cart.cartItems?.findIndex(
        (item: any) => ticketItem?.sellingPrice && item.sku === ticketItem.sku
      );

      const isSpecialItem =
        ticketItem.name.en === "Open Item" ||
        ticketItem?.unit !== "perItem" ||
        ticketItem?.isOpenPrice;

      if (idx !== -1 && !isSpecialItem) {
        const updatedQty = cart.cartItems[idx].qty + ticketItem.qty;
        const updatedTotal =
          (cart.cartItems[idx].sellingPrice + cart.cartItems[idx].vatAmount) *
          updatedQty;

        cart.updateCartItem(
          idx,
          {
            ...cart.cartItems[idx],
            qty: updatedQty,
            total: updatedTotal,
          },
          (updatedItems: any) => {
            trigger("itemUpdated", null, updatedItems, null, null);
          }
        );

        const total =
          (cart.cartItems[idx].sellingPrice + cart.cartItems[idx].vatAmount) *
          ticketItem.qty;

        // autoApplyCustomCharges(
        //   total + totalAmount - totalCharges + totalCharges,
        //   customCharges,
        //   chargesApplied,
        //   getItemSellingPrice(total, ticketItem.vat) + subTotalWithoutDiscount
        // );
      } else {
        cart.addToCart(ticketItem, (items: any) => {
          trigger("itemAdded", null, items, null, null);
        });

        // autoApplyCustomCharges(
        //   ticketItem.total + totalAmount - totalCharges + totalCharges,
        //   customCharges,
        //   chargesApplied,
        //   getItemSellingPrice(ticketItem.total, ticketItem.vat) +
        //     subTotalWithoutDiscount
        // );
      }
    });
  };

  return (
    <>
      <Box>
        <Dialog
          fullWidth
          maxWidth="md"
          open={open}
          onClose={() => {
            handleClose();
          }}
        >
          {/* header */}
          <Box
            sx={{
              display: "flex",
              p: 2,
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor:
                theme.palette.mode === "light" ? "#fff" : "#111927",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            ></Box>

            <Typography sx={{ ml: 2 }} variant="h6">
              {t("Ticket's")}
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
              <CloseIcon
                fontSize="medium"
                onClick={() => {
                  handleClose();
                }}
              />
            </Box>
          </Box>
          <Divider />
          <DialogContent style={{ marginBottom: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("Ticket Name")}</TableCell>
                    <TableCell>{t("Order Type")}</TableCell>
                    <TableCell>{t("Amount")}</TableCell>
                    <TableCell>{t("Status")}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tickets?.length > 0 ? (
                    tickets.map((ticket, index) => (
                      <TableRow
                        key={index}
                        hover
                        sx={{ cursor: "pointer" }}
                        onClick={() => {
                          addTicketToCart(ticket);
                          handleTicketRowTap({ ...ticket, id: index });
                        }}
                      >
                        <TableCell>
                          <Typography variant="subtitle2">
                            {ticket.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2">
                            {ticket.type}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2">
                            {`${currency} ${toFixedNumber(
                              totalTicketAmount(ticket) || 0
                            )}`}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2">
                            {formatDistanceToNow(new Date(ticket.createdAt), {
                              addSuffix: true,
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => removeSingleTicket(index)}
                            sx={{
                              p: 1,
                              borderRadius: 50,
                              minWidth: "auto",
                            }}
                          >
                            <SvgIcon
                              color={"error"}
                              fontSize="medium"
                              sx={{
                                m: "auto",
                                cursor: "pointer",
                              }}
                            >
                              <RemoveCircleIcon />
                            </SvgIcon>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        style={{
                          textAlign: "center",
                          borderBottom: "none",
                        }}
                      >
                        <Box sx={{ mt: 10, mb: 6 }}>
                          <NoDataAnimation
                            text={
                              <Typography
                                variant="h6"
                                textAlign="center"
                                sx={{ mt: 5 }}
                              >
                                {t("No Tickets!")}
                              </Typography>
                            }
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
        </Dialog>
      </Box>
    </>
  );
};
