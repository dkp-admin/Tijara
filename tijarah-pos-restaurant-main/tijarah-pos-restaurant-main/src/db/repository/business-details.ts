import { BaseRepository } from "./base-repository";
import { BusinessDetails } from "../schema/business-details";

export class BusinessDetailsRepository extends BaseRepository<
  BusinessDetails,
  string
> {
  constructor() {
    super('"business-details"');
  }

  async create(details: BusinessDetails): Promise<BusinessDetails> {
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO "business-details" (
        _id, company, location, source, createdAt, updatedAt
      ) VALUES (
        $id, $company, $location, $source, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT (_id) DO UPDATE SET
        company = $company,
        location = $location,
        source = $source,
        updatedAt = CURRENT_TIMESTAMP
    `);

    const params: any = {
      $id: details._id,
      $company: JSON.stringify(details.company),
      $location: JSON.stringify(details.location),
      $source: details.source || "server",
    };

    try {
      const result = await statement.executeAsync(params);
      const created = await result.getFirstAsync();
      return created ? BusinessDetails.fromRow(created) : details;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async createMany(detailsList: BusinessDetails[]): Promise<BusinessDetails[]> {
    const columns = ["_id", "company", "location", "source"];

    const generateParams = (details: BusinessDetails) => {
      const toRowData = BusinessDetails.toRow(details);
      return [
        toRowData._id,
        toRowData.company || "{}",
        toRowData.location || "{}",
        toRowData.source || "server",
      ];
    };

    return this.createManyGeneric(
      "business-details",
      detailsList,
      columns,
      generateParams
    );
  }

  async update(id: string, details: BusinessDetails): Promise<BusinessDetails> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "business-details" SET
        company = $company,
        location = $location,
        source = $source,
        updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    const params = {
      $id: id,
      $company: JSON.stringify(details.company),
      $location: JSON.stringify(details.location),
      $source: details.source,
    };

    try {
      const result = await statement.executeAsync(params);
      const updated = await result.getFirstAsync();
      return updated ? BusinessDetails.fromRow(updated) : details;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async delete(id: string): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM "business-details" WHERE _id = $id
    `);

    try {
      await statement.executeAsync({ $id: id });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findById(id: string): Promise<BusinessDetails> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "business-details" WHERE _id = $id
    `);

    try {
      const result = await statement.executeAsync({ $id: id });
      const row = await result.getFirstAsync();
      if (!row) {
        throw new Error("Business details not found");
      }
      return BusinessDetails.fromRow(row);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findAll(): Promise<BusinessDetails[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "business-details"
    `);

    try {
      const result = await statement.executeAsync({});
      const rows = await result.getAllAsync();
      return rows.map((row) => BusinessDetails.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByCompanyId(companyId: string): Promise<BusinessDetails | null> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "business-details" 
      WHERE json_extract(company, '$._id') = $companyId
    `);

    try {
      const result = await statement.executeAsync({ $companyId: companyId });
      const rows = await result.getAllAsync();
      return rows.length > 0 ? BusinessDetails.fromRow(rows[0]) : null;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByLocationId(locationId: string): Promise<BusinessDetails | null> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "business-details" 
      WHERE json_extract(location, '$._id') = $locationId
    `);

    try {
      const result = await statement.executeAsync({ $locationId: locationId });
      const rows = await result.getAllAsync();
      return rows.length > 0 ? BusinessDetails.fromRow(rows[0]) : null;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateCompanyLogo(id: string, logo: string): Promise<void> {
    const details = await this.findById(id);
    details.company.logo = logo;
    await this.update(id, details);
  }
}
