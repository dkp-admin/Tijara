export interface SendOTPRequest {
  phone: string;
}

export interface VerifyOTPRequest {
  phone: string;
  otp: string;
  locationRef: string;
}

export interface UserDoc {
  name: string;
  profilePicture: string;
  email: string;
  phone: string;
  address: string;
  userType: string;
  permissions: string[];
  status: string;
  onboarded: boolean;
  locationRefs: string[];
  locations: unknown[];
  customerRef: string;
  assignedToAllLocation: boolean;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

export interface CustomerDoc {
  name: string;
  phone: string;
  address?: string; // Add optional address field
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
  _id: string;
  groups: unknown[];
  specialEvents: unknown[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface OTPResponse {
  success?: boolean;
  message?: string;
  token?: string;
  userDoc?: UserDoc;
  customerDoc?: CustomerDoc;
}
