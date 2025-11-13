export class Name {
  constructor(public en: string = "", public ar: string = "") {}
}

export class DateRange {
  constructor(public from: string = "", public to: string = "") {}
}

export class AdsReport {
  id?: number;
  adRef: string;
  type: string;
  adType: string;
  status: string;
  daysOfWeek: string;
  locationRef: string;
  deviceRef: string;
  companyRef: string;
  businessTypeRef: string;
  businessType: string;
  createdByRole: string;
  adName: Name;
  schedule: DateRange;
  location: Name;
  company: Name;
  count: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<AdsReport> = {}) {
    this.id = data.id;
    this.adRef = data.adRef || "";
    this.type = data.type || "";
    this.adType = data.adType || "";
    this.status = data.status || "";
    this.daysOfWeek = data.daysOfWeek || "";
    this.locationRef = data.locationRef || "";
    this.deviceRef = data.deviceRef || "";
    this.companyRef = data.companyRef || "";
    this.businessTypeRef = data.businessTypeRef || "";
    this.businessType = data.businessType || "";
    this.createdByRole = data.createdByRole || "";
    this.adName = new Name(data.adName?.en, data.adName?.ar);
    this.schedule = new DateRange(data.schedule?.from, data.schedule?.to);
    this.location = new Name(data.location?.en, data.location?.ar);
    this.company = new Name(data.company?.en, data.company?.ar);
    this.count = data.count || 0;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  static fromRow(row: any): AdsReport {
    return new AdsReport({
      id: Number(row.id),
      adRef: row.adRef,
      type: row.type,
      adType: row.adType,
      status: row.status,
      daysOfWeek: row.daysOfWeek,
      locationRef: row.locationRef,
      deviceRef: row.deviceRef,
      companyRef: row.companyRef,
      businessTypeRef: row.businessTypeRef,
      businessType: row.businessType,
      createdByRole: row.createdByRole,
      adName: JSON.parse(row.adName),
      schedule: JSON.parse(row.schedule),
      location: JSON.parse(row.location),
      company: JSON.parse(row.company),
      count: Number(row.count),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }

  static toRow(report: AdsReport): any {
    return {
      id: report.id,
      adRef: report.adRef,
      type: report.type,
      adType: report.adType,
      status: report.status,
      daysOfWeek: report.daysOfWeek,
      locationRef: report.locationRef,
      deviceRef: report.deviceRef,
      companyRef: report.companyRef,
      businessTypeRef: report.businessTypeRef,
      businessType: report.businessType,
      createdByRole: report.createdByRole,
      adName: JSON.stringify(report.adName),
      schedule: JSON.stringify(report.schedule),
      location: JSON.stringify(report.location),
      company: JSON.stringify(report.company),
      count: report.count,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    };
  }
}
