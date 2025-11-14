import DeleteOutlineTwoToneIcon from "@mui/icons-material/DeleteOutlineTwoTone";
import ReorderRoundedIcon from "@mui/icons-material/ReorderRounded";
import {
  Box,
  FormControlLabel,
  IconButton,
  SvgIcon,
  Switch,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import Edit02Icon from "@untitled-ui/icons-react/build/esm/Edit02";
import {
  Draggable,
  DraggableStateSnapshot,
  Droppable,
} from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";
import { UNIT_VALUES } from "src/utils/constants";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { trimText } from "src/utils/trim-text";
import { useCurrency } from "src/utils/useCurrency";

export function VariantLists({
  variants,
  handleEdit,
  handleDelete,
  handleStatusChange,
}: any) {
  const { t } = useTranslation();
  const lng = localStorage.getItem("currentLanguage");
  const currency = useCurrency();

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
                            {variant?.name[lng] || variant?.name?.en}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {trimText(variant?.sku, 18)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {UNIT_VALUES[variant?.unit]}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {`${
                              variant?.price
                                ? `${currency} ${toFixedNumber(
                                    variant?.costPrice
                                  )}`
                                : t("Custom Price")
                            }`}
                          </Typography>

                          {variant?.oldCostPrice && (
                            <Typography
                              variant="body2"
                              style={{
                                textDecoration: "line-through",
                                marginLeft: "5px",
                              }}
                            >
                              {toFixedNumber(variant?.oldCostPrice)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {`${
                              variant?.price
                                ? `${currency} ${toFixedNumber(variant?.price)}`
                                : t("Custom Price")
                            }`}
                          </Typography>

                          {variant?.oldPrice && (
                            <Typography
                              variant="body2"
                              style={{
                                textDecoration: "line-through",
                                marginLeft: "5px",
                              }}
                            >
                              {toFixedNumber(variant?.oldPrice)}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <FormControlLabel
                            sx={{
                              minWidth: "100px",
                              display: "flex",
                              flexDirection: "row",
                            }}
                            control={
                              <Switch
                                checked={
                                  variant?.status === "active" ? true : false
                                }
                                color="primary"
                                edge="end"
                                name="variantStatus"
                                onChange={(e) => {
                                  handleStatusChange(idx, e.target.checked);
                                }}
                                value={
                                  variant?.status === "active" ? true : false
                                }
                                sx={{
                                  mr: 0.2,
                                }}
                              />
                            }
                            label={
                              variant?.status === "active"
                                ? t("Active")
                                : t("Deactivated")
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                          >
                            <IconButton
                              sx={{ mr: 0.7 }}
                              onClick={() => handleEdit(idx)}
                            >
                              <SvgIcon>
                                <Edit02Icon fontSize="small" />
                              </SvgIcon>
                            </IconButton>

                            <IconButton
                              color="error"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDelete(idx);
                              }}
                              sx={{ mx: 0.5 }}
                            >
                              <SvgIcon>
                                <DeleteOutlineTwoToneIcon />
                              </SvgIcon>
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  }}
                </Draggable>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} style={{ textAlign: "center" }}>
                {t("Currently, no variants available")}
              </TableCell>
            </TableRow>
          )}
          {provided.placeholder}
        </TableBody>
      )}
    </Droppable>
  );
}
