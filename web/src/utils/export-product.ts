import { HOST } from "src/config";
import { useAuth } from "src/hooks/use-auth";
import { useUserType } from "src/hooks/use-user-type";
import { USER_TYPES } from "./constants";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function useExportAll(props: any) {
  const { user } = useAuth();
  const { userType } = useUserType();

  const { companyRef } = props;

  function exportCsv(url: string, type = "csv", name?: string) {
    // toast.success(
    //   "This feature is temporaily unavailble. Please try again later."
    // );
    // return;
    const todayDate = new Date();
    const formattedDate = format(todayDate, "dd-MM-yyyy");
    fetch(
      `${HOST}${url}${name === "global-products" ? "" : `?format=${type}`}${
        name !== "global-products" && userType === USER_TYPES.ADMIN
          ? `&companyRef=${user?.company?._id}`
          : ""
      }${
        name !== "global-products" && userType === USER_TYPES.SUPERADMIN
          ? `&companyRef=${companyRef || user?._id}`
          : ""
      }`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
        method: "GET",
      }
    )
      .then((response) => response.blob())
      .then((blob) => {
        const _url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = _url;
        link.download = `${name}-${formattedDate}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((err) => {
        console.log("err", err);
      });
  }
  return { exportCsv };
}
