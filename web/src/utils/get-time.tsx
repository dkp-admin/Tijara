import { parseISO, compareAsc, compareDesc } from "date-fns";

interface TimeRange {
  startTime: string;
  endTime: string;
}

export const getStartAndEndTime = (
  timeRanges: TimeRange[]
): { startTime: string; endTime: string } => {
  if (timeRanges.length === 0) {
    throw new Error("The array should not be empty");
  }

  const sortedByStartTime = timeRanges.sort((a, b) =>
    compareAsc(parseISO(a.startTime), parseISO(b.startTime))
  );
  const sortedByEndTime = timeRanges.sort((a, b) =>
    compareDesc(parseISO(a.endTime), parseISO(b.endTime))
  );

  return {
    startTime: sortedByStartTime[0].startTime,
    endTime: sortedByEndTime[0].endTime,
  };
};

export function getExtremeTimes(times: any) {
  if (!Array.isArray(times) || times.length === 0) {
    return null;
  }

  let minStartTime = new Date(times[0].startTime);
  let maxEndTime = new Date(times[0].endTime);

  times.forEach((time) => {
    let startTime = new Date(time.startTime);
    let endTime = new Date(time.endTime);

    if (startTime < minStartTime) {
      minStartTime = startTime;
    }

    if (endTime > maxEndTime) {
      maxEndTime = endTime;
    }
  });

  return {
    startTime: minStartTime.toISOString(),
    endTime: maxEndTime.toISOString(),
  };
}

export function getAdjustedTimeRange(timeArray: any) {
  // Get the startTime of the first element from array
  const startTime = new Date(timeArray[0].startTime);

  // Calculate the new start time as one minute after the last end time
  const newEndTime = new Date(startTime.getTime() - 1 * 60 * 1000); // Substract 1 minute in milliseconds

  // Convert the newStartTime and lastEndTime back to ISO strings
  return {
    startTime: startTime.toISOString(),
    endTime: newEndTime.toISOString(),
  };
}
