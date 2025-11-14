import { format } from "date-fns";

export function generateGreetings() {
  var currentHour = Number(format(new Date(), "HH"));
  if (currentHour >= 4 && currentHour < 12) {
    return "Good Morning!";
  } else if (currentHour >= 12 && currentHour < 16) {
    return "Good Afternoon!";
  } else {
    return "Good Evening!";
  }
}
