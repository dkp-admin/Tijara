import { CustomCharge } from "../schema/custom.charge";
import { BaseRepository } from "./base-repository";

export class CustomChargeRepository extends BaseRepository<
  CustomCharge,
  string
> {
  constructor() {
    super("custom-charge");
  }

  async create(charge: CustomCharge): Promise<CustomCharge> {
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO "custom-charge" (
        _id, company, companyRef, locationRefs, name,
        image, value, type, chargeType, status,
        source, taxRef, tax, channel,
        applyAutoChargeOnOrders, skipIfOrderValueIsAbove, orderValue, createdAt, updatedAt
      ) VALUES (
        $id, $company, $companyRef, $locationRefs, $name,
        $image, $value, $type, $chargeType, $status,
        $source, $taxRef, $tax, $channel,
        $applyAutoChargeOnOrders, $skipIfOrderValueIsAbove, $orderValue, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT(_id) DO UPDATE SET
        company = $company,
        companyRef = $companyRef,
        locationRefs = $locationRefs,
        name = $name,
        image = $image,
        value = $value,
        type = $type,
        chargeType = $chargeType,
        status = $status,
        source = $source,
        taxRef = $taxRef,
        tax = $tax,
        channel = $channel,
        applyAutoChargeOnOrders = $applyAutoChargeOnOrders,
        skipIfOrderValueIsAbove = $skipIfOrderValueIsAbove,
        orderValue = $orderValue,
        updatedAt = CURRENT_TIMESTAMP
    `);

    const params: any = {
      $id: charge._id,
      $company: JSON.stringify(charge.company),
      $companyRef: charge.companyRef,
      $locationRefs: JSON.stringify(charge.locationRefs),
      $name: JSON.stringify(charge.name),
      $image: charge.image || null,
      $value: charge.value,
      $type: charge.type,
      $chargeType: charge.chargeType,
      $status: charge.status,
      $source: charge.source,
      $taxRef: charge.taxRef || null,
      $tax: charge.tax ? JSON.stringify(charge.tax) : null,
      $channel: charge.channel || null,
      $applyAutoChargeOnOrders: Number(charge.applyAutoChargeOnOrders),
      $skipIfOrderValueIsAbove: Number(charge.skipIfOrderValueIsAbove),
      $orderValue: charge.orderValue || 0,
    };

    try {
      const result = await statement.executeAsync(params);
      const created = await result.getFirstAsync();
      return created ? CustomCharge.fromRow(created) : charge;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async createMany(charges: CustomCharge[]): Promise<CustomCharge[]> {
    const columns = [
      "_id",
      "company",
      "companyRef",
      "locationRefs",
      "name",
      "image",
      "value",
      "type",
      "chargeType",
      "status",
      "source",
      "taxRef",
      "tax",
      "channel",
      "applyAutoChargeOnOrders",
      "skipIfOrderValueIsAbove",
      "orderValue",
    ];

    const generateParams = (charge: CustomCharge) => {
      const toRow = CustomCharge.toRow(charge);
      return [
        toRow._id,
        toRow.company,
        toRow.companyRef,
        toRow.locationRefs,
        toRow.name,
        toRow.image || null,
        toRow.value,
        toRow.type,
        toRow.chargeType,
        toRow.status,
        toRow.source,
        toRow.taxRef || null,
        toRow.tax ? toRow.tax : null,
        toRow.channel || null,
        toRow.applyAutoChargeOnOrders,
        toRow.skipIfOrderValueIsAbove,
        toRow.orderValue || 0,
      ];
    };

    return this.createManyGeneric(
      "custom-charge",
      charges,
      columns,
      generateParams
    );
  }

  async update(id: string, charge: CustomCharge): Promise<CustomCharge> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "custom-charge" SET
        company = $company,
        companyRef = $companyRef,
        locationRefs = $locationRefs,
        name = $name,
        image = $image,
        value = $value,
        type = $type,
        chargeType = $chargeType,
        status = $status,
        source = $source,
        taxRef = $taxRef,
        tax = $tax,
        channel = $channel,
        applyAutoChargeOnOrders = $applyAutoChargeOnOrders,
        skipIfOrderValueIsAbove = $skipIfOrderValueIsAbove,
        orderValue = $orderValue,
        updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    const params = {
      $id: id,
      $company: JSON.stringify(charge.company),
      $companyRef: charge.companyRef,
      $locationRefs: JSON.stringify(charge.locationRefs),
      $name: JSON.stringify(charge.name),
      $image: charge.image || null,
      $value: charge.value,
      $type: charge.type,
      $chargeType: charge.chargeType,
      $status: charge.status,
      $source: charge.source,
      $taxRef: charge.taxRef || null,
      $tax: charge.tax ? JSON.stringify(charge.tax) : null,
      $channel: charge.channel || null,
      $applyAutoChargeOnOrders: Number(charge.applyAutoChargeOnOrders),
      $skipIfOrderValueIsAbove: Number(charge.skipIfOrderValueIsAbove),
      $orderValue: charge.orderValue || 0,
    };

    try {
      const result = await statement.executeAsync(params);
      return charge;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async delete(id: string): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM "custom-charge" WHERE _id = $id
    `);

    try {
      await statement.executeAsync({ $id: id });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findById(id: string): Promise<CustomCharge> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "custom-charge" WHERE _id = $id
    `);

    try {
      const result = await statement.executeAsync({ $id: id });
      const row = await result.getFirstAsync();
      if (!row) {
        throw new Error("Custom charge not found");
      }
      return CustomCharge.fromRow(row);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findAll(): Promise<CustomCharge[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "custom-charge"
    `);

    try {
      const result = await statement.executeAsync({});
      const rows = await result.getAllAsync();
      return rows.map((row) => CustomCharge.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByCompany(companyRef: string): Promise<CustomCharge[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "custom-charge" 
      WHERE companyRef = $companyRef
      ORDER BY value DESC
    `);

    try {
      const result = await statement.executeAsync({ $companyRef: companyRef });
      const rows = await result.getAllAsync();
      return rows.map((row) => CustomCharge.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findActiveByLocation(locationRef: string): Promise<CustomCharge[]> {
    const statement = await this.db.getConnection().prepareAsync(`
     SELECT * FROM "custom-charge" 
WHERE 
  locationRefs LIKE '%' || $locationRef || '%'
  AND status = 'active'
  ORDER BY value DESC
    `);

    try {
      const result = await statement.executeAsync({
        $locationRef: locationRef,
      });
      const rows = await result.getAllAsync();
      return rows.map((row) => CustomCharge.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByType(type: string, companyRef?: string): Promise<CustomCharge[]> {
    const conditions = ["type = $type"];
    const params: Record<string, any> = { $type: type };

    if (companyRef) {
      conditions.push("companyRef = $companyRef");
      params.$companyRef = companyRef;
    }

    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "custom-charge" 
      WHERE ${conditions.join(" AND ")}
      ORDER BY value DESC
    `);

    try {
      const result = await statement.executeAsync(params);
      const rows = await result.getAllAsync();
      return rows.map((row) => CustomCharge.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findAutoCharges(orderValue: number): Promise<CustomCharge[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "custom-charge" 
      WHERE status = 'active'
      AND applyAutoChargeOnOrders = 1
      AND (
        skipIfOrderValueIsAbove = 0 
        OR (skipIfOrderValueIsAbove = 1 AND orderValue <= $orderValue)
      )
      ORDER BY value DESC
    `);

    try {
      const result = await statement.executeAsync({ $orderValue: orderValue });
      const rows = await result.getAllAsync();
      return rows.map((row) => CustomCharge.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateStatus(id: string, status: string): Promise<CustomCharge> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "custom-charge" SET status = $status, updatedAt = CURRENT_TIMESTAMP WHERE _id = $id
    `);

    try {
      await statement.executeAsync({ $id: id, $status: status });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async searchCharges(
    query: string,
    pageParam: number = 1,
    rowsPerPage: number = 100
  ): Promise<[CustomCharge[], number]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "custom-charge" 
      WHERE status = 'active' 
      AND (
        json_extract(name, '$.en') LIKE $pattern
        OR json_extract(name, '$.ar') LIKE $pattern
        OR type LIKE $pattern
        OR chargeType LIKE $pattern
      )
      ORDER BY createdAt DESC
      LIMIT $limit OFFSET $offset
    `);

    const countStatement = await this.db.getConnection().prepareAsync(`
      SELECT COUNT(*) as total FROM "custom-charge" 
      WHERE status = 'active' 
      AND (
        json_extract(name, '$.en') LIKE $pattern
        OR json_extract(name, '$.ar') LIKE $pattern
        OR type LIKE $pattern
        OR chargeType LIKE $pattern
      )
    `);

    const params = {
      $pattern: `%${query}%`,
      $limit: rowsPerPage,
      $offset: rowsPerPage * (pageParam - 1),
    };

    try {
      const countResult: any = await countStatement.executeAsync({
        $pattern: `%${query}%`,
      });
      const totalCount = Number((await countResult.getFirstAsync()).total);

      const result = await statement.executeAsync(params);
      const rows = await result.getAllAsync();
      return [rows.map((row) => CustomCharge.fromRow(row)), totalCount];
    } finally {
      await statement.finalizeAsync();
      await countStatement.finalizeAsync();
    }
  }

  async getPaginatedCharges(
    pageParam: number = 1,
    rowsPerPage: number = 100,
    whereClause?: string
  ): Promise<[CustomCharge[], number]> {
    try {
      let sqlQuery = `SELECT * FROM "custom-charge"`;

      if (whereClause) {
        sqlQuery += ` ${whereClause}`;
      } else {
        sqlQuery += ` WHERE status = 'active'`;
      }

      // Get total count first
      const countQuery = `SELECT COUNT(*) as total FROM (${sqlQuery})`;
      const countResult: any = await this.db
        .getConnection()
        .getFirstAsync(countQuery);
      const totalCount = Number(countResult.total);

      // Add pagination
      sqlQuery += ` ORDER BY createdAt DESC 
                    LIMIT ${rowsPerPage} OFFSET ${
        rowsPerPage * (pageParam - 1)
      }`;

      // Get paginated results
      const rows = await this.db.getConnection().getAllAsync(sqlQuery);
      const charges = rows.map((row) => CustomCharge.fromRow(row));

      return [charges, totalCount];
    } catch (error) {
      console.error("Error in getPaginatedCharges:", error);
      return [[], 0];
    }
  }

  async findAndCount(options: {
    take?: number;
    skip?: number;
    where?: { status?: string };
  }): Promise<[CustomCharge[], number]> {
    const { take = 100, skip = 0, where } = options;
    const pageParam = Math.floor(skip / take) + 1;

    let whereClause = "";
    if (where?.status) {
      whereClause = `WHERE status = '${where.status}'`;
    }

    return this.getPaginatedCharges(pageParam, take, whereClause);
  }
}
