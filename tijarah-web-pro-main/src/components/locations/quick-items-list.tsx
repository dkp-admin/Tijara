import DeleteOutlineTwoToneIcon from "@mui/icons-material/DeleteOutlineTwoTone";
import ReorderRoundedIcon from "@mui/icons-material/ReorderRounded";
import {
  Box,
  IconButton,
  SvgIcon,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import {
  Draggable,
  DraggableStateSnapshot,
  Droppable,
} from "react-beautiful-dnd";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { MoleculeType } from "src/permissionManager";
import NoDataAnimation from "../widgets/animations/NoDataAnimation";
import { useAuth } from "src/hooks/use-auth";
import { useContext } from "react";
import { CompanyContext } from "src/contexts/company-context";

export function QuickItemsLists({ data, handleDelete }: any) {
  const { t } = useTranslation();
  const canAccess = usePermissionManager();
  const { user } = useAuth();
  const companyContext = useContext(CompanyContext) as any;

  const canDelete =
    canAccess(MoleculeType["quick-items:delete"]) ||
    canAccess(MoleculeType["quick-items:manage"]);

  return (
    <Droppable droppableId="variantsDroppable">
      {(provided) => (
        <TableBody {...provided.droppableProps} ref={provided.innerRef}>
          {data?.length > 0 ? (
            data.map((d: any, idx: any) => {
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
                            {d?.product?.name?.en}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {d?.location?.name}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography
                            sx={{ textTransform: "capitalize" }}
                            variant="body2"
                          >
                            {d?.type || "NA"}
                          </Typography>
                        </TableCell>

                        {(user?.company?.industry === "restaurant" ||
                          companyContext?.industry === "restaurant") && (
                          <TableCell>
                            <Typography
                              sx={{ textTransform: "capitalize" }}
                              variant="body2"
                            >
                              {d?.menu || "NA"}
                            </Typography>
                          </TableCell>
                        )}

                        <TableCell>
                          <Box>
                            <IconButton
                              onClick={(e) => {
                                if (!canDelete) {
                                  return toast.error(
                                    t("You don't have access")
                                  );
                                }
                                e.preventDefault();
                                handleDelete(d?._id);
                              }}
                              sx={{ mr: 0.7 }}
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
              <TableCell colSpan={4}>
                <Box>
                  <NoDataAnimation
                    text={
                      <Typography
                        variant="h6"
                        textAlign="center"
                        sx={{ mt: 5 }}
                      >
                        {t("No Quick Items!")}
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
