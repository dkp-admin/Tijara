import EventIcon from "@mui/icons-material/Event";
import { Box, Divider, SvgIcon, Typography, useTheme } from "@mui/material";
import { endOfDay, format, startOfDay } from "date-fns";
import { useState } from "react";
import { DateFilterModal } from "./date-filter-modal";

const CustomDateFilter = (props: any) => {
  const { startDate, setStartDate, endDate, setEndDate, reset, setReset } =
    props;
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  return (
    <>
      <Box
        onClick={() => {
          setOpen(true);
        }}
        border={1}
        borderColor={theme.palette.mode === "dark" ? "#2D3748" : "#E5E7EB"}
        sx={{
          borderRadius: 1,

          pr: 1,
          pl: 1,
          width: "250px",
          height: "55px",
          display: "flex",
          "&:hover": {
            border: "1px solid background.paper",
            backgroundColor:
              theme.palette.mode === "dark" ? "#151822" : "#eff0f2",
            cursor: "pointer",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              mr: 1,
            }}
          >
            <Typography
              color={theme.palette.mode === "dark" ? "#A0AEC0" : "#6C737F"}
              variant="caption"
            >
              {"From"}
            </Typography>
            <Typography variant="body2">
              {format(startDate || startOfDay(new Date()), "dd/MM/yyyy")}
            </Typography>
          </Box>
          <Divider
            sx={{ mt: 3.2, width: 10, borderWidth: 1, borderColor: "#474a48" }}
          />
          <Box
            sx={{
              ml: 1,
              mr: 1,
            }}
          >
            <Typography
              color={theme.palette.mode === "dark" ? "#A0AEC0" : "#6C737F"}
              variant="caption"
            >
              {"To"}
            </Typography>
            <Typography variant="body2">
              {format(endDate || endOfDay(new Date()), "dd/MM/yyyy")}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <SvgIcon
            onClick={() => {
              setOpen(true);
            }}
          >
            <EventIcon color="action" />
          </SvgIcon>
        </Box>
      </Box>
      <DateFilterModal
        reset={reset}
        setReset={(val: any) => setReset(val)}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        open={open}
        handleClose={(e: any) => {
          setOpen(e);
        }}
      />
    </>
  );
};

export default CustomDateFilter;
