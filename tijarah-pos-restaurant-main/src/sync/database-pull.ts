import { endOfDay, startOfDay } from "date-fns";
import nextFrame from "next-frame";
import { InteractionManager } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import serviceCaller from "../api";
import endpoint from "../api/endpoints";
import repository from "../db/repository";
import { BillingSettings } from "../db/schema/billing-settings";
import { queryClient } from "../query-client";
import { useTimezoneValidator } from "../store/timezone-validator";
import { logError, logInfo } from "../utils/axiom-logger";
import MMKVDB from "../utils/DB-MMKV";
import { DBKeys } from "../utils/DBKeys";
import { useCurrency } from "../store/get-currency";
import { useSubscription } from "../store/subscription-store";

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
  | "box-crates"
  | "order-number-sequence";

const repositoryMapping: Record<EntityNames, keyof typeof repository> = {
  products: "productRepository",
  category: "categoryRepository",
  collection: "collectionRepository",
  customer: "customerRepository",
  "business-details": "business",
  orders: "orderRepository",
  "print-template": "printTemplateRepository",
  "stock-history": "stockHistoryRepository",
  batch: "batchRepository",
  "quick-items": "quickItemRepository",
  "custom-charge": "customChargeRepository",
  "billing-settings": "billing",
  "ads-management": "adManagementRepository",
  "kitchen-management": "kitchenManagementRepository",
  "section-tables": "sectionTableRepository",
  menu: "menuRepository",
  "void-comp": "voidCompRepository",
  "box-crates": "boxCratesRepository",
  "order-number-sequence": "orderNumberSequenceRepository",
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
  "order-number-sequence": DBKeys.ORDER_SEQUENCE_LAST_SYNCED_AT,
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
  "order-number-sequence": endpoint.orderNumberSequencePull,
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
  "order-number-sequence": `find-order-number-sequence`,
};

