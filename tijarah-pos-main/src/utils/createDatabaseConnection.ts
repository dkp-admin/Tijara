import * as driver from "expo-sqlite-storage";
import { DataSource } from "typeorm";
import { AdsManagementModel } from "../database/ads-management/ads-management";
import { AdsReportModel } from "../database/ads-management/ads-report";
import { BatchModel } from "../database/batch/batch";
import { BillingSettingsModel } from "../database/billing-settings/billing-settings";
import { BoxCratesModel } from "../database/box-crates/box-crates";
import { BusinessDetailsModel } from "../database/business-details/business-details";
import { CashDrawerTransactionModel } from "../database/cash-drawer-transaction/cash-drawer-txn";
import { CategoryModel } from "../database/category/category";
import { CheckRequestModel } from "../database/check-request/check-request";
import { CollectionsModel } from "../database/collections/collections";
import { CustomChargeModel } from "../database/custom-charge/custom-charge";
import { CustomersModel } from "../database/customers/customers";
import { KitchenManagementModel } from "../database/kitchen-management/kitchen-management";
import { LogsModel } from "../database/logs/logs";
import { MenuModel } from "../database/menu/menu";
import { CreateCategoryTable1688722113496 } from "../database/migrations/1688722113496-CreateCategoryTable";
import { CreateProductTable1688723113423 } from "../database/migrations/1688723113423-CreateProductTable";
import { CreateCashDrawerTxnTable1688723170826 } from "../database/migrations/1688723170826-CreateCashDrawerTxnTable";
import { CreateBillingSettingsTable1688723186565 } from "../database/migrations/1688723186565-CreateBillingSettingsTable";
import { CreateBusinessDetailsTable1688723198994 } from "../database/migrations/1688723198994-CreateBusinessDetailsTable";
import { CreateCheckRequestTable1688723213098 } from "../database/migrations/1688723213098-CreateCheckRequestTable";
import { CreateCollectionsTable1688723227790 } from "../database/migrations/1688723227790-CreateCollectionsTable";
import { CreateCustomersTable1688723238031 } from "../database/migrations/1688723238031-CreateCustomersTable";
import { CreateLogsTable1688723256145 } from "../database/migrations/1688723256145-CreateLogsTable";
import { CreateOpLogTable1688723271456 } from "../database/migrations/1688723271456-CreateOpLogTable";
import { CreateOrderTable1688723282459 } from "../database/migrations/1688723282459-CreateOrderTable";
import { CreatePrintTemplateTable1688723294300 } from "../database/migrations/1688723294300-CreatePrintTemplateTable";
import { CreatePrinterTable1688723301447 } from "../database/migrations/1688723301447-CreatePrinterTable";
import { CreateUserTable1688723335905 } from "../database/migrations/1688723335905-CreateUserTable";
import { CompanyDataCashTxnTable1688968631250 } from "../database/migrations/1688968631250-CompanyDataCashTxnTable";
import { ParentDataCategoryTable1689243011744 } from "../database/migrations/1689243011744-ParentDataCategoryTable";
import { CreateOtherVariantsProductTable1689936983489 } from "../database/migrations/1689936983489-CreateOtherVariantsProductTable";
import { CreateDeviceInOrderTable1690224524962 } from "../database/migrations/1690224524962-CreateDeviceInOrderTable";
import { AddSourceToCashDrawerTxns1690541178975 } from "../database/migrations/1690541178975-AddSourceToCashDrawerTxns";
import { AddKeypadDiscountsToBillingSettings1693388804092 } from "../database/migrations/1693388804092-AddKeypadDiscountsToBillingSettings";
import { AddOpeningBalanceInCashTxnTable1693591205011 } from "../database/migrations/1693591205011-AddOpeningBalanceInCashTxnTable";
import { AddVATInCustomersTable1693638887792 } from "../database/migrations/1693638887792-AddVATInCustomersTable";
import { AddSKUInProductsTable1694586740806 } from "../database/migrations/1694586740806-AddSKUInProductsTable";
import { CreateStockHistoryTable1695382444525 } from "../database/migrations/1695382444525-CreateStockHistoryTable";
import { CreateBatchTable1695390448843 } from "../database/migrations/1695390448843-CreateBatchTable";
import { AddBoxesEnableBatchingInProductTable1696398503394 } from "../database/migrations/1696398503394-AddBoxesEnableBatchingInProductTable";
import { CreateQuickItemsTable1697051239330 } from "../database/migrations/1697051239330-CreateQuickItemsTable";
import { AddedVariantInBatchTable1697116257685 } from "../database/migrations/1697116257685-AddedVariantInBatchTable";
import { AddedVariantInStockHistoryTable1697116857274 } from "../database/migrations/1697116857274-AddedVariantInStockHistoryTable";
import { AddTotalRefundedInCustomersTable1697446644525 } from "../database/migrations/1697446644525-TotalRefundedAddedInCustomersTable";
import { AddedExpiryInBatchTable1697533900571 } from "../database/migrations/1697533900571-AddedExpiryInBatchTable";
import { AddedStatusInBatchTable1698308940086 } from "../database/migrations/1698308940086-AddedStatusInBatchTable";
import { AddedCardPaymentOptionInBillingSettingsTable1698500732749 } from "../database/migrations/1698500732749-AddedCardPaymentOptionInBillingSettingsTable";
import { AddedTokenNumberInOrdersTable1699957753354 } from "../database/migrations/1699957753354-AddedTokenNumberInOrdersTable";
import { AddedShowTokenAndResetCounterInPrintTemplateTable1699963270116 } from "../database/migrations/1699963270116-AddedShowTokenAndResetCounterInPrintTemplateTable";
import { AddedShowOrderTypeInPrintTemplateTable1699972170410 } from "../database/migrations/1699972170410-AddedShowOrderTypeInPrintTemplateTable";
import { AddedOrderTypeInOrdersTable1699972233441 } from "../database/migrations/1699972233441-AddedOrderTypeInOrdersTable";
import { AddedPrinterTypeAndSizeInPrinterTable1700216360695 } from "../database/migrations/1700216360695-AddedPrinterTypeAndSizeInPrinterTable";
import { AddedOrderTypeListInBillingSettings1700567335643 } from "../database/migrations/1700567335643-AddedOrderTypeListInBillingSettings";
import { CreateCustomChargeTable1700819069819 } from "../database/migrations/1700819069819-CreateCustomChargeTable";
import { AddCustomerPhone1702369733553 } from "../database/migrations/1702369733553-AddCustomerPhone";
import { AddMultiVariantsInStockHistoryTable1702729509427 } from "../database/migrations/1702729509427-AddMultiVariantsInStockHistoryTable";
import { AddMultiVariantsInBatchTable1702729524918 } from "../database/migrations/1702729524918-AddMultiVariantsInBatchTable";
import { AddCatalogueManagementInBillingSettingTable1703588633191 } from "../database/migrations/1703588633191-AddCatalogueManagementInBillingSettingTable";
import { AddedPrevStockCountInStockHistoryTable1703840153528 } from "../database/migrations/1703840153528-AddedPrevStockCountInStockHistoryTable";
import { AddCreditManagementInCustomersTable1705398325949 } from "../database/migrations/1705398325949-AddCreditManagementInCustomersTable";
import { AddUsedAvailableCreditInCustomerTable1705485821473 } from "../database/migrations/1705485821473-AddUsedAvailableCreditInCustomerTable";
import { CreateAdsManagementTable1707573367620 } from "../database/migrations/1707573367620-CreateAdsManagementTable";
import { AddLastPlayedAtInAdsTable1707811958493 } from "../database/migrations/1707811958493-AddLastPlayedAtInAdsTable";
import { AddTypeInAdsManagementTable1707831335857 } from "../database/migrations/1707831335857-AddTypeInAdsManagementTable";
import { AddAdReportTable1708341007141 } from "../database/migrations/1708341007141-AddAdReportTable";
import { AddCodeInProductstable1708413129080 } from "../database/migrations/1708413129080-AddCodeInProductstable";
import { AddDeviceIdToAdsReportTable1708421180691 } from "../database/migrations/1708421180691-AddDeviceIdToAdsReportTable";
import { AddAdTypeInAdsReport1708577404525 } from "../database/migrations/1708577404525-AddAdTypeInAdsReport";
import { AddScheduleStatusDaysOfWeekInAdsReport1709573747995 } from "../database/migrations/1709573747995-AddScheduleStatusDaysOfWeekInAdsReport";
import { AddCreatedByInAdsManagement1709624745351 } from "../database/migrations/1709624745351-AddCreatedByInAdsManagement";
import { AddCreatedByInAdsReports1709625007248 } from "../database/migrations/1709625007248-AddCreatedByInAdsReports";
import { AddedOrderStatusQROrderingInOrdersTable1709750589599 } from "../database/migrations/1709750589599-AddedOrderStatusQROrderingInOrdersTable";
import { AddImageAndSourceInCollectionTable1710527630245 } from "../database/migrations/1710527630245-AddImageAndSourceInCollectionTable";
import { AddNewDataPointInProductTable1710966570077 } from "../database/migrations/1710966570077-AddNewDataPointInProductTable";
import { AddSpecialInstructionInOrderTable1710970210665 } from "../database/migrations/1710970210665-AddSpecialInstructionInOrderTable";
import { AddedEnableKOTInPrinterTable1711045501947 } from "../database/migrations/1711045501947-AddedEnableKOTInPrinterTable";
import { AddNewRuleDataPointInCustomChargeTable1711378196988 } from "../database/migrations/1711378196988-AddNewRuleDataPointInCustomChargeTable";
import { AddCollectionsRefsInProductTable1711690390744 } from "../database/migrations/1711690390744-AddCollectionsRefsInProductTable";
import { AddSelfOnlineOrderingInProductTable1712046170122 } from "../database/migrations/1712046170122-AddSelfOnlineOrderingInProductTable";
import { AddGroupRefsInCustomerModel1713008324585 } from "../database/migrations/1713008324585-AddGroupRefsInCustomerModel";
import { AddPromotionsCustomChargesInBillingSettingsTable1713378840183 } from "../database/migrations/1713378840183-AddPromotionsCustomChargesInBillingSettingsTable";
import { AddedCategoryInStockHistoryTable1714729722271 } from "../database/migrations/1714729722271-AddedCategoryInStockHistoryTable";
import { AddWidthCharLineInPrinterTable1715351676394 } from "../database/migrations/1715351676394-AddWidthCharLineInPrinterTable";
import { AddAcceptedDateInOrderDetailsTable1715582096739 } from "../database/migrations/1715582096739-AddAcceptedDateInOrderDetailsTable";
import { CreateSectionTables1717413827625 } from "../database/migrations/1717413827625-CreateSectionTables";
import { AddSortOrderInProductTable1717757785804 } from "../database/migrations/1717757785804-AddSortOrderInProductTable";
import { CreateVoidCompTable1718107059693 } from "../database/migrations/1718107059693-CreateVoidCompTable";
import { CreateKitchenManagementTable1718188678009 } from "../database/migrations/1718188678009-CreateKitchenManagementTable";
import { AddKitchenInPrinterTable1718189321497 } from "../database/migrations/1718189321497-AddKitchenInPrinterTable";
import { AddAllProdCatInKitchenTable1718212358983 } from "../database/migrations/1718212358983-AddAllProdCatInKitchenTable";
import { AddProdCatRefsInKitchenTable1718212615583 } from "../database/migrations/1718212615583-AddProdCatRefsInKitchenTable";
import { AddProdCatDataInKitchenTable1718212852707 } from "../database/migrations/1718212852707-AddProdCatDataInKitchenTable";
import { AddPrinterDeviceInKitchenTable1718213265147 } from "../database/migrations/1718213265147-AddPrinterDeviceInKitchenTable";
import { AddKitchenInProductTable1718219717294 } from "../database/migrations/1718219717294-AddKitchenInProductTable";
import { AddedKitchenFacingNameInProductTable1720612403715 } from "../database/migrations/1720612403715-AddedKitchenFacingNameInProductTable";
import { AddDineInDataInOrders1720613539851 } from "../database/migrations/1720613539851-AddDineInDataInOrders";
import { CreateNewMenuTable1721635653116 } from "../database/migrations/1721635653116-CreateNewMenuTable";
import { CreateBoxCratesTable1721657189762 } from "../database/migrations/1721657189762-CreateBoxCratesTable";
import { AddedBoxCrateRefsInProductTable1721731621246 } from "../database/migrations/1721731621246-AddedBoxCrateRefsInProductTable";
import { AddedOnlineOrderingInOrderTable1721900608004 } from "../database/migrations/1721900608004-AddedOnlineOrderingInOrderTable";
import { AddedPrinterAssignedInkitchenManagementTable1722246111698 } from "../database/migrations/1722246111698-AddedPrinterAssignedInkitchenManagementTable";
import { AddedBoxRefAndLocationRefsInBoxCrateTable1722419418426 } from "../database/migrations/1722419418426-AddedBoxRefAndLocationRefsInBoxCrateTable";
import { AddedTotalSalesIncashDrawerTxnTable1722588769605 } from "../database/migrations/1722588769605-AddedTotalSalesIncashDrawerTxnTable";
import { AddedReceivedAtInOrdersTable1723024634192 } from "../database/migrations/1723024634192-AddedReceivedAtInOrdersTable";
import { AddedBoxNameInBoxCrateTable1723732278334 } from "../database/migrations/1723732278334-AddedBoxNameInBoxCrateTable";
import { AddedAutoInStockHistoryTable1724245359119 } from "../database/migrations/1724245359119-AddedAutoInStockHistoryTable";
import { AddedBoxObjInBoxCrateTable1724328397838 } from "../database/migrations/1724328397838-AddedBoxObjInBoxCrateTable";
import { EventSubscription } from "../database/oplog-handler/event";
import { OplogModel } from "../database/oplog/op-log.model";
import { OrderModel } from "../database/order/order";
import { PrintTemplateModel } from "../database/print-template/print-template";
import { PrinterModel } from "../database/printer/printer";
import { ProductModel } from "../database/product/product";
import { QuickItemsModel } from "../database/quick-items/quick-items";
import { SectionTablesModel } from "../database/section-tables/section-tables";
import { StockHistoryModel } from "../database/stock-history/stock-history";
import { UsersModel } from "../database/users/users";
import { VoidCompModel } from "../database/void-comp/void-comp";

