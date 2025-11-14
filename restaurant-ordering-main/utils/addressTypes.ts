export const ADDRESS_TYPES = {
  home: {
    id: 'home',
    icon: '🏠',
    name: { en: 'Home', ar: 'المنزل' },
  },
  work: {
    id: 'work',
    icon: '💼',
    name: { en: 'Work', ar: 'العمل' },
  },
  friendsFamily: {
    id: 'friendsFamily',
    icon: '👥',
    name: { en: 'Friends and Family', ar: 'الأصدقاء والعائلة' },
  },
  other: {
    id: 'other',
    icon: '📍',
    name: { en: 'Other', ar: 'أخرى' },
  },
} as const;

export type AddressTypeId = keyof typeof ADDRESS_TYPES;

export interface Address {
  id: string;
  _id?: string;
  address: string;
  addressType: AddressTypeId;
  fullAddress: string;
  type?: string;
  houseFlatBlock?: string;
  apartmentArea?: string;
  directionToReach?: string;
  coordinates?: {
    lat: number | null;
    lng: number | null;
  };
  receiverName?: string;
  receiverPhone?: string;
}

export const FORM_DATA_KEY = 'personalDetailsFormData';