class DatabasePull {
  getRepository(entityName: EntityNames) {
    const repositoryKey = repositoryMapping[entityName];
    if (!repositoryKey) {
      throw new Error(`Invalid entity name: ${entityName}`);
    }
    return repository[repositoryKey];
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
      await this.yieldToMain();
      const query: any = {
        lastSyncAt: lastSynced || new Date(1970, 1, 1).toISOString(),
        page: page,
        limit: 1000,
        sort: entityName === "orders" ? "desc" : "asc",
        activeTab: "all",
        companyRef,
        locationRef,
        businessTypeRef,
        startOfDay: startOfTheDay.toISOString(),
        endOfDay: endOfTheDay.toISOString(),
        deviceRef: deviceUserObject?.deviceRef,
      };

      logInfo(`[DatabasePull][${entityName}] Query`, query);

      const res = await serviceCaller(APIEndpointName[entityName].path, {
        method: APIEndpointName[entityName].method,
        query: query,
      });

      logInfo(`[DatabasePull][${entityName}] Response`, {
        data: JSON.stringify(res),
      });

      if (res.results?.length > 0) {
        if (entityName === "ads-management") {
          console.log("PULL SUCCESS");
          EventRegister.emit("ads:pull-success");
        }

        if (entityName === "business-details") {
          MMKVDB.set(DBKeys.BUSINESS_DETAILS, res.results[0]);
        }

        page = page + 1;
        totalCount = res.count || 0;
        length += res.results?.length;

        try {
          logInfo(
            `[DatabasePull][${entityName}] initiating batch ops on local db`,
            {}
          );
          console.log("db pull started", entityName);

          const dataToInsert = res.results.map((data: any) =>
            entityName === "box-crates" || entityName === "kitchen-management"
              ? { ...data, source: "server" }
              : entityName === "business-details"
              ? { ...data?.[0], source: "server" }
              : { ...data, source: "server" }
          );

          console.log("db pull started", dataToInsert.length);
          if (entityName === "customer") {
            console.log(dataToInsert, "INSERTED DATA");
          }
          await repo.createMany(dataToInsert);
          console.log("pull success");
          logInfo(`[DatabasePull][${entityName}] success`, {});
        } catch (error) {
          logError(
            `[DatabasePull][${entityName}] error`,
            JSON.stringify(error)
          );
          console.log("pull error", JSON.stringify(error));
        }

        if (entityName === "business-details") {
          useTimezoneValidator.getState().checkTimezone();
          useCurrency.getState().setCurrency();
          useSubscription.getState().fetchSubscription();
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

    if (length > 0) {
      await queryClient.invalidateQueries(invalidateQuery[entityName]);
    }

    MMKVDB.set(DBKeysName[entityName], new Date().toISOString());
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
    try {
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

      logInfo(`[DatabasePull][billing-settings] Query`, query);

      const response = (await serviceCaller("/pull/device-config", {
        method: "GET",
        query: query,
      })) as any;

      const result = response.results[0];

      if (result) {
        const billingSettings = new BillingSettings({
          _id: locationRef,
          quickAmounts: result.quickAmount,
          catalogueManagement: result.catalogueManagement,
          paymentTypes: result.paymentTypes,
          orderTypesList: result.orderTypes,
          cardPaymentOption: result.cardPaymentOptions[0],
          defaultCompleteBtn: result.defaultComplete,
          defaultCash: parseFloat(result.startingCash || "0"),
          noOfReceiptPrint: result.numberOfPrint.toString(),
          cashManagement: result.cashManagement,
          keypad: result.keypad,
          discounts: result.discounts,
          promotions: result.promotions,
          customCharges: result.customCharges,
          terminalId: result?.terminalId,
        });

        logInfo(
          `[DatabasePull][billing-settings] intiating ops on local db`,
          {}
        );

        // Use the repository to create/save the settings
        await repository.billing.create(billingSettings);

        logInfo(`[DatabasePull][billing-settings] success`, {});

        MMKVDB.set("billing-settings", new Date().toISOString());

        await queryClient.invalidateQueries("find-billing-settings");
      }
    } catch (error) {
      logError(`[DatabasePull][billing-settings] error`, error);
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

  async fetchOrderSequences() {
    return this.fetchEntity("order-number-sequence");
  }

  async fetchVoidComp() {
    return this.fetchEntity("void-comp");
  }

  async fetchBoxCrates() {
    return this.fetchEntity("box-crates");
  }

  private async yieldToMain(): Promise<void> {
    return new Promise((resolve) => {
      InteractionManager.runAfterInteractions(async () => {
        // Use nextFrame to ensure we yield to the main thread
        await nextFrame();
        resolve();
      });
    });
  }

  async fetchAllEntities() {
    console.log("fetchAllEntities called");

    // Group entities by priority
    const highPriorityEntities = [
      { name: "Business Details", fetch: () => this.fetchBusinessDetail() },
      { name: "Billing Settings", fetch: () => this.fetchBillingSettings() },
      { name: "Products", fetch: () => this.fetchProducts() },
      { name: "Orders", fetch: () => this.fetchOrder() },
      { name: "Order Configuration", fetch: () => this.fetchOrderSequences() },
    ];

    const mediumPriorityEntities = [
      { name: "Categories", fetch: () => this.fetchCategory() },
      { name: "Collections", fetch: () => this.fetchCollection() },
      { name: "Customers", fetch: () => this.fetchCustomer() },
      { name: "Quick Items", fetch: () => this.fetchQuickItems() },
      {
        name: "Kitchen Management",
        fetch: () => this.fetchKitchenManagement(),
      },
      { name: "Menu Management", fetch: () => this.fetchMenuManagement() },
    ];

    const lowPriorityEntities = [
      { name: "Print Templates", fetch: () => this.fetchPrintTemplate() },
      { name: "Batch", fetch: () => this.fetchBatch() },
      { name: "Custom Charges", fetch: () => this.fetchCustomCharge() },
      { name: "Ads Management", fetch: () => this.fetchAdsManagement() },
      { name: "Section Tables", fetch: () => this.fetchSectionTables() },
      { name: "Void Comp", fetch: () => this.fetchVoidComp() },
      { name: "Box Crates", fetch: () => this.fetchBoxCrates() },
      { name: "Stock History", fetch: () => this.fetchStockHistory() },
    ];

    // Process each priority group
    const processGroup = async (
      entities: { name: string; fetch: () => Promise<void> }[]
    ) => {
      for (const entity of entities) {
        try {
          console.log(`Fetching ${entity.name}...`);
          await entity.fetch();
          await this.yieldToMain();
        } catch (error) {
          console.error(`Error fetching ${entity.name}:`, error);
        }
      }
    };

    try {
      await processGroup(highPriorityEntities);
      await new Promise((resolve) => setTimeout(resolve, 100));
      await processGroup(mediumPriorityEntities);
      await new Promise((resolve) => setTimeout(resolve, 100));
      await processGroup(lowPriorityEntities);

      console.log("All entities fetched successfully");
    } catch (error) {
      console.error("Error in fetchAllEntities:", error);
      throw error;
    }
  }
}

export default new DatabasePull();
