import { Box, Card, Typography } from "@mui/material";
import PropTypes from "prop-types";
import { useMemo, type FC } from "react";
import { useTranslation } from "react-i18next";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { SuperTable } from "../../widgets/super-table";
import { useCurrency } from "src/utils/useCurrency";

export const VendorsCard: FC<any> = (props) => {
  const { t } = useTranslation();

  const currency = useCurrency();

  const headers = [
    {
      key: "vendor",
      label: "Vendor",
    },
    {
      key: "phone",
      label: "Phone",
    },
    {
      key: "paidAmount",
      label: "Paid Amount",
    },
    {
      key: "paidOrders",
      label: "Paid Orders",
    },
    {
      key: "dueAmount",
      label: "Due Amount",
    },
    {
      key: "dueOrders",
      label: "Due Orders",
    },
  ];

  const transformedData = useMemo(() => {
    let arr: any[] = [];

    [
      {
        _id: 1,
        vendor: "vendor 1",
        phone: "+91-112314224",
        paidAmount: 210,
        paidOrders: 10,
        dueAmount: 100,
        dueOrders: 32,
      },
      {
        _id: 2,
        vendor: "vendor 2",
        phone: "+9-111231443",
        paidAmount: 2110,
        paidOrders: 100,
        dueAmount: 400,
        dueOrders: 62,
      },
      {
        _id: 3,
        vendor: "vendor 3",
        phone: "+9-111238762",
        paidAmount: 5410,
        paidOrders: 160,
        dueAmount: 345,
        dueOrders: 72,
      },
    ]?.map((d: any) => {
      arr.push({
        key: d?._id,
        _id: d?._id,
        vendor: (
          <Box>
            <Typography
              sx={{ textTransform: "capitalize" }}
              color="inherit"
              variant="subtitle2"
            >
              {d?.vendor || "NA"}
            </Typography>
          </Box>
        ),
        phone: (
          <Box>
            <Typography color="inherit" variant="subtitle2">
              {d?.phone || "12/10/21"}
            </Typography>
          </Box>
        ),
        paidAmount: (
          <Box>
            <Typography variant="subtitle2">
              {currency} {toFixedNumber(d?.paidAmount)}
            </Typography>
          </Box>
        ),
        paidOrders: (
          <Box>
            <Typography color="GrayText" variant="subtitle2">
              {d?.paidOrders || 10}
            </Typography>
          </Box>
        ),
        dueAmount: (
          <Box>
            <Typography variant="subtitle2">
              {currency} {toFixedNumber(d?.dueAmount)}
            </Typography>
          </Box>
        ),
        dueOrders: (
          <Box>
            <Typography color="GrayText" variant="subtitle2">
              {d?.paidOrders || 10}
            </Typography>
          </Box>
        ),
      });
    });

    return arr;
  }, []);

  return (
    <Card>
      <Box
        sx={{
          display: "flex",
          m: 2,
        }}
      >
        <Typography variant="h6">{t("Vendors")}</Typography>
      </Box>
      <SuperTable
        showPagination={false}
        headers={headers}
        items={transformedData || []}
      />
    </Card>
  );
};
