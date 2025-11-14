import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import React from "react";
import { useTranslation } from "react-i18next";

const companies = [
  "Acme Corporation",
  "Widget Industries",
  "Tech Innovations Ltd.",
  "Global Retail Solutions",
  "Healthcare Partners Inc.",
  "Financial Wizards LLC",
  "Hospitality Haven",
  "Manufacturing Masters",
  "EduTech Enterprises",
  "Transport Titans",
  "Real Estate Experts",
  "Entertainment Empire",
  "Digital Dreams Co.",
  "Service Solutions Inc.",
  "Creative Creations Ltd.",
];

const businessTypes = [
  "Technology",
  "Retail",
  "Healthcare",
  "Finance",
  "Hospitality",
  "Manufacturing",
  "Education",
  "Transportation",
  "Real Estate",
  "Entertainment",
];

interface AdBusinessListModalProps {
  open?: boolean;
  handleClose?: () => void;
  data?: any;
}

export const AdBusinessListModal: React.FC<AdBusinessListModalProps> = ({
  open,
  data,
  handleClose,
}) => {
  const { t } = useTranslation();

  return (
    <Box>
      <Modal open={open} onClose={handleClose} disableEscapeKeyDown>
        <Card
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            minHeight: "40%",
            maxHeight: "80%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "95vw",
              sm: "70vw",
              md: "55vw",
              lg: "45vw",
            },
            bgcolor: "background.paper",
            overflowY: "hidden",
            p: 4,
            display: "flex",
            flexDirection: "column",
          }}>
          <Box style={{ width: "100%", display: "flex" }}>
            <XCircle
              fontSize="small"
              onClick={handleClose}
              style={{ cursor: "pointer" }}
            />

            <Box style={{ flex: 1 }}>
              <Typography variant="h5" align="center" sx={{ mr: 4, mb: 3 }}>
                {t("Businesses & Companies")}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ overflowY: "scroll", height: 600, display: "flex" }}>
            <Table sx={{ display: "flex", flexDirection: "column" }}>
              <TableHead>
                <TableCell>{"Business Type"}</TableCell>
              </TableHead>
              <TableBody>
                <TableCell>
                  {businessTypes.map((name: any, idx) => {
                    return <Typography key={idx}>{name}</Typography>;
                  })}
                </TableCell>
              </TableBody>
            </Table>
            <Table sx={{ display: "flex", flexDirection: "column" }}>
              <TableHead>
                <TableCell>{"Companies"}</TableCell>
              </TableHead>
              <TableBody>
                <TableCell>
                  {companies?.map((name, idx) => {
                    return <Typography key={idx}>{name}</Typography>;
                  })}
                </TableCell>
              </TableBody>
            </Table>
          </Box>
        </Card>
      </Modal>
    </Box>
  );
};
