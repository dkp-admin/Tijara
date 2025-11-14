import {
  Box,
  Button,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Theme,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import { format } from "date-fns";
import PropTypes from "prop-types";
import { useRef, type FC } from "react";
import { useTranslation } from "react-i18next";
import { useReactToPrint } from "react-to-print";
import { PropertyList } from "src/components/property-list";
import { PropertyListItem } from "src/components/property-list-item";
import i18n from "src/i18n";
import { ChannelsName } from "src/utils/constants";
import { toFixedNumber } from "src/utils/toFixedNumber";
import KOTReceiptPrint from "../print-receipt/kot-print-receipt";
import { useCurrency } from "src/utils/useCurrency";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";

const ZatcaStatusEnum: any = Object.freeze({
  PENDING: i18n.t("Pending"),
  REPORTED: i18n.t("Accepted"),
  NOT_REPORTED: i18n.t("Rejected"),
  NOT_ENABLED: i18n.t("Not Enabled"),
  "Accepted With Warnings": i18n.t("Accepted With Warnings"),
});

// Function to consolidate products based on SKU

function consolidateProducts(products: any[]) {
  // Create a map to track products by SKU
  const productMap = new Map();

  // Process each product
  products.forEach((product) => {
    const sku = product.sku;

    if (productMap.has(sku)) {
      // If product already exists in map, update the quantity and amount
      const existingProduct = productMap.get(sku);
      existingProduct.qty += product.qty;
      existingProduct.totalAmount =
        (existingProduct.totalAmount || existingProduct.amount) +
        product.amount;

      // Consolidate modifiers if needed
      if (product.modifiers && product.modifiers.length > 0) {
        existingProduct.modifiers = [
          ...existingProduct.modifiers,
          ...product.modifiers,
        ];
      }
    } else {
      // If product doesn't exist in map, add it with initial totalAmount
      const newProduct = { ...product, totalAmount: product.amount };
      productMap.set(sku, newProduct);
    }
  });

  // Convert map back to array
  return Array.from(productMap.values());
}

interface OrderDetailsProps {
  onApprove?: () => void;
  onEdit?: () => void;
  onReject?: () => void;
  order: any;
  companyRef?: string;
  openCustomerAddModal?: boolean;
  setOpenCustomerAddModal?: (res: any) => any;
  company?: any;
  printTemplate?: any;
}

export const OrderDetails: FC<OrderDetailsProps> = (props) => {
  const { t } = useTranslation();
  const {
    order,
    companyRef,
    openCustomerAddModal,
    setOpenCustomerAddModal,
    company,
    printTemplate,
  } = props;
  const kotComponentRef = useRef();
  const currency = useCurrency();

  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("lg"));
  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";
  const align = lgUp ? "horizontal" : "vertical";
  const { canAccessModule } = useFeatureModuleManager();

  const paymentData = (data: any, index: number) => {
    if (data.providerName == "cash") {
      return cashData(data, index == order?.payment?.breakup?.length - 1);
    } else if (data.providerName == "card") {
      return cardData(data, index == order?.payment?.breakup?.length - 1);
    } else if (data.providerName == "credit") {
      return creditData(data, index == order?.payment?.breakup?.length - 1);
    } else if (data.providerName === "wallet") {
      return walletData(data, index == order?.payment?.breakup?.length - 1);
    } else
      return otherPaymentTypesData(
        data,
        index == order?.payment?.breakup?.length - 1
      );
  };

  const otherPaymentTypesData = (data: any, last: boolean) => {
    const payment = [
      {
        title: t(data?.name),
        value: `${currency} ${toFixedNumber(data?.total) || 0}`,
      },
      { title: t("Receipt/Order"), value: `#${order?.orderNum || ""}` },
    ];

    if (order?.tokenNumber) {
      payment.push({ title: t("Token Number"), value: order.tokenNumber });
    }

    if (order?.orderType && !order?.qrOrdering) {
      payment.push({
        title: t("Order Type"),
        value: ChannelsName[order.orderType] || order.orderType,
      });
    }

    // amount =
    //   amount == 0 ? order?.payment?.total - data?.total : amount - data?.total;

    return payment;
  };

  const cashData = (data: any, last: boolean) => {
    // amount =
    //   amount == 0 ? order?.payment?.total - data?.total : amount - data?.total;

    const cash =
      Number(data?.change || 0) > 0
        ? Number(data?.total) - Number(data?.change || 0)
        : Number(data?.total);

    const payment = [];

    if (Number(data?.change || 0) > 0) {
      payment.push({
        title: t("Tendered"),
        value: `${currency} ${toFixedNumber(data?.total) || 0}`,
      });

      payment.push({
        title: t("Change"),
        value: `${currency} ${toFixedNumber(data?.change) || 0}`,
      });
    }

    payment.push({
      title: t("Cash"),
      value: `${currency} ${toFixedNumber(cash) || 0}`,
    });

    payment.push({
      title: t("Receipt/Order"),
      value: `#${order?.orderNum || ""}`,
    });

    if (order?.tokenNumber) {
      payment.push({ title: t("Token Number"), value: order.tokenNumber });
    }

    if (order?.orderType && !order?.qrOrdering) {
      payment.push({
        title: t("Order Type"),
        value: ChannelsName[order.orderType] || order.orderType,
      });
    }

    return payment;
  };

  const cardData = (data: any, last: boolean) => {
    const payment = [
      {
        title: `${t("Card")} - ${data.name}`,
        value: `${currency} ${toFixedNumber(data?.total) || 0}`,
      },
      { title: t("Receipt/Order"), value: `#${order?.orderNum || ""}` },
    ];

    if (order?.tokenNumber) {
      payment.push({ title: t("Token Number"), value: order.tokenNumber });
    }

    if (order?.orderType && !order?.qrOrdering) {
      payment.push({
        title: t("Order Type"),
        value: ChannelsName[order.orderType] || order.orderType,
      });
    }

    // amount =
    //   amount == 0 ? order?.payment?.total - data?.total : amount - data?.total;

    return payment;
  };

  const creditData = (data: any, last: boolean) => {
    const payment = [
      {
        title: t("Credit"),
        value: `${currency} ${toFixedNumber(data?.total) || 0}`,
      },
      { title: t("Receipt/Order"), value: `#${order?.orderNum || ""}` },
    ];

    if (order?.tokenNumber) {
      payment.push({ title: t("Token Number"), value: order.tokenNumber });
    }

    if (order?.orderType && !order?.qrOrdering) {
      payment.push({
        title: t("Order Type"),
        value: ChannelsName[order.orderType] || order.orderType,
      });
    }

    // amount =
    //   amount == 0 ? order?.payment?.total - data?.total : amount - data?.total;

    return payment;
  };

  const walletData = (data: any, last: boolean) => {
    const payment = [
      {
        title: t("Wallet"),
        value: `${currency} ${toFixedNumber(data?.total) || 0}`,
      },
      { title: t("Receipt/Order"), value: `#${order?.orderNum || ""}` },
    ];

    if (order?.tokenNumber) {
      payment.push({ title: t("Token Number"), value: order.tokenNumber });
    }

    if (order?.orderType && !order?.qrOrdering) {
      payment.push({
        title: t("Order Type"),
        value: ChannelsName[order.orderType] || order.orderType,
      });
    }

    // amount =
    //   amount == 0 ? order?.payment?.total - data?.total : amount - data?.total;

    return payment;
  };

  const getItemName = (data: any) => {
    const box =
      data.variant.type === "box"
        ? `(${t("Box")} - ${data.variant.unitCount} ${t("Units")})`
        : data.variant.type === "crate"
        ? `(${t("Crate")} - ${data.variant.unitCount} ${t("Units")})`
        : "";

    if (isRTL) {
      const variantNameAr = data.hasMultipleVariants
        ? `, ${data.variant.name.ar} `
        : " ";

      return data.name.ar + variantNameAr + box;
    } else {
      const variantNameEn = data.hasMultipleVariants
        ? `, ${data.variant.name.en} `
        : " ";

      return data.name.en + variantNameEn + box;
    }
  };

  const totalVoidAmount = order?.items?.reduce(
    (sum: any, item: any) =>
      item.void ? sum + item.billing.amountBeforeVoidComp : sum,
    0
  );

  const totalCompAmount = order?.items?.reduce(
    (sum: any, item: any) =>
      item.comp ? sum + item.billing.amountBeforeVoidComp : sum,
    0
  );

  const getModifierName = (data: any) => {
    let name = "";

    data?.modifiers?.map((mod: any) => {
      name += `${name === "" ? "" : ", "}${mod.optionName}`;
    });

    return name;
  };

  const vatCharges = () => {
    return order?.payment?.charges?.reduce((vat: number, charge: any) => {
      return vat + charge.vat;
    }, 0);
  };

  const refundVatCharges = () => {
    return order?.refunds?.[0]?.charges?.reduce((vat: number, charge: any) => {
      return vat + charge.totalVatOnCharge;
    }, 0);
  };

  const orderStatusName: any = (deliveryType: string, orderStatus: string) => {
    if (orderStatus === "open") {
      return t("Open");
    } else if (orderStatus === "inprocess") {
      return t("Inprocess");
    } else if (orderStatus === "ready") {
      return deliveryType === "Pickup" ? t("Ready") : t("On the way");
    } else if (orderStatus === "completed") {
      return t("Completed");
    } else {
      return t("Cancelled");
    }
  };

  const getFreeDiscountAmount = () => {
    const price = order?.items?.reduce((acc: any, item: any) => {
      if (item?.isFree) {
        const disc = item?.billing?.discountedTotal || 0;
        return acc + disc;
      }

      return acc;
    }, 0);

    return price;
  };

  const getFreeQtyDiscount = () => {
    const price = order?.items?.reduce((acc: any, item: any) => {
      if (item?.isQtyFree) {
        const disc = item?.billing?.discountAmount || 0;
        return acc + disc;
      }

      return acc;
    }, 0);

    return price;
  };

  const handlePrintKOT = useReactToPrint({
    content: () => kotComponentRef.current,
  });

  const getKOTPrintPreview = () => {
    const printData = {
      orderNum: order.orderNum,
      createdAt: order.createdAt,
      tokenNum: order.tokenNumber,
      orderType: order.orderType,
      items: order.items,
      specialInstructions: order.specialInstructions,
      showToken: printTemplate?.showToken,
      showOrderType: printTemplate?.showOrderType,
      location: {
        en: printTemplate?.location?.name?.en,
        ar: printTemplate?.location?.name?.ar,
      },
      address: printTemplate?.location?.address,
    };

    return KOTReceiptPrint(printData);
  };

  const reportsMap = {
    customCharges: "Custom Charge",
    productSales: "Sales",
    orders: "Orders",
    voidComp: "Void & Comp",
  };

  const colors: any = {
    NOT_REPORTED: "#b71c1c",
    REPORTED: "#00c853",
    Pending: "#03a9f4",
    "Accepted With Warnings": "#ff6d00",
    NOT_ENABLED: "gray",
  };

  return (
    <Stack spacing={6}>
      <Stack spacing={3}>
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
        >
          <Typography sx={{ mt: -1, mb: 1 }} variant="h6">
            {order?.location?.name}
          </Typography>
        </Stack>

        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          spacing={3}
        >
          <Typography variant="h6">{t("Payments")}</Typography>
        </Stack>

        {order?.onlineOrdering && (
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Typography variant="subtitle2">{t("ORDER DETAILS")}</Typography>

            <Box
              sx={{
                border: 2,
                borderRadius: 1,
                borderColor: "divider",
              }}
            >
              <PropertyList>
                <PropertyListItem
                  align={align}
                  label={t("Order Type")}
                  value={
                    order?.orderType === "Pickup"
                      ? t("Online - Self Pickup")
                      : t("Online - Delivery")
                  }
                />
                <PropertyListItem
                  align={align}
                  label={t("Order Status")}
                  value={orderStatusName(order?.orderType, order?.orderStatus)}
                  color={order?.orderStatus === "cancelled" ? "error.main" : ""}
                />
              </PropertyList>
            </Box>
          </Stack>
        )}

        {order?.qrOrdering && (
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Typography variant="subtitle2">{t("ORDER DETAILS")}</Typography>

            <Box
              sx={{
                border: 2,
                borderRadius: 1,
                borderColor: "divider",
              }}
            >
              <PropertyList>
                <PropertyListItem
                  align={align}
                  label={t("Order Type")}
                  value={t("QR - Self Pickup")}
                />
                <PropertyListItem
                  align={align}
                  label={t("Order Status")}
                  value={orderStatusName(order?.orderType, order?.orderStatus)}
                  color={order?.orderStatus === "cancelled" ? "error.main" : ""}
                />
              </PropertyList>
            </Box>
          </Stack>
        )}

        <Stack spacing={3} sx={{ pt: 1 }}>
          <Typography variant="subtitle2">{t("CUSTOMER DETAILS")}</Typography>

          <Box
            sx={{
              border: 2,
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <PropertyList>
              <PropertyListItem
                align={align}
                label={t("Customer")}
                value={order?.customer?.name || "NA"}
              />
            </PropertyList>
          </Box>
          {!order?.customer && order?.refunds?.length < 1 && (
            <Box>
              <Button
                onClick={() => {
                  setOpenCustomerAddModal(true);
                }}
                disabled={!canAccessModule("customers")}
                variant="contained"
              >
                {t("Add Customer")}
              </Button>
            </Box>
          )}
        </Stack>

        <Stack spacing={3} sx={{ pt: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="subtitle2">{t("ITEMS")}</Typography>

            {company?.industry?.toLowerCase() === "restaurant" && (
              <div id="kotprintablediv">
                <Button
                  sx={{ height: 30 }}
                  variant="text"
                  onClick={handlePrintKOT}
                >
                  {t("Print KOT")}
                </Button>

                <div style={{ display: "none" }}>
                  <div
                    ref={kotComponentRef}
                    style={{
                      width: "400px",
                      margin: "20px auto",
                      textAlign: "center",
                      padding: "30px 5px",
                      fontWeight: "bold",
                      fontSize: "15px",
                      lineHeight: "20px",
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: getKOTPrintPreview(),
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </Box>

          <Table
            sx={{
              border: 1,
              borderColor: "divider",
            }}
          >
            <TableHead
              style={{
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TableRow>
                <TableCell>{t("Name")}</TableCell>
                <TableCell>{t("Quantity")}</TableCell>
                <TableCell>{t("Amount")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order?.items?.map((item: any, index: number) => {
                return (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body1">
                        {getItemName(item)}
                      </Typography>

                      {item?.modifiers?.length > 0 && (
                        <Typography fontSize="13px" variant="body2">
                          {getModifierName(item)}
                        </Typography>
                      )}

                      {item?.note && (
                        <Typography fontSize="13px" variant="body2">
                          {item.note}
                        </Typography>
                      )}

                      {(item?.void || item?.comp) && (
                        <Typography fontSize="13px" variant="body2">
                          {item.void ? t("Void: ") : item.comp ? "Comp: " : ""}
                          {lng === "ar"
                            ? item?.voidReason?.ar || item?.compReason?.ar
                            : item?.voidReason?.en || item?.compReason?.en}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{item?.quantity}</TableCell>
                    <TableCell>
                      {item?.isFree ? (
                        <>
                          <Typography variant="body2">{"Free"}</Typography>
                          <Typography
                            variant="body2"
                            style={{ textDecoration: "line-through" }}
                          >
                            {`${currency} ${toFixedNumber(
                              item?.billing?.total
                            )}`}
                          </Typography>
                        </>
                      ) : item?.isQtyFree ? (
                        <>
                          <Typography variant="body2">
                            {`${currency} ${toFixedNumber(
                              item?.billing?.discountedTotal ||
                                item?.billing?.total
                            )}`}
                          </Typography>
                          <Typography
                            variant="body2"
                            style={{ textDecoration: "line-through" }}
                          >
                            {`${currency} ${toFixedNumber(
                              item?.billing?.total +
                                item?.billing?.discountAmount
                            )}`}
                          </Typography>
                        </>
                      ) : item?.void || item?.comp ? (
                        <>
                          <Typography variant="body2">
                            {`${currency} ${toFixedNumber(0)}`}
                          </Typography>
                          <Typography
                            variant="body2"
                            style={{ textDecoration: "line-through" }}
                          >
                            {`${currency} ${toFixedNumber(
                              item?.billing?.amountBeforeVoidComp
                            )}`}
                          </Typography>
                        </>
                      ) : item?.discountedTotal > 0 ? (
                        <>
                          <Typography variant="body2">
                            {`${currency} ${toFixedNumber(
                              item?.billing?.total
                            )}`}
                          </Typography>
                          <Typography
                            variant="body2"
                            style={{ textDecoration: "line-through" }}
                          >
                            {`${currency} ${toFixedNumber(
                              item?.billing?.total +
                                item?.billing?.discountAmount
                            )}`}
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Typography variant="body2">
                            {`${currency} ${toFixedNumber(
                              item?.billing?.total
                            )}`}
                          </Typography>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Stack>

        <Stack spacing={3} sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center " }}>
            <Typography variant="subtitle2">{t("DETAILS")}</Typography>
            <Tooltip
              sx={{ ml: 1 }}
              title={t(
                "Item total comprises the aggregate sale value of products in order, exlclusive of VAT and any other charges."
              )}
            >
              <SvgIcon color="primary">
                <InfoCircleIcon />
              </SvgIcon>
            </Tooltip>
          </Box>

          <Box
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <PropertyList>
              <PropertyListItem
                align={align}
                divider
                label={t("Item Total")}
                value={`${currency} ${toFixedNumber(
                  order?.payment?.subTotalWithoutDiscount
                )}`}
              />

              <PropertyListItem
                infoMessage={t("Info order details discount")}
                showInfoMessage={true}
                align={align}
                divider
                label={t("Discount")}
                value={
                  order?.payment?.discountAmount
                    ? `${currency} -${
                        toFixedNumber(
                          order?.payment?.discountAmount +
                            getFreeDiscountAmount() +
                            getFreeQtyDiscount()
                        ) || 0.0
                      }`
                    : `${currency} ${toFixedNumber(
                        0 + getFreeDiscountAmount() + getFreeQtyDiscount()
                      )}`
                }
              />
            </PropertyList>
          </Box>

          <Box
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <PropertyList>
              <PropertyListItem
                align={align}
                divider
                label={t("Subtotal")}
                value={`${currency} ${
                  toFixedNumber(order?.payment?.subTotal) || 0.0
                }`}
              />
              {order.payment?.charges?.map((charge: any, idx: any) => {
                return (
                  <PropertyListItem
                    key={idx}
                    align={align}
                    divider
                    label={isRTL ? charge?.name.ar : charge?.name?.en}
                    value={`${currency} ${toFixedNumber(
                      charge?.total - charge?.vat
                    )}`}
                  />
                );
              })}
              <PropertyListItem
                infoMessage={`${t("Items VAT")}: ${currency} ${toFixedNumber(
                  order?.payment?.vatAmount - vatCharges()
                )}, ${t("Charges VAT")}: ${currency} ${toFixedNumber(
                  vatCharges()
                )}`}
                showInfoMessage={true}
                align={align}
                divider
                label={"VAT"}
                value={`${currency} ${
                  toFixedNumber(order?.payment?.vatAmount) || 0.0
                }`}
              />
              <PropertyListItem
                align={align}
                label={t("Total")}
                value={`${currency} ${
                  toFixedNumber(order?.payment?.total) || 0.0
                }`}
              />
            </PropertyList>
          </Box>
        </Stack>

        {order?.payment?.breakup?.map((data: any, idx: number) => {
          return (
            <Stack key={idx} spacing={3} sx={{ pt: 2 }}>
              <Stack
                alignItems="center"
                direction="row"
                justifyContent="space-between"
              >
                <Typography variant="subtitle2">{t("PAYMENT")}</Typography>

                <Stack direction="column">
                  <Typography color="text.secondary" variant="body2">
                    {`${order?.cashier?.name || "" + ", "} (${
                      order?.device?.deviceCode || ""
                    }), `}
                  </Typography>

                  <Typography color="text.secondary" variant="body2">
                    {`${format(
                      new Date(order?.createdAt),
                      "dd/MM/yyyy, h:mma"
                    )}`}
                  </Typography>
                </Stack>
              </Stack>

              <Box
                key={data?.title}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <PropertyList>
                  {paymentData(data, idx)?.map((data: any) => {
                    return (
                      <PropertyListItem
                        key={data.title}
                        align={align}
                        divider
                        label={data.title}
                        value={data.value}
                      />
                    );
                  })}
                </PropertyList>
              </Box>
            </Stack>
          );
        })}
        {order?.driver && (
          <Stack spacing={3} sx={{ pt: 2 }}>
            <Stack
              alignItems="center"
              direction="row"
              justifyContent="space-between"
            >
              <Typography variant="subtitle2">{t("DRIVER")}</Typography>
            </Stack>

            <Box
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <PropertyList>
                <PropertyListItem
                  align={align}
                  divider
                  label={"Name"}
                  value={order?.driver?.name}
                />
                <PropertyListItem
                  align={align}
                  divider
                  label={"Phone"}
                  value={order?.driver?.phone}
                />
              </PropertyList>
            </Box>
          </Stack>
        )}
        {order?.staffRef && (
          <Stack spacing={3} sx={{ pt: 2 }}>
            <Stack
              alignItems="center"
              direction="row"
              justifyContent="space-between"
            >
              <Typography variant="subtitle2">{t("STAFF")}</Typography>
            </Stack>

            <Box
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <PropertyList>
                <PropertyListItem
                  align={align}
                  divider
                  label={t("Name")}
                  value={order?.staff?.name || "N/A"}
                />
                {order?.staff?.phone && (
                  <PropertyListItem
                    align={align}
                    divider
                    label={t("Phone")}
                    value={order?.staff?.phone}
                  />
                )}
              </PropertyList>
            </Box>
          </Stack>
        )}
        {order?.orderType === "Dine-in" && order?.dineInData?.table && (
          <Stack spacing={3} sx={{ pt: 2 }}>
            <Stack
              alignItems="center"
              direction="row"
              justifyContent="space-between"
            >
              <Typography variant="subtitle2">
                {t("Dine in Details")}
              </Typography>
            </Stack>

            <Box
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <PropertyList>
                <PropertyListItem
                  align={align}
                  divider
                  label={"No of Guests"}
                  value={order?.dineInData?.noOfGuests}
                />
                <PropertyListItem
                  align={align}
                  divider
                  label={"Table"}
                  value={order?.dineInData?.table}
                />
                <PropertyListItem
                  align={align}
                  divider
                  label={"Void"}
                  value={`${currency} ${toFixedNumber(totalVoidAmount)}`}
                />
                <PropertyListItem
                  align={align}
                  divider
                  label={"Comp"}
                  value={`${currency} ${toFixedNumber(totalCompAmount)}`}
                />
              </PropertyList>
            </Box>
          </Stack>
        )}
      </Stack>
      {order?.refunds?.length > 0 && (
        <Stack spacing={3} sx={{ pt: 4 }}>
          <Typography variant="h6">{t("Refunds")}</Typography>

          {order?.refunds?.map((refund: any, index: number) => {
            return (
              <div key={index}>
                <Stack spacing={3} sx={{ pt: 2 }}>
                  <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Typography variant="subtitle2">{t("REFUND")}</Typography>

                    <Stack direction="column">
                      <Typography color="text.secondary" variant="body2">
                        {`${refund?.cashier?.name || "" + ", "} (${
                          refund?.device?.deviceCode || ""
                        }), `}
                      </Typography>

                      <Typography color="text.secondary" variant="body2">
                        {`${format(
                          new Date(refund?.date),
                          "dd/MM/yyyy, h:mma"
                        )}`}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Typography variant="subtitle2">
                      {t("Refund Receipt No.")}
                    </Typography>

                    <Stack>
                      <Typography color="text.secondary" variant="body2">
                        {`#${refund.referenceNumber}`}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Box
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <PropertyList>
                      {consolidateProducts(refund?.items)?.map((item: any) => {
                        const orderItem = order.items.find((items: any) =>
                          item.sku
                            ? (items.productRef === item._id &&
                                items.variant?.sku === item.sku) ||
                              item.sku === "Open Item"
                            : items.productRef === item._id
                            ? item.sku === "Open Item"
                            : true
                            ? item.unit === "perItem" ||
                              items.type === "box" ||
                              items.type === "crate"
                            : items.qty === item.qty
                        );

                        if (orderItem) {
                          const box =
                            orderItem.variant.type === "box"
                              ? `, (${t("Box")} - ${
                                  orderItem.variant.unitCount
                                } ${t("Units")})`
                              : orderItem.variant.type === "crate"
                              ? `, (${t("Crate")} - ${
                                  orderItem.variant.unitCount
                                } ${t("Units")})`
                              : "";

                          const name = isRTL
                            ? item.name.ar + box
                            : item.name.en + box;

                          return (
                            <PropertyListItem
                              key={item?._id}
                              align={align}
                              divider
                              label={name || ""}
                              value={`${currency} -${
                                toFixedNumber(
                                  (item?.amount - item?.vat) * (item?.qty || 1)
                                ) || "0.00"
                              }`}
                            />
                          );
                        }
                      })}

                      {refund?.charges &&
                        refund?.charges?.map((charge: any, idx: any) => {
                          return (
                            <PropertyListItem
                              key={idx}
                              align={align}
                              divider
                              label={
                                isRTL ? charge?.name?.ar : charge?.name?.en
                              }
                              value={`${currency} -${
                                toFixedNumber(
                                  charge?.totalCharge - charge?.totalVatOnCharge
                                ) || "0.00"
                              }`}
                            />
                          );
                        })}

                      <PropertyListItem
                        showInfoMessage={true}
                        infoMessage={`${t("Items VAT")}: ${t(
                          "${currency}"
                        )} -${toFixedNumber(
                          order?.refunds?.[0]?.vat - refundVatCharges()
                        )}, ${t("Charges VAT")}: ${currency} -${toFixedNumber(
                          refundVatCharges()
                        )}`}
                        align={align}
                        divider
                        label={"VAT"}
                        value={`${currency} -${
                          toFixedNumber(order?.refunds?.[0]?.vat) || "0.00"
                        }`}
                      />

                      <PropertyListItem
                        key={index}
                        align={align}
                        label={t("Total")}
                        value={`${currency} -${
                          toFixedNumber(
                            refund?.refundedTo?.reduce(
                              (cv: number, pv: any) => {
                                return cv + Number(pv.amount);
                              },
                              0
                            )
                          ) || "0.00"
                        }`}
                      />
                    </PropertyList>
                  </Box>
                </Stack>

                <Stack spacing={3} sx={{ pt: 2 }}>
                  <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Typography variant="subtitle2">{t("Details")}</Typography>
                  </Stack>

                  <Box
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <PropertyList>
                      <PropertyListItem
                        align={align}
                        divider
                        label={t("Reason")}
                        value={refund?.reason}
                      />

                      {refund?.refundedTo?.map((data: any, index: number) => {
                        return (
                          <PropertyListItem
                            key={index}
                            align={align}
                            label={data?.refundedTo || ""}
                            value={`${currency} -${
                              toFixedNumber(data?.amount) || "0.00"
                            }`}
                          />
                        );
                      })}

                      {company?.configuration?.enableZatca && (
                        <PropertyListItem
                          align={align}
                          divider
                          label={t("ZATCA refund status")}
                          value={
                            order?.zatca?.status === "NOT_ENABLED"
                              ? "NA"
                              : ZatcaStatusEnum[order?.zatca?.refundStatus]
                          }
                        />
                      )}
                    </PropertyList>
                  </Box>
                </Stack>
              </div>
            );
          })}
        </Stack>
      )}
      {order?.specialInstructions && (
        <Stack spacing={3}>
          <Typography variant="subtitle2">
            {t("SPECIAL INSTRUCTIONS")}
          </Typography>

          <Box
            sx={{
              border: 2,
              borderColor: "divider",
              borderRadius: 1,
              px: 2,
              py: 1,
            }}
          >
            <Typography variant="body2">
              {order?.specialInstructions || "-"}
            </Typography>
          </Box>
        </Stack>
      )}
      {order?.receivedAt && (
        <Stack spacing={3}>
          <Typography variant="subtitle2">
            {`${t("Order received at")}:-  ${format(
              new Date(order.receivedAt),
              "dd/MM/yyyy, h:mma"
            )}`}
          </Typography>
        </Stack>
      )}
      {order.reportStatus.length > 0 && (
        <Stack spacing={3}>
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
          >
            <Typography variant="subtitle2">Report Status</Typography>
          </Stack>

          <Box
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <PropertyList>
              {order?.reportStatus?.map((report: any, index: number) => (
                <PropertyListItem
                  key={index}
                  align={align}
                  divider
                  label={reportsMap[report.name as keyof typeof reportsMap]}
                  value={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        width: "100%",
                        alignItems: "center",
                      }}
                    >
                      <Tooltip
                        title={report.status ? "Success" : report.error}
                        arrow
                        placement="top"
                        componentsProps={{
                          popper: {
                            sx: {
                              // This will align the tooltip with the end of the circle
                              '&[data-popper-placement*="top"] .MuiTooltip-tooltip':
                                {
                                  marginBottom: "4px",
                                  transform: "translateX(50%)",
                                },
                            },
                          },
                        }}
                      >
                        <div
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          style={{
                            backgroundColor: report.status
                              ? colors.REPORTED
                              : colors.NOT_REPORTED,
                            height: 20,
                            width: 20,
                            borderRadius: 10,
                            cursor: "pointer",
                          }}
                        />
                      </Tooltip>
                    </div>
                  }
                />
              ))}
            </PropertyList>
          </Box>
        </Stack>
      )}
    </Stack>
  );
};

OrderDetails.propTypes = {
  onApprove: PropTypes.func,
  onEdit: PropTypes.func,
  onReject: PropTypes.func,
  // @ts-ignore
  order: PropTypes.object,
};
