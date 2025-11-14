import { Box, Button, Card, Typography } from "@mui/material";
import { format } from "date-fns";
import { useRouter } from "next/router";
import { useMemo, type FC } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { useAuth } from "src/hooks/use-auth";
import { tijarahPaths } from "src/paths";
import { USER_TYPES } from "src/utils/constants";
import { toFixedNumber } from "src/utils/toFixedNumber";
import useActiveTabs from "src/utils/use-active-tabs";
import { SuperTable } from "../../widgets/super-table";
import { POGRNsRowLoading } from "./po-grn-row-loading";
import { SeverityPill } from "src/components/severity-pill";
import { useCurrency } from "src/utils/useCurrency";

export const PoGrnsCard: FC<any> = (props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { changeTab, getTab } = useActiveTabs();
  const currency = useCurrency();

  const { orders, loading, companyRef } = props;

  const headers = [
    {
      key: "orderId",
      label: t("Order Id"),
    },
    {
      key: "expectedDate",
      label: t("Expected Date"),
    },
    {
      key: "paymentStatus",
      label: t("Payment Status"),
    },
    {
      key: "deliveryStatus",
      label: t("Delivery Status"),
    },
    {
      key: "orderValue",
      label: t("Order Value"),
    },
    {
      key: "quantity",
      label: t("Quantity"),
    },
  ];

  const transformedData = useMemo(() => {
    let arr: any[] = [];

    orders?.map((d: any) => {
      const quantity = d?.items.map((item: any) => item?.quantity);

      const paymentstatusColor =
        d.billing.paymentStatus === "paid" ? "success" : "error";

      const statusColorsMap: any = {
        completed: "success",
        open: "info",
        cancelled: "warning",
        overdue: "error",
        partiallyReceived: "warning",
      };

      const status = d?.status;

      const statusColor = statusColorsMap[status];

      arr.push({
        key: d?._id,
        _id: d?._id,
        orderId: (
          <Box>
            <Typography color="inherit" variant="subtitle2">
              {d?.orderNum || "-"}
            </Typography>
          </Box>
        ),
        expectedDate: (
          <Box>
            <Typography color="inherit" variant="subtitle2">
              {format(new Date(d?.expectedDate), "MMMM dd, yyyy") || "-"}
            </Typography>
          </Box>
        ),
        paymentStatus: (
          <Box>
            <Typography
              sx={{ textTransform: "capitalize" }}
              // color={d?.billing?.paymentStatus === "unpaid" ? "red" : "green"}
              variant="subtitle2"
            >
              <SeverityPill color={paymentstatusColor}>
                {d?.billing?.paymentStatus === "unpaid" ? t("Due") : t("Paid")}
              </SeverityPill>
            </Typography>
          </Box>
        ),
        deliveryStatus: (
          <Box>
            <Typography
              sx={{ textTransform: "capitalize" }}
              variant="subtitle2"
            >
              <SeverityPill color={statusColor}> {status}</SeverityPill>
            </Typography>
          </Box>
        ),
        orderValue: (
          <Box>
            <Typography color="inherit" variant="subtitle2">
              {currency + " "} {toFixedNumber(d?.billing?.total || 0.0)}
            </Typography>
          </Box>
        ),
        quantity: (
          <Box>
            <Typography color="GrayText" variant="body2">
              {quantity[0] || 0}
            </Typography>
          </Box>
        ),
      });
    });

    return arr;
  }, [orders]);

  return (
    <Card>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          m: 2,
          mt: 2,
          mb: 0,
        }}
      >
        <Typography variant="h6">{t("PO & GRNs")}</Typography>
        <Button
          variant="text"
          onClick={() => {
            if (
              user?.userType === USER_TYPES.SUPERADMIN &&
              companyRef != "all"
            ) {
              return router.push({
                pathname: `${tijarahPaths.platform.companies}/${companyRef}`,
              });
            } else if (user?.userType === USER_TYPES.ADMIN) {
              return router.push({
                pathname: tijarahPaths.inventoryManagement.purchaseOrder.index,
              });
            }
            toast.error(t("Select a company to navigate"));
          }}
        >
          {t("View All")}
        </Button>
      </Box>
      <SuperTable
        isLoading={loading}
        loaderComponent={POGRNsRowLoading}
        showPagination={false}
        headers={headers}
        items={transformedData || []}
        noDataPlaceholder={
          <Box sx={{ mt: 6, mb: 4 }}>
            <NoDataAnimation
              text={
                <Typography variant="h6" textAlign="center" sx={{ mt: 2 }}>
                  {t("No PO and GRNs!")}
                </Typography>
              }
            />
          </Box>
        }
      />
    </Card>
  );
};
