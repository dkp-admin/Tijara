export interface Device {
  _id: string;
  name: string;
  profilePicture: string;
  email: string;
  phone: string;
  userType: string;
  permissions: string[];
  connectivityStatus: string;
  status: string;
  onboarded: boolean;
  companyRef: string;
  locationRef: string;
  deviceRef: string;
  company: {
    _id: string;
    name: {
      en: string;
      ar: string;
    };
    industry: string;
    businessType: string;
    logo: string;
    phone: string;
    email: string;
    address: {
      address1: string;
      address2: string;
      city: string;
      postalCode: string;
      country: string;
      state: string;
    };
    owner: {
      name: string;
    };
    configuration: {
      enableBatch: boolean;
      enableLoyalty: boolean;
      enableZatca: boolean;
      loyaltyPercentage: any;
      minimumRedeemAmount: any;
      enableInventoryTracking: boolean;
      enableKitchenManagement: boolean;
      nielsenReportEnabled: boolean;
    };
    subscriptionType: string;
    subscriptionEndDate: string;
    commercialRegistrationNumber: {
      url: string;
      docNumber: string;
      expiry: string;
    };
    status: string;
    vat: {
      url: string;
      vatRef: string;
      docNumber: string;
      percentage: string;
    };
    businessTypeRef: string;
    channel: any[];
    ownerRef: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  location: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
  tokenSequence: string;
}
