"use client";

import * as React from "react";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

export interface FaqProps {
  answer: any;
  question: any;
}

export const Faq: React.FC<FaqProps> = ({ answer, question }) => {
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);
  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  return (
    <Stack
      onClick={() => {
        setIsExpanded((prevState) => !prevState);
      }}
      spacing={2}
      sx={{ cursor: "pointer" }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <Typography variant="subtitle1">
          {isRTL ? question?.ar : question?.en}
        </Typography>
        {isExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
      </Stack>
      <Collapse in={isExpanded}>
        <Typography color="text.secondary" variant="body2">
          {isRTL ? answer?.ar : answer?.en}
        </Typography>
      </Collapse>
    </Stack>
  );
};
