import {
  Box,
  Card,
  Chip,
  Grid,
  Link,
  Stack,
  Switch,
  Tab,
  Tabs,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { differenceInMinutes, format, formatDistanceToNow } from "date-fns";
import { useRouter } from "next/router";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import withPermission from "src/components/permissionManager/restrict-page";
import { Scrollbar } from "src/components/scrollbar";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import i18n from "src/i18n";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useDebounce } from "use-debounce";
import { OnlineOrderSettingModal } from "./online-ordering/online-order-setiing-modal";
import { OnlineOrderingRowLoading } from "./online-ordering/online-ordering-row-loading";
import { QROrderSettingModal } from "./online-ordering/order-qr-setiing-modal";
import { useCurrency } from "src/utils/useCurrency";

interface OnlineOrderingProps {
  company: any;
  location: any;
  deviceData: any;
}

const tabDataOptions = [
  {
    label: i18n.t("All"),
    value: "all",
  },
  {
    label: i18n.t("Open"),
    value: "open",
  },
  {
    label: i18n.t("Inprocess"),
    value: "inprocess",
  },
  {
    label: i18n.t("Ready/OTW"),
    value: "ready",
  },
  // {
  //   label: i18n.t("Completed/Cancelled"),
  //   value: "completed",
  // },
];

