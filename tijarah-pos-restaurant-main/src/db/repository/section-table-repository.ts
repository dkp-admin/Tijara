import { BaseRepository } from "./base-repository";
import { SectionTables, TablesModal } from "../schema/section-table";

interface FindActiveBySectionOptions {
  where: {
    status?: string;
    _id?: string;
    sectionRef?: string;
    [key: string]: any;
  };
}

export interface FindAndCountOptions {
  take?: number;
  skip?: number;
  where?: {
    name?: { _ilike?: string } | string;
    status?: string;
    sectionRef?: string;
    tableNumber?: { _ilike?: string } | number;
    companyRef?: string;
    floorType?: string;
    [key: string]: any;
  };
  order?: {
    [key: string]: "ASC" | "DESC";
  };
}

export class SectionTablesRepository extends BaseRepository<
  SectionTables,
  string
> {
  constructor() {
    super("section-tables");
  }

  async create(section: SectionTables): Promise<SectionTables> {
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO "section-tables" (
        _id, company, companyRef, location, locationRef,
        name, floorType, tableNaming, numberOfTable,
        tables, status, source, createdAt, updatedAt
      ) VALUES (
        $id, $company, $companyRef, $location, $locationRef,
        $name, $floorType, $tableNaming, $numberOfTable,
        $tables, $status, $source, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT(_id) DO UPDATE SET
        company = $company,
        companyRef = $companyRef,
        location = $location,
        locationRef = $locationRef,
        name = $name,
        floorType = $floorType,
        tableNaming = $tableNaming,
        numberOfTable = $numberOfTable,
        tables = $tables,
        status = $status,
        source = $source
    `);

    const params: any = {
      $id: section._id,
      $company: JSON.stringify(section.company),
      $companyRef: section.companyRef,
      $location: JSON.stringify(section.location),
      $locationRef: section.locationRef,
      $name: JSON.stringify(section.name),
      $floorType: section.floorType,
      $tableNaming: section.tableNaming,
      $numberOfTable: section.numberOfTable,
      $tables: JSON.stringify(section.tables),
      $status: section.status,
      $source: section.source,
    };

    try {
      await statement.executeAsync(params);
      return section;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async createMany(sections: SectionTables[]): Promise<SectionTables[]> {
    const columns = [
      "_id",
      "company",
      "companyRef",
      "location",
      "locationRef",
      "name",
      "floorType",
      "tableNaming",
      "numberOfTable",
      "tables",
      "status",
      "source",
    ];

    const generateParams = (section: SectionTables) => {
      const toRow = SectionTables.toRow(section);
      return [
        toRow._id,
        toRow.company,
        toRow.companyRef,
        toRow.location,
        toRow.locationRef,
        toRow.name,
        toRow.floorType,
        toRow.tableNaming,
        toRow.numberOfTable,
        toRow.tables,
        toRow.status,
        toRow.source,
      ];
    };

    return this.createManyGeneric(
      "section-tables",
      sections,
      columns,
      generateParams
    );
  }

  async update(id: string, section: SectionTables): Promise<SectionTables> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "section-tables" SET
        company = $company,
        companyRef = $companyRef,
        location = $location,
        locationRef = $locationRef,
        name = $name,
        floorType = $floorType,
        tableNaming = $tableNaming,
        numberOfTable = $numberOfTable,
        tables = $tables,
        status = $status,
        source = $source,
        updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    const params = {
      $id: id,
      $company: JSON.stringify(section.company),
      $companyRef: section.companyRef,
      $location: JSON.stringify(section.location),
      $locationRef: section.locationRef,
      $name: JSON.stringify(section.name),
      $floorType: section.floorType,
      $tableNaming: section.tableNaming,
      $numberOfTable: section.numberOfTable,
      $tables: JSON.stringify(section.tables),
      $status: section.status,
      $source: section.source,
    };

    try {
      await statement.executeAsync(params);
      section._id = id;
      return section;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async delete(id: string): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM "section-tables" WHERE _id = $id
    `);

    try {
      await statement.executeAsync({ $id: id });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findById(id: string): Promise<SectionTables> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "section-tables" WHERE _id = $id
    `);

    try {
      const result = await statement.executeAsync({ $id: id });
      const row = await result.getFirstAsync();
      if (!row) {
        throw new Error("Section not found");
      }
      return SectionTables.fromRow(row);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findAll(): Promise<SectionTables[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "section-tables"
    `);

    try {
      const result = await statement.executeAsync({});
      const rows = await result.getAllAsync();
      return rows.map((row) => SectionTables.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByLocation(locationRef: string): Promise<SectionTables[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "section-tables" 
      WHERE locationRef = $locationRef
      AND status = 'active'
    `);

    try {
      const result = await statement.executeAsync({
        $locationRef: locationRef,
      });
      const rows = await result.getAllAsync();
      return rows.map((row) => SectionTables.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findAndCount(
    options: FindAndCountOptions
  ): Promise<[SectionTables[], number]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "section-tables" 
      WHERE (status = $status OR $status IS NULL) 
        AND (floorType = $floorType OR $floorType IS NULL)
      ORDER BY CAST(numberOfTable AS INTEGER) ASC 
      LIMIT $limit OFFSET $offset
    `);

    const countStatement = await this.db.getConnection().prepareAsync(`
      SELECT COUNT(*) as total FROM "section-tables"
    `);

    try {
      const params: any = {
        $status: options.where?.status,
        $limit: options.take,
        $offset: options.skip,
      };

      if (options.where?.floorType) {
        params["$floorType"] = options.where?.floorType;
      }

      const countResult: any = await countStatement.executeAsync({});
      const totalCount = Number((await countResult.getFirstAsync()).total);

      const result = await statement.executeAsync(params);
      const rows = await result.getAllAsync();
      return [rows.map((row) => SectionTables.fromRow(row)), totalCount];
    } finally {
      await statement.finalizeAsync();
      await countStatement.finalizeAsync();
    }
  }

  async findActiveBySection(
    options: FindActiveBySectionOptions
  ): Promise<SectionTables[]> {
    try {
      const conditions: any = [];
      const params: Record<string, any> = {};
      let paramIndex = 0;

      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          if (value !== undefined) {
            const paramName = `$param${paramIndex++}`;
            conditions.push(`${key} = ${paramName}`);
            params[paramName] = value;
          }
        });
      }

      const baseQuery = `
        SELECT * FROM "section-tables"
        ${conditions.length ? "WHERE " + conditions.join(" AND ") : ""}
        ORDER BY name ASC
      `;

      const statement = await this.db.getConnection().prepareAsync(baseQuery);

      try {
        const result = await statement.executeAsync(params);
        const rows = await result.getAllAsync();
        return rows.map((row) => SectionTables.fromRow(row));
      } finally {
        await statement.finalizeAsync();
      }
    } catch (error) {
      console.error("Error in findActiveBySection:", error);
      return [];
    }
  }

  async updateTable(
    sectionId: string,
    tableId: string,
    tableData: Partial<TablesModal>
  ): Promise<SectionTables> {
    const section = await this.findById(sectionId);
    const tableIndex = section.tables.findIndex((t) => t.id === tableId);

    if (tableIndex >= 0) {
      section.tables[tableIndex] = {
        ...section.tables[tableIndex],
        ...tableData,
      };
      return this.update(sectionId, section);
    }
    throw new Error("Table not found");
  }

  async updateTableStatus(
    sectionId: string,
    tableId: string,
    status: string
  ): Promise<SectionTables> {
    return this.updateTable(sectionId, tableId, { status });
  }

  async assignWaiter(
    sectionId: string,
    tableId: string,
    waiterRef: string,
    waiterName: string
  ): Promise<SectionTables> {
    return this.updateTable(sectionId, tableId, {
      waiterRef,
      waiter: { name: waiterName },
    });
  }

  async updateGuestCount(
    sectionId: string,
    tableId: string,
    noOfGuests: number
  ): Promise<SectionTables> {
    return this.updateTable(sectionId, tableId, { noOfGuests });
  }

  async findAvailableTables(locationRef: string): Promise<TablesModal[]> {
    const sections = await this.findByLocation(locationRef);
    return sections.flatMap((section) =>
      section.tables.filter((table) => table.status === "available")
    );
  }
}
