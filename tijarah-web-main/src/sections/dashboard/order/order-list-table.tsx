import {
  Alert,
  Badge,
  Box,
  Table,
  TableBody,
  TableCell,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { format } from "date-fns";
import { t } from "i18next";
import PropTypes from "prop-types";
import {
  useEffect,
  type ChangeEvent,
  type FC,
  type MouseEvent,
  useContext,
} from "react";
import toast from "react-hot-toast";
import { AuthContext } from "src/contexts/auth/jwt-context";
import { CompanyContext } from "src/contexts/company-context";
import { useAuth } from "src/hooks/use-auth";
import { useCurrency } from "src/utils/useCurrency";

interface OrderListTableProps {
  currentOrderId?: string;
  isSelected?: boolean;
  count?: number;
  items?: any[];
  onPageChange?: (
    event: MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelect?: (order: any) => void;
  page?: number;
  rowsPerPage?: number;
  isLoading?: boolean;
  loaderComponent?: any;
  noDataPlaceholder?: React.ReactElement<any, any>;
}

export const OrderListTable: FC<OrderListTableProps> = (props) => {
  const {
    currentOrderId,
    isSelected,
    count = 0,
    items = [],
    onPageChange = () => {},
    onRowsPerPageChange,
    onSelect,
    page = 0,
    rowsPerPage = 0,
    isLoading = false,
    loaderComponent: LoaderComponent,
    noDataPlaceholder,
  } = props;

  const theme = useTheme();
  const currency = useCurrency();

  const getItemName = (items: any) => {
    if (items?.length > 6) {
      const visibleItems = items
        .slice(0, 6)
        .map(
          (item: any) =>
            `${item?.name?.en} ${
              item?.hasMultipleVariants ? `${item?.variant?.name?.en}` : ""
            }`
        )
        .join(", ");
      const remainingCount = items.length - 6;
      return `${visibleItems}, and ${remainingCount} more`;
    } else {
      return items
        ?.map(
          (item: any) =>
            `${item?.name?.en} ${
              item?.hasMultipleVariants ? `${item?.variant?.name?.en}` : ""
            }`
        )
        .join(", ");
    }
  };

  const colors: any = {
    NOT_REPORTED: "#b71c1c",
    REPORTED: "#00c853",
    Pending: "#03a9f4",
    "Accepted With Warnings": "#ff6d00",
    NOT_ENABLED: "gray",
  };

  return (
    <div>
      <Table
        sx={{
          backgroundColor: theme.palette.mode !== "dark" && "#fff",
        }}
      >
        <TableBody>
          {items.map((order) => {
            const allValid = order?.reportStatus?.every(
              (item: any) => item.status === true && item.error === null
            );

            return (
              <TableRow
                hover
                key={order._id}
                onClick={() => {
                  onSelect?.(order);
                }}
                sx={{ cursor: "pointer" }}
              >
                <TableCell>
                  <Box sx={{ ml: 2 }}>
                    <Tooltip
                      title={
                        allValid
                          ? "All Reports Generated Successfully"
                          : "One or More Reports Failed to Generate"
                      }
                    >
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        style={{
                          backgroundColor: allValid
                            ? colors.REPORTED
                            : colors["Accepted With Warnings"],
                          height: 20,
                          width: 20,
                          borderRadius: 10,
                        }}
                      />
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell
                  sx={{
                    alignItems: "center",
                    width: "45%",
                  }}
                >
                  <Box sx={{ ml: 2 }}>
                    <Typography
                      color={order?._id === currentOrderId ? "primary" : ""}
                      variant="subtitle2"
                    >
                      {`#${order?.orderNum || ""}`}
                    </Typography>

                    <Typography color="text.secondary" variant="body2">
                      {getItemName(order?.items) || "-"}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell
                  sx={{
                    alignItems: "center",
                    width: "27%",
                  }}
                >
                  <Typography variant="subtitle2">
                    {`${order?.location?.name || "-"}`}
                  </Typography>
                </TableCell>

                <TableCell
                  align="right"
                  sx={{
                    width: "27%",
                  }}
                >
                  <Box sx={{ ml: 2, mr: 1 }}>
                    <Typography variant="subtitle2">{`${currency} ${
                      order?.payment?.total?.toFixed(2) || 0.0
                    }`}</Typography>

                    <Typography color="text.secondary" variant="body2">
                      {format(new Date(order?.createdAt), "dd/MM/yyyy, h:mma")}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}

          {isLoading && count == 0 && LoaderComponent && <LoaderComponent />}
        </TableBody>
      </Table>

      {!isLoading && count === 0 && noDataPlaceholder}

      <TablePagination
        component="div"
        count={count}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        sx={{
          backgroundColor: theme.palette.mode !== "dark" && "#fff",
        }}
      />
    </div>
  );
};

OrderListTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  onSelect: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
};
