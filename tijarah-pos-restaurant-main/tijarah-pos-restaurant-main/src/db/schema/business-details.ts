export class BusinessAddress {
  constructor(
    public address1: string = "",
    public address2: string = "",
    public city: string = "",
    public postalCode: string = "",
    public country: string = "",
    public state?: string
  ) {}
}

export class VAT {
  constructor(
    public percentage: string = "0",
    public docNumber: string = "",
    public vatRef: string = ""
  ) {}
}

export class Company {
  _id: string;
  logo: string;
  localLogo: string;
  owner: { name: string };
  name: { en: string; ar: string };
  email: string;
  phone: string;
  subscriptionType: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  vat: VAT;
  industry: string;
  businessType: string;
  address: BusinessAddress;
  status: string;
  businessTypeRef: string;
  ownerRef: string;
  wallet: boolean;
  minimumWalletBalance: number;
  orderTypes: string[];
  defaultCreditSetting: boolean;
  enableCredit: boolean;
  limitType: string;
  maximumCreditLimit: number;
  allowChangeCredit: boolean;
  maximumCreditPercent: number;
  enableKitchenManagement: boolean;
  enableStcPay: boolean;
  nearpay: boolean;
  merchantId: string;
  merchantName: string;
  saptcoCompany: boolean;
  timezone: string;
  syncMethod: string;
  transactionVolumeCategory: number;
  currency: string;

  constructor(data: Partial<Company> = {}) {
    this._id = data._id || "";
    this.logo = data.logo || "";
    this.localLogo = data.localLogo || "";
    this.owner = data.owner || { name: "" };
    this.name = data.name || { en: "", ar: "" };
    this.email = data.email || "";
    this.phone = data.phone || "";
    this.subscriptionType = data.subscriptionType || "";
    this.subscriptionStartDate = data.subscriptionStartDate || "";
    this.subscriptionEndDate = data.subscriptionEndDate || "";
    this.vat = new VAT(
      data.vat?.percentage,
      data.vat?.docNumber,
      data.vat?.vatRef
    );
    this.industry = data.industry || "";
    this.businessType = data.businessType || "";
    this.address = new BusinessAddress();
    Object.assign(this.address, data.address);
    this.status = data.status || "";
    this.businessTypeRef = data.businessTypeRef || "";
    this.ownerRef = data.ownerRef || "";
    this.wallet = data.wallet || false;
    this.minimumWalletBalance = data.minimumWalletBalance || 0;
    this.orderTypes = data.orderTypes || [];
    this.defaultCreditSetting = data.defaultCreditSetting || false;
    this.enableCredit = data.enableCredit || false;
    this.limitType = data.limitType || "";
    this.maximumCreditLimit = data.maximumCreditLimit || 0;
    this.allowChangeCredit = data.allowChangeCredit || false;
    this.maximumCreditPercent = data.maximumCreditPercent || 0;
    this.enableKitchenManagement = data.enableKitchenManagement || false;
    this.enableStcPay = data.enableStcPay || false;
    this.nearpay = data.nearpay || false;
    this.merchantId = data.merchantId || "";
    this.merchantName = data.merchantName || "";
    this.saptcoCompany = data.saptcoCompany || false;
    this.timezone = data.timezone || "Asia/Riyadh";
    this.syncMethod = data.syncMethod || "push-notification";
    this.transactionVolumeCategory = data.transactionVolumeCategory || 50000;
    this.currency = data.currency || "SAR";
  }
}

export class QROrderingConfiguration {
  constructor(
    public qrOrdering: boolean = false,
    public onlineOrdering: boolean = false,
    public deliveryRange: number = 0,
    public deliveryType: string = "",
    public paymentOptions: string = "",
    public paymentOptionsQr: string = "",
    public startTime: Date = new Date(),
    public endTime: Date = new Date(),
    public coordinates: { lat: string; lng: string } = { lat: "", lng: "" },
    public schedule: { startTime: string; endTime: string }[] = [],
    public geofencing: object = {}
  ) {}
}

