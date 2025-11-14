import { Avatar, Box, ButtonBase, SvgIcon } from "@mui/material";
import User01Icon from "@untitled-ui/icons-react/build/esm/User01";
import { useEffect, type FC } from "react";
import { useEntity } from "src/hooks/use-entity";
import { usePopover } from "src/hooks/use-popover";
import { AccountPopover } from "./account-popover";

export const AccountButton: FC = () => {
  const popover = usePopover<HTMLButtonElement>();
  const { findOne: findUser, entity: user, refetch } = useEntity("user");

  useEffect(() => {
    findUser("profile");
  }, []);

  return (
    <>
      <Box
        component={ButtonBase}
        onClick={popover.handleOpen}
        ref={popover.anchorRef}
        sx={{
          alignItems: "center",
          display: "flex",
          borderWidth: 2,
          borderStyle: "solid",
          borderColor: "divider",
          height: 40,
          width: 40,
          borderRadius: "50%",
        }}
      >
        <Avatar
          sx={{
            height: 32,
            width: 32,
          }}
          src={user?.profilePicture || ""}
        >
          <SvgIcon>
            <User01Icon />
          </SvgIcon>
        </Avatar>
      </Box>
      <AccountPopover
        user={user}
        anchorEl={popover.anchorRef.current}
        onClose={popover.handleClose}
        open={popover.open}
      />
    </>
  );
};
