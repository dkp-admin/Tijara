export const truncateString = (
  str: string | undefined,
  num: number
): string => {
  if (str && str.length > num) {
    return str.slice(0, num) + "...";
  } else {
    return str || ""; // Return an empty string if str is undefined or null
  }
};
