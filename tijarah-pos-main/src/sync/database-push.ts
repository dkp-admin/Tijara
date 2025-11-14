import { EventRegister } from "react-native-event-listeners";
import { serializeError } from "serialize-error";
import { Repository, UpdateResult } from "typeorm";
import serviceCaller from "../api";
import endpoint from "../api/endpoints";
import { CheckRequestModel } from "../database/check-request/check-request";
import { OplogModel } from "../database/oplog/op-log.model";
import { objectId } from "../utils/bsonObjectIdTransformer";
import { db } from "../utils/createDatabaseConnection";
import { debugLog, errorLog } from "../utils/log-patch";
import upload from "../utils/uploadToS3";

const TAG = "SYNC-QUEUE";

type EntityNames =
  | "products"
  | "customer"
  | "business-details"
  | "orders"
  | "cash-drawer-txns"
  | "stock-history"
  | "batch"
  | "quick-items"
  | "billing-settings"
  | "ads-report"
  | "kitchen-management"
  | "section-tables"
  | "box-crates";

async function uploadAndModifyProducts(data: any) {
  const results = [];

  for (const op of data) {
    const parsedData = JSON.parse(op?.data);
    let result;

    if (
      parsedData?.insertOne?.document?.localImage !== "" &&
      parsedData?.insertOne?.document?.image === "" &&
      op?.action === "INSERT"
    ) {
      const variantUpdate = await Promise.all(
        parsedData?.insertOne?.document?.variants?.map(async (vars: any) => {
          if (vars?.localImage !== "") {
            const uploadedImage = await upload(vars?.localImage);
            return {
              ...vars,
              image: uploadedImage,
            };
          } else {
            return { ...vars };
          }
        })
      );

      const uploadedImage = await upload(
        parsedData?.updateOne?.update?.localImage
      );

      const variants = await Promise.all(variantUpdate);

      result = {
        id: op?.id,
        requestId: op?.requestId,
        data: JSON.stringify({
          insertOne: {
            document: {
              ...parsedData?.insertOne?.document,
              image: uploadedImage,
              variants,
            },
          },
        }),
        tableName: op?.tableName,
        action: op?.action,
        timestamp: op?.timestamp,
        status: op?.status,
      };
    } else if (
      op?.action === "UPDATE" &&
      parsedData?.updateOne?.update?.localImage !== ""
    ) {
      const variantUpdate = await Promise.all(
        parsedData?.updateOne?.update?.variants?.map(async (vars: any) => {
          if (vars?.localImage !== "") {
            const uploadedImage = await upload(vars?.localImage);
            return {
              ...vars,
              image: uploadedImage,
            };
          } else {
            return { ...vars };
          }
        })
      );

      const uploadedImage = await upload(
        parsedData?.updateOne?.update?.localImage
      );

      const variants = await Promise.all(variantUpdate);
      result = {
        id: op?.id,
        requestId: op?.requestId,
        data: JSON.stringify({
          updateOne: {
            filter: { ...parsedData?.updateOne?.filter },
            update: {
              ...parsedData?.updateOne?.update,
              image: uploadedImage,
              variants,
            },
          },
        }),
        tableName: op?.tableName,
        action: op?.action,
        timestamp: op?.timestamp,
        status: op?.status,
      };
    } else {
      result = op;
    }

    results.push(result);
  }

  return results;
}

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

export default class DatabasePush {
  private oplogRepository: Repository<OplogModel>;
  private requestRepository: Repository<CheckRequestModel>;

  constructor() {
    this.oplogRepository = db.getRepository(OplogModel);
    this.requestRepository = db.getRepository(CheckRequestModel);
  }

