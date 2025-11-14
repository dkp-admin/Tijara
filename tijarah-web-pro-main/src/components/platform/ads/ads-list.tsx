import DeleteOutlineTwoToneIcon from "@mui/icons-material/DeleteOutlineTwoTone";
import {
  Box,
  IconButton,
  Link,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
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
import ReorderRoundedIcon from "@mui/icons-material/ReorderRounded";

const AdsList = (props: any) => {
  const { t } = useTranslation();
  const { slidesData, handleEdit, handleDelete } = props;

  return (
    <Box sx={{ display: "flex" }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableCell>{t("Content Type")}</TableCell>
            <TableCell>{t("Time")}</TableCell>
            <TableCell
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                bgcolor: "red",
                pr: 10,
              }}>
              {t("Actions")}
            </TableCell>
          </TableHead>
          <Droppable droppableId="slidesDataDroppable">
            {(provided) => (
              <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                {slidesData?.map((data: any, index: any) => {
                  console.log(data);

                  return (
                    <Draggable
                      key={index}
                      draggableId={index.toString()}
                      index={index}>
                      {(provided, snapshot: DraggableStateSnapshot) => {
                        return (
                          <TableRow
                            key={index}
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
                              <Typography>
                                <IconButton sx={{ mr: 0.7, ml: -1 }}>
                                  <SvgIcon>
                                    <ReorderRoundedIcon fontSize="small" />
                                  </SvgIcon>
                                </IconButton>
                                {data?.contentType}
                              </Typography>
                            </TableCell>
                            <TableCell>{`${data?.duration} Sec`}</TableCell>
                            <TableCell
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                mr: 5,
                              }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                }}>
                                <Box>
                                  <IconButton
                                    onClick={() => {
                                      handleEdit(index);
                                    }}>
                                    <SvgIcon>
                                      <Edit02Icon fontSize="small" />
                                    </SvgIcon>
                                  </IconButton>
                                </Box>
                                <Box>
                                  <IconButton
                                    color="error"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleDelete(index);
                                    }}>
                                    <SvgIcon>
                                      <DeleteOutlineTwoToneIcon />
                                    </SvgIcon>
                                  </IconButton>
                                </Box>
                                {(data?.imageUrl ||
                                  data?.videoUrl ||
                                  data?.link) && (
                                  <Box>
                                    <Link
                                      target="_blank"
                                      href={
                                        data?.imageUrl ||
                                        data?.videoUrl ||
                                        data?.link
                                      }>
                                      {t("View")}
                                    </Link>
                                  </Box>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      }}
                    </Draggable>
                  );
                })}
              </TableBody>
            )}
          </Droppable>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdsList;
