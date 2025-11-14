import { useRouter } from "next/router";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "src/hooks/use-auth";
import { usePageView } from "src/hooks/use-page-view";
import { tijarahPaths } from "src/paths";
import type { Page as PageType } from "src/types/page";
import { ERRORS } from "src/utils/errors";

const Authorize: PageType = () => {
  const router = useRouter();
  const { authorize } = useAuth();
  const { redirectURL, phone, pos_id } = router.query;

  const authenticatePOS = async () => {
    try {
      let phoneNumber = phone?.toString()?.trimStart();

      const res = await authorize(pos_id?.toString(), `+${phoneNumber}`);

      if (res.token && res.user) {
        if (redirectURL?.toString() === "vendor") {
          window.location.replace(
            tijarahPaths.inventoryManagement.vendor.index
          );
        } else if (redirectURL?.toString() === "purchase-order") {
          window.location.replace(
            tijarahPaths.inventoryManagement.purchaseOrder.index
          );
        } else if (redirectURL?.toString() === "orders") {
          window.location.replace(tijarahPaths.orders);
        } else if (redirectURL?.toString() === "/reports/summary") {
          window.location.replace(tijarahPaths.reports.salesSummaryReport);
        } else if (redirectURL?.toString() === "/reports/shifts-cash-drawer") {
          window.location.replace(
            tijarahPaths.reports.shiftsAndCashDrawerReport
          );
        } else if (redirectURL?.toString() === "/reports/sales") {
          window.location.replace(tijarahPaths.reports.salesReport);
        } else {
          window.location.replace(tijarahPaths.inventoryManagement.history);
        }
      }
    } catch (err) {
      if (err?.code == "not_found") {
        toast.error(ERRORS.USER_NOT_FOUND);
      } else if (err?.code == "bad_password") {
        toast.error(ERRORS.INVALID_PASSWORD);
      } else if (err.code == "user_inactive") {
        toast.error(ERRORS.USER_INACTIVE);
      } else {
        toast.error(JSON.stringify(err));
      }
    }
  };

  usePageView();

  useEffect(() => {
    if (phone?.toString()?.length > 0 && pos_id?.toString()?.length > 0) {
      authenticatePOS();
    }
  }, [phone, pos_id]);

  return <></>;
};

export default Authorize;