  public async updateRequestIdOpLog(requestId: string): Promise<void> {
    try {
      // Update the status of each pending entity to "pushed"
      await this.oplogRepository.update(
        { requestId: requestId },
        { status: "pushed", requestId: requestId }
      );
      debugLog(
        "Update status to pushed in oplog repo",
        { status: "pushed", requestId: requestId },
        "sync-push-db",
        "updateRequestIdOpLogFunction"
      );

      // Update the request status to "success"
      await this.requestRepository.update(
        { _id: requestId },
        { _id: requestId, status: "success" }
      );
      debugLog(
        "Update status to success in check request repo",
        { _id: requestId, status: "success" },
        "sync-push-db",
        "updateRequestIdOpLogFunction"
      );
    } catch (error) {
      // Handle the error gracefully
      console.error(
        "An error occurred while updating entities and request status:",
        error
      );
      errorLog(
        "An error occurred while updating entities and request status",
        { message: "Failed to update entities and request status." },
        "sync-push-db",
        "updateRequestIdOpLogFunction",
        error
      );
      throw new Error("Failed to update entities and request status.");
    }
  }

  public async updateRequestIdInAllOpLogs(
    requestId: string,
    tableName: string
  ): Promise<UpdateResult> {
    try {
      // Update the requestId for each pending entity
      const res = await this.oplogRepository.update(
        { status: "pending", tableName: tableName },
        { requestId }
      );
      debugLog(
        "Update the requestId for each pending entity",
        {},
        "sync-push-db",
        "updateRequestIdInAllOpLogsFunction"
      );

      return res;
    } catch (error) {
      console.error(
        "An error occurred while updating entities with the request ID:",
        error
      );
      errorLog(
        "An error occurred while updating entities and request ID",
        { message: "Failed to update entities with the request ID." },
        "sync-push-db",
        "updateRequestIdInAllOpLogsFunction",
        error
      );
      throw new Error("Failed to update entities with the request ID.");
    }
  }

  async pushProducts() {
    return this.pushEntity("products");
  }

  // async pushAdsReport() {
  //   return this.pushEntity("ads-report");
  // }

  async pushCustomer() {
    return this.pushEntity("customer");
  }

  async pushBusinessDetail() {
    return this.pushEntity("business-details");
  }

  async pushOrder() {
    return this.pushEntity("orders");
  }

  async pushCashDrawerTxns() {
    return this.pushEntity("cash-drawer-txns");
  }

  async pushStockHistory() {
    return this.pushEntity("stock-history");
  }

  async pushBatch() {
    return this.pushEntity("batch");
  }

  async pushQuickItems() {
    return this.pushEntity("quick-items");
  }

  async pushSectionTables() {
    return this.pushEntity("section-tables");
  }

  async pushBoxCrates() {
    return this.pushEntity("box-crates");
  }

  async pushBillingSettings() {
    return this.pushEntity("billing-settings");
  }

  async pushKitchenManagement() {
    return this.pushEntity("kitchen-management");
  }

  async isSuccessfullOnServer(requestId: string) {
    try {
      const res = await serviceCaller(endpoint.checkRequestPush.path, {
        method: endpoint.checkRequestPush.method,
        query: { requestId: requestId },
      });

      if (res === "NO_REQUEST") {
        debugLog(
          "No push request",
          {},
          "sync-push-db",
          "isSuccessfullOnServerFunction"
        );
        return false;
      }

      debugLog(
        `last push request server response`,
        {},
        "sync-push-db",
        "isSuccessfullOnServerFunction"
      );

      return res.status === "success";
    } catch (error: any) {
      errorLog(
        error?.code,
        { message: "last push request server response" },
        "sync-push-db",
        "isSuccessfullOnServerFunction",
        error
      );
      return false;
    }
  }

