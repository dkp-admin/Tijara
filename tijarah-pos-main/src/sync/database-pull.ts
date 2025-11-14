import { endOfDay, startOfDay } from "date-fns";
import nextFrame from "next-frame";
import { EventRegister } from "react-native-event-listeners";
import { DataSource } from "typeorm";
import serviceCaller from "../api";
import endpoint from "../api/endpoints";
import { AdsManagementModel } from "../database/ads-management/ads-management";
import { BatchModel } from "../database/batch/batch";
import { BillingSettingsModel } from "../database/billing-settings/billing-settings";
import { BoxCratesModel } from "../database/box-crates/box-crates";
import { BusinessDetailsModel } from "../database/business-details/business-details";
import { CategoryModel } from "../database/category/category";
import { CollectionsModel } from "../database/collections/collections";
import { CustomChargeModel } from "../database/custom-charge/custom-charge";
import { CustomersModel } from "../database/customers/customers";
import { KitchenManagementModel } from "../database/kitchen-management/kitchen-management";
import { MenuModel } from "../database/menu/menu";
import { OrderModel } from "../database/order/order";
import { PrintTemplateModel } from "../database/print-template/print-template";
import { ProductModel } from "../database/product/product";
import { QuickItemsModel } from "../database/quick-items/quick-items";
import { SectionTablesModel } from "../database/section-tables/section-tables";
import { StockHistoryModel } from "../database/stock-history/stock-history";
import { VoidCompModel } from "../database/void-comp/void-comp";
import { queryClient } from "../query-client";
import MMKVDB from "../utils/DB-MMKV";
import { DBKeys } from "../utils/DBKeys";
import { repo as Repo, db } from "../utils/createDatabaseConnection";
import { debugLog } from "../utils/log-patch";

// Get start of day
const startOfTheDay = startOfDay(new Date());

// Get end of day
const endOfTheDay = endOfDay(new Date());

type EntityNames =
  | "products"
  | "category"
  | "collection"
  | "customer"
  | "business-details"
  | "orders"
  | "print-template"
  | "stock-history"
  | "batch"
  | "quick-items"
  | "custom-charge"
  | "billing-settings"
  | "ads-management"
  | "kitchen-management"
  | "section-tables"
  | "menu"
  | "void-comp"
  | "box-crates";

const models = {
  products: ProductModel,
  category: CategoryModel,
  collection: CollectionsModel,
  customer: CustomersModel,
  "business-details": BusinessDetailsModel,
  orders: OrderModel,
  "print-template": PrintTemplateModel,
  "stock-history": StockHistoryModel,
  batch: BatchModel,
  "quick-items": QuickItemsModel,
  "custom-charge": CustomChargeModel,
  "billing-settings": BillingSettingsModel,
  "ads-management": AdsManagementModel,
  "kitchen-management": KitchenManagementModel,
  "section-tables": SectionTablesModel,
  menu: MenuModel,
  "void-comp": VoidCompModel,
  "box-crates": BoxCratesModel,
};

export const DBKeysName: any = {
  products: DBKeys.PRODUCT_LAST_SYNCED_AT,
  category: DBKeys.CATEGORY_LAST_SYNCED_AT,
  collection: DBKeys.COLLECTION_LAST_SYNCED_AT,
  customer: DBKeys.CUSTOMER_LAST_SYNCED_AT,
  "business-details": DBKeys.BUSINESS_DETAIL_LAST_SYNCED_AT,
  orders: DBKeys.ORDER_LAST_SYNCED_AT,
  "print-template": DBKeys.PRINT_TEMPLATE_LAST_SYNCED_AT,
  "stock-history": DBKeys.STOCK_HISTORY_LAST_SYNCED_AT,
  batch: DBKeys.BATCH_LAST_SYNCED_AT,
  "quick-items": DBKeys.QUICK_ITEMS_LAST_SYNCED_AT,
  "custom-charge": DBKeys.CUSTOM_CHARGE_LAST_SYNCED_AT,
  "billing-settings": DBKeys.BILLING_SETTINGS_LAST_SYNCED_AT,
  "ads-management": DBKeys.ADS_MANAGEMENT_LAST_SYNCED_AT,
  "kitchen-management": DBKeys.KITCHEN_MANAGEMENT_LAST_SYNCED_AT,
  "section-tables": DBKeys.SECTION_TABLES_LAST_SYNCED_AT,
  menu: DBKeys.MENU_MANAGEMENT_LAST_SYNCED_AT,
  "void-comp": DBKeys.VOID_COMP_LAST_SYNCED_AT,
  "box-crates": DBKeys.BOX_CRATES_LAST_SYNCED_AT,
};

