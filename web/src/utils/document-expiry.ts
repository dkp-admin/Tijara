import { differenceInDays } from "date-fns";

export const documentExpiry = (expiryDate: any) => {
  const date = new Date();
  date.setHours(0, 0, 0);
  const docDate = new Date(expiryDate);
  docDate.setHours(0, 0, 0);

  if (differenceInDays(docDate, date) >= 0) return true;
  else return false;
};