  async pushToServer(request: any, entityName: any) {
    let pushResponse: any;
    let page = 0;

    do {
      debugLog(
        "Fetching Pending OPS",
        {},
        "sync-push-db",
        "pushToServerFunction"
      );

      let allPendingOperations = await this.oplogRepository.find({
        where: {
          requestId: request._id,
          tableName: entityName,
        },
        skip: page * 100,
        take: 100,
      });

      if (allPendingOperations.length === 0) {
        debugLog(
          "Pending push operations empty",
          {},
          "sync-push-db",
          "pushToServerFunction"
        );
        break;
      }

      debugLog(
        "Fetched Pending OPS",
        {
          requestId: request._id,
          operations: allPendingOperations,
        },
        "sync-push-db",
        "pushToServerFunction"
      );

      console.log(
        "BEFORE API CALL",
        JSON.stringify({
          requestId: request._id,
          operations: allPendingOperations,
        })
      );

      if (entityName === "products") {
        const res = await uploadAndModifyProducts(allPendingOperations);

        const response = await Promise.all(res);

        allPendingOperations = response;
      }

      if (entityName !== "ads-report") {
        const res = await serviceCaller(APIEndpointName[entityName].path, {
          method: APIEndpointName[entityName].method,
          body: {
            requestId: request._id,
            operations: allPendingOperations,
          },
        });

        pushResponse = res;

        debugLog(
          entityName + ` push response`,
          res,
          "sync-push-db",
          "pushToServerFunction"
        );

        if (res.message !== "accepted") {
          debugLog(
            entityName + ` push failed`,
            res,
            "sync-push-db",
            "pushToServerFunction"
          );
          throw new Error("push_failed");
        } else {
          page = page + 1;
        }

        debugLog(
          entityName + ` push response after oplog`,
          {},
          "sync-push-db",
          "pushToServerFunction"
        );
      }

      if (entityName === "ads-report" && allPendingOperations.length === 100) {
        const res = await serviceCaller(APIEndpointName[entityName].path, {
          method: APIEndpointName[entityName].method,
          body: {
            requestId: request._id,
            operations: allPendingOperations,
          },
        });

        pushResponse = res;

        EventRegister.emit("set-index");

        debugLog(
          entityName + ` push response`,
          res,
          "sync-push-db",
          "pushToServerFunction"
        );

        if (res.message !== "accepted") {
          debugLog(
            entityName + ` push failed`,
            res,
            "sync-push-db",
            "pushToServerFunction"
          );
          throw new Error("push_failed");
        } else {
          page = page + 1;
        }

        debugLog(
          entityName + ` push response after oplog`,
          {},
          "sync-push-db",
          "pushToServerFunction"
        );
      }
    } while (true);

    await this.updateRequestIdOpLog(request._id);
    return pushResponse;
  }

  async pushEntity(entityName: EntityNames) {
    const lastRequest = await this.requestRepository.findOne({
      where: [
        { entityName, status: "failed" },
        { entityName, status: "pending" },
      ],
      order: { createdAt: "DESC" },
    });

    debugLog(
      "Push " + entityName + ` last request`,
      lastRequest,
      "sync-push-db",
      "pushEntityFunction"
    );

    if (lastRequest) {
      debugLog(
        "Push " + entityName + ` last request found`,
        lastRequest,
        "sync-push-db",
        "pushEntityFunction"
      );

      const isSuccess = await this.isSuccessfullOnServer(lastRequest._id);

      if (isSuccess) {
        await this.updateRequestIdOpLog(lastRequest._id);
      } else {
        await this.pushToServer(lastRequest, entityName);
      }
    }
    // current request
    const id = objectId();
    const request: CheckRequestModel = {
      _id: id,
      entityName,
      lastSync: new Date(),
      status: "pending",
      createdAt: new Date(),
    };
    await this.requestRepository.insert(request);

    debugLog(
      `Check request inserted to local db`,
      request,
      "sync-push-db",
      "pushEntityFunction"
    );

    // Assuming All The Failed OpLogs are marked pushed
    debugLog(
      "Push " + entityName + ` new request`,
      { _id: request._id },
      "sync-push-db",
      "pushEntityFunction"
    );

    //Updating Request id in all pending oplogs
    debugLog(
      "Push " + entityName + ` update all oplogs`,
      { _id: request._id },
      "sync-push-db",
      "pushEntityFunction"
    );
    await this.updateRequestIdInAllOpLogs(request._id, entityName);

    const response = await this.pushToServer(request, entityName).catch((err) =>
      errorLog(entityName, request, "sync-push-db", "pushEntityFunction", err)
    );

    if (response.error) {
      debugLog(response.error, response, "sync-push-db", "pushEntityFunction");
      throw new Error(serializeError(response.error));
    }
    if (response.message !== "accepted") {
      debugLog(
        response.message,
        response,
        "sync-push-db",
        "pushEntityFunction"
      );
      throw new Error("push_failed");
    }

    return { success: true };
  }
}
