export type ContentType = "image" | "video" | "text-with-image";

export class SlidesData {
  contentType: ContentType;
  displayBrandLogo: boolean;
  heading: string;
  description?: string;
  imageUrl: string;
  videoUrl: string;
  qrImage: string;
  duration: number;
  mute: boolean;

  constructor(data: Partial<SlidesData> = {}) {
    this.contentType = data.contentType || "image";
    this.displayBrandLogo = data.displayBrandLogo || false;
    this.heading = data.heading || "";
    this.description = data.description;
    this.imageUrl = data.imageUrl || "";
    this.videoUrl = data.videoUrl || "";
    this.qrImage = data.qrImage || "";
    this.duration = data.duration || 0;
    this.mute = data.mute || false;
  }
}

export class DateRange {
  constructor(public from: string = "", public to: string = "") {}
}

export class Name {
  constructor(public en: string = "", public ar: string = "") {}
}

export class AdsManagement {
  _id?: string;
  name: Name;
  type: string;
  slidesData: SlidesData[];
  status: string;
  priority: string;
  locationRefs?: string[];
  companyRefs: string[];
  businessTypeRefs: string[];
  dateRange: DateRange;
  excludedLocationRefs: string[];
  excludedCompanyRefs: string[];
  daysOfWeek: string;
  createdByRole: string;
  createdAt: Date;
  updatedAt: Date;
  lastPlayedAt?: Date;
  sentToPos: boolean;

  constructor(data: Partial<AdsManagement> = {}) {
    this._id = data._id;
    this.name = new Name(data.name?.en, data.name?.ar);
    this.type = data.type || "";
    this.slidesData = (data.slidesData || []).map(
      (slide) => new SlidesData(slide)
    );
    this.status = data.status || "";
    this.priority = data.priority || "";
    this.locationRefs = data.locationRefs || [];
    this.companyRefs = data.companyRefs || [];
    this.businessTypeRefs = data.businessTypeRefs || [];
    this.dateRange = new DateRange(data.dateRange?.from, data.dateRange?.to);
    this.excludedLocationRefs = data.excludedLocationRefs || [];
    this.excludedCompanyRefs = data.excludedCompanyRefs || [];
    this.daysOfWeek = data.daysOfWeek || "";
    this.createdByRole = data.createdByRole || "";
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    this.lastPlayedAt = data.lastPlayedAt
      ? new Date(data.lastPlayedAt)
      : undefined;
    this.sentToPos = data.sentToPos || false;
  }

  static fromRow(row: any): AdsManagement {
    return new AdsManagement({
      _id: row._id,
      name: JSON.parse(row.name),
      type: row.type,
      slidesData: JSON.parse(row.slidesData),
      status: row.status,
      priority: row.priority,
      locationRefs: JSON.parse(row.locationRefs || "[]"),
      companyRefs: JSON.parse(row.companyRefs || "[]"),
      businessTypeRefs: JSON.parse(row.businessTypeRefs || "[]"),
      dateRange: JSON.parse(row.dateRange),
      excludedLocationRefs: JSON.parse(row.excludedLocationRefs || "[]"),
      excludedCompanyRefs: JSON.parse(row.excludedCompanyRefs || "[]"),
      daysOfWeek: row.daysOfWeek,
      createdByRole: row.createdByRole,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      lastPlayedAt: row.lastPlayedAt ? new Date(row.lastPlayedAt) : undefined,
      sentToPos: Boolean(row.sentToPos),
    });
  }

  static toRow(ad: AdsManagement): any {
    return {
      _id: ad._id,
      name: JSON.stringify(ad.name),
      type: ad.type,
      slidesData: JSON.stringify(ad.slidesData),
      status: ad.status,
      priority: ad.priority,
      locationRefs: JSON.stringify(ad.locationRefs),
      companyRefs: JSON.stringify(ad.companyRefs),
      businessTypeRefs: JSON.stringify(ad.businessTypeRefs),
      dateRange: JSON.stringify(ad.dateRange),
      excludedLocationRefs: JSON.stringify(ad.excludedLocationRefs),
      excludedCompanyRefs: JSON.stringify(ad.excludedCompanyRefs),
      daysOfWeek: ad.daysOfWeek,
      createdByRole: ad.createdByRole,
      createdAt: ad.createdAt,
      updatedAt: ad.updatedAt,
      lastPlayedAt: ad.lastPlayedAt?.toISOString(),
      sentToPos: Number(ad.sentToPos),
    };
  }
}
