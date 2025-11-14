import { EventRegister } from "react-native-event-listeners";
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from "typeorm";
import EntityNames from "../../types/entity-name";
import MMKVDB from "../../utils/DB-MMKV";
import { OplogModel } from "../oplog/op-log.model";

const pushEntities: any = {
  products: EntityNames.ProductsPush,
  customer: EntityNames.CustomerPush,
  orders: EntityNames.OrdersPush,
  "business-details": EntityNames.BusinessDetailsPush,
  "cash-drawer-txns": EntityNames.CashDrawerTxnsPush,
  "stock-history": EntityNames.StockHistoryPush,
  batch: EntityNames.BatchPush,
  "quick-items": EntityNames.QuickItemsPush,
  "billing-settings": EntityNames.BillingSettingsPush,
  "ads-report": EntityNames.AdsReportPush,
  "kitchen-management": EntityNames.KitchenManagementPush,
  "section-tables": EntityNames.SectionTablesPush,
  "box-crates": EntityNames.BoxCratesPush,
};
@EventSubscriber()
export class EventSubscription implements EntitySubscriberInterface {
  async afterInsert(event: InsertEvent<any>) {
    if (
      event.entity.source === "server" ||
      event.metadata.tableName === "billing-settings"
    )
      return;

    let obj: any = {
      data: JSON.stringify({
        insertOne: {
          document: { ...event.entity },
        },
      }),
      tableName: event.metadata.tableName,
      action: "INSERT",
      status: "pending",
      timestamp: new Date(),
    };

    try {
      if (event.metadata.tableName === "opLogs") return;
      const repo = event.connection.getRepository(OplogModel);
      const saveReponse = await repo.save({ ...obj });
      if (Object.keys(pushEntities).includes(event.metadata.tableName)) {
        if (
          event.metadata.tableName === "cash-drawer-txns" &&
          event.entity.transactionType === "open"
        ) {
          return;
        }

        EventRegister.emit("sync:enqueue", {
          entityName: pushEntities[event.metadata.tableName],
        });
      }
    } catch (error) {
      console.log("oplog error", error);
    }
  }

  async afterUpdate(event: UpdateEvent<any>) {
    if (!event.entity) return;
    if (event.entity.source === "server") return;

    if (event.metadata.tableName === "billing-settings") {
      event.entity._id = MMKVDB.get("device").deviceRef;
    }

    const obj: any = {
      data: JSON.stringify({
        updateOne: {
          filter: { _id: event?.entity?._id },
          update: event.entity,
        },
      }),
      tableName: event.metadata.tableName,
      action: "UPDATE",
      status: "pending",
      timestamp: new Date(),
    };

    try {
      if (event.metadata.tableName === "opLogs") return;

      const repo = event.connection.getRepository(OplogModel);
      await repo.save({ ...obj });

      if (Object.keys(pushEntities).includes(event.metadata.tableName)) {
        EventRegister.emit("sync:enqueue", {
          entityName: pushEntities[event.metadata.tableName],
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async afterRemove(event: RemoveEvent<any>) {
    if (event.entity.source === "server") return;

    if (event.metadata.tableName === "billing-settings") {
      event.entity._id = MMKVDB.get("device").deviceRef;
    }

    const obj: any = {
      data: JSON.stringify({
        deleteOne: {
          filter: event.entityId,
        },
      }),
      tableName: event.metadata.tableName,
      action: "DELETE",
      status: "pending",
      timestamp: new Date(),
    };

    try {
      if (event.metadata.tableName === "opLogs") return;
      const repo = event.connection.getRepository(OplogModel);
      await repo.save({ ...obj });
      if (Object.keys(pushEntities).includes(event.metadata.tableName)) {
        EventRegister.emit("sync:enqueue", {
          entityName: pushEntities[event.metadata.tableName],
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
}
