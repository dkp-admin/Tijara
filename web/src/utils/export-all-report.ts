import { HOST } from "src/config";
import qs from "qs";
import { format } from "date-fns";
import toast from "react-hot-toast";

const exportAllReport = (
  url: string,
  query: any,
  name?: string,
  startDate?: Date,
  endDate?: Date
) => {
  // toast.success(
  //   "This fearure is temporaily unavailble. please try again later."
  // );
  // return;
  const exportQuery = qs.stringify({ ...query });
  const formattedendDate = format(endDate, "dd-MM-yyyy");
  const formattedstartDate = format(startDate, "dd-MM-yyyy");

  fetch(`${HOST}${url}?${exportQuery}&export=true&max=1000`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
    },
  })
    .then((response) => response.blob())
    .then((blob) => {
      const _url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = _url;
      link.download = `${name}-${
        formattedstartDate === formattedendDate
          ? formattedstartDate
          : `${`${formattedstartDate}-${formattedendDate}`}`
      }`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch((err) => {
      console.log(err);
    });
};

export default exportAllReport;
