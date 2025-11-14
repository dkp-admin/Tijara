export const getStartEndOfDay = () => {
  const currentDate = new Date();

  // Set the time to the start of the day
  const startOfDay = new Date(
    Date.UTC(
      currentDate.getUTCFullYear(),
      currentDate.getUTCMonth(),
      currentDate.getUTCDate()
    )
  );

  // Set the time to the end of the day
  const endOfDay = new Date(
    Date.UTC(
      currentDate.getUTCFullYear(),
      currentDate.getUTCMonth(),
      currentDate.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );

  return { startOfDay, endOfDay };
};
