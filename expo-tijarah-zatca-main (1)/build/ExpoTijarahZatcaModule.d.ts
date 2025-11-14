declare const _default: {
    initializeConfig: (configJson: string) => Promise<any>;
    preProcessZatcaInvoice: (orderJson: string, companyJson: string, locationJson: string, deviceJson: string, invoiceSequence: number, previousInvoiceHash: string, refund: boolean) => Promise<any>;
    clearPrivateKeyCache: (deviceCode: string) => Promise<boolean>;
    testTimezoneConversion: (utcDateTime: string) => Promise<any>;
};
export default _default;
//# sourceMappingURL=ExpoTijarahZatcaModule.d.ts.map