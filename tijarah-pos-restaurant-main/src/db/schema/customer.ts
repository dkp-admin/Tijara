export class CompanyInfo {
  constructor(public name: string = "") {}
}

export class Address {
  country: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  state: string;

  constructor(data: Partial<Address> = {}) {
    this.country = data.country || "";
    this.addressLine1 = data.addressLine1 || "";
    this.addressLine2 = data.addressLine2 || "";
    this.city = data.city || "";
    this.postalCode = data.postalCode || "";
    this.state = data.state || "";
  }
}

export class SpecialEventsSchema {
  id: string;
  name: string;
  date?: string;
  type?: string;

  constructor(data: Partial<SpecialEventsSchema> = {}) {
    this.id = data.id || "";
    this.name = data.name || "";
    this.date = data.date;
    this.type = data.type;
  }
}

export class Customer {
  _id?: string;
  profilePicture?: string;
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  vat?: string;
  company: CompanyInfo;
  companyRef: string;
  locations?: any[];
  groups?: any[];
  locationRefs?: string[];
  groupRefs?: string[];
  allowCredit: boolean;
  maximumCredit: number;
  usedCredit: number;
  availableCredit: number;
  blockedCredit: boolean;
  blacklistCredit: boolean;
  address?: Address;
  specialEvents?: SpecialEventsSchema[];
  totalSpend: number;
  totalRefunded: number;
  totalOrders: number;
  lastOrder?: Date;
  status: string;
  source: "local" | "server";
  createdAt: Date;
  updatedAt: Date;
  note?: string;

  constructor(data: Partial<Customer> = {}) {
    this._id = data._id;
    this.profilePicture = data.profilePicture;
    this.firstName = data.firstName || "";
    this.lastName = data.lastName;
    this.phone = data.phone || "";
    this.email = data.email;
    this.vat = data.vat;
    this.company = new CompanyInfo(data.company?.name);
    this.companyRef = data.companyRef || "";
    this.locations = data.locations || [];
    this.groups = data.groups || [];
    this.locationRefs = data.locationRefs || [];
    this.groupRefs = data.groupRefs || [];
    this.allowCredit = data.allowCredit || false;
    this.maximumCredit = data.maximumCredit || 0;
    this.usedCredit = data.usedCredit || 0;
    this.availableCredit = data.availableCredit || 0;
    this.blockedCredit = data.blockedCredit || false;
    this.blacklistCredit = data.blacklistCredit || false;
    this.address = data.address ? new Address(data.address) : undefined;
    this.specialEvents =
      data.specialEvents?.map((event) => new SpecialEventsSchema(event)) || [];
    this.totalSpend = data.totalSpend || 0;
    this.totalRefunded = data.totalRefunded || 0;
    this.totalOrders = data.totalOrders || 0;
    this.note = data.note || "";
    this.lastOrder = data.lastOrder ? new Date(data.lastOrder) : new Date();
    this.status = data.status || "active";
    this.source = data.source || "local";
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  static fromRow(row: any): Customer {
    return new Customer({
      _id: row._id,
      profilePicture: row.profilePicture,
      firstName: row.firstName,
      lastName: row?.lastName || "",
      phone: row.phone,
      email: row.email,
      vat: row.vat,
      company: JSON.parse(row.company),
      companyRef: row.companyRef,
      locations: JSON.parse(row.locations || "[]"),
      groups: JSON.parse(row.groups || "[]"),
      locationRefs: JSON.parse(row.locationRefs || "[]"),
      groupRefs: JSON.parse(row.groupRefs || "[]"),
      allowCredit: Boolean(row.allowCredit),
      maximumCredit: Number(row.maximumCredit),
      usedCredit: Number(row.usedCredit),
      availableCredit: Number(row.availableCredit),
      blockedCredit: Boolean(row.blockedCredit),
      blacklistCredit: Boolean(row.blacklistCredit),
      address: row.address ? JSON.parse(row.address) : undefined,
      specialEvents: row.specialEvents ? JSON.parse(row.specialEvents) : [],
      totalSpend: Number(row.totalSpend),
      totalRefunded: Number(row.totalRefunded),
      totalOrders: Number(row.totalOrders),
      lastOrder: new Date(row.lastOrder),
      status: row.status,
      note: row.note || "",
      source: row.source,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }

  static toRow(customer: Customer): any {
    return {
      _id: customer._id,
      profilePicture: customer.profilePicture,
      firstName: customer.firstName || "Unknown",
      lastName: customer.lastName || "",
      phone: customer.phone || "Unknown",
      email: customer.email,
      vat: customer.vat,
      company: JSON.stringify(customer.company),
      companyRef: customer.companyRef,
      locations: JSON.stringify(customer.locations),
      groups: JSON.stringify(customer.groups),
      locationRefs: JSON.stringify(customer.locationRefs),
      groupRefs: JSON.stringify(customer.groupRefs),
      allowCredit: Number(customer.allowCredit),
      maximumCredit: customer.maximumCredit,
      usedCredit: customer.usedCredit,
      availableCredit: customer.availableCredit,
      blockedCredit: Number(customer.blockedCredit),
      blacklistCredit: Number(customer.blacklistCredit),
      address: customer.address ? JSON.stringify(customer.address) : null,
      specialEvents: JSON.stringify(customer.specialEvents || []),
      totalSpend: customer.totalSpend,
      totalRefunded: customer.totalRefunded,
      totalOrders: customer.totalOrders,
      lastOrder: customer.lastOrder,
      status: customer.status,
      source: customer.source,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      note: customer.note || "",
    };
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName || ""}`.trim();
  }

  hasAvailableCredit(): boolean {
    if (!this.allowCredit || this.blockedCredit || this.blacklistCredit)
      return false;
    return this.availableCredit > 0;
  }

  canSpend(amount: number): boolean {
    if (!this.hasAvailableCredit()) return false;
    return amount <= this.availableCredit;
  }

  calculateRemainingCredit(): number {
    return this.maximumCredit - this.usedCredit;
  }
}
