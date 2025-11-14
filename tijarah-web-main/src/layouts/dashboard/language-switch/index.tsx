import { Box, IconButton, Tooltip } from "@mui/material";
import type { FC } from "react";
import { usePopover } from "src/hooks/use-popover";
import { LanguagePopover } from "./language-popover";

type Language = "en" | "ar" | "ur";

const languages: Record<Language, string> = {
  en: "/assets/flags/flag-uk.svg",
  ar: "/assets/flags/flag-ar.svg",
  ur: "/assets/flags/flag-ur.svg",
};

export const LanguageSwitch: FC = () => {
  const popover = usePopover<HTMLButtonElement>();
  const lng = localStorage.getItem("currentLanguage");

  const flag = languages[(lng || "en") as Language];

  return (
    <>
      <Tooltip title="Language">
        <IconButton onClick={popover.handleOpen} ref={popover.anchorRef}>
          <Box
            sx={{
              width: 28,
              "& img": {
                width: "100%",
              },
            }}
          >
            <img src={flag} />
          </Box>
        </IconButton>
      </Tooltip>
      <LanguagePopover
        anchorEl={popover.anchorRef.current}
        onClose={popover.handleClose}
        open={popover.open}
      />
    </>
  );
};
