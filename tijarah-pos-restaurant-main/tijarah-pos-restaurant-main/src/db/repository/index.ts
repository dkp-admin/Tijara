import { AdsManagementRepository } from "./ad-management-repository";
import { AdsReportRepository } from "./ad-report-repository";
import { BatchRepository } from "./batch-repository";
import { BillingSettingsRepository } from "./billing-settings";
import { BoxCratesRepository } from "./box-crates-repository";
import { BusinessDetailsRepository } from "./business-details";
import { CashDrawerTransactionRepository } from "./cashdrawer-txn-repository";
import { CategoryRepository } from "./category-repository";
import { CheckRequestRepository } from "./check-request-repository";
import { CollectionsRepository } from "./collection-repository";
import { CustomChargeRepository } from "./custom-charge-repository";
import { CustomerRepository } from "./customer-repository";
import { DeviceUserRepository } from "./device-user-repository";
import { KitchenManagementRepository } from "./kitchen-manegement-repository";
import { MenuRepository } from "./menu-repository";
import { OpLogRepository } from "./oplog-repository";
import { OrderNumberSequenceRepository } from "./order-number-sequence";
import { OrderRepository } from "./order-repository";
import { PrinterRepository } from "./print-repository";
import { PrintTemplateRepository } from "./print-template-repository";
import { ProductRepository } from "./product-repository";
import { QuickItemsRepository } from "./quick-item-repository";
import { SectionTablesRepository } from "./section-table-repository";
import { StockHistoryRepository } from "./stock-history-repository";
import { UserRepository } from "./user-repository";
import { VoidCompRepository } from "./void-comp";

const repository = {
  billing: new BillingSettingsRepository(),
  business: new BusinessDetailsRepository(),
  adManagementRepository: new AdsManagementRepository(),
  adReportRepository: new AdsReportRepository(),
  batchRepository: new BatchRepository(),
  boxCratesRepository: new BoxCratesRepository(),
  cashDrawerTxnRepository: new CashDrawerTransactionRepository(),
  categoryRepository: new CategoryRepository(),
  checkRequestRepository: new CheckRequestRepository(),
  collectionRepository: new CollectionsRepository(),
  customChargeRepository: new CustomChargeRepository(),
  customerRepository: new CustomerRepository(),
  deviceUserRepository: new DeviceUserRepository(),
  kitchenManagementRepository: new KitchenManagementRepository(),
  menuRepository: new MenuRepository(),
  oplogRepository: new OpLogRepository(),
  orderRepository: new OrderRepository(),
  printTemplateRepository: new PrintTemplateRepository(),
  printerRepository: new PrinterRepository(),
  productRepository: new ProductRepository(),
  quickItemRepository: new QuickItemsRepository(),
  sectionTableRepository: new SectionTablesRepository(),
  stockHistoryRepository: new StockHistoryRepository(),
  userRepository: new UserRepository(),
  voidCompRepository: new VoidCompRepository(),
  orderNumberSequenceRepository: new OrderNumberSequenceRepository(),
};

export default repository;
