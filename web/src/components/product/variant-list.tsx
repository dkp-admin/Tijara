import ReorderRoundedIcon from "@mui/icons-material/ReorderRounded";
import {
  Box,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  SvgIcon,
  Switch,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { DotsVertical } from "src/icons/dot-vertical";
import {
  Draggable,
  DraggableStateSnapshot,
  Droppable,
} from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";
import { UNIT_VALUES } from "src/utils/constants";
import { trimText } from "src/utils/trim-text";
import { useState } from "react";
import NoDataAnimation from "../widgets/animations/NoDataAnimation";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { useCurrency } from "src/utils/useCurrency";

export function VariantLists({
  variants,
  handleEdit,
  handleEditStock,
  handleDelete,
  handleStatusChange,
  handleHistoryClick,
  handleBatchHistoryClick,
  batching,
  editStock,
  handlePricingEdit,
}: any) {
  const { canAccessModule } = useFeatureModuleManager();
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<Record<number, Element | null>>({});
  const handleClick =
    (idx: number) => (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl({ ...anchorEl, [idx]: event.currentTarget });
    };
  const currency = useCurrency();

  const handleClose = (idx: number) => () => {
    setAnchorEl({ ...anchorEl, [idx]: null });
  };

  const manageStock = (variant: any) => {
    if (
      !variant?.stockConfiguration ||
      variant?.stockConfiguration.length === 0
    ) {
      return "Manage Stock";
    } else {
      let total = 0;
      let trackingEnabled = false;

      for (let item of variant.stockConfiguration) {
        if (item.tracking) {
          total += item.count;
          trackingEnabled = true;
        }
      }

      return trackingEnabled ? total : "Manage Stock";
    }
  };

  const getLocations = (variant: any) => {
    if (variant?.assignedToAll === true) {
      return "All Locations";
    } else {
      const locations = variant.locations.map((location: any) => {
        return location?.name;
      });

      let data = locations.slice(0, 2).join(", ");

      return locations?.length >= 3
        ? data + ` +${locations?.length - 2}`
        : data || "NA";
    }
  };

  return (
    <Droppable droppableId="variantsDroppable">
      {(provided) => (
        <TableBody {...provided.droppableProps} ref={provided.innerRef}>
          {variants?.length > 0 ? (
            variants.map((variant: any, idx: any) => {
              return (
                <Draggable key={idx} draggableId={idx.toString()} index={idx}>
                  {(provided, snapshot: DraggableStateSnapshot) => {
                    return (
                      <TableRow
                        key={idx}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          background: snapshot.isDragging
                            ? "rgba(245,245,245, 0.75)"
                            : "none",
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2">
                            <IconButton sx={{ mr: 0.7, ml: -1 }}>
                              <SvgIcon>
                                <ReorderRoundedIcon fontSize="small" />
                              </SvgIcon>
                            </IconButton>
                            {variant?.name?.en}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {trimText(variant?.sku, 18)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {UNIT_VALUES[variant?.unit] || "NA"}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {variant?.costPrice
                              ? `${currency} ${variant?.costPrice || 0}`
                              : t("-")}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {variant?.price
                              ? `${currency} ${variant?.price || 0}`
                              : t("Custom price")}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {getLocations(variant)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography
                              variant="body2"
                              color={"primary"}
                              style={{ cursor: "pointer" }}
                              onClick={() => handleEditStock(idx)}
                            >
                              {manageStock(variant)}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography
                              variant="body2"
                              color={"primary"}
                              style={{ cursor: "pointer" }}
                              onClick={() => handlePricingEdit(idx)}
                            >
                              {t("Manage Pricing")}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Box>
                            <IconButton
                              onClick={handleClick(idx)}
                              sx={{ mr: 0.7 }}
                            >
                              <SvgIcon>
                                <DotsVertical fontSize="small" />
                              </SvgIcon>
                            </IconButton>
                          </Box>

                          <Menu
                            anchorEl={anchorEl[idx]}
                            open={Boolean(anchorEl[idx])}
                            onClose={handleClose(idx)}
                          >
                            <MenuItem onClick={() => handleEdit(idx)}>
                              {t("Edit Variant")}
                            </MenuItem>
                            <MenuItem onClick={() => handleDelete(idx)}>
                              {t("Remove Variant")}
                            </MenuItem>
                            <MenuItem
                              onClick={() => handleHistoryClick(idx)}
                              disabled={!canAccessModule("inventory")}
                            >
                              {t("Stock History")}
                            </MenuItem>
                            {batching && (
                              <MenuItem
                                onClick={() => handleBatchHistoryClick(idx)}
                              >
                                {t("Batch History")}
                              </MenuItem>
                            )}
                          </Menu>
                        </TableCell>
                      </TableRow>
                    );
                  }}
                </Draggable>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={7}
                style={{ textAlign: "center", borderBottom: "none" }}
              >
                <Box sx={{ mt: 4, mb: 4 }}>
                  <NoDataAnimation
                    text={
                      <Typography
                        variant="h5"
                        textAlign="center"
                        sx={{ mt: 5 }}
                      >
                        {t("No Variants!")}
                      </Typography>
                    }
                  />
                </Box>
              </TableCell>
            </TableRow>
          )}
          {provided.placeholder}
        </TableBody>
      )}
    </Droppable>
  );
}
