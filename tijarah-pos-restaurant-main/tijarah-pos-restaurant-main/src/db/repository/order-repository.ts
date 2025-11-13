import { Order } from "../schema/order";
import { OrderItem } from "../schema/order/order-items";
import { PaymentSchema } from "../schema/order/order-payment";
import { BaseRepository } from "./base-repository";

interface WhereCondition {
  [key: string]: any;
  orderNum?: { operator: string; value: string };
  deviceRef?: string;
  paymentMethod?: { operator: string; value: string };
  createdAt?: { operator: string; start?: Date; end?: Date };
  acceptedAt?: { operator: string; start?: Date; end?: Date };
  appliedDiscount?: boolean;
  onlineOrdering?: boolean;
  qrOrdering?: boolean;
  orderType?: { operator: string; value: string };
  orderStatus?: { operator: string; value: string };
  refunds?: { operator: string };
}

export interface FindOptions {
  where?: WhereCondition | WhereCondition[];
  take?: number;
  skip?: number;
}

export class OrderRepository extends BaseRepository<Order, string> {
  constructor() {
    super("orders");
  }

  async create(order: Order): Promise<Order> {
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO orders (
        _id, company, companyRef, location, locationRef,
        customer, customerRef, cashier, cashierRef,
        device, deviceRef, orderNum, tokenNum,
        orderType, orderStatus, qrOrdering,
        onlineOrdering, specialInstructions, items,
        payment, dineInData, refunds, createdAt,
        acceptedAt, updatedAt, receivedAt, source,
        appliedDiscount, paymentMethod, refundAvailable, currency
      ) VALUES (
        $id, $company, $companyRef, $location, $locationRef,
        $customer, $customerRef, $cashier, $cashierRef,
        $device, $deviceRef, $orderNum, $tokenNum,
        $orderType, $orderStatus, $qrOrdering,
        $onlineOrdering, $specialInstructions, $items,
        $payment, $dineInData, $refunds, $createdAt,
        $acceptedAt, $createdAt, $receivedAt, $source,
        $appliedDiscount, $paymentMethod, $refundAvailable, $currency
      )
      ON CONFLICT(_id) DO UPDATE SET
        company = $company,
        companyRef = $companyRef,
        location = $location,
        locationRef = $locationRef,
        customer = $customer,
        customerRef = $customerRef,
        cashier = $cashier,
        cashierRef = $cashierRef,
        device = $device,
        deviceRef = $deviceRef,
        orderNum = $orderNum,
        tokenNum = $tokenNum,
        orderType = $orderType,
        orderStatus = $orderStatus,
        qrOrdering = $qrOrdering,
        onlineOrdering = $onlineOrdering,
        specialInstructions = $specialInstructions,
        items = $items,
        payment = $payment,
        dineInData = $dineInData,
        refunds = $refunds,
        createdAt = $createdAt,
        acceptedAt = CURRENT_TIMESTAMP,
        updatedAt = $updatedAt,
        receivedAt = $receivedAt,
        source = $source,
        appliedDiscount = $appliedDiscount,
        paymentMethod = $paymentMethod,
        refundAvailable = $refundAvailable,
        currency = $currency,
        updatedAt = CURRENT_TIMESTAMP
    `);

    const params: any = {
      $id: order._id,
      $company: JSON.stringify(order.company),
      $companyRef: order.companyRef,
      $location: JSON.stringify(order.location),
      $locationRef: order.locationRef,
      $customer: order.customer ? JSON.stringify(order.customer) : null,
      $customerRef: order.customerRef || null,
      $cashier: order.cashier ? JSON.stringify(order.cashier) : null,
      $cashierRef: order.cashierRef || null,
      $device: order.device ? JSON.stringify(order.device) : null,
      $deviceRef: order.deviceRef || null,
      $orderNum: order.orderNum,
      $tokenNum: order.tokenNum || null,
      $orderType: order.orderType || null,
      $orderStatus: order.orderStatus,
      $qrOrdering: Number(order.qrOrdering) || 0,
      $onlineOrdering: Number(order.onlineOrdering) || 0,
      $specialInstructions: order.specialInstructions || null,
      $items: JSON.stringify(order.items),
      $payment: JSON.stringify(order.payment),
      $dineInData: JSON.stringify(order.dineInData),
      $refunds: JSON.stringify(order.refunds),
      $createdAt: order.createdAt,
      $acceptedAt: order.acceptedAt || null,
      $updatedAt: order.createdAt,
      $receivedAt: order.receivedAt || null,
      $source: order.source,
      $appliedDiscount: Number(order.appliedDiscount) || 0,
      $paymentMethod: JSON.stringify(order.paymentMethod),
      $refundAvailable: Number(order.refundAvailable) || 0,
      $currency: order.currency || "SAR",
    };

    try {
      await statement.executeAsync(params);
      return order;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async createMany(orders: Order[]): Promise<Order[]> {
    const columns = [
      "_id",
      "company",
      "companyRef",
      "location",
      "locationRef",
      "customer",
      "customerRef",
      "cashier",
      "cashierRef",
      "device",
      "deviceRef",
      "orderNum",
      "tokenNum",
      "orderType",
      "orderStatus",
      "qrOrdering",
      "onlineOrdering",
      "specialInstructions",
      "items",
      "payment",
      "dineInData",
      "refunds",
      "createdAt",
      "acceptedAt",
      "receivedAt",
      "source",
      "appliedDiscount",
      "paymentMethod",
      "refundAvailable",
      "currency",
    ];

    const generateParams = (order: Order) => {
      const toRow = Order.toRow(order);
      return [
        toRow._id,
        toRow.company,
        toRow.companyRef,
        toRow.location,
        toRow.locationRef,
        toRow.customer,
        toRow.customerRef || null,
        toRow.cashier,
        toRow.cashierRef || null,
        toRow.device,
        toRow.deviceRef || null,
        toRow.orderNum,
        toRow.tokenNum || null,
        toRow.orderType || null,
        toRow.orderStatus,
        toRow.qrOrdering || 0,
        toRow.onlineOrdering || 0,
        toRow.specialInstructions || null,
        toRow.items,
        toRow.payment,
        toRow.dineInData,
        toRow.refunds,
        toRow.createdAt,
        toRow.acceptedAt || null,
        toRow.receivedAt || null,
        toRow.source,
        toRow.appliedDiscount || 0,
        toRow.paymentMethod,
        toRow.refundAvailable || 0,
        toRow.currency || "SAR",
      ];
    };

    return this.createManyGeneric("orders", orders, columns, generateParams);
  }

  async getCashOrders(
    deviceRef: string,
    startDate: Date,
    endDate: Date
  ): Promise<Order[]> {
    try {
      const query = `
        SELECT * FROM orders 
        WHERE deviceRef = ? 
        AND json_extract(paymentMethod, '$[0]') = 'cash'
        AND (
          (datetime(createdAt) BETWEEN datetime(?) AND datetime(?))
          OR 
          (datetime(acceptedAt) BETWEEN datetime(?) AND datetime(?))
        )
        ORDER BY datetime(createdAt) DESC`;

      const params = [
        deviceRef,
        startDate.toISOString(),
        endDate.toISOString(),
        startDate.toISOString(),
        endDate.toISOString(),
      ];

      console.log("Query:", query);
      console.log("Params:", params);

      const rows = await this.db.getConnection().getAllAsync(query, params);
      console.log("Found rows:", rows.length);

      return rows.map((row) => Order.fromRow(row));
    } catch (error) {
      console.error("Error getting cash orders:", error);
      throw error;
    }
  }

  async find(options: FindOptions): Promise<Order[]> {
    try {
      let baseQuery = "SELECT * FROM `order`";
      const params: any[] = [];
      let conditions: string[] = [];

      // Handle where conditions
      if (options.where) {
        const whereConditions = Array.isArray(options.where)
          ? options.where
          : [options.where];

        conditions = whereConditions.map((condition) => {
          const subConditions: string[] = [];

          Object.entries(condition).forEach(([key, value]) => {
            if (value === null || value === undefined) return;

            if (typeof value === "object") {
              // Handle Like operator for paymentMethod
              if (value.operator === "Like") {
                subConditions.push(`${key} LIKE ?`);
                params.push(value.value);
              }
              // Handle Between operator for dates
              else if (
                (key === "createdAt" || key === "acceptedAt") &&
                value.operator === "Between"
              ) {
                subConditions.push(`${key} BETWEEN ? AND ?`);
                params.push(value.start);
                params.push(value.end);
              }
            } else {
              // Handle direct equals comparison
              subConditions.push(`${key} = ?`);
              params.push(value);
            }
          });

          return `(${subConditions.join(" AND ")})`;
        });

        if (conditions.length > 0) {
          baseQuery += ` WHERE ${conditions.join(" OR ")}`;
        }
      }

      // Add pagination if specified
      if (options.take !== undefined && options.skip !== undefined) {
        baseQuery += ` LIMIT ? OFFSET ?`;
        params.push(options.take, options.skip);
      }

      // Get results
      const rows = await this.db.getConnection().getAllAsync(baseQuery, params);
      return rows.map((row) => Order.fromRow(row));
    } catch (error) {
      console.error("Error in find:", error);
      return [];
    }
  }

  async findById(id: string): Promise<Order> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM orders WHERE _id = $id
    `);

