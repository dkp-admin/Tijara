import { Badge, IconButton, SvgIcon, Tooltip } from "@mui/material";
import Bell01Icon from "@untitled-ui/icons-react/build/esm/Bell01";
import type { FC } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePopover } from "src/hooks/use-popover";
import { NotificationsPopover } from "./notifications-popover";

export const NotificationsButton: FC = () => {
  const { t } = useTranslation();
  const popover = usePopover<HTMLButtonElement>();

  const { user } = useAuth();
  const { find, entities } = useEntity("notification");

  const unreadNotification = () => {
    return entities?.results?.filter((notification: any) => !notification?.read)
      ?.length;
  };

  useEffect(() => {
    find({
      page: 0,
      limit: 10,
      sort: "desc",
      activeTab: "all",
      companyRef: user.company?._id,
    });
  }, []);

  return (
    <>
      <Tooltip title={t("Notifications")}>
        <IconButton ref={popover.anchorRef} onClick={popover.handleOpen}>
          <Badge color="error" badgeContent={unreadNotification()}>
            <SvgIcon>
              <Bell01Icon />
            </SvgIcon>
          </Badge>
        </IconButton>
      </Tooltip>

      <NotificationsPopover
        anchorEl={popover.anchorRef.current}
        notifications={entities?.results}
        onClose={popover.handleClose}
        open={popover.open}
      />
    </>
  );
};
