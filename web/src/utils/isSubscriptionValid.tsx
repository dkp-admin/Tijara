import { differenceInDays, isAfter, parseISO } from "date-fns";

export function isSubscriptionValid(expiryDate: any): boolean {
  const newExpiryDate = parseISO(expiryDate);
  const today = new Date();

  const daysDifference = differenceInDays(newExpiryDate, today);
  const isNotExpired = isAfter(newExpiryDate, today);
  return daysDifference >= 0 && isNotExpired;
}
