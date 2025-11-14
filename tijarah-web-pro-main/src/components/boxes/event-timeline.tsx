import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useTranslation } from "react-i18next";
import CategoryIcon from "@mui/icons-material/Category";
import NorthIcon from "@mui/icons-material/North";
import SouthIcon from "@mui/icons-material/South";
import { Box, useTheme } from "@mui/material";
import Crate from "src/icons/crate";
import Boxes from "src/icons/box";

export function EventsTimeline({ events, data }: any) {
  return (
    <Timeline
      sx={{
        mt: 0,
        "& .MuiTimelineItem-root": { "&::before": { display: "none" } },
        "& .MuiTimelineSeparator-root": { minWidth: "unset" },
        "& .MuiTimelineDot-root": {
          background: "transparent",
          border: 0,
          p: 0,
        },
        "& .MuiTimelineConnector-root": { minHeight: "50px" },
      }}>
      {events.map((event: any, index: number) => (
        <TimelineItem key={event.id}>
          <EventContent
            connector={index !== events.length - 1}
            event={event}
            data={data}
          />
        </TimelineItem>
      ))}
    </Timeline>
  );
}

interface EventContentProps {
  connector?: boolean;
  event: Event;
  data: any;
}

function EventContent({ connector, event, data }: EventContentProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  if (event.type === "product") {
    return (
      <React.Fragment>
        <TimelineSeparator>
          <TimelineDot>
            <Avatar>
              <CategoryIcon />
            </Avatar>
          </TimelineDot>
          {connector ? <SouthIcon fontSize="large" /> : null}
        </TimelineSeparator>
        <TimelineContent>
          <Typography variant="subtitle2">{`${t("Goes to")} ${
            data?.product[0]?.name?.en || ""
          }, Qty: ${data?.qty}`}</Typography>
          <Typography color="text.secondary" variant="caption"></Typography>
        </TimelineContent>
      </React.Fragment>
    );
  }

  if (event.type === "box") {
    return (
      <React.Fragment>
        <TimelineSeparator>
          <TimelineDot>
            <Avatar>
              <Boxes />
            </Avatar>
          </TimelineDot>

          <Box>
            <NorthIcon fontSize="large" />
          </Box>
        </TimelineSeparator>
        <TimelineContent>
          <Typography variant="subtitle2">{`${t("Goes to")} ${
            data?.name?.en
          }, Qty: ${"Box quantity"}`}</Typography>
        </TimelineContent>
      </React.Fragment>
    );
  }

  if (event.type === "crate") {
    return (
      <React.Fragment>
        <TimelineSeparator>
          <TimelineDot>
            <Avatar>
              <Crate color={"#000"} />
            </Avatar>
          </TimelineDot>
          {connector ? <NorthIcon fontSize="large" /> : null}
        </TimelineSeparator>
        <TimelineContent>
          <Typography variant="subtitle2">{`${t("Crate: ")} ${t(
            "CrateName"
          )}, Qty: ${"Crate quantity"}`}</Typography>
          <Typography color="text.secondary" variant="caption">
            {/* {createdAt} */}
          </Typography>
        </TimelineContent>
      </React.Fragment>
    );
  }

  return null;
}
