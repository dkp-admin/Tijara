import { TijarahUtils } from "tijarah-utils";
import { create } from "zustand";
import serviceCaller from "../api";
import endpoint from "../api/endpoints";
import repository from "../db/repository";

type TimezoneValidator = {
  timezoneError: boolean;
  checkTimezone: () => Promise<void>;
  timezoneMismatchError: boolean;
  autoTimezoneError: boolean;
};

export const useTimezoneValidator = create<TimezoneValidator>((set) => ({
  timezoneError: false,
  autoTimezoneError: false,
  timezoneMismatchError: false,
  checkTimezone: async () => {
    try {
      let businessDetails: any = await repository.business.findAll();

      if (businessDetails[0]) {
        const query: any = {
          lastSyncAt: new Date(1970, 1, 1).toISOString(),
          page: 0,
          limit: 100,
          sort: "asc",
          activeTab: "all",
          companyRef: businessDetails[0]?.company?._id,
          locationRef: businessDetails[0]?.company?._id,
          businessTypeRef: businessDetails[0]?.company?.businessTypeRef,
        };

        const db = await serviceCaller(endpoint.businessDetailPull.path, {
          method: endpoint.businessDetailPull.method,
          query: query,
        });

        businessDetails = db?.results[0];
      }

      const isTimeAutomatic = await TijarahUtils.isTimeAutomatic();

      if (businessDetails[0]?.company?.timezone) {
        const timezone = [
          (await TijarahUtils.getCurrentTimeZone()).toLowerCase(),
        ]; // Asia/Kolkata Asia/Calcutta

        const neoleapTimezoneKolkata = "asia/kolkata";
        const neoleapTimezoneSaudi = "asia/riyadh";

        if (timezone[0] === "asia/calcutta") {
          timezone.push(neoleapTimezoneKolkata);
        }

        if (timezone[0] === "asia/kuwait") {
          timezone.push(neoleapTimezoneSaudi);
        }

        const isValid =
          timezone.includes(
            businessDetails[0]?.company?.timezone?.trim()?.toLowerCase()
          ) && isTimeAutomatic;

        if (!isTimeAutomatic) {
          set({ autoTimezoneError: true });
        } else set({ autoTimezoneError: false });

        if (
          !timezone.includes(
            businessDetails[0]?.company?.timezone?.trim()?.toLowerCase()
          )
        ) {
          set({ timezoneMismatchError: true });
        } else set({ timezoneMismatchError: false });

        if (isValid) {
          set({ timezoneError: false });
        } else set({ timezoneError: true });
      }
    } catch (error: any) {
      let businessDetails: any = await repository.business.findAll();

      const isTimeAutomatic = await TijarahUtils.isTimeAutomatic();

      if (businessDetails[0]?.company?.timezone) {
        const timezone = [
          (await TijarahUtils.getCurrentTimeZone()).toLowerCase(),
        ]; // Asia/Kolkata Asia/Calcutta

        const neoleapTimezoneKolkata = "asia/kolkata";
        const neoleapTimezoneSaudi = "asia/riyadh";

        if (timezone[0] === "asia/calcutta") {
          timezone.push(neoleapTimezoneKolkata);
        }

        if (timezone[0] === "asia/kuwait") {
          timezone.push(neoleapTimezoneSaudi);
        }

        const isValid =
          timezone.includes(
            businessDetails[0]?.company?.timezone?.trim()?.toLowerCase()
          ) && isTimeAutomatic;

        if (!isTimeAutomatic) {
          set({ autoTimezoneError: true });
        } else set({ autoTimezoneError: false });

        if (
          !timezone.includes(
            businessDetails[0]?.company?.timezone?.trim()?.toLowerCase()
          )
        ) {
          set({ timezoneMismatchError: true });
        } else set({ timezoneMismatchError: false });

        if (isValid) {
          set({ timezoneError: false });
        } else set({ timezoneError: true });
      }
      // showToast("error", error?.message);
    }
  },
}));
