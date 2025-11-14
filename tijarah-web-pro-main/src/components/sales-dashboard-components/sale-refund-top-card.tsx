import { Grid, useTheme } from "@mui/material";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useFindOne } from "src/hooks/use-find-one";
import { TotalRefundCard } from "./total-refund-card";
import { TotalSaleCard } from "./total-sale-card";
import { useEffect } from "react";
import { useAuth } from "src/hooks/use-auth";
import { useUserType } from "src/hooks/use-user-type";
import { USER_TYPES } from "src/utils/constants";
import { getReportDateTime } from "src/utils/get-report-date-time";

interface SaleRefundTopCardProps {
  companyRef: string;
  locationRef: string;
  startDate: Date;
  endDate: Date;
  startTime: Date;
  endTime: Date;
  businessHour: any;
  reportingHour: any;
  locationData: any;
  dayEndTime: any;
  locationEntity: any;
}

export const SaleRefundTopCard = ({
  companyRef,
  locationRef,
  startDate,
  endDate,
  startTime,
  endTime,
  businessHour,
  reportingHour,
  locationData,
  locationEntity,
  dayEndTime,
}: SaleRefundTopCardProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { userType } = useUserType();

  const userIsAdmin =
    user.userType === USER_TYPES.ADMIN ||
    user.userType === USER_TYPES.SUPERADMIN;

  const prevDate = new Date();
  prevDate.setDate(prevDate.getDate() - 1);

  const {
    findOne: findSalesStats,
    entity: salesData,
    loading: loadingSale,
  } = useFindOne("report/sales/stats");

  const getQuery = () => {
    const query: any = {
      _q: "",
      sort: "asc",
      activeTab: "all",
      page: 0,
      limit: 1000,
    };

    if (userType == USER_TYPES?.SUPERADMIN) {
      if (companyRef !== "all" && companyRef) {
        query["companyRef"] = companyRef;
      }
    } else {
      query["companyRef"] = user?.companyRef;
    }

    if (userIsAdmin) {
      if (locationRef !== "all" && locationRef) {
        query["locationRef"] = locationRef;
      }
    } else {
      query["locationRef"] = locationRef;
    }

    if (startDate && endDate) {
      const dateTime = getReportDateTime(
        startDate,
        endDate,
        startTime,
        endTime,
        reportingHour,
        businessHour,
        locationData?.qrOrderingConfiguration?.schedule ||
          locationEntity?.qrOrderingConfiguration?.schedule,
        locationData?.timeZone || locationEntity?.timeZone,
        dayEndTime,
        locationRef,
        locationData?.businessClosureSetting?.endStartReporting ||
          locationEntity?.businessClosureSetting?.endStartReporting
      );

      query["dateRange"] = { from: dateTime.from, to: dateTime.to };
    }

    return query;
  };

  useEffect(() => {
    if (companyRef || locationRef) {
      findSalesStats({
        ...getQuery(),
      });
    }
  }, [companyRef, locationRef]);

  return (
    <Grid container spacing={3} sx={{ mt: 0 }}>
      <Grid item lg={4} md={6} sm={12} sx={{ width: "100%" }}>
        <TotalSaleCard loading={loadingSale} stats={salesData} />
      </Grid>

      <Grid item lg={4} md={6} sm={12} sx={{ width: "100%" }}>
        <TotalRefundCard loading={loadingSale} stats={salesData} />
      </Grid>
    </Grid>
  );
};
