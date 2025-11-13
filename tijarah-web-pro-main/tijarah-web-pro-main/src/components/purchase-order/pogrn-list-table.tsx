import { ChangeEvent, FC, useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Checkbox,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { Scrollbar } from "src/components/scrollbar";
import { ActionDropdown } from "src/components/action-dropdown";

interface Item {
  disableCheckbox: any;
  _id: any;
  industry: any;
  status?: boolean;
  action?: any;
}

interface PoGrnTableProps {
  showPagination?: boolean;
  count?: number;
  items?: Item[];
  onPageChange?: any;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  page?: number;
  rowsPerPage?: number;
  selected?: string[];
  headers: { key: string; label: string | React.ReactElement<any, any> }[];
  showCheckbox?: boolean;
  showMore?: boolean;
  moreOptions?: any;
  total?: any;
  isCancelAllClicked?: any;
  isLoading?: boolean;
  loaderComponent?: any;
  noDataPlaceholder?: React.ReactElement<any, any>;
}

export const PoGrnTable: FC<PoGrnTableProps> = (props) => {
  const {
    showPagination = true,
    items = [],
    onPageChange = () => {},
    onRowsPerPageChange,
    page = 0,
    rowsPerPage = 0,
    headers,
    showCheckbox,
    total,
    isCancelAllClicked,
    isLoading = false,
    showMore,
    moreOptions = [],
    loaderComponent: LoaderComponent,
    noDataPlaceholder,
  } = props;

  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Reset selected items when items change
  useEffect(
    () => {
      if (selectedItems.length) {
        setSelectedItems([]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items]
  );

  const handleSelectAllItems = (event: ChangeEvent<HTMLInputElement>): void => {
    setSelectedItems(
      event.target.checked
        ? items.map((item) => {
            if (!item?.disableCheckbox) {
              return item?._id;
            }
          })
        : []
    );
  };

  const handleSelectOneItem = (
    event: ChangeEvent<HTMLInputElement>,
    itemId: string
  ): void => {
    if (!selectedItems.includes(itemId)) {
      setSelectedItems((prevSelected) => [...prevSelected, itemId]);
    } else {
      setSelectedItems((prevSelected) =>
        prevSelected.filter((id) => id !== itemId)
      );
    }
  };

  const enableBulkActions = selectedItems.length > 0;
  const selectedSomeSupers =
    selectedItems.length > 0 && selectedItems.length < items.length;
  const selectedAllSupers = selectedItems.length === items.length;

  return (
    <Box sx={{ position: "relative" }}>
      {enableBulkActions && (
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "center",
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "neutral.800" : "neutral.50",
            display: enableBulkActions ? "flex" : "none",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            px: 2,
            py: 0.5,
            zIndex: 10,
          }}
        >
          <Checkbox
            checked={selectedAllSupers}
            indeterminate={selectedSomeSupers}
            onChange={handleSelectAllItems}
          />

          <Button color="inherit" size="small">
            Delete
          </Button>
          <Button color="inherit" size="small">
            Edit
          </Button>
        </Stack>
      )}
      <Scrollbar>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              {showCheckbox && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedAllSupers}
                    indeterminate={selectedSomeSupers}
                    onChange={handleSelectAllItems}
                  />
                </TableCell>
              )}

              {headers.map((header) => (
                <TableCell
                  key={header.key}
                  sx={{ px: 1 }}
                  align={header.key === "action" ? "right" : "inherit"}
                >
                  <Typography
                    fontSize="12px"
                    sx={{
                      px: header.key === "action" ? 3 : 1,
                      fontWeight: 600,
                      color: (theme) =>
                        theme.palette.mode === "dark"
                          ? "neutral.100"
                          : "neutral.900",
                    }}
                  >
                    {header.label}
                  </Typography>
                </TableCell>
              ))}
              {showMore && <TableCell></TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item: any) => {
              const isItemSelected = selectedItems.includes(item._id);

              return (
                <TableRow hover key={item._id} selected={isItemSelected}>
                  {showCheckbox && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        disabled={item?.disableCheckbox}
                        checked={
                          isCancelAllClicked
                            ? isCancelAllClicked
                            : isItemSelected
                        }
                        onChange={(event) =>
                          handleSelectOneItem(event, item._id)
                        }
                        value={isItemSelected}
                      />
                    </TableCell>
                  )}

                  {headers.map((header, i) => {
                    return (
                      <TableCell key={i}>
                        <Box>{item[header.key]}</Box>
                      </TableCell>
                    );
                  })}
                  {showMore && (
                    <TableCell key={Math.random()} sx={{ textAlign: "center" }}>
                      <ActionDropdown dropdownData={moreOptions} item={item} />
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {isLoading && items?.length == 0 && LoaderComponent && (
              <LoaderComponent />
            )}
          </TableBody>
        </Table>
      </Scrollbar>

      {items?.length <= 0 && !isLoading && noDataPlaceholder}

      {/* {total > rowsPerPage && ( */}
      {showPagination && (
        <TablePagination
          component="div"
          count={total || 0}
          onPageChange={(e: any, number) => {
            onPageChange(number);
          }}
          onRowsPerPageChange={onRowsPerPageChange}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      )}

      {/* )} */}
    </Box>
  );
};

PoGrnTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  selected: PropTypes.array,
};
