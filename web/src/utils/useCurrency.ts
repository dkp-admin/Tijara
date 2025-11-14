import React from "react";
import { CompanyContext } from "src/contexts/company-context";
import { useAuth } from "src/hooks/use-auth";

export const useCurrency = () => {
  const { user } = useAuth() as any;
  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";
  const companyContext = React.useContext(CompanyContext) as any;

  if (
    (companyContext?.currency === "SAR" || user?.company?.currency === "SAR") &&
    isRTL
  )
    return "ريال";

  return companyContext?.currency || user?.company?.currency || "SAR";
};
