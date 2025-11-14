import { DeleteOutlined } from "@mui/icons-material";
import { Box, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

export function VendorAddCard({
  setCustomerEventID,
  setShowDialogCustomerEvent,
  customerEventsList,
}: any) {
  const { t } = useTranslation();

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
                  {format(new Date(data.date), "dd/MM/yyyy")}
                </Typography>
              </TableCell>
              <TableCell>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-around",
                  }}
                >
                  <a
                    href=""
                    onClick={(e) => {
                      e.preventDefault();
                      setCustomerEventID(idx);
                      setShowDialogCustomerEvent(true);
                    }}
                    style={{
                      pointerEvents: null,
                    }}
                  >
                    <DeleteOutlined fontSize="medium" color="error" />
                  </a>
                </Box>
              </TableCell>
            </TableRow>
          );
        })
      ) : (
        <TableRow>
          <TableCell colSpan={5} style={{ textAlign: "center" }}>
            {t("No Record, Add vendor")}
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}