const OnlineOrdering: FC<OnlineOrderingProps> = (props) => {
  const theme = useTheme();
  const router = useRouter();
  const { device } = useAuth();
  const { t } = useTranslation();
  const { company, location } = props;
  const currency = useCurrency();

  const xsDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  usePageView();

  const { find, loading, entities } = useEntity("ordering/order");
  const { findOne, entity } = useEntity("ordering/menu-config");

  const [currentTab, setCurrentTab] = useState("all");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [openOrderSettingModal, setOpenOrderSettingModal] = useState(false);
  const [openOrderQRSettingModal, setOpenOrderQRSettingModal] = useState(false);

  const handleTabsChange = (event: ChangeEvent<any>, value: string): void => {
    setPage(0);
    setCurrentTab(value);
  };

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleQueryChange = (value: string): void => {
    if (value != undefined) {
      setQueryText(value);
      if (page > 0) {
        setPage(0);
      }
    }
  };

  const handleSortChange = (value: any) => {
    setSort(value);
  };

  const tableHeaders = [
    {
      key: "orderNum",
      label: `${t("Order")}#`,
    },
    {
      key: "orderDate",
      label: t("Date & Time"),
    },
    {
      key: "customer",
      label: t("Customer"),
    },
    {
      key: "source",
      label: t("Source"),
    },
    {
      key: "payment",
      label: t("Payment"),
    },
    {
      key: "total",
      label: t("Total Bill"),
    },
    {
      key: "orderStatus",
      label: t("Order Status"),
    },
  ];

  const orderStatusName = (deliveryType: string, orderStatus: string) => {
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

  const orderStatusBgColor = (orderStatus: string) => {
    if (orderStatus === "open") {
      return "neutral.600";
    } else if (orderStatus === "inprocess") {
      return "info.main";
    } else if (orderStatus === "ready") {
      return "warning.main";
    } else if (orderStatus === "completed") {
      return theme.palette.mode === "dark" ? "#0C9356" : "#006C35";
    } else {
      return "error.main";
    }
  };

  const transformedData = useMemo(() => {
    const arr: any[] = entities?.results?.map((d) => {
      const minutes = differenceInMinutes(new Date(), new Date(d.createdAt));

      const quantity = d.items?.reduce(
        (prev: any, cur: any) => prev + Number(cur.quantity),
        0
      );

      return {
        key: d._id,
        _id: d._id,
        orderNum: (
          <Box>
            <Link
              sx={{ fontSize: "14px", cursor: "pointer" }}
              variant="subtitle1"
              onClick={() => {
                router.push({
                  pathname: tijarahPaths?.billing?.["online-order-details"],
                  query: {
                    id: d._id,
                    orderType: d.orderType,
                    industry: d?.industry || entity?.industry,
                  },
                });
              }}
            >
              {d.orderNum}
            </Link>

            <Typography color="text.secondary" variant="subtitle2">
              {d.orderType === "Pickup" ? "Pickup" : "Delivery"}
            </Typography>
          </Box>
        ),
        orderDate: (
          <Box>
            {minutes < 60 ? (
              <Box>
                <Typography variant="body2">
                  {formatDistanceToNow(new Date(d.createdAt), {
                    addSuffix: true,
                  })}
                </Typography>
                <Typography variant="body2">
                  {`at ${format(new Date(d.createdAt), "h:mm a")}`}
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="body2">
                  {format(new Date(d.createdAt), "dd/MM/yyyy")}
                </Typography>
                <Typography variant="body2">
                  {format(new Date(d.createdAt), "h:mm a")}
                </Typography>
              </Box>
            )}
          </Box>
        ),
        customer: (
          <Box>
            <Typography variant="subtitle2">
              {d?.customer?.name || "N/A"}
            </Typography>
            <Typography
              sx={{ fontSize: "13px" }}
              color="text.secondary"
              variant="body2"
            >
              {d?.customer?.phone || "N/A"}
            </Typography>
          </Box>
        ),
        source: (
          <Typography variant="subtitle2">
            {d.qrOrdering ? "QR" : d?.onlineOrdering ? "Online" : "-"}
          </Typography>
        ),
        payment: (
          <Box>
            <Typography variant="subtitle2">
              {d.payment.paymentType === "online" ? "Online" : "Offline"}
            </Typography>
            <Chip
              size="small"
              label={d.payment.paymentStatus === "paid" ? "Paid" : "Due"}
              sx={{
                mt: 0.5,
                color:
                  d.payment.paymentStatus === "paid"
                    ? theme.palette.mode === "dark"
                      ? "#0C9356"
                      : "#006C35"
                    : "error.main",
                backgroundColor:
                  d.payment.paymentStatus === "paid"
                    ? theme.palette.mode === "dark"
                      ? "#0C93561A"
                      : "#006C351A"
                    : "error.light",
              }}
            />
          </Box>
        ),
        total: (
          <Box>
            <Typography variant="subtitle2">
              {`${currency} ${toFixedNumber(d.payment.total)}`}
            </Typography>

            <Typography variant="subtitle2">
              {`${quantity || 0} ${"Qty"}`}
            </Typography>
          </Box>
        ),
        orderStatus: (
          <Chip
            size="small"
            label={orderStatusName(d.orderType, d.orderStatus)}
            sx={{
              pl: 0.5,
              pr: 0.5,
              color: "#fff",
              backgroundColor: orderStatusBgColor(d.orderStatus),
            }}
          />
        ),
      };
    });

    return arr;
  }, [entities?.results, entity]);

  useEffect(() => {
    if (
      (device?.locationRef && device?.companyRef) ||
      (company?._id && location?._id)
    ) {
      findOne(
        `?locationRef=${device?.locationRef || location?._id}&companyRef=${
          device?.companyRef || company?._id
        }`
      );
    }
  }, [device, location, company]);

  useEffect(() => {
    find({
      page: page,
      sort: sort,
      activeTab: currentTab,
      limit: rowsPerPage,
      _q: debouncedQuery,
      companyRef: company?._id,
      locationRef: location?._id,
    });
  }, [page, sort, debouncedQuery, rowsPerPage, currentTab, company, location]);

  return (
    <Box sx={{ py: 0.5, textAlign: "left" }}>
      <Grid container spacing={2} sx={{ mt: 1, mb: 1, mx: 2 }}>
        <Grid xs={12} sm={12} md={8} lg={9}>
          <Box
            sx={{
              display: "flex",
              textAlign: "center",
              overflowX: "auto",
              scrollbarWidth: "none",
              "-ms-overflow-style": "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            <Tabs
              sx={{ px: 1.5, py: 0, mb: 1, ml: 1, mt: -1 }}
              indicatorColor="primary"
              onChange={handleTabsChange}
              scrollButtons="auto"
              textColor="primary"
              value={currentTab}
              variant="scrollable"
            >
              {tabDataOptions.map((tab) => (
                <Tab key={tab.value} label={tab.label} value={tab.value} />
              ))}
            </Tabs>
          </Box>
        </Grid>

        <Grid xs={12} sm={12} md={4} lg={3}>
          <Stack
            spacing={2}
            direction="row"
            alignItems="center"
            maxWidth="85% !important"
            justifyContent={xsDown ? "flex-start" : "flex-end"}
          >
            <Stack spacing={1} direction="row" alignItems="center">
              <Box
                sx={{
                  display: "flex",
                  cursor: "pointer",
                  paddingLeft: "8px",
                  borderRadius: "8px",
                  alignItems: "center",
                  border: `1px solid ${
                    theme.palette.mode !== "dark" ? "#E5E7EB" : "#2D3748"
                  }`,
                }}
                onClick={() => {
                  setOpenOrderQRSettingModal(true);
                }}
              >
                <Typography
                  align="left"
                  fontSize="14px"
                  variant="subtitle2"
                  color={
                    entity?.pickupQRConfiguration?.pickup
                      ? "primary.main"
                      : "error.main"
                  }
                >
                  {t("QR")}
                </Typography>

                <Switch
                  sx={{ ml: 1 }}
                  color={
                    entity?.pickupQRConfiguration?.pickup ? "primary" : "error"
                  }
                  name="qrOrdering"
                  checked={true}
                  value={true}
                  onChange={() => {}}
                />
              </Box>
            </Stack>

            <Stack spacing={1} direction="row" alignItems="center">
              <Box
                sx={{
                  display: "flex",
                  cursor: "pointer",
                  paddingLeft: "8px",
                  borderRadius: "8px",
                  alignItems: "center",
                  border: `1px solid ${
                    theme.palette.mode !== "dark" ? "#E5E7EB" : "#2D3748"
                  }`,
                }}
                onClick={() => {
                  setOpenOrderSettingModal(true);
                }}
              >
                <Typography
                  align="left"
                  fontSize="14px"
                  variant="subtitle2"
                  color={
                    entity?.pickupDeliveryConfiguration?.pickup &&
                    entity?.pickupDeliveryConfiguration?.delivery
                      ? "primary.main"
                      : entity?.pickupDeliveryConfiguration?.pickup ||
                        entity?.pickupDeliveryConfiguration?.delivery
                      ? "warning.main"
                      : "error.main"
                  }
                >
                  {t("Online")}
                </Typography>

                <Switch
                  sx={{ ml: 1 }}
                  color={
                    entity?.pickupDeliveryConfiguration?.pickup &&
                    entity?.pickupDeliveryConfiguration?.delivery
                      ? "primary"
                      : entity?.pickupDeliveryConfiguration?.pickup ||
                        entity?.pickupDeliveryConfiguration?.delivery
                      ? "warning"
                      : "error"
                  }
                  name="onlineOrdering"
                  checked={true}
                  value={true}
                  onChange={() => {}}
                />
              </Box>
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      <Scrollbar
        sx={{
          mx: 2,
          maxHeight: xsDown ? "calc(100vh - 240px)" : "calc(100vh - 200px)",
        }}
      >
        <Card sx={{ mx: 1, mb: 6 }}>
          <SuperTableHeader
            showFilter={false}
            showStatusFilter={false}
            onQueryChange={handleQueryChange}
            searchPlaceholder={t(
              "Search with Order Number or Customer Name/Phone"
            )}
            onSortChange={handleSortChange}
            sort={sort}
            sortOptions={sortOptions}
          />

          <SuperTable
            isLoading={loading}
            loaderComponent={OnlineOrderingRowLoading}
            items={transformedData}
            headers={tableHeaders}
            total={entities?.total || 0}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPage={rowsPerPage}
            page={page}
            isCancelAllClicked={isCancelAllClicked}
            noDataPlaceholder={
              <Box sx={{ mt: 6, mb: 4 }}>
                <NoDataAnimation
                  text={
                    <Typography variant="h6" textAlign="center" sx={{ mt: 2 }}>
                      {t("No Online Orders!")}
                    </Typography>
                  }
                />
              </Box>
            }
          />
        </Card>
      </Scrollbar>

      <QROrderSettingModal
        data={entity}
        open={openOrderQRSettingModal}
        handleClose={() => setOpenOrderQRSettingModal(false)}
        handleSuccess={() => {
          setOpenOrderQRSettingModal(false);
        }}
      />

      <OnlineOrderSettingModal
        data={entity}
        open={openOrderSettingModal}
        handleClose={() => setOpenOrderSettingModal(false)}
        handleSuccess={() => {
          setOpenOrderSettingModal(false);
        }}
      />
    </Box>
  );
};

export default withPermission(OnlineOrdering, MoleculeType["order:read"]);