export class PickupDeliveryConfiguration {
  constructor(
    public pickup: boolean = false,
    public delivery: boolean = false,
    public pickupNextAvailable: string = "",
    public deliveryNextAvailable: string = "",
    public pickupOffTill: string = "",
    public deliveryOffTill: string = ""
  ) {}
}

export class BusinessClosureSetting {
  constructor(
    public businessTime: boolean = false,
    public eventBasedTime: boolean = false,
    public extendedReporting: boolean = false,
    public endStartReporting: boolean = false,
    public defaultTime: boolean = false
  ) {}
}

export class RefundMode {
  constructor(
    public label: boolean = false,
    public value: boolean = false,
    public status: boolean = false
  ) {}
}

export class Location {
  _id: string;
  name: { en: string; ar: string };
  businessType: string;
  address: BusinessAddress;
  email: string;
  phone: string;
  vatRef: string;
  vat: { percentage: string };
  startTime: Date;
  endTime: Date;
  status: string;
  businessTypeRef: string;
  companyRef: string;
  ownerRef: string;
  negativeBilling: boolean;
  qrOrderingConfiguration: QROrderingConfiguration;
  pickupDeliveryConfiguration: PickupDeliveryConfiguration;
  channel: { name: string; status: boolean }[];
  dinein: boolean;
  courses: boolean;
  businessClosureSetting: BusinessClosureSetting;
  timeZone: string;
  refundModes: RefundMode[];
  enableRefundModesRestriction: boolean;

  constructor(data: Partial<Location> = {}) {
    this._id = data._id || "";
    this.name = data.name || { en: "", ar: "" };
    this.businessType = data.businessType || "";
    this.address = new BusinessAddress();
    Object.assign(this.address, data.address);
    this.email = data.email || "";
    this.phone = data.phone || "";
    this.vatRef = data.vatRef || "";
    this.vat = data.vat || { percentage: "0" };
    this.startTime = data.startTime || new Date();
    this.endTime = data.endTime || new Date();
    this.status = data.status || "";
    this.businessTypeRef = data.businessTypeRef || "";
    this.companyRef = data.companyRef || "";
    this.ownerRef = data.ownerRef || "";
    this.negativeBilling = data.negativeBilling || false;
    this.qrOrderingConfiguration = new QROrderingConfiguration();
    Object.assign(this.qrOrderingConfiguration, data.qrOrderingConfiguration);
    this.pickupDeliveryConfiguration = new PickupDeliveryConfiguration();
    Object.assign(
      this.pickupDeliveryConfiguration,
      data.pickupDeliveryConfiguration
    );
    this.channel = data.channel || [];
    this.dinein = data.dinein || false;
    this.courses = data.courses || false;
    this.businessClosureSetting = new BusinessClosureSetting();
    Object.assign(this.businessClosureSetting, data.businessClosureSetting);
    this.timeZone = data.timeZone || "";
    this.refundModes = (data.refundModes || []).map(
      (mode) => new RefundMode(mode.label, mode.value, mode.status)
    );
    this.enableRefundModesRestriction =
      data.enableRefundModesRestriction || false;
  }
}

export class BusinessDetails {
  _id?: string;
  company: Company;
  location: Location;
  source: "local" | "server";
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<BusinessDetails> = {}) {
    this._id = data._id;
    this.company = new Company(data.company);
    this.location = new Location(data.location);
    this.source = data.source || "local";
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  static fromRow(row: any): BusinessDetails {
    return new BusinessDetails({
      _id: row.id,
      company: new Company(JSON.parse(row.company)),
      location: new Location(JSON.parse(row.location)),
      source: row.source,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }

  static toRow(details: BusinessDetails): any {
    return {
      _id: details._id,
      company: JSON.stringify(details.company),
      location: JSON.stringify(details.location),
      source: details.source,
      createdAt: details.createdAt,
      updatedAt: details.updatedAt,
    };
  }
}
