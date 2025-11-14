import { Card, Divider, FormControlLabel, Switch } from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { ChangeEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SuperTable } from "src/components/widgets/super-table";

interface GlobalProductStatusChangeModalProps {
  open?: boolean;
  handleClose?: () => void;
  modalData?: any;
  onSuccess?: any;
  variants?: any[];
  onChange?: (array: any[]) => any;
}

export const GlobalProductStatusChangeModal: React.FC<
  GlobalProductStatusChangeModalProps
> = ({ open, handleClose, variants, onChange }) => {
  const { t } = useTranslation();

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isChanged, setIsChanged] = useState(false);
  const [isCancelAllClicked] = useState(false);

  const tableHeaders = [
    {
      key: "variantName",
      label: t("Variant Name"),
    },
    {
      key: "variantStatus",
      label: t("Status"),
    },
  ];

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const onStatusChange = async (index: any, result: any) => {
    variants[index].status = result ? "active" : "inactive";
    onChange(variants);
    setIsChanged(!isChanged);
  };

  const transformedData = useMemo(() => {
    let arr: any[] = [];
    variants?.map((d, i) => {
      arr.push({
        key: "d?._id",
        _id: d?._id,
        variantName: <Typography variant="body2">{d?.name?.en}</Typography>,

        variantStatus: (
          <FormControlLabel
            sx={{
              minWidth: "100px",
              display: "flex",
              flexDirection: "row",
            }}
            control={
              <Switch
                checked={d?.status === "active" ? true : false}
                color="primary"
                edge="end"
                name="status"
                onChange={(e) => {
                  onStatusChange(i, e.target.checked);
                }}
                value={d?.status === "active" ? true : false}
                sx={{
                  mr: 0.2,
                }}
              />
            }
            label={d?.status === "active" ? t("Active") : t("Deactivated")}
          />
        ),
      });
    });

    return arr;
  }, [...variants, isChanged]);

  return (
    <Box>
      <Modal
        open={open}
        onClose={() => {
          handleClose();
        }}>
        <Card
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "90vw",
              sm: "70vw",
              md: "50vw",
            },
            bgcolor: "background.paper",
            overflow: "auto",
            p: 4,
          }}>
          <Box
            style={{ width: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ display: "flex" }}>
              <XCircle
                fontSize="small"
                onClick={handleClose}
                style={{
                  width: "40px",
                  cursor: "pointer",
                }}
              />

              <Box sx={{ width: "100%", mr: 4 }}>
                <Typography variant="h5" align="center">
                  {t("Variants List")}
                </Typography>
                <Typography
                  variant="body2"
                  align="center"
                  color="gray"
                  sx={{ mt: 1, mb: 3 }}>
                  {t("Update the variant statuses here")}
                </Typography>
              </Box>
            </Box>

            <Box style={{ flex: 1 }}>
              <Divider />

              <Card
                sx={{
                  mt: 4,
                  mb: 1,
                  overflowY: "auto",
                  height: {
                    xs: "44vh",
                    sm: "39vh",
                    md: "57vh",
                    lg: "52vh",
                  },
                }}>
                <SuperTable
                  showPagination={false}
                  items={transformedData}
                  headers={tableHeaders}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  total={variants?.length || 0}
                  isCancelAllClicked={isCancelAllClicked}
                />
              </Card>
            </Box>
          </Box>
        </Card>
      </Modal>
    </Box>
  );
};