export const db = new DataSource({
  type: "expo",
  database: "tijarah",
  name: "tijarah",
  driver,
  entities: [
    OplogModel,
    CategoryModel,
    ProductModel,
    UsersModel,
    CollectionsModel,
    CustomersModel,
    BillingSettingsModel,
    CashDrawerTransactionModel,
    BusinessDetailsModel,
    PrinterModel,
    OrderModel,
    LogsModel,
    CheckRequestModel,
    PrintTemplateModel,
    StockHistoryModel,
    BatchModel,
    QuickItemsModel,
    CustomChargeModel,
    AdsManagementModel,
    AdsReportModel,
    KitchenManagementModel,
    SectionTablesModel,
    MenuModel,
    VoidCompModel,
    BoxCratesModel,
  ],
  subscribers: [EventSubscription],
  migrations: [
    CreateCategoryTable1688722113496,
    CreateBillingSettingsTable1688723186565,
    CreateBusinessDetailsTable1688723198994,
    CreateCashDrawerTxnTable1688723170826,
    CompanyDataCashTxnTable1688968631250,
    CreateCheckRequestTable1688723213098,
    CreateCollectionsTable1688723227790,
    CreateCustomersTable1688723238031,
    CreateUserTable1688723335905,
    CreateProductTable1688723113423,
    CreateLogsTable1688723256145,
    CreatePrinterTable1688723301447,
    CreatePrintTemplateTable1688723294300,
    CreateOrderTable1688723282459,
    CreateOpLogTable1688723271456,
    ParentDataCategoryTable1689243011744,
    CreateOtherVariantsProductTable1689936983489,
    CreateDeviceInOrderTable1690224524962,
    AddSourceToCashDrawerTxns1690541178975,
    AddVATInCustomersTable1693638887792,
    AddOpeningBalanceInCashTxnTable1693591205011,
    AddKeypadDiscountsToBillingSettings1693388804092,
    AddSKUInProductsTable1694586740806,
    AddBoxesEnableBatchingInProductTable1696398503394,
    CreateStockHistoryTable1695382444525,
    CreateBatchTable1695390448843,
    CreateQuickItemsTable1697051239330,
    AddedVariantInBatchTable1697116257685,
    AddedVariantInStockHistoryTable1697116857274,
    AddTotalRefundedInCustomersTable1697446644525,
    AddedExpiryInBatchTable1697533900571,
    AddedStatusInBatchTable1698308940086,
    AddedCardPaymentOptionInBillingSettingsTable1698500732749,
    AddedTokenNumberInOrdersTable1699957753354,
    AddedShowTokenAndResetCounterInPrintTemplateTable1699963270116,
    AddedOrderTypeInOrdersTable1699972233441,
    AddedShowOrderTypeInPrintTemplateTable1699972170410,
    AddedPrinterTypeAndSizeInPrinterTable1700216360695,
    AddedOrderTypeListInBillingSettings1700567335643,
    CreateCustomChargeTable1700819069819,
    AddMultiVariantsInStockHistoryTable1702729509427,
    AddMultiVariantsInBatchTable1702729524918,
    AddCustomerPhone1702369733553,
    AddCatalogueManagementInBillingSettingTable1703588633191,
    AddedPrevStockCountInStockHistoryTable1703840153528,
    AddCreditManagementInCustomersTable1705398325949,
    AddUsedAvailableCreditInCustomerTable1705485821473,
    CreateAdsManagementTable1707573367620,
    AddLastPlayedAtInAdsTable1707811958493,
    AddTypeInAdsManagementTable1707831335857,
    AddAdReportTable1708341007141,
    AddDeviceIdToAdsReportTable1708421180691,
    AddAdTypeInAdsReport1708577404525,
    AddScheduleStatusDaysOfWeekInAdsReport1709573747995,
    AddCreatedByInAdsManagement1709624745351,
    AddCreatedByInAdsReports1709625007248,
    AddCodeInProductstable1708413129080,
    AddedOrderStatusQROrderingInOrdersTable1709750589599,
    AddImageAndSourceInCollectionTable1710527630245,
    AddNewDataPointInProductTable1710966570077,
    AddSpecialInstructionInOrderTable1710970210665,
    AddedEnableKOTInPrinterTable1711045501947,
    AddNewRuleDataPointInCustomChargeTable1711378196988,
    AddCollectionsRefsInProductTable1711690390744,
    AddSelfOnlineOrderingInProductTable1712046170122,
    AddPromotionsCustomChargesInBillingSettingsTable1713378840183,
    AddGroupRefsInCustomerModel1713008324585,
    AddedCategoryInStockHistoryTable1714729722271,
    AddWidthCharLineInPrinterTable1715351676394,
    AddAcceptedDateInOrderDetailsTable1715582096739,
    AddKitchenInPrinterTable1718189321497,
    CreateKitchenManagementTable1718188678009,
    AddAllProdCatInKitchenTable1718212358983,
    AddProdCatRefsInKitchenTable1718212615583,
    AddProdCatDataInKitchenTable1718212852707,
    AddPrinterDeviceInKitchenTable1718213265147,
    AddKitchenInProductTable1718219717294,
    CreateSectionTables1717413827625,
    CreateNewMenuTable1721635653116,
    AddSortOrderInProductTable1717757785804,
    CreateVoidCompTable1718107059693,
    AddedKitchenFacingNameInProductTable1720612403715,
    AddDineInDataInOrders1720613539851,
    CreateBoxCratesTable1721657189762,
    AddedBoxCrateRefsInProductTable1721731621246,
    AddedOnlineOrderingInOrderTable1721900608004,
    AddedPrinterAssignedInkitchenManagementTable1722246111698,
    AddedBoxRefAndLocationRefsInBoxCrateTable1722419418426,
    AddedTotalSalesIncashDrawerTxnTable1722588769605,
    AddedReceivedAtInOrdersTable1723024634192,
    AddedBoxNameInBoxCrateTable1723732278334,
    AddedAutoInStockHistoryTable1724245359119,
    AddedBoxObjInBoxCrateTable1724328397838,
  ],
  migrationsRun: true,
});

