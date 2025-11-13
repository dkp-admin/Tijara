import { objectId } from "../../utils/bsonObjectIdTransformer";
import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";
import { OrderNumberSequence } from "../schema/order-number-sequence";
import { BaseRepository } from "./base-repository";

export class OrderNumberSequenceRepository extends BaseRepository<
  OrderNumberSequence,
  string
> {
  constructor() {
    super("order-number-sequence");
  }

  async create(
    orderNumberSequence: OrderNumberSequence
  ): Promise<OrderNumberSequence> {
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO "order-number-sequence" (
        _id, key, value, "createdAt", "updatedAt", source, "deviceRef"
        ) VALUES (
         $id, $key, $value, $createdAt, $updatedAt, $source, $deviceRef
        )
      ON CONFLICT(_id) DO UPDATE SET
        key = $key,
        value = $value,
        "updatedAt" = $updatedAt
        `);

    const deviceUserObject = MMKVDB.get(DBKeys.DEVICE);
    console.log("DEVIAS", deviceUserObject);

    const params: any = {
      $id: objectId(),
      $key: orderNumberSequence.key,
      $value: orderNumberSequence.value,
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
      $source: "local",
      $deviceRef: deviceUserObject?.deviceRef,
    };

    try {
      await statement.executeAsync(params);
      return orderNumberSequence;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async update(
    id: string,
    item: OrderNumberSequence
  ): Promise<OrderNumberSequence> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "order-number-sequence" SET
        key = $key,
        value = $value,
        updatedAt = CURRENT_TIMESTAMP,
        source = $source
      WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
        $key: item.key,
        $value: item.value,
        $source: item.source || "local",
      });
    } finally {
      await statement.finalizeAsync();
    }

    item._id = Number(id);
    return item;
  }

  async delete(id: string): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM "order-number-sequence" WHERE _id = $id
    `);

    try {
      await statement.executeAsync({ $id: id });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findById(id: string): Promise<OrderNumberSequence> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "order-number-sequence" WHERE _id = $id
    `);

    try {
      const result = await statement.executeAsync({ $id: id });
      const row = await result.getFirstAsync();
      if (!row) {
        throw new Error("OpLog not found");
      }
      return OrderNumberSequence.fromRow(row);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async createMany(
    sequences: OrderNumberSequence[]
  ): Promise<OrderNumberSequence[]> {
    const columns = [
      "_id",
      "key",
      "value",
      "createdAt",
      "updatedAt",
      "source",
      "deviceRef",
    ];
    const deviceUserObject = MMKVDB.get(DBKeys.DEVICE);

    const generateParams = (seq: OrderNumberSequence) => {
      const toRow = OrderNumberSequence.toRow(seq);
      return [
        toRow._id,
        toRow.key,
        toRow.value,
        toRow.createdAt,
        toRow.updatedAt,
        toRow.source,
        deviceUserObject?.deviceRef,
      ];
    };

    return this.createManyGeneric(
      "order-number-sequence",
      sequences,
      columns,
      generateParams
    );
  }

  async findByKey(key: string): Promise<number> {
    console.log("DEBUG:key", key);
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "order-number-sequence" WHERE key = $key
    `);

    try {
      const result = await statement.executeAsync({ $key: key });

      const row = await result.getFirstAsync();
      console.log("DEBUG:DATA", row);

      if (!row) {
        console.log("DATA:new sequcne");
        // Create new sequence
        const newSequence = new OrderNumberSequence();
        newSequence.key = key;
        newSequence.value = 1;
        newSequence.source = "local";

        try {
          await this.create(newSequence);
        } catch (error) {
          console.log("ERROR:CREATE SEQUENCE", error);
        }
        console.log("DEBUG:NEW SEQUENCE", newSequence);
        return newSequence.value;
      }

      // Update existing sequence
      console.log("RORA", row);
      const sequence = OrderNumberSequence.fromRow(row);
      sequence.value += 1;
      sequence.source = "local";
      if (!sequence?._id) return 0;
      await this.update(sequence._id?.toString(), sequence);
      return sequence.value;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findAll(): Promise<OrderNumberSequence[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "order-number-sequence"
    `);

    try {
      const result = await statement.executeAsync({});
      const rows = await result.getAllAsync();
      const trows = [];
      for (const row of rows) {
        trows.push(OrderNumberSequence.fromRow(row));
      }

      return trows;
    } finally {
      await statement.finalizeAsync();
    }
  }
}
