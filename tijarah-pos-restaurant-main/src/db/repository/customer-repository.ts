import { BaseRepository } from "./base-repository";
import { Address, Customer, SpecialEventsSchema } from "../schema/customer";

export interface FindAndCountOptions {
  take?: number;
  skip?: number;
  where?: WhereCondition | WhereCondition[];
  order?: {
    [key: string]: "ASC" | "DESC";
  };
}

interface WhereCondition {
  firstName?: { operator?: string; value?: string } | string;
  lastName?: { operator?: string; value?: string } | string;
  phone?: { operator?: string; value?: string } | string;
  email?: { operator?: string; value?: string } | string;
  status?: string;
  [key: string]: any;
}

export class CustomerRepository extends BaseRepository<Customer, string> {
  constructor() {
    super("customer");
  }

  async create(customer: Customer): Promise<Customer> {
    console.log("customer is king", customer);
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO customer (
        _id, createdAt, updatedAt, profilePicture, firstName,
        lastName, phone, email, vat, company,
        companyRef, locations, groups, locationRefs, groupRefs,
        allowCredit, maximumCredit, usedCredit, availableCredit, blockedCredit,
        blacklistCredit, address, specialEvents, totalSpend, totalRefunded,
        totalOrders, lastOrder, status, source, note, createdAt, updatedAt
      ) VALUES (
        $id, CURRENT_TIMESTAMP, NULL, $profilePicture, $firstName,
        $lastName, $phone, NULL, $vat, $company,
        $companyRef, $locations, $groups, $locationRefs, $groupRefs,
        $allowCredit, $maximumCredit, $usedCredit, $availableCredit, $blockedCredit,
        $blacklistCredit, $address, $specialEvents, $totalSpend, $totalRefunded,
        $totalOrders, $lastOrder, $status, $source, $note, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT(_id) DO UPDATE SET
        updatedAt = CURRENT_TIMESTAMP,
        profilePicture = $profilePicture,
        firstName = $firstName,
        lastName = $lastName,
        note = $note,
        phone = $phone,
        vat = $vat,
        company = $company,
        companyRef = $companyRef,
        locations = $locations,
        groups = $groups,
        locationRefs = $locationRefs,
        groupRefs = $groupRefs,
        allowCredit = $allowCredit,
        blockedCredit = $blockedCredit,
        usedCredit = $usedCredit,
        blacklistCredit = $blacklistCredit,
        maximumCredit = $maximumCredit,
        availableCredit = $availableCredit,
        address = $address,
        specialEvents = $specialEvents,
        totalSpend = $totalSpend,
        totalRefunded = $totalRefunded,
        totalOrders = $totalOrders,
        lastOrder = $lastOrder,
        status = $status,
        source = $source
    `);

    const params: any = {
      $id: customer._id,
      $profilePicture: customer.profilePicture || null,
      $firstName: customer.firstName,
      $lastName: customer.lastName || null,
      $phone: customer.phone,
      $vat: customer.vat || null,
      $company: JSON.stringify(customer.company),
      $companyRef: customer.companyRef,
      $locations: JSON.stringify(customer.locations),
      $groups: JSON.stringify(customer.groups),
      $locationRefs: JSON.stringify(customer.locationRefs),
      $groupRefs: JSON.stringify(customer.groupRefs),
      $allowCredit: Number(customer.allowCredit),
      $blockedCredit: Number(customer.blockedCredit),
      $usedCredit: customer.usedCredit || 0,
      $availableCredit: Number(customer.availableCredit),
      $maximumCredit: Number(customer.maximumCredit),
      $blacklistCredit: Number(customer.blacklistCredit),
      $address: customer.address ? JSON.stringify(customer.address) : null,
      $specialEvents: JSON.stringify(customer.specialEvents),
      $totalSpend: customer.totalSpend || 0,
      $totalRefunded: customer.totalRefunded || 0,
      $totalOrders: customer.totalOrders || 0,
      $lastOrder: customer.lastOrder ? customer.lastOrder.toString() : null,
      $status: customer.status,
      $source: customer.source,
      $note: customer.note,
    };

    try {
      const result = await statement.executeAsync(params);
      const created = await result.getFirstAsync();
      return created ? Customer.fromRow(created) : customer;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async createMany(customers: Customer[]): Promise<Customer[]> {
    const columns = [
      "_id",
      "profilePicture",
      "firstName",
      "lastName",
      "phone",
      "note",
      "email",
      "vat",
      "company",
      "companyRef",
      "locations",
      "groups",
      "locationRefs",
      "groupRefs",
      "allowCredit",
      "maximumCredit",
      "usedCredit",
      "availableCredit",
      "blockedCredit",
      "blacklistCredit",
      "address",
      "specialEvents",
      "totalSpend",
      "totalRefunded",
      "totalOrders",
      "lastOrder",
      "status",
      "source",
    ];

    const generateParams = (customer: Customer) => {
      const toRow = Customer.toRow(customer);
      return [
        toRow._id,
        toRow.profilePicture || null,
        toRow.firstName || "Unknown",
        toRow.lastName || null,
        toRow.phone || "Unknown",
        toRow.note || "",
        toRow.email,
        toRow.vat || null,
        toRow.company || "{}",
        toRow.companyRef,
        toRow.locations || "[]",
        toRow.groups || "[]",
        toRow.locationRefs || "[]",
        toRow.groupRefs || "[]",
        toRow.allowCredit || 0,
        toRow.maximumCredit || 0,
        toRow.usedCredit || 0,
        toRow.availableCredit || 0,
        toRow.blockedCredit || 0,
        toRow.blacklistCredit || 0,
        toRow.address ? toRow.address : null,
        toRow.specialEvents || "[]",
        toRow.totalSpend || 0,
        toRow.totalRefunded || 0,
        toRow.totalOrders || 0,
        toRow.lastOrder ? toRow.lastOrder.toString() : null,
        toRow.status || "active",
        toRow.source || "server",
      ];
    };

    return this.createManyGeneric(
      "customer",
      customers,
      columns,
      generateParams
    );
  }

  async update(id: string, customer: Customer): Promise<Customer> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE customer SET
        profilePicture = $profilePicture,
        firstName = $firstName,
        lastName = $lastName,
        phone = $phone,
        email = $email,
        note = $note,
        vat = $vat,
        company = $company,
        companyRef = $companyRef,
        locations = $locations,
        groups = $groups,
        locationRefs = $locationRefs,
        groupRefs = $groupRefs,
        allowCredit = $allowCredit,
        maximumCredit = $maximumCredit,
        usedCredit = $usedCredit,
        availableCredit = $availableCredit,
        blockedCredit = $blockedCredit,
        blacklistCredit = $blacklistCredit,
        address = $address,
        specialEvents = $specialEvents,
        totalSpend = $totalSpend,
        totalRefunded = $totalRefunded,
        totalOrders = $totalOrders,
        lastOrder = $lastOrder,
        status = $status,
        source = $source,
        updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    const params: any = {
      $id: id,
      $profilePicture: customer.profilePicture || null,
      $firstName: customer.firstName,
      $lastName: customer.lastName || null,
      $phone: customer.phone,
      $note: customer.note || "",
      $email: customer.email || null,
      $vat: customer.vat || null,
      $company: JSON.stringify(customer.company),
      $companyRef: customer.companyRef,
      $locations: JSON.stringify(customer.locations),
      $groups: JSON.stringify(customer.groups),
      $locationRefs: JSON.stringify(customer.locationRefs),
      $groupRefs: JSON.stringify(customer.groupRefs),
      $allowCredit: Number(customer.allowCredit),
      $maximumCredit: customer.maximumCredit,
      $usedCredit: customer.usedCredit,
      $availableCredit: customer.availableCredit,
      $blockedCredit: Number(customer.blockedCredit),
      $blacklistCredit: Number(customer.blacklistCredit),
      $address: customer.address ? JSON.stringify(customer.address) : null,
      $specialEvents: JSON.stringify(customer.specialEvents),
      $totalSpend: customer.totalSpend,
      $totalRefunded: customer.totalRefunded,
      $totalOrders: customer.totalOrders,
      $lastOrder: customer.lastOrder,
      $status: customer.status,
      $source: customer.source,
    };

    try {
      const result = await statement.executeAsync(params);
      return customer;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findById(id: string): Promise<Customer> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM customer WHERE _id = $id
    `);

    try {
      const result = await statement.executeAsync({ $id: id });
      const row = await result.getFirstAsync();
      if (!row) {
        throw new Error("Customer not found");
      }
      return Customer.fromRow(row);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findAll(): Promise<Customer[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM customer
    `);

    try {
      const result = await statement.executeAsync({});
      const rows = await result.getAllAsync();
      return rows.map((row) => Customer.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByPhone(
    phone: string,
    companyRef?: string
  ): Promise<Customer | null> {
    const conditions = ["phone = $phone"];
    const params: Record<string, any> = { $phone: phone };

    if (companyRef) {
      conditions.push("companyRef = $companyRef");
      params.$companyRef = companyRef;
    }

    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM customer WHERE ${conditions.join(" AND ")}
    `);

    try {
      const result = await statement.executeAsync(params);
      const row = await result.getFirstAsync();
      return row ? Customer.fromRow(row) : null;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByEmail(
    email: string,
    companyRef?: string
  ): Promise<Customer | null> {
    const conditions = ["email = $email"];
    const params: Record<string, any> = { $email: email };

    if (companyRef) {
      conditions.push("companyRef = $companyRef");
      params.$companyRef = companyRef;
    }

    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM customer WHERE ${conditions.join(" AND ")}
    `);

    try {
      const result = await statement.executeAsync(params);
      const row = await result.getFirstAsync();
      return row ? Customer.fromRow(row) : null;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async search(query: string, companyRef?: string): Promise<Customer[]> {
    const conditions = [
      "(firstName LIKE $pattern OR lastName LIKE $pattern OR phone LIKE $pattern OR email LIKE $pattern)",
    ];
    const params: Record<string, any> = { $pattern: `%${query}%` };

    if (companyRef) {
      conditions.push("companyRef = $companyRef");
      params.$companyRef = companyRef;
    }

    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM customer 
      WHERE ${conditions.join(" AND ")}
    `);

    try {
      const result = await statement.executeAsync(params);
      const rows = await result.getAllAsync();
      return rows.map((row) => Customer.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByLocation(locationRef: string): Promise<Customer[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM customer 
WHERE locationRefs LIKE '%' || $locationRef || '%'
    `);

    try {
      const result = await statement.executeAsync({
        $locationRef: locationRef,
      });
      const rows = await result.getAllAsync();
      return rows.map((row) => Customer.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByGroup(groupRef: string): Promise<Customer[]> {
    const statement = await this.db.getConnection().prepareAsync(`
    SELECT * FROM customer 
WHERE groupRefs LIKE '%' || $groupRef || '%'
    `);

    try {
      const result = await statement.executeAsync({ $groupRef: groupRef });
      const rows = await result.getAllAsync();
      return rows.map((row) => Customer.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateCreditUsage(id: string, amount: number): Promise<Customer> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE customer 
      SET usedCredit = usedCredit + $amount,
          availableCredit = maximumCredit - (usedCredit + $amount), updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    try {
      await statement.executeAsync({ $id: id, $amount: amount });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateTotalSpend(
    id: string,
    amount: number,
    isRefund: boolean = false
  ): Promise<Customer> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE customer 
      SET ${isRefund ? "totalRefunded" : "totalSpend"} = ${
      isRefund ? "totalRefunded" : "totalSpend"
    } + $amount
          ${
            !isRefund
              ? ", totalOrders = totalOrders + 1, lastOrder = CURRENT_TIMESTAMP"
              : ""
          }, updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    try {
      await statement.executeAsync({ $id: id, $amount: amount });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateCreditSettings(
    id: string,
    settings: {
      allowCredit?: boolean;
      maximumCredit?: number;
      blockedCredit?: boolean;
      blacklistCredit?: boolean;
    }
  ): Promise<Customer> {
    const updates: string[] = [];
    const params: Record<string, any> = { $id: id };

    if (settings.allowCredit !== undefined) {
      updates.push("allowCredit = $allowCredit");
      params.$allowCredit = Number(settings.allowCredit);
    }
    if (settings.maximumCredit !== undefined) {
      updates.push(
        "maximumCredit = $maximumCredit, availableCredit = $maximumCredit - usedCredit"
      );
      params.$maximumCredit = settings.maximumCredit;
    }
    if (settings.blockedCredit !== undefined) {
      updates.push("blockedCredit = $blockedCredit");
      params.$blockedCredit = Number(settings.blockedCredit);
    }
    if (settings.blacklistCredit !== undefined) {
      updates.push("blacklistCredit = $blacklistCredit");
      params.$blacklistCredit = Number(settings.blacklistCredit);
    }

    if (updates.length === 0) return this.findById(id);

    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE customer 
      SET ${updates.join(", ")}, updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    try {
      await statement.executeAsync(params);
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async addSpecialEvent(
    id: string,
    event: SpecialEventsSchema
  ): Promise<Customer> {
    const customer = await this.findById(id);
    event.id = id;
    customer.specialEvents = customer.specialEvents || [];
    customer.specialEvents.push(event);
    return this.update(id, customer);
  }

  async removeSpecialEvent(
    customerId: string,
    eventId: string
  ): Promise<Customer> {
    const customer = await this.findById(customerId);
    if (customer.specialEvents) {
      customer.specialEvents = customer.specialEvents.filter(
        (event) => event.id !== eventId
      );
    }
    return this.update(customerId, customer);
  }

  async updateAddress(id: string, address: Address): Promise<Customer> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE customer 
      SET address = $address, updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
        $address: JSON.stringify(address),
      });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateStatus(id: string, status: string): Promise<Customer> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE customer SET status = $status, updatedAt = CURRENT_TIMESTAMP WHERE _id = $id
    `);

    try {
      await statement.executeAsync({ $id: id, $status: status });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findWithSearch(
    pageSize: number = 10,
    pageNumber: number = 1,
    search?: string
  ): Promise<[Customer[], number]> {
    try {
      const params: Record<string, any> = {
        $limit: pageSize,
        $offset: (pageNumber - 1) * pageSize,
      };

      let baseQuery = "SELECT * FROM customer";
      let countQuery = "SELECT COUNT(*) as total FROM customer";

      // Add search conditions if search text is provided
      if (search && search.trim()) {
        const whereClause = `
          WHERE firstName LIKE $search 
          OR lastName LIKE $search
          OR email LIKE $search 
          OR phone LIKE $search
          OR status LIKE $search
        `;
        baseQuery += whereClause;
        countQuery += whereClause;
        params.$search = `%${search.trim()}%`;
      }

      // Add pagination and ordering
      baseQuery += " ORDER BY createdAt DESC LIMIT $limit OFFSET $offset";

      // Prepare statements
      const countStatement = await this.db
        .getConnection()
        .prepareAsync(countQuery);

      console.log(baseQuery);
      const queryStatement = await this.db
        .getConnection()
        .prepareAsync(baseQuery);

      try {
        // Get total count
        const countResult: any = await countStatement.executeAsync(params);
        const total = Number((await countResult.getFirstAsync()).total);

        // Get paginated results
        const result = await queryStatement.executeAsync(params);
        const rows = await result.getAllAsync();

        return [rows.map((row) => Customer.fromRow(row)), total];
      } finally {
        await countStatement.finalizeAsync();
        await queryStatement.finalizeAsync();
      }
    } catch (error) {
      console.error("Error in findAndCount:", error);
      throw error;
    }
  }

  async findAndCount(
    options: FindAndCountOptions
  ): Promise<[Customer[], number]> {
    try {
      const conditions: string[] = [];
      const params: Record<string, any> = {};
      let paramIndex = 0;

      if (options.where) {
        const whereConditions = Array.isArray(options.where)
          ? options.where
          : [options.where];

        whereConditions.forEach((condition) => {
          const searchConditions: string[] = [];

          Object.entries(condition).forEach(([key, value]) => {
            if (value === null || value === undefined) return;

            if (typeof value === "object") {
              // Handle ILike/Like operator
              if (
                "operator" in value &&
                (value.operator === "ILike" || value.operator === "Like")
              ) {
                const cleanPattern = value.value?.replace(/%/g, "") || "";
                const paramName = `$pattern${paramIndex}`;
                searchConditions.push(`${key} LIKE ${paramName}`);
                params[paramName] = `%${cleanPattern}%`;
                paramIndex++;
              }
              // Handle Between operator for dates
              else if (
                value.operator === "Between" &&
                value.start &&
                value.end
              ) {
                searchConditions.push(
                  `${key} BETWEEN $start${paramIndex} AND $end${paramIndex}`
                );
                params[`$start${paramIndex}`] = value.start;
                params[`$end${paramIndex}`] = value.end;
                paramIndex++;
              }
            } else {
              // Text search with LIKE
              const paramName = `$value${paramIndex}`;
              searchConditions.push(`${key} LIKE ${paramName}`);
              params[paramName] = `%${value}%`;
              paramIndex++;
            }
          });

          if (searchConditions.length > 0) {
            // Use OR between field conditions for the same search text
            conditions.push(`(${searchConditions.join(" OR ")})`);
          }
        });
      }

      const whereClause =
        conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";
      const baseQuery = `SELECT * FROM customer${whereClause}`;

      // Prepare count query
      const countStatement = await this.db
        .getConnection()
        .prepareAsync(
          `SELECT COUNT(*) as total FROM (${baseQuery}) as count_query`
        );

      // Prepare main query with ordering and pagination
      let mainQuery = baseQuery;
      if (options.order) {
        const orderClauses = Object.entries(options.order).map(
          ([key, direction]) => `${key} ${direction}`
        );
        if (orderClauses.length > 0) {
          mainQuery += ` ORDER BY ${orderClauses.join(", ")}`;
        }
      }

      if (options.take !== undefined && options.skip !== undefined) {
        mainQuery += ` LIMIT $limit OFFSET $offset`;
        params.$limit = options.take;
        params.$offset = options.skip;
      }

      const queryStatement = await this.db
        .getConnection()
        .prepareAsync(mainQuery);

      try {
        // Get total count
        const countResult: any = await countStatement.executeAsync(params);
        const totalCount = Number((await countResult.getFirstAsync()).total);

        // Get paginated results
        const result = await queryStatement.executeAsync(params);
        const rows = await result.getAllAsync();

        return [rows.map((row) => Customer.fromRow(row)), totalCount];
      } finally {
        await countStatement.finalizeAsync();
        await queryStatement.finalizeAsync();
      }
    } catch (error) {
      console.error("Error in findAndCount:", error);
      return [[], 0];
    }
  }

  async delete(id: string): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM customer WHERE _id = $id
    `);

    try {
      await statement.executeAsync({ $id: id });
    } finally {
      await statement.finalizeAsync();
    }
  }
}
