import {
  addDays,
  endOfDay,
  format,
  isAfter,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";
import { DateTime } from "luxon";
import { getAdjustedTimeRange } from "./get-time";

export const getReportDateTime = (
  startDate: Date,
  endDate: Date,
  startTime: Date,
  endTime: Date,
  reportingHour: any,
  businessHour?: boolean,
  schedule?: any[],
  locationTimeZone?: string,
  dayEndTime?: any,
  locationRef?: string,
  endStartReporting?: boolean
) => {
  if (reportingHour?.startTime && reportingHour?.endTime) {
    const startTime = reportingHour.startTime;
    const endTime = reportingHour.endTime;
    const createdStartTime = reportingHour?.createdStartTime
      ? reportingHour.createdStartTime
      : format(new Date(startTime), "h:mm a");
    const createdEndTime = reportingHour?.createdEndTime
      ? reportingHour.createdEndTime
      : format(new Date(endTime), "h:mm a");
    const timeZone = reportingHour.timezone?.split(",");

    const fromDate = new Date(startDate);

    const startHours = new Date(startTime).getHours();
    const startMinutes = new Date(startTime).getMinutes();
    const startSeconds = new Date(startTime).getSeconds();

    fromDate.setHours(startHours);
    fromDate.setMinutes(startMinutes);
    fromDate.setSeconds(startSeconds);

    let toDate = new Date(endDate);

    const endHours = new Date(endTime).getHours();
    const endMinutes = new Date(endTime).getMinutes();
    const endSeconds = new Date(endTime).getSeconds();

    toDate.setHours(endHours);
    toDate.setMinutes(endMinutes);
    toDate.setSeconds(endSeconds);

    const start = setMinutes(setHours(fromDate, startHours), startMinutes);
    const end = setMinutes(setHours(fromDate, endHours), endMinutes);

    if (isAfter(start, end)) {
      toDate = addDays(endDate, 1);
    }

    const startDateString = format(new Date(fromDate), "dd MMM yyyy");
    const endDateString = format(new Date(toDate), "dd MMM yyyy");

    const { UTCFromDate, UTCToDate } = convertToUTC(
      startDateString,
      endDateString,
      createdStartTime,
      createdEndTime,
      timeZone?.[1]?.trim()
    );

    return {
      from: UTCFromDate,
      to: UTCToDate,
    };
  } else if (businessHour && schedule?.length > 0) {
    const { startTime, endTime } = getAdjustedTimeRange(schedule);

    const timeZone = locationTimeZone?.split(",");

    const fromDate = new Date(startDate);

    const startHours = new Date(startTime).getHours();
    const startMinutes = new Date(startTime).getMinutes();
    const startSeconds = new Date(startTime).getSeconds();

    fromDate.setHours(startHours);
    fromDate.setMinutes(startMinutes);
    fromDate.setSeconds(startSeconds);

    let toDate = new Date(endDate);

    const d = new Date(toDate);
    d.setDate(d.getDate() + 1);
    toDate = d;

    const endHours = new Date(endTime).getHours();
    const endMinutes = new Date(endTime).getMinutes();
    const endSeconds = new Date(endTime).getSeconds();

    toDate.setHours(endHours);
    toDate.setMinutes(endMinutes);
    toDate.setSeconds(endSeconds);

    const startDateTimeUTC = DateTime.fromISO(startTime, {
      zone: "utc",
    });
    const endDateTimeUTC = DateTime.fromISO(endTime, {
      zone: "utc",
    });

    const startDateTimeInZone = startDateTimeUTC.setZone(timeZone?.[1]?.trim());
    const endDateTimeInZone = endDateTimeUTC.setZone(timeZone?.[1]?.trim());

    const startDateString = format(new Date(fromDate), "dd MMM yyyy");
    const endDateString = format(new Date(toDate), "dd MMM yyyy");
    const startTimeString = startDateTimeInZone.toFormat("h:mm a");
    const endTimeString = endDateTimeInZone.toFormat("h:mm a");

    const { UTCFromDate, UTCToDate } = convertToUTC(
      startDateString,
      endDateString,
      startTimeString,
      endTimeString,
      timeZone?.[1]?.trim()
    );

    return { from: UTCFromDate, to: UTCToDate };
  } else if (
    endStartReporting &&
    dayEndTime?.startDate &&
    dayEndTime?.endDate &&
    locationRef !== "all"
  ) {
    const startTime = dayEndTime.startDate;
    const endTime = dayEndTime.endDate;

    const fromDate = new Date(startDate);

    const startHours = new Date(startTime).getHours();
    const startMinutes = new Date(startTime).getMinutes();
    const startSeconds = new Date(startTime).getSeconds();

    fromDate.setHours(startHours);
    fromDate.setMinutes(startMinutes);
    fromDate.setSeconds(startSeconds);

    let toDate = new Date(endDate);

    const start = Number(
      `${new Date(startTime).getHours()}${new Date(startTime).getMinutes()}`
    );

    const end = Number(
      `${new Date(endTime).getHours()}${new Date(endTime).getMinutes()}`
    );

    if (end < start) {
      const d = new Date(toDate);
      d.setDate(d.getDate() + 1);
      toDate = d;
    }

    const endHours = new Date(endTime).getHours();
    const endMinutes = new Date(endTime).getMinutes();
    const endSeconds = new Date(endTime).getSeconds();

    toDate.setHours(endHours);
    toDate.setMinutes(endMinutes);
    toDate.setSeconds(endSeconds);

    return { from: fromDate, to: toDate };
  } else {
    const fromDate = startOfDay(startDate);
    const toDate = endOfDay(endDate);
    const timeZone = locationTimeZone?.split(",");

    const startDateString = format(new Date(fromDate), "dd MMM yyyy");
    const endDateString = format(new Date(toDate), "dd MMM yyyy");
    const startTimeString = "12:00 AM";
    const endTimeString = "11:59 PM";

    if (timeZone?.length > 0) {
      const { UTCFromDate, UTCToDate } = convertToUTC(
        startDateString,
        endDateString,
        startTimeString,
        endTimeString,
        timeZone?.[1]?.trim()
      );

      return {
        from: UTCFromDate,
        to: UTCToDate,
      };
    } else {
      return { from: startOfDay(startDate), to: endOfDay(endDate) };
    }
  }
};

export function convertToUTC(
  startDateString: string,
  endDateString: string,
  startTimeString: string,
  endTimeString: string,
  timeZone: string
): { UTCFromDate: string; UTCToDate: string } {
  const startUTC = DateTime.fromFormat(
    `${startDateString} ${startTimeString}`,
    "dd MMM yyyy h:mm a",
    { zone: timeZone }
  );

  const endUTC = DateTime.fromFormat(
    `${endDateString} ${endTimeString}`,
    "dd MMM yyyy h:mm a",
    { zone: timeZone }
  );

  if (!startUTC.isValid) {
    console.log(`Invalid date/time format: ${startUTC.invalidExplanation}`);
    return { UTCFromDate: "", UTCToDate: "" };
  }

  if (!endUTC.isValid) {
    console.log(`Invalid date/time format: ${endUTC.invalidExplanation}`);
    return { UTCFromDate: "", UTCToDate: "" };
  }

  const UTCFromDate = startUTC.toUTC().toISO();
  const UTCToDate = endUTC.toUTC().toISO();

  return { UTCFromDate, UTCToDate };
}
