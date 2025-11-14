import { DeleteOutlined } from "@mui/icons-material";
import {
  Box,
  IconButton,
  SvgIcon,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import Edit02Icon from "@untitled-ui/icons-react/build/esm/Edit02";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { MoleculeType } from "src/permissionManager";
import { EventNames } from "src/types/customer";

export function CustomerEventCard({
  id,
  handleEdit,
  setCustomerEventID,
  setShowDialogCustomerEvent,
  customerEventsList,
}: {
  id?: any;
  handleEdit: any;
  setCustomerEventID: any;
  setShowDialogCustomerEvent: any;
  customerEventsList: any;
}) {
  const { t } = useTranslation();
  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["customer:update"]);

  return (
    <TableBody>
      {customerEventsList?.length > 0 ? (
        customerEventsList.map((data: any, idx: any) => {
          return (
            <TableRow key={idx}>
              <TableCell>
                <Typography variant="body2">{data.name}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {data.date ? format(new Date(data.date), "dd/MM/yyyy") : ""}
                </Typography>
              </TableCell>
              <TableCell>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}>
                  <IconButton
                    sx={{ mr: 0.7 }}
                    onClick={() => {
                      setCustomerEventID(idx);
                      handleEdit(idx);
                    }}>
                    <SvgIcon>
                      <Edit02Icon fontSize="small" />
                    </SvgIcon>
                  </IconButton>

                  <IconButton
                    disabled={data.type !== EventNames.other}
                    onClick={(e) => {
                      if (id != null && !canUpdate) {
                        return toast.error(t("You don't have access"));
                      }
                      e.preventDefault();
                      setCustomerEventID(idx);
                      setShowDialogCustomerEvent(true);
                    }}
                    style={{
                      pointerEvents: "painted",
                    }}>
                    <DeleteOutlined
                      fontSize="medium"
                      color={
                        data.type !== EventNames.other ? "disabled" : "error"
                      }
                    />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          );
        })
      ) : (
        <TableRow>
          <TableCell colSpan={5} style={{ textAlign: "center" }}>
            {t("Currently, there are no customer events")}
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}
