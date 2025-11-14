import { toast } from "react-hot-toast";
import { USER_TYPES } from "src/utils/constants";
import { useAuth } from "./use-auth";
import { useUserType } from "./use-user-type";
import { HOST } from "src/config";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export default function useImport(props: any) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { importEntity, companyRef } = props;
  const { userType } = useUserType();
  const [response, setResponse] = useState<any>();

  async function importCsv(file: any) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (userType == USER_TYPES.ADMIN) {
        formData.append("companyRef", user.company?._id);
      } else if (userType == USER_TYPES.SUPERADMIN) {
        formData.append("companyRef", companyRef);
      } else {
        formData.append("companyRef", user.company?._id);
      }
      const token = localStorage.getItem("accessToken");
      fetch(`${HOST}/csv-import/${importEntity}`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((result) => {
          return setResponse(result);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } catch (error) {
      toast.error("Import Failed");
    }
  }
  return { importCsv, response };
}
