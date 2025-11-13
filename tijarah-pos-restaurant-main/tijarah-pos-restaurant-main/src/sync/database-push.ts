import { EventRegister } from "react-native-event-listeners";
import { serializeError } from "serialize-error";
import serviceCaller from "../api";
import endpoint from "../api/endpoints";
import repository from "../db/repository";
import { CheckRequest } from "../db/schema/check-request";
import { OpLog } from "../db/schema/oplog";

import { logError, logInfo } from "../utils/axiom-logger";
import { objectId } from "../utils/bsonObjectIdTransformer";
import upload from "../utils/uploadToS3";

type EntityNames =
  | "products"
  | "customer"
  | "business-details"
  | "orders"
  | "cash-drawer-txns"
  | "stock-history"
  | "batch"
  | "billing-settings"
  | "ads-report"
  | "kitchen-management"
  | "section-tables"
  | "box-crates"
  | "order-number-sequence";

async function uploadAndModifyProducts(data: any) {
  const results = [];

  logInfo(`[DatabasePush][uploadAndModifyProducts] initiated`, {
    data,
  });

  for (const op of data) {
    const parsedData = JSON.parse(op?.data);
    let result;

    if (
      parsedData?.insertOne?.document?.localImage !== "" &&
      parsedData?.insertOne?.document?.image === "" &&
      op?.action === "INSERT"
    ) {
      console.log(parsedData?.insertOne?.document);
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
      let variants = [];

      // Check if variants exist and is an array before mapping
      if (Array.isArray(parsedData?.updateOne?.update?.variants)) {
        const variantUpdate = await Promise.all(
          parsedData.updateOne.update.variants.map(async (vars: any) => {
            if (vars?.localImage !== "") {
              try {
                let uploadedImage;

                if (vars.localImage != null && vars.localImage !== "null") {
                  console.log(vars.localImage, "uploading:::::::::");
                  uploadedImage = await upload(vars.localImage);
                } else {
                  uploadedImage = vars.image;
                }

                return {
                  ...vars,
                  image: uploadedImage,
                };
              } catch (error) {
                console.error("Error uploading variant image:", error);
                return { ...vars };
              }
            }
            return { ...vars };
          })
        );
        variants = await Promise.all(variantUpdate);
      }

      try {
        let uploadedImage;

        if (
          parsedData.updateOne.update.localImage != null &&
          parsedData.updateOne.update.localImage !== "null" &&
          parsedData.updateOne.update.localImage !== undefined
        ) {
          console.log(parsedData.updateOne.update.localImage);
          uploadedImage = await upload(parsedData.updateOne.update.localImage);
        } else {
          uploadedImage = parsedData.updateOne.update.image;
        }

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
      } catch (error) {
        console.error("Error uploading main image:", JSON.stringify(error));
        throw new Error("Failed to upload main image");
      }
    } else {
      result = op;
    }

    results.push(result);
  }

  logInfo(`[DatabasePush][uploadAndModifyProducts] Result `, {
    results,
  });

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
  "billing-settings": endpoint.pushBillingSettings,
  "ads-report": endpoint.adsReportPush,
  "kitchen-management": endpoint.kitchenManagementPush,
  "section-tables": endpoint.sectionTablesPush,
  "box-crates": endpoint.boxCratesPush,
  "order-number-sequence": endpoint.orderNumberSequencePush,
};

export default class DatabasePush {
  constructor() {}

  public async updateRequestIdOpLog(requestId: string): Promise<void> {
    try {
      logInfo(`[DatabasePush][${requestId}] update started`, {});
      // Update the status of each pending entity to "pushed"
      await repository.oplogRepository.updateByRequestId(requestId, {
        status: "pushed",
        requestId: requestId,
      });

      logInfo(`[DatabasePush][${requestId}] updated`, {});

      console.log("update request id done");

      await repository.checkRequestRepository.updateStatusById(requestId, {
        status: "success",
      });

      logInfo(`[DatabasePush]request status updated`, {});

      console.log("check request id update done");

      // Update the request status to "success"
    } catch (error) {
      // Handle the error gracefully
      console.error(
        "An error occurred while updating entities and request status:",
        error
      );

      logError(`[DatabasePush]request status update error`, {
        error: JSON.stringify(error),
      });

      throw new Error("Failed to update entities and request status.");
    }
  }

