import React, { useState, useTransition } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { SvgIcon, Typography } from "@mui/material";
import Download01Icon from "@untitled-ui/icons-react/build/esm/Download01";
import { useTranslation } from "react-i18next";
import { useUserType } from "src/hooks/use-user-type";
import { USER_TYPES } from "src/utils/constants";
import toast from "react-hot-toast";

interface ActionButtonProps {
  openSendReceiptModal: boolean;
  setOpenSendReceiptModal: any;
  handlePrint: any;
  locationRef: string;
  companyRef: string;
}

const ActionButton = (props: ActionButtonProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { t } = useTranslation();
  const { userType } = useUserType();
  const {
    openSendReceiptModal,
    setOpenSendReceiptModal,
    handlePrint,
    locationRef,
    companyRef,
  } = props;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="export-button">
      <Button
        variant="contained"
        aria-controls="export-menu"
        onClick={(e) => {
          if (userType === USER_TYPES.SUPERADMIN && companyRef == "all") {
            return toast.error(t("Select a company"));
          } else if (
            userType === USER_TYPES.SUPERADMIN &&
            locationRef == "all"
          ) {
            return toast.error(t("Select a location"));
          } else if (
            userType !== USER_TYPES.SUPERADMIN &&
            locationRef == "all"
          ) {
            return toast.error(t("Select a location"));
          }
          handleClick(e);
        }}
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
        <Typography>{t("Receipt / Print")}</Typography>
      </Button>
      <Menu
        id="export-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}>
        <MenuItem
          onClick={() => {
            setOpenSendReceiptModal(!openSendReceiptModal);
            handleClose();
          }}>
          {t("Send Report")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            handlePrint();
            handleClose();
          }}>
          {t("Print Report")}
        </MenuItem>
      </Menu>
    </div>
  );
};

export default ActionButton;
