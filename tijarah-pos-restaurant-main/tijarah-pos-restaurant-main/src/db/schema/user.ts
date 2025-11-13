export class Name {
  constructor(public en: string = "", public ar: string = "") {}
}

export class CompanyInfo {
  constructor(public name: string = "") {}
}

export class LocationInfo {
  constructor(public name: string = "") {}
}

export class User {
  _id?: string;
  name: string;
  company: CompanyInfo;
  companyRef: string;
  location: LocationInfo;
  locationRefs: string[];
  locationRef: string;
  profilePicture: string;
  email: string;
  phone: string;
  userType: string;
  permissions: string[];
  status: string;
  onboarded: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
  pin: string;
  key: string;
  value: string;

  constructor(data: Partial<User> = {}) {
    this._id = data._id;
    this.name = data.name || "";
    this.company = new CompanyInfo(data.company?.name);
    this.companyRef = data.companyRef || "";
    this.location = new LocationInfo(data.location?.name);
    this.locationRefs = data.locationRefs || [];
    this.locationRef = data.locationRef || "";
    this.profilePicture = data.profilePicture || "";
    this.email = data.email || "";
    this.phone = data.phone || "";
    this.userType = data.userType || "";
    this.permissions = data.permissions || [];
    this.status = data.status || "active";
    this.onboarded = data.onboarded || false;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.version = data.version || 0;
    this.pin = data.pin || "";
    this.key = data.key || "";
    this.value = data.value || "";
  }

  static fromRow(row: any): User {
    return new User({
      _id: row._id,
      name: row.name,
      company: JSON.parse(row.company),
      companyRef: row.companyRef,
      location: JSON.parse(row.location),
      locationRefs: JSON.parse(row.locationRefs || "[]"),
      locationRef: row.locationRef,
      profilePicture: row.profilePicture,
      email: row.email,
      phone: row.phone,
      userType: row.userType,
      permissions: JSON.parse(row.permissions || "[]"),
      status: row.status,
      onboarded: Boolean(row.onboarded),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      version: Number(row.version),
      pin: row.pin,
      key: row.key,
      value: row.value,
    });
  }

  static toRow(row: User): any {
    return {
      _id: row._id,
      name: row.name,
      company: JSON.stringify(row.company),
      companyRef: row.companyRef,
      location: JSON.stringify(row.location),
      locationRefs: JSON.stringify(row.locationRefs || "[]"),
      locationRef: row.locationRef,
      profilePicture: row.profilePicture,
      email: row.email,
      phone: row.phone,
      userType: row.userType,
      permissions: JSON.stringify(row.permissions || "[]"),
      status: row.status,
      onboarded: row.onboarded,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      version: row.version,
      pin: row.pin,
      key: row.key,
      value: row.value,
    };
  }
}
