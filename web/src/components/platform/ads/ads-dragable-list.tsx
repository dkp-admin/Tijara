import ReorderRoundedIcon from "@mui/icons-material/ReorderRounded";
import {
  Box,
  FormControlLabel,
  IconButton,
  LinearProgress,
  SvgIcon,
  Switch,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { differenceInDays, format } from "date-fns";
import { useRouter } from "next/router";
import {
  Draggable,
  DraggableStateSnapshot,
  Droppable,
} from "react-beautiful-dnd";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { TransformedArrowIcon } from "src/components/TransformedIcons";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useUserType } from "src/hooks/use-user-type";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { USER_TYPES } from "src/utils/constants";
import { toFixedNumber } from "src/utils/toFixedNumber";

export function AdsList({ data, handleStatusChange }: any) {
  const router = useRouter();
  const { t } = useTranslation();
  const canAccess = usePermissionManager();
  const { userType } = useUserType();
  const canUpdate = canAccess(MoleculeType["ads:update"]);

  function convertStoMs(seconds: any) {
    let minutes: any = Math.floor(seconds / 60);
    let extraSeconds: any = seconds % 60;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    extraSeconds = extraSeconds < 10 ? "0" + extraSeconds : extraSeconds;
    return `${minutes} min : ${extraSeconds} sec`;
  }

  const calculatePercentage = (
    startDate: any,
    endDate: any,
    currentDate: any
  ) => {
    const totalDays =
      differenceInDays(new Date(endDate), new Date(startDate)) + 1;

    const elapsedDays = differenceInDays(currentDate, new Date(startDate));

    let percentage = (elapsedDays / totalDays) * 100;

    percentage = Math.min(percentage, 100);

    percentage = Math.max(percentage, 0);

    return toFixedNumber(percentage);
  };

  const canDelete =
    canAccess(MoleculeType["quick-items:delete"]) ||
    canAccess(MoleculeType["quick-items:manage"]);
  const lng = localStorage.getItem("currentLanguage");

  return (
    <Droppable droppableId="variantsDroppable">
      {(provided) => (
        <TableBody {...provided.droppableProps} ref={provided.innerRef}>
          {data?.length > 0 ? (
            data.map((d: any, idx: any) => {
              const duration = d?.slidesData?.reduce(
                (ob: any, ac: any) => ob + ac.duration,
                0
              );
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
                        }}>
                        <TableCell>
                          <Typography variant="body2">
                            <IconButton sx={{ mr: 0.7, ml: -1 }}>
                              <SvgIcon>
                                <ReorderRoundedIcon fontSize="small" />
                              </SvgIcon>
                            </IconButton>
                            <Typography
                              sx={{ textTransform: "capitalize" }}
                              color="inherit"
                              variant="subtitle2">
                              {d?.name[lng] || d?.name?.en}
                            </Typography>
                          </Typography>
                        </TableCell>
                        {userType === USER_TYPES.SUPERADMIN && (
                          <TableCell>
                            <Typography
                              sx={{ textTransform: "capitalize" }}
                              color="inherit"
                              variant="subtitle2">
                              {d?.createdByRole === "super-admin"
                                ? "Platform"
                                : "Admin"}
                            </Typography>
                          </TableCell>
                        )}

                        <TableCell>
                          <Box>
                            <Typography variant="body2">{`${t(
                              "From"
                            )}: ${format(
                              new Date(d?.dateRange?.from),
                              "yyyy-MM-dd"
                            )}`}</Typography>
                            <Typography variant="body2">{`${t("To")}: ${format(
                              new Date(d?.dateRange?.to),
                              "yyyy-MM-dd"
                            )} `}</Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography>{`${convertStoMs(duration)}`}</Typography>
                        </TableCell>

                        <TableCell>
                          <FormControlLabel
                            sx={{
                              width: "120px",
                              display: "flex",
                              flexDirection: "row",
                            }}
                            control={
                              <Switch
                                disabled={
                                  d?.status === "completed" ||
                                  (userType === USER_TYPES.SUPERADMIN &&
                                    d?.createdByRole == "merchant")
                                }
                                checked={d?.status === "ongoing" ? true : false}
                                color="primary"
                                edge="end"
                                name="status"
                                onChange={(e) => {
                                  if (!canUpdate) {
                                    return toast.error(
                                      t("You don't have access")
                                    );
                                  }
                                  handleStatusChange(d?._id, e.target.checked);
                                }}
                                value={d?.status === "ongoing" ? true : false}
                                sx={{
                                  mr: 0.2,
                                }}
                              />
                            }
                            label={
                              d?.status === "ongoing"
                                ? t("Ongoing")
                                : d?.status === "paused"
                                ? t("Paused")
                                : t("Completed")
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box sx={{ width: "100%", mr: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={Number(
                                  calculatePercentage(
                                    d?.dateRange.from,
                                    d?.dateRange.to,
                                    new Date()
                                  )
                                )}
                              />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary">{`${calculatePercentage(
                                d?.dateRange?.from,
                                d?.dateRange?.to,
                                new Date()
                              )}%`}</Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "end",
                            }}>
                            <IconButton
                              onClick={() => {
                                router.push({
                                  pathname:
                                    tijarahPaths.platform.adsManagement.create,
                                  query: {
                                    id: d?._id,
                                    role: d?.createdByRole,
                                  },
                                });
                              }}
                              sx={{ mr: 1.5 }}>
                              <TransformedArrowIcon name="arrow-right" />
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
              <TableCell colSpan={6}>
                <Box>
                  <NoDataAnimation
                    text={
                      <Typography
                        variant="h6"
                        textAlign="center"
                        sx={{ mt: 5 }}>
                        {t("No Ads!")}
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