  public async updateRequestIdInAllOpLogs(
    requestId: string,
    tableName: string
  ): Promise<OpLog> {
    try {
      logInfo(`[DatabasePush][${tableName}] Adding request id to all ops`, {});
      // Update the requestId for each pending entity
      await repository.oplogRepository.updateByTableAndStatus(
        "pending",
        tableName,
        requestId
      );

      return repository.oplogRepository.findByRequestid(requestId);
    } catch (error) {
      logError(
        `[DatabasePush][${tableName}] An error occured while updating entities with request ID`,
        error
      );
      console.error(
        "An error occurred while updating entities with the request ID:",
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

  async pushOrderNumberSequences() {
    return this.pushEntity("order-number-sequence");
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
        return false;
      }

      return res.status === "success";
    } catch (error: any) {
      return false;
    }
  }

  async pushToServer(request: any, entityName: any) {
    try {
      let pushResponse: any;
      let page = 0;

      console.log("push to server called", entityName);
      logInfo(`[DatabasePush][${entityName}] push to server called`, {});

      do {
        let allPendingOperations = await repository.oplogRepository.find({
          where: {
            requestId: request._id,
            tableName: entityName,
          },
          skip: (page - 1) * 100,
          take: 100,
        });

        logInfo(`[DatabasePush][${entityName}] push to server called`, {
          allPendingOperations,
        });

        if (allPendingOperations.length === 0) {
          break;
        }

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

          logInfo(`[DatabasePush][${entityName}] push to server response`, {
            response: res,
          });

          pushResponse = res;

          if (res.message !== "accepted") {
            throw new Error("push_failed");
          } else {
            page = page + 1;
          }
        }

        if (
          entityName === "ads-report" &&
          allPendingOperations.length === 100
        ) {
          const res = await serviceCaller(APIEndpointName[entityName].path, {
            method: APIEndpointName[entityName].method,
            body: {
              requestId: request._id,
              operations: allPendingOperations,
            },
          });

          logInfo(`[DatabasePush][${entityName}] push to server response`, {
            response: res,
          });

          console.log("pushed to server", res);

          pushResponse = res;

          EventRegister.emit("set-index");

          if (res.message !== "accepted") {
            logError(`[DatabasePush][${entityName}] push to server error`, {
              response: res,
            });
            throw new Error("push_failed");
          } else {
            page = page + 1;
          }
        }
      } while (true);

      await this.updateRequestIdOpLog(request._id);
      console.log("UPDATED::::::");
      return pushResponse;
    } catch (error) {
      console.log(error);
      logError(`[DatabasePush][${entityName}] push to server error`, {
        response: error,
      });
    }
  }

  async pushEntity(entityName: EntityNames) {
    logInfo(`[DatabasePush][${entityName}] started`, {});
    const lastRequest = await repository.checkRequestRepository.findOne({
      where: [
        { entityName, status: "failed" },
        { entityName, status: "pending" },
      ],
      order: { createdAt: "DESC" },
    });

    if (lastRequest?._id) {
      const isSuccess = await this.isSuccessfullOnServer(lastRequest._id);
      logInfo(`[DatabasePush][${entityName}] last request status`, {
        isSuccess,
      });

      if (isSuccess) {
        await this.updateRequestIdOpLog(lastRequest._id);
      } else {
        await this.pushToServer(lastRequest, entityName);
      }
    }
    // current request
    const id = objectId();
    const request: CheckRequest = {
      _id: id,
      entityName,
      lastSync: new Date(),
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    logInfo(`[DatabasePush][${entityName}] creating new request`, {
      request,
    });

    await repository.checkRequestRepository.create(request);

    if (!request._id) return;
    console.log("updating request in op logs");
    await this.updateRequestIdInAllOpLogs(request._id, entityName);
    console.log("updated request in op logs pushing to server");

    const response = await this.pushToServer(request, entityName).catch(
      (err) => {}
    );

    console.log("pushed");

    if (response.error) {
      logError(`[DatabasePush][${entityName}] error`, {
        response,
      });
      throw new Error(serializeError(response.error));
    }
    if (response.message !== "accepted") {
      logError(`[DatabasePush][${entityName}] error`, {
        response,
      });
      throw new Error("push_failed");
    }

    return { success: true };
  }
}
