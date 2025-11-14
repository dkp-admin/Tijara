import { AdsManagement } from "../schema/ad-management";
import { BaseRepository } from "./base-repository";

export class AdsManagementRepository extends BaseRepository<
  AdsManagement,
  string
> {
  constructor() {
    super('"ads-management"');
  }

  async create(ads: AdsManagement): Promise<AdsManagement> {
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO "ads-management" (
        _id, name, type, slidesData, status, priority,
        locationRefs, companyRefs, businessTypeRefs, dateRange,
        excludedLocationRefs, excludedCompanyRefs, daysOfWeek,
        createdByRole, createdAt, createdAt, lastPlayedAt, sentToPos
      ) VALUES (
        $id, $name, $type, $slidesData, $status, $priority,
        $locationRefs, $companyRefs, $businessTypeRefs, $dateRange,
        $excludedLocationRefs, $excludedCompanyRefs, $daysOfWeek,
        $createdByRole, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $lastPlayedAt, $sentToPos
      )
      ON CONFLICT (_id) DO UPDATE SET
        name = $name,
        type = $type,
        slidesData = $slidesData,
        status = $status,
        priority = $priority,
        locationRefs = $locationRefs,
        companyRefs = $companyRefs,
        businessTypeRefs = $businessTypeRefs,
        dateRange = $dateRange,
        excludedLocationRefs = $excludedLocationRefs,
        excludedCompanyRefs = $excludedCompanyRefs,
        daysOfWeek = $daysOfWeek,
        createdByRole = $createdByRole,
        updatedAt = CURRENT_TIMESTAMP,
        lastPlayedAt = $lastPlayedAt,
        sentToPos = $sentToPos
    `);

    const params: any = {
      $id: ads._id,
      $name: JSON.stringify(ads.name),
      $type: ads.type,
      $slidesData: JSON.stringify(ads.slidesData),
      $status: ads.status,
      $priority: ads.priority,
      $locationRefs: JSON.stringify(ads.locationRefs),
      $companyRefs: JSON.stringify(ads.companyRefs),
      $businessTypeRefs: JSON.stringify(ads.businessTypeRefs),
      $dateRange: JSON.stringify(ads.dateRange),
      $excludedLocationRefs: JSON.stringify(ads.excludedLocationRefs),
      $excludedCompanyRefs: JSON.stringify(ads.excludedCompanyRefs),
      $daysOfWeek: ads.daysOfWeek,
      $createdByRole: ads.createdByRole,
      $lastPlayedAt: ads.lastPlayedAt || null,
      $sentToPos: Number(ads.sentToPos),
    };

    try {
      let response = await statement.executeAsync(params);
      const result = (await response.getFirstAsync()) as AdsManagement;
      return result;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async createMany(adsList: AdsManagement[]): Promise<AdsManagement[]> {
    const columns = [
      "_id",
      "name",
      "type",
      "slidesData",
      "status",
      "priority",
      "locationRefs",
      "companyRefs",
      "businessTypeRefs",
      "dateRange",
      "excludedLocationRefs",
      "excludedCompanyRefs",
      "daysOfWeek",
      "createdByRole",
      "lastPlayedAt",
      "sentToPos",
    ];

    const generateParams = (ads: AdsManagement) => {
      const toRowAd = AdsManagement.toRow(ads);

      return [
        toRowAd._id,
        toRowAd.name,
        toRowAd.type,
        toRowAd.slidesData,
        toRowAd.status,
        toRowAd.priority,
        toRowAd.locationRefs,
        toRowAd.companyRefs,
        toRowAd.businessTypeRefs,
        toRowAd.dateRange,
        toRowAd.excludedLocationRefs,
        toRowAd.excludedCompanyRefs,
        toRowAd.daysOfWeek,
        toRowAd.createdByRole,
        toRowAd.lastPlayedAt || null,
        Number(toRowAd.sentToPos),
      ];
    };

    return this.createManyGeneric(
      "ads-management",
      adsList,
      columns,
      generateParams
    );
  }
  async update(id: string, ads: AdsManagement): Promise<AdsManagement> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "ads-management" SET
        name = $name,
        type = $type,
        slidesData = $slidesData,
        status = $status,
        priority = $priority,
        locationRefs = $locationRefs,
        companyRefs = $companyRefs,
        businessTypeRefs = $businessTypeRefs,
        dateRange = $dateRange,
        excludedLocationRefs = $excludedLocationRefs,
        excludedCompanyRefs = $excludedCompanyRefs,
        daysOfWeek = $daysOfWeek,
        createdByRole = $createdByRole,
        lastPlayedAt = $lastPlayedAt,
        sentToPos = $sentToPos,
        updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    const params = {
      $id: id,
      $name: JSON.stringify(ads.name),
      $type: ads.type,
      $slidesData: JSON.stringify(ads.slidesData),
      $status: ads.status,
      $priority: ads.priority,
      $locationRefs: JSON.stringify(ads.locationRefs),
      $companyRefs: JSON.stringify(ads.companyRefs),
      $businessTypeRefs: JSON.stringify(ads.businessTypeRefs),
      $dateRange: JSON.stringify(ads.dateRange),
      $excludedLocationRefs: JSON.stringify(ads.excludedLocationRefs),
      $excludedCompanyRefs: JSON.stringify(ads.excludedCompanyRefs),
      $daysOfWeek: ads.daysOfWeek,
      $createdByRole: ads.createdByRole,
      $lastPlayedAt: ads.lastPlayedAt?.toISOString() || null,
      $sentToPos: Number(ads.sentToPos),
    };

    try {
      let response = await statement.executeAsync(params);
      const result = (await response.getFirstAsync()) as AdsManagement;
      return result;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async delete(id: string): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM "ads-management" WHERE _id = $id
    `);

    try {
      await statement.executeAsync({ $id: id });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findById(id: string): Promise<AdsManagement> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "ads-management" WHERE _id = $id
    `);

    try {
      const result = await statement.executeAsync({ $id: id });
      const row = result.getAllAsync();
      if (!row) {
        throw new Error("Advertisement not found");
      }
      return AdsManagement.fromRow(row);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findAll(): Promise<AdsManagement[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "ads-management"
    `);

    try {
      const result = await statement.executeAsync();
      const rows = await result.getAllAsync();
      return rows.map((row) => AdsManagement.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findActiveAds(): Promise<AdsManagement[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "ads-management" 
      WHERE status = $status 
      AND DATE(dateRange->>'$.from') <= DATE('now')
      AND DATE(dateRange->>'$.to') >= DATE('now')
      ORDER BY priority DESC
    `);

    try {
      const result = await statement.executeAsync({ $status: "active" });
      const rows = await result.getAllAsync();
      return rows.map((row) => AdsManagement.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findOngoingAds(): Promise<AdsManagement[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "ads-management" 
      WHERE status = $status 
      AND DATE(dateRange->>'$.from') <= DATE('now')
      AND DATE(dateRange->>'$.to') >= DATE('now')
      ORDER BY priority DESC
    `);

    try {
      const result = await statement.executeAsync({ $status: "ongoing" });
      const rows = await result.getAllAsync();
      return rows.map((row) => AdsManagement.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateLastPlayedAt(id: string): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "ads-management" 
      SET lastPlayedAt = $lastPlayedAt,
      updatedAt = CURRENT_TIMESTAMP,
      WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
        $lastPlayedAt: new Date().toISOString(),
      });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByLocation(locationRef: string): Promise<AdsManagement[]> {
    const statement = await this.db.getConnection()
      .prepareAsync(`SELECT * FROM "ads-management"
WHERE 
  json_array_length(locationRefs) = 0
  OR locationRefs LIKE '%' || $locationRef || '%'
  AND NOT (excludedLocationRefs LIKE '%' || $locationRef || '%')`);

    try {
      const result = await statement.executeAsync({
        $locationRef: locationRef,
      });
      const rows = await result.getAllAsync();
      return rows.map((row) => AdsManagement.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByCompany(companyRef: string): Promise<AdsManagement[]> {
    const statement = await this.db.getConnection().prepareAsync(`
    SELECT * FROM "ads-management"
WHERE 
  json_array_length(companyRefs) = 0
  OR ($companyRef::text = ANY(SELECT jsonb_array_elements_text(companyRefs)))
  AND NOT ($companyRef::text = ANY(SELECT jsonb_array_elements_text(excludedCompanyRefs)))
    `);

    try {
      const result = await statement.executeAsync({ $companyRef: companyRef });
      const rows = await result.getAllAsync();
      return rows.map((row) => AdsManagement.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async markAsSentToPos(id: string): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "ads-management" SET sentToPos = $sentToPos, updatedAt = CURRENT_TIMESTAMP, WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
        $sentToPos: 1,
      });
    } finally {
      await statement.finalizeAsync();
    }
  }
}
