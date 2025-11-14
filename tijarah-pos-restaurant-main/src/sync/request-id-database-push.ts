import serviceCaller from "../api";
import endpoint from "../api/endpoints";

import repository from "../db/repository";

const APIEndpointName: any = {
  products: endpoint.productPush,
  customer: endpoint.customerPush,
  "business-details": endpoint.businessDetailPush,
  orders: endpoint.orderPush,
  "cash-drawer-txns": endpoint.cashDrawerTxnPush,
  "stock-history": endpoint.stockHistoryPush,
  batch: endpoint.batchPush,
  "billing-settings": endpoint.pushBillingSettings,
  "ads-report": endpoint.adsReportPush,
  "kitchen-management": endpoint.kitchenManagementPush,
  "section-tables": endpoint.sectionTablesPush,
  "box-crates": endpoint.boxCratesPush,
};

class RequestIdDatabasePush {
  constructor() {}

  async pushEntityRequestId(requestId: string, entityName: string) {
    const allPendingOperations = await repository.oplogRepository.find({
      where: {
        requestId: requestId,
      },
    });

    if (allPendingOperations.length === 0) {
      return;
    }

    const res = await serviceCaller(APIEndpointName[entityName].path, {
      method: APIEndpointName[entityName].method,
      body: {
        requestId: requestId,
        operations: allPendingOperations,
      },
    });

    if (res.message !== "accepted") {
      throw new Error("push_failed");
    }
  }
}

export default new RequestIdDatabasePush();
