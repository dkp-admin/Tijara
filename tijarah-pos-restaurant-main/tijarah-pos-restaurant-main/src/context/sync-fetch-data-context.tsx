import React, { useEffect } from "react";
import { EventRegister } from "react-native-event-listeners";
import EntityNames from "../types/entity-name";
import MMKVDB from "../utils/DB-MMKV";
import { DBKeys } from "../utils/DBKeys";

const pullFromServer: any = {
  products: EntityNames.ProductsPull,
  categories: EntityNames.CategoryPull,
  collections: EntityNames.CollectionPull,
  customers: EntityNames.CustomerPull,
  companies: EntityNames.BusinessDetailsPull,
  locations: EntityNames.BusinessDetailsPull,
  orders: EntityNames.OrdersPull,
  printtemplates: EntityNames.PrintTemplatePull,
  stockhistories: EntityNames.StockHistoryPull,
  batches: EntityNames.BatchPull,
  quickitems: EntityNames.QuickItemsPull,
  billingSettings: EntityNames.BillingSettingsPull,
  adsManagement: EntityNames.AdsManagementPull,
};

const DBKeysName: any = {
  products: DBKeys.PRODUCT_LAST_SYNCED_AT,
  categories: DBKeys.CATEGORY_LAST_SYNCED_AT,
  collections: DBKeys.COLLECTION_LAST_SYNCED_AT,
  customers: DBKeys.CUSTOMER_LAST_SYNCED_AT,
  companies: DBKeys.BUSINESS_DETAIL_LAST_SYNCED_AT,
  locations: DBKeys.BUSINESS_DETAIL_LAST_SYNCED_AT,
  orders: DBKeys.ORDER_LAST_SYNCED_AT,
  printtemplates: DBKeys.PRINT_TEMPLATE_LAST_SYNCED_AT,
  stockhistories: DBKeys.STOCK_HISTORY_LAST_SYNCED_AT,
  batches: DBKeys.BATCH_LAST_SYNCED_AT,
  quickitems: DBKeys.QUICK_ITEMS_LAST_SYNCED_AT,
  billingSettings: DBKeys.BILLING_SETTINGS_LAST_SYNCED_AT,
  adsManagement: DBKeys.ADS_MANAGEMENT_LAST_SYNCED_AT,
};

export const SyncDataWrapper = ({ data }: any) => {
  useEffect(() => {
    (async () => {
      if (data?.action) {
        data?.entities?.map(async (entity: string) => {
          if (Object.keys(DBKeysName).includes(entity)) {
            MMKVDB.set(DBKeysName[entity], new Date(1970, 1, 1).toISOString());
            EventRegister.emit("sync:enqueue", {
              entityName: pullFromServer[entity],
            });
          }
        });
      }
    })();
  }, [data]);

  return <></>;
};