const APIEndpointName = {
  products: endpoint.productPull,
  category: endpoint.categoryPull,
  collection: endpoint.collectionPull,
  customer: endpoint.customerPull,
  "business-details": endpoint.businessDetailPull,
  orders: endpoint.orderPull,
  "print-template": endpoint.printTemplatePull,
  "stock-history": endpoint.stockHistoryPull,
  batch: endpoint.batchPull,
  "quick-items": endpoint.quickItemsPull,
  "custom-charge": endpoint.customChargePull,
  "billing-settings": endpoint.billingSettingsPull,
  "ads-management": endpoint.adsManagementPull,
  "kitchen-management": endpoint.kitchenManagementPull,
  "section-tables": endpoint.sectionTablesPull,
  menu: endpoint.menuPull,
  "void-comp": endpoint.voidCompPull,
  "box-crates": endpoint.boxCratesPull,
};

const invalidateQuery = {
  products: `find-product`,
  category: `find-category`,
  collection: `find-collections`,
  customer: `find-customer`,
  "business-details": `find-business-details`,
  promotion: `find-promotion`,
  orders: `find-order`,
  "print-template": `find-print-template`,
  "stock-history": `find-stock-history`,
  batch: `find-batch`,
  "quick-items": `find-quick-items`,
  "custom-charge": `find-custom-charge`,
  "billing-settings": `find-billing-settings`,
  "ads-management": `find-ads-management`,
  "kitchen-management": `find-kitchen-management`,
  "section-tables": `find-section-tables`,
  menu: `find-menu`,
  "void-comp": `find-void-comp`,
  "box-crates": `find-box-crates`,
};

export default class DatabasePull {
  private connection: DataSource;
  constructor() {
    this.connection = db;
  }

  getRepository(entityName: EntityNames) {
    const model = models[entityName];
    if (!model) {
      throw new Error(`Invalid entity name: ${entityName}`);
    }
    return this.connection.getRepository(model);
  }

  async fetchEntity(entityName: EntityNames) {
    let page = 0;
    let totalCount = 0;

    let lastSynced = MMKVDB.get(DBKeysName[entityName]);
    const deviceUserObject = MMKVDB.get(DBKeys.DEVICE);
    const companyRef = deviceUserObject.companyRef;
    const businessTypeRef = deviceUserObject?.company?.businessTypeRef;
    const locationRef = deviceUserObject?.locationRef;

    if (!lastSynced && entityName === "orders") {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - 30);
      currentDate.setHours(0, 0, 0, 0);
      const dateString = currentDate.toISOString();
      lastSynced = dateString;
    } else if (lastSynced && entityName === "orders") {
      const currentDate = new Date(lastSynced);
      currentDate.setMinutes(currentDate.getMinutes() - 3);
      const dateString = currentDate.toISOString();
      lastSynced = dateString;
    } else if (!lastSynced && entityName !== "orders")
      lastSynced = new Date(1970, 1, 1).toISOString();

    const repo = this.getRepository(entityName);

    let length = 0;

    do {
      const query: any = {
        lastSyncAt: lastSynced || new Date(1970, 1, 1).toISOString(),
        page: page,
        limit: 100,
        sort: entityName === "orders" ? "desc" : "asc",
        activeTab: "all",
        companyRef,
        locationRef,
        businessTypeRef,
        startOfDay: startOfTheDay.toISOString(),
        endOfDay: endOfTheDay.toISOString(),
      };

      debugLog(
        "got repo for pull entity name " + entityName,
        query,
        "sync-pull-db",
        "fetchEntityFunction"
      );

      const res = await serviceCaller(APIEndpointName[entityName].path, {
        method: APIEndpointName[entityName].method,
        query: query,
      });

      if (res.results?.length > 0) {
        if (entityName === "ads-management") {
          console.log("PULL SUCCESS");
          EventRegister.emit("ads:pull-success");
        }
        page = page + 1;
        totalCount = res.count || 0;
        length += res.results?.length;
        for (const data of res.results) {
          await nextFrame();
          db.manager.save(
            repo.create(
              entityName === "box-crates" || entityName === "kitchen-management"
                ? { ...data, source: "server" }
                : data
            )
          );
        }
      } else {
        break;
      }

      if (length > totalCount) {
        break;
      }

      if (entityName === "orders" && page === 50) {
        break;
      }
    } while (true);

