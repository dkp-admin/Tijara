import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useTranslation } from "react-i18next";
import * as React from "react";
import { Box, Typography } from "@mui/material";
import { string } from "prop-types";

type DialogProps = {
  show?: boolean;
  toggle?: any;
  cancelButtonText?: string;
  title?: string;
  response?: any;
  importEntity?: any;
};

const renderDialogContent = (response: any, importEntity: any, t: any) => {
  if (response?.invalidCols?.length > 0) {
    return (
      <DialogContentText id="alert-dialog-description">
        {response?.invalidCols?.map((error: any, index: any) => (
          <Box key={index}>
            <Typography sx={{ mt: 2 }}>{`${index + 1}: ${
              error.field
            }`}</Typography>
            <Typography sx={{ mt: 2 }}>{`${
              error.field
            } ${error.message[0].replace("String", "")}`}</Typography>
            <Typography
              sx={{ mt: 2, mb: 2 }}>{`Row:- ${response?.row}`}</Typography>
          </Box>
        ))}
      </DialogContentText>
    );
  }

  if (response?.code === "not_found") {
    return (
      <DialogContentText>
        <Typography>{`${
          typeof response.value === "string"
            ? response.value
            : response?.value?.[0]
        } is not Found in the ${
          response?.field || response.context
        }`}</Typography>
      </DialogContentText>
    );
  }

  if (response?.code === "too_large") {
    return (
      <DialogContentText>
        <Typography>{`${importEntity} should not be more than ${response?.max}!`}</Typography>
      </DialogContentText>
    );
  }

  if (response?.code === "no_data") {
    return <Typography>{`${t("Not able to import empty sheet!")}`}</Typography>;
  }

  if (response?.status === true) {
    return (
      <DialogContentText>
        <Typography>{`${importEntity} ${t(
          "Imported Successfully!"
        )}`}</Typography>
      </DialogContentText>
    );
  }

  if (response?.statusCode === 500) {
    return <Typography>{`${t("Something went wrong!")}`}</Typography>;
  }

  return null;
};
export default function ImportMessage({
  show,
  toggle,
  cancelButtonText,
  title,
  response,
  importEntity,
}: DialogProps) {
  const { t } = useTranslation();

  return (
    <div>
      <Dialog
        open={show}
        onClose={toggle}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle
          color={response.status === true ? "green" : "red"}
          id="alert-dialog-title">
          {title}
        </DialogTitle>
        <DialogContent>
          {renderDialogContent(response, importEntity, t)}
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={toggle}>
            {cancelButtonText}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
