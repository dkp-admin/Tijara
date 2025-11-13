import { requireNativeModule } from "expo";
const nativeModule = requireNativeModule("ExpoTijarahZatca");
export default {
    // Native module functions
    initializeConfig: nativeModule.initializeConfig,
    preProcessZatcaInvoice: nativeModule.preProcessZatcaInvoice,
    clearPrivateKeyCache: nativeModule.clearPrivateKeyCache,
    testTimezoneConversion: nativeModule.testTimezoneConversion,
};
//# sourceMappingURL=ExpoTijarahZatcaModule.js.map