db.driver.afterConnect = async () => {
  const SyncQueue = require("../sync/sync-queue").default;
  const SyncPolling = require("../sync/sync-polling").default;
  SyncQueue.initialize();
  SyncPolling.initialize();
};

export const repo = {
  category: db.getRepository(CategoryModel),
  collection: db.getRepository(CollectionsModel),
  product: db.getRepository(ProductModel),
  business: db.getRepository(BusinessDetailsModel),
  printer: db.getRepository(PrinterModel),
  order: db.getRepository(OrderModel),
  quickItem: db.getRepository(QuickItemsModel),
  billingSettings: db.getRepository(BillingSettingsModel),
  cashDrawerTxn: db.getRepository(CashDrawerTransactionModel),
  user: db.getRepository(UsersModel),
  customer: db.getRepository(CustomersModel),
  log: db.getRepository(LogsModel),
  printTemplate: db.getRepository(PrintTemplateModel),
  stockHistory: db.getRepository(StockHistoryModel),
  batch: db.getRepository(BatchModel),
  customCharge: db.getRepository(CustomChargeModel),
  adsManagement: db.getRepository(AdsManagementModel),
  adsReport: db.getRepository(AdsReportModel),
  kitchenManagement: db.getRepository(KitchenManagementModel),
  sectionTables: db.getRepository(SectionTablesModel),
  menu: db.getRepository(MenuModel),
  voidComp: db.getRepository(VoidCompModel),
  boxCrates: db.getRepository(BoxCratesModel),
};
