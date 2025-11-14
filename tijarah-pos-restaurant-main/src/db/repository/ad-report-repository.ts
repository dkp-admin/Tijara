import { AdsReport } from "../schema/ad-report";
import { BaseRepository } from "./base-repository";

export class AdsReportRepository extends BaseRepository<AdsReport, number> {
  constructor() {
    super('"ads-report"');
  }

  async create(report: AdsReport): Promise<AdsReport> {
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO "ads-report" (
        adRef, type, adType, status, daysOfWeek, locationRef,
        deviceRef, companyRef, businessTypeRef, businessType,
        createdByRole, adName, schedule, location, company,
        count, createdAt, updatedAt
      ) VALUES (
        $adRef, $type, $adType, $status, $daysOfWeek, $locationRef,
        $deviceRef, $companyRef, $businessTypeRef, $businessType,
        $createdByRole, $adName, $schedule, $location, $company,
        $count, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT(id) DO UPDATE SET
        adRef = $adRef,
        type = $type,
        adType = $adType,
        status = $status,
        daysOfWeek = $daysOfWeek,
        locationRef = $locationRef,
        deviceRef = $deviceRef,
        companyRef = $companyRef,
        businessTypeRef = $businessTypeRef,
        businessType = $businessType,
        createdByRole = $createdByRole,
        adName = $adName,
        schedule = $schedule,
        location = $location,
        company = $company,
        count = $count,
        updatedAt = CURRENT_TIMESTAMP
    `);

    const params = {
      $adRef: report.adRef,
      $type: report.type,
      $adType: report.adType,
      $status: report.status,
      $daysOfWeek: report.daysOfWeek,
      $locationRef: report.locationRef,
      $deviceRef: report.deviceRef,
      $companyRef: report.companyRef,
      $businessTypeRef: report.businessTypeRef,
      $businessType: report.businessType,
      $createdByRole: report.createdByRole,
      $adName: JSON.stringify(report.adName),
      $schedule: JSON.stringify(report.schedule),
      $location: JSON.stringify(report.location),
      $company: JSON.stringify(report.company),
      $count: report.count,
    };

    try {
      await statement.executeAsync(params);
      const lastIdResult: any = await this.db
        .getConnection()
        .getFirstAsync("SELECT last_insert_rowid() as id");
      report.id = lastIdResult.id;
      return report;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async createMany(reports: AdsReport[]): Promise<AdsReport[]> {
    const columns = [
      "adRef",
      "type",
      "adType",
      "status",
      "daysOfWeek",
      "locationRef",
      "deviceRef",
      "companyRef",
      "businessTypeRef",
      "businessType",
      "createdByRole",
      "adName",
      "schedule",
      "location",
      "company",
      "count",
    ];

    const generateParams = (report: AdsReport) => {
      const toRowAdReport = AdsReport.toRow(report);
      return [
        toRowAdReport.adRef,
        toRowAdReport.type,
        toRowAdReport.adType,
        toRowAdReport.status,
        toRowAdReport.daysOfWeek,
        toRowAdReport.locationRef,
        toRowAdReport.deviceRef,
        toRowAdReport.companyRef,
        toRowAdReport.businessTypeRef,
        toRowAdReport.businessType,
        toRowAdReport.createdByRole,
        toRowAdReport.adName,
        toRowAdReport.schedule,
        toRowAdReport.location,
        toRowAdReport.company,
        toRowAdReport.count,
      ];
    };

    return this.createManyGeneric(
      "ads-report",
      reports,
      columns,
      generateParams
    );
  }

  async update(id: number, report: AdsReport): Promise<AdsReport> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "ads-report" SET
        adRef = $adRef,
        type = $type,
        adType = $adType,
        status = $status,
        daysOfWeek = $daysOfWeek,
        locationRef = $locationRef,
        deviceRef = $deviceRef,
        companyRef = $companyRef,
        businessTypeRef = $businessTypeRef,
        businessType = $businessType,
        createdByRole = $createdByRole,
        adName = $adName,
        schedule = $schedule,
        location = $location,
        company = $company,
        count = $count,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = $id
    `);

    const params = {
      $id: id,
      $adRef: report.adRef,
      $type: report.type,
      $adType: report.adType,
      $status: report.status,
      $daysOfWeek: report.daysOfWeek,
      $locationRef: report.locationRef,
      $deviceRef: report.deviceRef,
      $companyRef: report.companyRef,
      $businessTypeRef: report.businessTypeRef,
      $businessType: report.businessType,
      $createdByRole: report.createdByRole,
      $adName: JSON.stringify(report.adName),
      $schedule: JSON.stringify(report.schedule),
      $location: JSON.stringify(report.location),
      $company: JSON.stringify(report.company),
      $count: report.count,
    };

    try {
      await statement.executeAsync(params);
      report.id = id;
      return report;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async delete(id: number): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM "ads-report" WHERE id = $id
    `);

    try {
      await statement.executeAsync({ $id: id });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findById(id: number): Promise<AdsReport> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "ads-report" WHERE id = $id
    `);

    try {
      const result = await statement.executeAsync({ $id: id });
      const row = await result.getFirstAsync();
      if (!row) {
        throw new Error("Ads report not found");
      }
      return AdsReport.fromRow(row);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findAll(): Promise<AdsReport[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "ads-report"
    `);

    try {
      const result = await statement.executeAsync();
      const rows = await result.getAllAsync();
      return rows.map((row) => AdsReport.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async incrementCount(id: number): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "ads-report" SET count = count + 1 WHERE id = $id
    `);

    try {
      await statement.executeAsync({ $id: id });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByAdRef(adRef: string): Promise<AdsReport[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "ads-report" WHERE adRef = $adRef
    `);

    try {
      const result = await statement.executeAsync({ $adRef: adRef });
      const rows = await result.getAllAsync();
      return rows.map((row) => AdsReport.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<AdsReport[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "ads-report" 
      WHERE createdAt BETWEEN $startDate AND $endDate
      ORDER BY createdAt DESC
    `);

    try {
      const result = await statement.executeAsync({
        $startDate: startDate.toISOString(),
        $endDate: endDate.toISOString(),
      });
      const rows = await result.getAllAsync();
      return rows.map((row) => AdsReport.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByLocation(locationRef: string): Promise<AdsReport[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "ads-report" WHERE locationRef = $locationRef
    `);

    try {
      const result = await statement.executeAsync({
        $locationRef: locationRef,
      });
      const rows = await result.getAllAsync();

      return rows.map((row) => AdsReport.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByCompany(companyRef: string): Promise<AdsReport[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "ads-report" WHERE companyRef = $companyRef
    `);

    try {
      const result = await statement.executeAsync({ $companyRef: companyRef });
      const rows = await result.getAllAsync();
      return rows.map((row) => AdsReport.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async getTopPerformingAds(limit: number = 10): Promise<AdsReport[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "ads-report"
      ORDER BY count DESC
      LIMIT $limit
    `);

    try {
      const result = await statement.executeAsync({ $limit: limit });
      const rows = await result.getAllAsync();
      return rows.map((row) => AdsReport.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }
}
