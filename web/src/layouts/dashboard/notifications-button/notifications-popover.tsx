import {
  Avatar,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Popover,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
} from "@mui/material";
import Mail04Icon from "@untitled-ui/icons-react/build/esm/Mail04";
import MessageChatSquareIcon from "@untitled-ui/icons-react/build/esm/MessageChatSquare";
import XIcon from "@untitled-ui/icons-react/build/esm/X";
import { format } from "date-fns";
import PropTypes from "prop-types";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { Scrollbar } from "src/components/scrollbar";
import { useMarkNotification } from "src/hooks/use-mark-notification";
import { UserCircle as UserCircleIcon } from "src/icons/user-circle";

const getNotificationContent = (notification: any): JSX.Element => {
  return (
    <>
      <ListItemAvatar sx={{ my: 0.7 }}>
        {notification?.image ? (
          <Avatar src={notification.image}>
            <UserCircleIcon fontSize="small" />
          </Avatar>
        ) : (
          <Avatar>
            <SvgIcon>
              <MessageChatSquareIcon />
            </SvgIcon>
          </Avatar>
        )}
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box
            sx={{
              mr: 0.5,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle2">{notification.title}</Typography>
            <Typography variant="body2">{notification.body}</Typography>
          </Box>
        }
        secondary={
          <Typography color="text.secondary" variant="caption">
            {format(new Date(notification.createdAt), "dd/MM/yyyy, hh:mm a")}
          </Typography>
        }
        sx={{ my: 0 }}
      />
    </>
  );
};

interface NotificationsPopoverProps {
  anchorEl: null | Element;
  notifications: any;
  onClose?: () => void;
  open?: boolean;
}

export const NotificationsPopover: FC<NotificationsPopoverProps> = (props) => {
  const { t } = useTranslation();
  const { markNotification } = useMarkNotification();

  const { anchorEl, notifications, onClose, open = false, ...other } = props;

  const getUnreadNotification = () => {
    return notifications?.filter((notification: any) => !notification?.read)
      ?.length;
  };

  const handleMarkAllAsRead = async () => {
    await markNotification({ notificationIds: [], type: "all" });
  };

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: "left",
        vertical: "bottom",
      }}
      disableScrollLock
      onClose={onClose}
      open={open}
      PaperProps={{ sx: { width: 380 } }}
      {...other}
    >
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        spacing={2}
        sx={{
          px: 3,
          py: 2,
        }}
      >
        <Typography color="inherit" variant="h6">
          {t("Notifications")}
        </Typography>
        <Tooltip title={t("Mark all as read")}>
          <IconButton
            size="small"
            color="inherit"
            onClick={handleMarkAllAsRead}
            disabled={notifications?.length === 0}
          >
            <SvgIcon>
              <Mail04Icon fontSize="small" />
            </SvgIcon>
          </IconButton>
        </Tooltip>
      </Stack>
      {getUnreadNotification() === 0 ? (
        <Box sx={{ px: 3, py: 2 }}>
          <Typography variant="subtitle2">
            {t("There are no notifications")}
          </Typography>
        </Box>
      ) : (
        <Scrollbar sx={{ maxHeight: 400 }}>
          <List disablePadding>
            {notifications?.map((notification: any) => {
              if (notification?.read) {
                return <></>;
              }

              return (
                <ListItem
                  divider
                  key={notification._id}
                  sx={{
                    alignItems: "flex-start",
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                    "& .MuiListItemSecondaryAction-root": {
                      top: "24%",
                    },
                  }}
                  secondaryAction={
                    <Tooltip title={t("Remove")}>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={async () => {
                          await markNotification({
                            notificationIds: [notification?._id],
                            type: "selective",
                          });
                        }}
                      >
                        <SvgIcon>
                          <XIcon />
                        </SvgIcon>
                      </IconButton>
                    </Tooltip>
                  }
                >
                  {getNotificationContent(notification)}
                </ListItem>
              );
            })}
          </List>
        </Scrollbar>
      )}
    </Popover>
  );
};

NotificationsPopover.propTypes = {
  anchorEl: PropTypes.any,
  notifications: PropTypes.array.isRequired,
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
