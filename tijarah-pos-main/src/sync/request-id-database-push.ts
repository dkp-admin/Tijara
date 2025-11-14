import { Repository } from "typeorm";
import serviceCaller from "../api";
import endpoint from "../api/endpoints";
import { OplogModel } from "../database/oplog/op-log.model";
import { db } from "../utils/createDatabaseConnection";
import { debugLog } from "../utils/log-patch";

const APIEndpointName: any = {
  products: endpoint.productPush,
  customer: endpoint.customerPush,
  "business-details": endpoint.businessDetailPush,
  orders: endpoint.orderPush,
  "cash-drawer-txns": endpoint.cashDrawerTxnPush,
  "stock-history": endpoint.stockHistoryPush,
  batch: endpoint.batchPush,
  "quick-items": endpoint.quickItemsPush,
  "billing-settings": endpoint.pushBillingSettings,
  "ads-report": endpoint.adsReportPush,
  "kitchen-management": endpoint.kitchenManagementPush,
  "section-tables": endpoint.sectionTablesPush,
  "box-crates": endpoint.boxCratesPush,
};

class RequestIdDatabasePush {
  private oplogRepository: Repository<OplogModel>;

  constructor() {
    this.oplogRepository = db.getRepository(OplogModel);
  }

  async pushEntityRequestId(requestId: string, entityName: string) {
    const allPendingOperations = await this.oplogRepository.find({
      where: {
        requestId: requestId,
      },
    });

    if (allPendingOperations.length === 0) {
      debugLog(
        "Pending push operations empty for " + requestId + " in " + entityName,
        {},
        "sync-push-db",
        "pushEntityRequestId"
      );
      return;
    }

    debugLog(
      "Push for " + requestId + " in " + entityName + ` pending ops`,
      {},
      "sync-push-db",
      "pushEntityRequestId"
    );

    const res = await serviceCaller(APIEndpointName[entityName].path, {
      method: APIEndpointName[entityName].method,
      body: {
        requestId: requestId,
        operations: allPendingOperations,
      },
    });

    if (res.message !== "accepted") {
      debugLog(
        entityName + " for " + entityName + ` push failed`,
        res,
        "sync-push-db",
        "pushEntityRequestId"
      );
      throw new Error("push_failed");
    }

    debugLog(
      requestId + " for " + entityName + ` push response`,
      res,
      "sync-push-db",
      "pushEntityRequestId"
    );
  }
}

export default new RequestIdDatabasePush();
