import { Box, Button, Card, Modal, Typography, useTheme } from "@mui/material";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useEffect, useState } from "react";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file

import { Scrollbar } from "../scrollbar";

interface DateFilterModalProps {
  setStartDate?: any;
  setEndDate?: any;
  reset?: boolean;
  setReset?: any;
  open: any;
  handleClose: any;
}

export const DateFilterModal = (props: DateFilterModalProps) => {
  const { open, handleClose, setStartDate, setEndDate, reset, setReset } =
    props;
  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [tempStart, setTempStart] = useState<Date>(new Date());
  const [tempEnd, setTempEnd] = useState<Date>(new Date());

  const pickerStyles = {
    ".rdrStaticRangeLabel": {
      color: "#000",
    },
    ".rdrInputRange": {
      color: "#000",
    },
    ".rdrInputRangeInput": {
      backgroundColor: "#fff",
      color: "#000",
    },
    ".rdrDayToday .rdrDayNumber span:after": {
      backgroundColor: "#16B364",
    },
  };

  useEffect(() => {
    state.map((d: any) => {
      setTempStart(d?.startDate);
      setTempEnd(d?.endDate);
    });
  }, [state]);

  useEffect(() => {
    if (reset) {
      setState([
        {
          startDate: new Date(),
          endDate: new Date(),
          key: "selection",
        },
      ]);
      setReset(!reset);
    }
  }, [reset]);

  return (
    <Modal open={open} onClose={handleClose}>
      <Box>
        <Card
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            visibility: "visible",
            scrollbarColor: "transpatent",
            position: "fixed ",
            top: "55%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "80vw",
              sm: "70vw",
              md: "60vw",
            },
            bgcolor: "white",
            overflowY: "hidden",
            height: {
              xs: "72vh",
              md: "68vh",
              lg: "69vh",
            },
            p: 2,
          }}
        >
          {/* header */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box>
              <XCircle
                color="#000"
                fontSize="small"
                onClick={() => {
                  handleClose(!open);
                }}
                style={{ cursor: "pointer" }}
              />
            </Box>

            <Box>
              <Typography color={"#000"} variant="h6" align="left">
                {"Select Date Range"}
              </Typography>
            </Box>

            <Box>
              <Button
                onClick={() => {
                  setStartDate(tempStart);
                  setEndDate(tempEnd);
                  handleClose(!open);
                }}
              >
                {"Done"}
              </Button>
            </Box>
          </Box>

          {/* Body */}
          <Box
            style={{
              display: "flex",
              flex: 1,
              overflow: "hidden",
              height: "100%",
              width: "100%",
            }}
          >
            <Scrollbar
              sx={{
                width: {
                  xs: "70vw",
                  sm: "65vw",
                  md: "56vw",
                  lg: "60vw",
                },
                height: {
                  xs: "70vh",
                  sm: "65vh",
                  md: "63vh",
                  lg: "65vh",
                },
              }}
            >
              <Box sx={pickerStyles}>
                <DateRangePicker
                  rangeColors={["#16B364"]}
                  onChange={(item: any) => {
                    setState([item.selection]);
                  }}
                  moveRangeOnFirstSelection={false}
                  months={2}
                  ranges={state}
                  direction="horizontal"
                />
              </Box>
            </Scrollbar>
          </Box>
        </Card>
      </Box>
    </Modal>
  );
};
