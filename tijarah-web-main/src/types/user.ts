import { MoleculeType } from "src/permissionManager";

export interface User {
  _id: string;
  name: string;
  profilePicture: string;
  email: string;
  location: {
    name: string;
  };
  locationRef: string;
  locationRefs: string[];
  phone: string;
  pin: string;
  permissions: string[];
  status: string;
  role: {
    name: string;
  };
  roleRef: string;
  onboarded: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  userType: string;
  companyRef: string;
  customerRef: string;
  permission: MoleculeType[];
  company: {
    _id: string;
    name: {
      en: string;
      ar: string;
    };
    industry: string;
    businessType: string;
    logo: string;
    address: {
      address1: string;
      city: string;
      postalCode: string;
      country: string;
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
    status: string;
    vat: {
      vatRef: string;
      url: string;
      docNumber: string;
      percentage: number;
    };
    saptcoCompany?: boolean;
    businessTypeRef: string;
    channel: any[];
    ownerRef: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}
