import {
  Box,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Popover,
  Typography,
} from "@mui/material";
import PropTypes from "prop-types";
import type { FC } from "react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { usePreferredLanguage } from "src/hooks/preferred-language/use-preferred-language";
import { useAuth } from "src/hooks/use-auth";
import i18n from "src/i18n";

type Language = "en" | "ar" | "ur";

type LanguageOptions = {
  [key in Language]: {
    icon: string;
    label: string;
  };
};

const languageOptions: LanguageOptions = {
  en: {
    icon: "/assets/flags/flag-uk.svg",
    label: i18n.t("English"),
  },
  ar: {
    icon: "/assets/flags/flag-ar.svg",
    label: i18n.t("Arabic"),
  },
  ur: {
    icon: "/assets/flags/flag-ur.svg",
    label: i18n.t("Urdu"),
  },
};

interface LanguagePopoverProps {
  anchorEl: null | Element;
  onClose?: () => void;
  open?: boolean;
}

export const LanguagePopover: FC<LanguagePopoverProps> = (props) => {
  const { anchorEl, onClose, open = false, ...other } = props;
  const { i18n, t } = useTranslation();
  const { user } = useAuth();
  const { updateLanguage } = usePreferredLanguage();

  const handleChange = useCallback(
    async (language: Language): Promise<void> => {
      if (user) {
        const resData = await updateLanguage({
          params: { id: user?._id },
          body: { language: language || "en" },
        });

        if (resData != null) {
          localStorage.setItem("currentLanguage", language);
        }
      } else {
        localStorage.setItem("currentLanguage", language);
      }
      onClose?.();
      await i18n.changeLanguage(language);
      window.location.reload();
    },
    [onClose, i18n, t]
  );

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: "right",
        vertical: "bottom",
      }}
      disableScrollLock
      transformOrigin={{
        horizontal: "right",
        vertical: "top",
      }}
      onClose={onClose}
      open={open}
      PaperProps={{ sx: { width: 220 } }}
      {...other}
    >
      {(Object.keys(languageOptions) as Language[]).map((language) => {
        const option = languageOptions[language];

        return (
          <MenuItem onClick={() => handleChange(language)} key={language}>
            <ListItemIcon>
              <Box
                sx={{
                  width: 28,
                  "& img": {
                    width: "100%",
                  },
                }}
              >
                <img alt={option.label} src={option.icon} />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="subtitle2">{option.label}</Typography>
              }
            />
          </MenuItem>
        );
      })}
    </Popover>
  );
};

LanguagePopover.propTypes = {
  anchorEl: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
