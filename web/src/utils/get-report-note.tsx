import i18n from "src/i18n";

export const note = (data: any, reportingId: string) => {
  if (data?.businessTime && !reportingId) {
    return `${i18n.t(
      "The report being shown is based on location's business hours and time zone."
    )}`;
  } else if (data?.endStartReporting && !reportingId) {
    return `${i18n.t(
      "The report being shown is based on End at business day settings."
    )}`;
  } else if (reportingId?.length > 0) {
    return `${i18n.t("The report being shown is based on Reporting hours")}`;
  } else {
    return `${i18n.t(
      "The report being shown is based on your current time zone (12:00 AM - 11:59 PM)"
    )}`;
  }
};
