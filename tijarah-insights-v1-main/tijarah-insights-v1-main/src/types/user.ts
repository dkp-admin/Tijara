export interface User {
  _id: string;
  name: string;
  profilePicture: string;
  email: string;
  location: {
    name: string;
  };
  locationRef: string;
  phone: string;
  permissions: string[];
  status: string;
  onboarded: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  userType: string;
  companyRef: string;
  permission: string[];
  userProperties: {
    preferredLanguage: string;
  };
  company: {
    _id: string;
    name: {
      en: string;
      ar: string;
    };
    phone: string;
    email: string;
    businessType: string;
    industry: string;
    logo: string;
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
      enableInventoryTracking: boolean;
      enableLoyalty: boolean;
      loyaltyPercentage: number;
      minimumRedeemAmount: number;
    };
    subscriptionType: string;
    status: string;
    vat: {
      url: string;
      vatRef: string;
      docNumber: string;
      percentage: number;
    };
    businessTypeRef: string;
    ownerRef: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    subscriptionEndDate: string;
  };
}
