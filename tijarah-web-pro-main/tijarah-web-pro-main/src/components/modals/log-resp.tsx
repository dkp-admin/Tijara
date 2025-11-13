import { Button, Card, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const DynamicReactJson = dynamic(import('react-json-view'), { ssr: false });

interface LogsModalProps {
  open?: boolean;
  handleClose?: () => void;
  data?: any;
}

export const LogModal: React.FC<LogsModalProps> = ({
  open,
  data,
  handleClose,
}) => {
  const { t } = useTranslation();

  const [, setBackDrop] = useState(false);




  const onClose = (event: {}, reason: "backdropClick" | "escapeKeyDown") => {
    if (reason === "backdropClick") {
      console.log(reason);
    } else {
      setBackDrop(false);
    }
  };

  const handleBackdropClick = (event: any) => {
    event.stopPropagation();
    return false;
  };

  return (
    <Box>
      <Modal
        open={open}
        onClose={onClose}
        onBackdropClick={handleBackdropClick}
        disableEscapeKeyDown>
        <Card
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            minHeight: '40%',
            maxHeight: '80%',
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

          }}>
          <Box style={{ width: "100%", display: "flex" }}>
            <XCircle
              fontSize="small"
              onClick={handleClose}
              style={{ cursor: "pointer" }}
            />

            <Box style={{ flex: 1 }}>
              <Typography variant="h5" align="center" sx={{ mr: 4, mb: 3 }}>
                {t("Log Response")}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ overflowY: 'scroll', height: 600 }}>
            <DynamicReactJson src={JSON.parse(data || {})} />
          </Box>


        </Card>
      </Modal>
    </Box>
  );
};
