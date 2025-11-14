export interface Customer {
  _id: string;
  name: string;
  phone: string;
  address?: string;
  totalSpent: number;
  totalRefunded: number;
  totalOrder: number;
  company: {
    name: string;
  };
  companyRef: string;
  userRef: string;
  locations: Array<{
    name: string;
  }>;
  locationRefs: string[];
  groupRefs: string[];
  groups: unknown[];
  specialEvents: unknown[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface UpdateCustomerRequest {
  name?: string;
  phone?: string;
  address?: string;
}

export interface UpdateCustomerResponse {
  acknowledged: boolean;
  modifiedCount: number;
  upsertedId: null | string;
  upsertedCount: number;
  matchedCount: number;
}
