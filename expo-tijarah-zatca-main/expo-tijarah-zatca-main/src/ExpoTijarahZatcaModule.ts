import { NativeModule, requireNativeModule } from "expo";

import { ExpoTijarahZatcaModuleEvents } from "./ExpoTijarahZatca.types";

declare class ExpoTijarahZatcaModule extends NativeModule<ExpoTijarahZatcaModuleEvents> {
  initializeConfig(configJson: string): Promise<any>;

  preProcessZatcaInvoice(
    orderJson: string,
    companyJson: string,
    locationJson: string,
    deviceJson: string,
    invoiceSequence: number,
    previousInvoiceHash: string,
    refund: boolean
  ): Promise<any>;

  clearPrivateKeyCache(deviceCode: string): Promise<boolean>;

  testTimezoneConversion(utcDateTime: string): Promise<any>;
}

const nativeModule = requireNativeModule<ExpoTijarahZatcaModule>("ExpoTijarahZatca");

export default {
  // Native module functions
  initializeConfig: nativeModule.initializeConfig,
  preProcessZatcaInvoice: nativeModule.preProcessZatcaInvoice,
  clearPrivateKeyCache: nativeModule.clearPrivateKeyCache,
  testTimezoneConversion: nativeModule.testTimezoneConversion,
};