    try {
      const result = await statement.executeAsync({ $id: id });
      const row = await result.getFirstAsync();
      if (!row) {
        throw new Error("Order not found");
      }
      return Order.fromRow(row);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async delete(id: string): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM orders WHERE _id = $id
    `);

    try {
      await statement.executeAsync({ $id: id });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findAll(): Promise<Order[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM orders ORDER BY createdAt DESC
    `);

    try {
      const result = await statement.executeAsync({});
      const rows = await result.getAllAsync();
      return rows.map((row) => Order.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByOrderNumber(orderNum: string): Promise<Order | null> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM orders WHERE orderNum = $orderNum
    `);

    try {
      const result = await statement.executeAsync({ $orderNum: orderNum });
      const row = await result.getFirstAsync();
      return row ? Order.fromRow(row) : null;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByCustomer(customerRef: string): Promise<Order[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM orders 
      WHERE customerRef = $customerRef 
      ORDER BY createdAt DESC
    `);

    try {
      const result = await statement.executeAsync({
        $customerRef: customerRef,
      });
      const rows = await result.getAllAsync();
      return rows.map((row) => Order.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    locationRef?: string
  ): Promise<Order[]> {
    const baseQuery = `
      SELECT * FROM orders 
      WHERE createdAt BETWEEN $startDate AND $endDate
      ${locationRef ? "AND locationRef = $locationRef" : ""}
      ORDER BY createdAt DESC
    `;

    const statement = await this.db.getConnection().prepareAsync(baseQuery);

    try {
      const params = {
        $startDate: startDate.toISOString(),
        $endDate: endDate.toISOString(),
        ...(locationRef && { $locationRef: locationRef }),
      };
      const result = await statement.executeAsync(params);
      const rows = await result.getAllAsync();
      return rows.map((row) => Order.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findPendingOrders(locationRef: string): Promise<Order[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM orders 
      WHERE locationRef = $locationRef 
      AND orderStatus IN ('pending', 'accepted')
      ORDER BY createdAt ASC
    `);

    try {
      const result = await statement.executeAsync({
        $locationRef: locationRef,
      });
      const rows = await result.getAllAsync();
      return rows.map((row) => Order.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findAndCount(options: FindOptions): Promise<[Order[], number]> {
    try {
      const conditions: string[] = [];
      const params: Record<string, any> = {};
      let paramIndex = 0;

      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          if (value === null || value === undefined) return;

          if (typeof value === "object") {
            const paramName = `$param${paramIndex}`;

            // Handle ILike operator for text searches
            if (value.operator === "ILike") {
              conditions.push(`${key} LIKE ${paramName}`);
              params[paramName] = `%${value.value}%`;
            }
            // Handle Like operator for payment method
            else if (key === "paymentMethod" && value.operator === "Like") {
              conditions.push(
                `EXISTS (
                  SELECT 1 
                  FROM json_each(payment, '$.breakup') 
                  WHERE json_extract(value, '$.providerName') LIKE ${paramName}
                )`
              );
              params[paramName] = `%${value.value}%`;
            }
            // Handle Between operator for dates
            else if (
              (key === "createdAt" || key === "acceptedAt") &&
              value.operator === "Between"
            ) {
              conditions.push(
                `${key} BETWEEN $start${paramIndex} AND $end${paramIndex}`
              );
              params[`$start${paramIndex}`] = value.start?.toISOString();
              params[`$end${paramIndex}`] = value.end?.toISOString();
            }
            // Handle Raw operator for refunds check
            else if (key === "refunds" && value.operator === "Raw") {
              conditions.push(`json_array_length(refunds) > 0`);
            }
            // Handle order type and status
            else if (
              (key === "orderType" || key === "orderStatus") &&
              value.operator === "ILike"
            ) {
              conditions.push(`${key} LIKE ${paramName}`);
              params[paramName] = `%${value.value}%`;
            }
          }
          // Handle boolean fields
          else if (typeof value === "boolean") {
            const paramName = `$param${paramIndex}`;
            conditions.push(`${key} = ${paramName}`);
            params[paramName] = value ? 1 : 0;
          }
          // Handle direct comparison
          else {
            const paramName = `$param${paramIndex}`;
            conditions.push(`${key} = ${paramName}`);
            params[paramName] = value;
          }
          paramIndex++;
        });
      }

      const whereClause =
        conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";
      const baseQuery = `SELECT * FROM orders${whereClause}`;

      // Get total count
      const countStatement = await this.db
        .getConnection()
        .prepareAsync(`SELECT COUNT(*) as total FROM orders${whereClause}`);

      // Prepare main query
      const queryStatement = await this.db.getConnection().prepareAsync(`
        ${baseQuery}
        ORDER BY createdAt DESC
        ${options.take !== undefined ? "LIMIT $limit OFFSET $offset" : ""}
      `);

      try {
        // Get count
        const countResult: any = await countStatement.executeAsync(params);
        const totalCount = Number((await countResult.getFirstAsync()).total);

        // Add pagination params if needed
        if (options.take !== undefined && options.skip !== undefined) {
          params.$limit = options.take;
          params.$offset = options.skip;
        }

        // Get results
        const result = await queryStatement.executeAsync(params);
        const rows = await result.getAllAsync();

        const orders = rows
          .map((row: any) => {
            try {
              return Order.fromRow(row);
            } catch (e) {
              console.error(`Error parsing JSON for order ${row._id}:`, e);
              return null;
            }
          })
          .filter((order): order is Order => order !== null);

        return [orders, totalCount];
      } finally {
        await countStatement.finalizeAsync();
        await queryStatement.finalizeAsync();
      }
    } catch (error) {
      console.error("Error in findAndCount:order", error);
      return [[], 0];
    }
  }

  async findByStatus(status: string, locationRef?: string): Promise<Order[]> {
    const baseQuery = `
      SELECT * FROM orders 
      WHERE orderStatus = $status
      ${locationRef ? "AND locationRef = $locationRef" : ""}
      ORDER BY createdAt DESC
    `;

    const statement = await this.db.getConnection().prepareAsync(baseQuery);

    try {
      const params = {
        $status: status,
        ...(locationRef && { $locationRef: locationRef }),
      };
      const result = await statement.executeAsync(params);
      const rows = await result.getAllAsync();
      return rows.map((row) => Order.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async update(id: string, order: Order): Promise<Order> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE orders SET
        company = $company,
        companyRef = $companyRef,
        location = $location,
        locationRef = $locationRef,
        customer = $customer,
        customerRef = $customerRef,
        cashier = $cashier,
        cashierRef = $cashierRef,
        device = $device,
        deviceRef = $deviceRef,
        orderNum = $orderNum,
        tokenNum = $tokenNum,
        orderType = $orderType,
        orderStatus = $orderStatus,
        qrOrdering = $qrOrdering,
        onlineOrdering = $onlineOrdering,
        specialInstructions = $specialInstructions,
        items = $items,
        payment = $payment,
        dineInData = $dineInData,
        refunds = $refunds,
        acceptedAt = $acceptedAt,
        receivedAt = $receivedAt,
        source = $source,
        appliedDiscount = $appliedDiscount,
        paymentMethod = $paymentMethod,
        refundAvailable = $refundAvailable,
        updatedAt = CURRENT_TIMESTAMP,
        currency = $currency
      WHERE _id = $id
    `);

    const params: any = {
      $id: id,
      $company: JSON.stringify(order.company),
      $companyRef: order.companyRef,
      $location: JSON.stringify(order.location),
      $locationRef: order.locationRef,
      $customer: order.customer ? JSON.stringify(order.customer) : null,
      $customerRef: order.customerRef || null,
      $cashier: order.cashier ? JSON.stringify(order.cashier) : null,
      $cashierRef: order.cashierRef || null,
      $device: order.device ? JSON.stringify(order.device) : null,
      $deviceRef: order.deviceRef || null,
      $orderNum: order.orderNum,
      $tokenNum: order.tokenNum || null,
      $orderType: order.orderType || null,
      $orderStatus: order.orderStatus,
      $qrOrdering: Number(order.qrOrdering),
      $onlineOrdering: Number(order.onlineOrdering),
      $specialInstructions: order.specialInstructions || null,
      $items: JSON.stringify(order.items),
      $payment: JSON.stringify(order.payment),
      $dineInData: JSON.stringify(order.dineInData),
      $refunds: JSON.stringify(order.refunds),
      $acceptedAt: order.acceptedAt || null,
      $receivedAt: order.receivedAt || null,
      $source: order.source,
      $appliedDiscount: Number(order.appliedDiscount),
      $paymentMethod: JSON.stringify(order.paymentMethod),
      $refundAvailable: Number(order.refundAvailable),
      $currency: order.currency || "SAR",
    };

    try {
      await statement.executeAsync(params);
      order._id = id;
      return order;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE orders SET
        orderStatus = $status,
        ${status === "accepted" ? "acceptedAt = $timestamp," : ""}
        ${status === "received" ? "receivedAt = $timestamp," : ""}
       updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
        $status: status,
      });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateItems(id: string, items: OrderItem[]): Promise<Order> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE orders SET items = $items, updatedAt = CURRENT_TIMESTAMP WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
        $items: JSON.stringify(items),
      });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updatePayment(id: string, payment: PaymentSchema): Promise<Order> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE orders SET payment = $payment, updatedAt = CURRENT_TIMESTAMP WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
        $payment: JSON.stringify(payment),
      });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async deleteOldOrders(limit: number): Promise<void> {
    await this.db.getConnection().execAsync(`
      DELETE FROM orders
      WHERE _id IN (
        SELECT _id FROM orders
        ORDER BY createdAt DESC
        LIMIT -1 OFFSET ${limit}
      )
    `);
  }
}