    MMKVDB.set(DBKeysName[entityName], new Date().toISOString());

    debugLog(
      "PULL ENTITY FETCHED SUCCESSFULLY " + entityName,
      {},
      "sync-pull-db",
      "fetchEntityFunction"
    );

    await queryClient.invalidateQueries(invalidateQuery[entityName]);
  }

  async fetchProducts() {
    return this.fetchEntity("products");
  }

  async fetchCategory() {
    return this.fetchEntity("category");
  }

  async fetchCollection() {
    return this.fetchEntity("collection");
  }

  async fetchCustomer() {
    return this.fetchEntity("customer");
  }

  async fetchBusinessDetail() {
    return this.fetchEntity("business-details");
  }

  async fetchOrder() {
    return this.fetchEntity("orders");
  }

  async fetchPrintTemplate() {
    return this.fetchEntity("print-template");
  }

  async fetchStockHistory() {
    return this.fetchEntity("stock-history");
  }

  async fetchBatch() {
    return this.fetchEntity("batch");
  }

  async fetchQuickItems() {
    return this.fetchEntity("quick-items");
  }

  async fetchBillingSettings() {
    const deviceUserObject = MMKVDB.get(DBKeys.DEVICE);

    let lastSynced = MMKVDB.get("billing-settings");

    const companyRef = deviceUserObject.companyRef;
    const businessTypeRef = deviceUserObject?.company?.businessTypeRef;
    const locationRef = deviceUserObject?.locationRef;

    const query: any = {
      lastSyncAt: lastSynced || new Date(1970, 1, 1).toISOString(),
      page: 0,
      limit: 10000,
      sort: "asc",
      activeTab: "all",
      companyRef,
      locationRef,
      businessTypeRef,
    };

    const response = (await serviceCaller("/pull/device-config", {
      method: "GET",
      query: query,
    })) as any;

    const result = response.results[0];

    if (result) {
      const findSettings = await Repo.billingSettings.find({});
      const obj = {
        quickAmounts: result.quickAmount,
        catalogueManagement: result.catalogueManagement,
        paymentTypes: result.paymentTypes,
        orderTypesList: result.orderTypes,
        cardPaymentOption: result.cardPaymentOptions[0],
        defaultCompleteBtn: result.defaultComplete,
        defaultCash: parseFloat(result.startingCash || 0),
        noOfReceiptPrint: result.numberOfPrint.toString(),
        cashManagement: result.cashManagement,
        keypad: result.keypad,
        discounts: result.discounts,
        promotions: result.promotions,
        customCharges: result.customCharges,
      };

      db.manager.save(
        this.getRepository("billing-settings").create({
          _id: findSettings[0]._id,
          ...obj,
        })
      );

      MMKVDB.set("billing-settings", new Date().toISOString());

      await queryClient.invalidateQueries("find-billing-settings");
    }
  }

  async fetchCustomCharge() {
    return this.fetchEntity("custom-charge");
  }

  async fetchAdsManagement() {
    return this.fetchEntity("ads-management");
  }

  async fetchKitchenManagement() {
    return this.fetchEntity("kitchen-management");
  }

  async fetchSectionTables() {
    return this.fetchEntity("section-tables");
  }

  async fetchMenuManagement() {
    return this.fetchEntity("menu");
  }

  async fetchVoidComp() {
    return this.fetchEntity("void-comp");
  }

  async fetchBoxCrates() {
    return this.fetchEntity("box-crates");
  }

  async fetchAllEntities() {
    await this.fetchProducts();
    await this.fetchCategory();
    await this.fetchCollection();
    await this.fetchCustomer();
    await this.fetchBusinessDetail();
    await this.fetchOrder();
    await this.fetchPrintTemplate();
    await this.fetchBatch();
    await this.fetchQuickItems();
    await this.fetchCustomCharge();
    await this.fetchBillingSettings();
    await this.fetchAdsManagement();
    await this.fetchKitchenManagement();
    await this.fetchSectionTables();
    await this.fetchMenuManagement();
    await this.fetchVoidComp();
    await this.fetchBoxCrates();
    await this.fetchStockHistory();
  }
}
