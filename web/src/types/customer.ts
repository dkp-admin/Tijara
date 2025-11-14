export interface Customer {
  _id: string;
  name: string;
  vat: string;
  email: string;
  phone: string;
  profilePicture: string;
  totalSpent: number;
  totalRefunded: number;
  totalOrder: number;
  lastOrderDate: string;
  company: { name: string };
  companyRef: string;
  credit: {
    allowCredit: boolean;
    maximumCredit: number;
    usedCredit: number;
    availableCredit: number;
    blockedCredit: boolean;
    blacklistCredit: boolean;
  };
  locations: any[];
  locationRefs: string[];
  specialEvents: any[];
  address: {
    address1: string;
    address2: string;
    city: string;
    postalCode: string;
    country: string;
    state: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerLog {
  id: string;
  createdAt: number;
  description: string;
  ip: string;
  method: string;
  route: string;
  status: number;
}

export interface CustomerEmail {
  id: string;
  description: string;
  createdAt: number;
}

export interface CustomerInvoice {
  id: string;
  issueDate: number;
  status: string;
  amount: number;
}

export enum EventNames {
  dateOfBirth = "dateOfBirth",
  anniversary = "anniversary",
  other = "other",
}
