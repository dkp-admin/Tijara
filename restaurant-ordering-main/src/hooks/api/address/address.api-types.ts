export interface AddressCoordinates {
  lat: number | null;
  lng: number | null;
}

// Simple form data that components will pass to hooks
export interface AddressFormData {
  houseDetails: string;
  apartmentDetails: string;
  directions: string;
  addressType: 'home' | 'work' | 'other' | 'friendsFamily';
  mapAddress: string;
  coordinates: AddressCoordinates;
  friendsName?: string;
  friendsPhone?: string;
  friendsCountryCode?: string;
}

export interface AddressPayload {
  name: string;
  phone: string;
  customerRef: string;
  companyRef: string;
  company: { en: string; ar: string };
  fullAddress: string;
  houseFlatBlock: string;
  apartmentArea: string;
  directionToReach: string;
  coordinates: AddressCoordinates;
  type: string;
  otherName?: string;
  receiverName?: string;
  receiverPhone?: string;
}

export interface AddressResponse {
  _id: string;
  houseFlatBlock: string;
  apartmentArea: string;
  directionToReach: string;
  type: string;
  coordinates: AddressCoordinates;
  fullAddress: string;
  receiverName?: string;
  receiverPhone?: string;
}

export interface AddressQueryParams {
  id?: string;
  customerRef?: string;
}
