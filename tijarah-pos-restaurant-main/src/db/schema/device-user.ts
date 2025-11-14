export class CompanyInfo {
  constructor(public name: string = "") {}
}

export class LocationInfo {
  constructor(public name: string = "") {}
}

export class DeviceUser {
  _id?: string;
  name: string;
  company: CompanyInfo;
  companyRef: string;
  location: LocationInfo;
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
  deviceId: string;
  key: string;
  value: string;

  constructor(data: Partial<DeviceUser> = {}) {
    this._id = data._id;
    this.name = data.name || "";
    this.company = new CompanyInfo(data.company?.name);
    this.companyRef = data.companyRef || "";
    this.location = new LocationInfo(data.location?.name);
    this.locationRef = data.locationRef || "";
    this.profilePicture = data.profilePicture || "";
    this.email = data.email || "";
    this.phone = data.phone || "";
    this.userType = data.userType || "";
    this.permissions = data.permissions || [];
    this.status = data.status || "";
    this.onboarded = data.onboarded || false;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.version = data.version || 0;
    this.pin = data.pin || "";
    this.deviceId = data.deviceId || "";
    this.key = data.key || "";
    this.value = data.value || "";
  }

  static fromRow(row: any): DeviceUser {
    return new DeviceUser({
      _id: row._id,
      name: row.name,
      company: JSON.parse(row.company),
      companyRef: row.companyRef,
      location: JSON.parse(row.location),
      locationRef: row.locationRef,
      profilePicture: row.profilePicture,
      email: row.email,
      phone: row.phone,
      userType: row.userType,
      permissions: JSON.parse(row.permissions),
      status: row.status,
      onboarded: Boolean(row.onboarded),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      version: row.version,
      pin: row.pin,
      deviceId: row.deviceId,
      key: row.key,
      value: row.value,
    });
  }

  static toRow(user: DeviceUser): any {
    return {
      _id: user._id,
      name: user.name,
      company: JSON.stringify(user.company),
      companyRef: user.companyRef,
      location: JSON.stringify(user.location),
      locationRef: user.locationRef,
      profilePicture: user.profilePicture,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      permissions: JSON.stringify(user.permissions),
      status: user.status,
      onboarded: Number(user.onboarded),
      version: user.version,
      pin: user.pin,
      deviceId: user.deviceId,
      key: user.key,
      value: user.value,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  toJSON() {
    return {
      _id: this._id,
      name: this.name,
      company: this.company,
      companyRef: this.companyRef,
      location: this.location,
      locationRef: this.locationRef,
      profilePicture: this.profilePicture,
      email: this.email,
      phone: this.phone,
      userType: this.userType,
      permissions: this.permissions,
      status: this.status,
      onboarded: this.onboarded,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      version: this.version,
      pin: this.pin,
      deviceId: this.deviceId,
      key: this.key,
      value: this.value,
    };
  }
}
