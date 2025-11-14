import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("business-details")
export class BusinessDetailsModel {
  @PrimaryGeneratedColumn("uuid")
  _id: string;

  @Column("simple-json")
  company: {
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
    vat: { percentage: string; docNumber: string; vatRef: string };
    industry: string;
    businessType: string;
    address: {
      address1: string;
      address2: string;
      city: string;
      postalCode: string;
      country: string;
    };
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
    saptcoCompany: boolean;
  };

  @Column("simple-json")
  location: {
    _id: string;
    name: { en: string; ar: string };
    businessType: string;
    address: {
      address1: string;
      address2: string;
      country: string;
      state: string;
      city: string;
      postalCode: string;
    };
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
    qrOrderingConfiguration: {
      qrOrdering: boolean;
      onlineOrdering: boolean;
      deliveryRange: number;
      deliveryType: string;
      paymentOptions: string;
      paymentOptionsQr: string;
      startTime: Date;
      endTime: Date;
      coordinates: {
        lat: string;
        lng: string;
      };
      schedule: {
        startTime: string;
        endTime: string;
      }[];
      geofencing: object;
    };
    pickupDeliveryConfiguration: {
      pickup: boolean;
      delivery: boolean;
      pickupNextAvailable: string;
      deliveryNextAvailable: string;
      pickupOffTill: string;
      deliveryOffTill: string;
    };
    channel: {
      name: string;
      status: boolean;
    }[];
    dinein: boolean;
    courses: boolean;
    businessClosureSetting: {
      businessTime: boolean;
      eventBasedTime: boolean;
      extendedReporting: boolean;
      endStartReporting: boolean;
      defaultTime: boolean;
    };
    timeZone: string;
  };

  @Column()
  source: "local" | "server";
}
