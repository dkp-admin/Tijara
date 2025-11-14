import { useContext } from "react";
import { CompanyContext } from "src/contexts/company-context";
import { USER_TYPES } from "src/utils/constants";
import { useAuth } from "./use-auth";

export const useCompanyRef = () => {
  const companyContext = useContext<any>(CompanyContext);

  const { user } = useAuth();

  return user.userType === USER_TYPES.SUPERADMIN
    ? companyContext._id
    : user.companyRef;
};
