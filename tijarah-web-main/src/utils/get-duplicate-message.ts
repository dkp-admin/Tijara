import { t } from "i18next";

export default function getDuplicateErrorMsg(error: any) {
  const field = error?._err?.field?.split(".");

  return `${t("A record with")} ${field[field?.length - 1]
    ?.replace(/([a-z])([A-Z])/g, "$1 $2")
    ?.toLowerCase()} ${t("already exists")}.`;
}
