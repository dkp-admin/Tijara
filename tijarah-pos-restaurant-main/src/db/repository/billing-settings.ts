import { BaseRepository } from "./base-repository";
import { BillingSettings } from "../schema/billing-settings";

export class BillingSettingsRepository extends BaseRepository<
  BillingSettings,
  string
> {
  constructor() {
    super('"billing-settings"');
  }

  async create(settings: BillingSettings): Promise<BillingSettings> {
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO "billing-settings" (
        _id, quickAmounts, catalogueManagement, paymentTypes, orderTypesList,
        cardPaymentOption, defaultCompleteBtn, defaultCash, noOfReceiptPrint,
        cashManagement, orderTypes, terminalId, keypad, discounts,
        promotions, customCharges, createdAt, updatedAt, source
      ) VALUES (
        $id, $quickAmounts, $catalogueManagement, $paymentTypes, $orderTypesList,
        $cardPaymentOption, $defaultCompleteBtn, $defaultCash, $noOfReceiptPrint,
        $cashManagement, $orderTypes, $terminalId, $keypad, $discounts,
        $promotions, $customCharges, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $source
      )
      ON CONFLICT(_id) DO UPDATE SET
        quickAmounts = $quickAmounts,
        catalogueManagement = $catalogueManagement,
        paymentTypes = $paymentTypes,
        orderTypesList = $orderTypesList,
        cardPaymentOption = $cardPaymentOption,
        defaultCompleteBtn = $defaultCompleteBtn,
        defaultCash = $defaultCash,
        noOfReceiptPrint = $noOfReceiptPrint,
        cashManagement = $cashManagement,
        orderTypes = $orderTypes,
        terminalId = $terminalId,
        keypad = $keypad,
        discounts = $discounts,
        promotions = $promotions,
        customCharges = $customCharges,
        source = $source,
        updatedAt = CURRENT_TIMESTAMP
    `);

    const params: any = {
      $id: settings._id,
      $quickAmounts: Number(settings.quickAmounts),
      $catalogueManagement: Number(settings.catalogueManagement),
      $paymentTypes: JSON.stringify(settings.paymentTypes),
      $orderTypesList: JSON.stringify(settings.orderTypesList),
      $cardPaymentOption: settings.cardPaymentOption,
      $defaultCompleteBtn: settings.defaultCompleteBtn,
      $defaultCash: settings.defaultCash,
      $noOfReceiptPrint: settings.noOfReceiptPrint,
      $cashManagement: Number(settings.cashManagement),
      $orderTypes: settings.orderTypes,
      $terminalId: settings.terminalId,
      $keypad: Number(settings.keypad),
      $discounts: Number(settings.discounts),
      $promotions: Number(settings.promotions),
      $customCharges: Number(settings.customCharges),
      $source: settings?.source || "server",
    };

    try {
      const result = await statement.executeAsync(params);
      const created = await result.getFirstAsync();
      return created ? BillingSettings.fromRow(created) : settings;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async createMany(
    settingsList: BillingSettings[]
  ): Promise<BillingSettings[]> {
    const columns = [
      "_id",
      "quickAmounts",
      "catalogueManagement",
      "paymentTypes",
      "orderTypesList",
      "cardPaymentOption",
      "defaultCompleteBtn",
      "defaultCash",
      "noOfReceiptPrint",
      "cashManagement",
      "orderTypes",
      "terminalId",
      "keypad",
      "discounts",
      "promotions",
      "customCharges",
      "source",
    ];

    const generateParams = (settings: BillingSettings) => {
      const toRowSetting = BillingSettings.toRow(settings);
      return [
        toRowSetting._id,
        toRowSetting.quickAmounts,
        toRowSetting.catalogueManagement,
        toRowSetting.paymentTypes,
        toRowSetting.orderTypesList,
        toRowSetting.cardPaymentOption,
        toRowSetting.defaultCompleteBtn,
        toRowSetting.defaultCash,
        toRowSetting.noOfReceiptPrint,
        toRowSetting.cashManagement,
        toRowSetting.orderTypes,
        toRowSetting.terminalId,
        toRowSetting.keypad,
        toRowSetting.discounts,
        toRowSetting.promotions,
        toRowSetting.customCharges,
        toRowSetting.source || "server",
      ];
    };

    return this.createManyGeneric(
      "billing-settings",
      settingsList,
      columns,
      generateParams
    );
  }

  async update(
    id: string,
    settings: BillingSettings
  ): Promise<BillingSettings> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "billing-settings" SET
        quickAmounts = $quickAmounts,
        catalogueManagement = $catalogueManagement,
        paymentTypes = $paymentTypes,
        orderTypesList = $orderTypesList,
        cardPaymentOption = $cardPaymentOption,
        defaultCompleteBtn = $defaultCompleteBtn,
        defaultCash = $defaultCash,
        noOfReceiptPrint = $noOfReceiptPrint,
        cashManagement = $cashManagement,
        orderTypes = $orderTypes,
        terminalId = $terminalId,
        keypad = $keypad,
        discounts = $discounts,
        promotions = $promotions,
        customCharges = $customCharges,
        updatedAt=CURRENT_TIMESTAMP,
        source = $source
      WHERE _id = $id
    `);

    const params = {
      $id: id,
      $quickAmounts: Number(settings.quickAmounts),
      $catalogueManagement: Number(settings.catalogueManagement),
      $paymentTypes: JSON.stringify(settings.paymentTypes),
      $orderTypesList: JSON.stringify(settings.orderTypesList),
      $cardPaymentOption: settings.cardPaymentOption,
      $defaultCompleteBtn: settings.defaultCompleteBtn,
      $defaultCash: settings.defaultCash,
      $noOfReceiptPrint: settings.noOfReceiptPrint,
      $cashManagement: Number(settings.cashManagement),
      $orderTypes: settings.orderTypes,
      $terminalId: settings.terminalId,
      $keypad: Number(settings.keypad),
      $discounts: Number(settings.discounts),
      $promotions: Number(settings.promotions),
      $customCharges: Number(settings.customCharges),
      $source: settings.source || "server",
    };

    try {
      const result = await statement.executeAsync(params);
      const updated = await result.getFirstAsync();
      return updated ? BillingSettings.fromRow(updated) : settings;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async delete(id: string): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM "billing-settings" WHERE _id = $id
    `);

    try {
      await statement.executeAsync({ $id: id });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findById(id: string): Promise<BillingSettings> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "billing-settings" WHERE _id = $id
    `);

    try {
      const result = await statement.executeAsync({ $id: id });
      const row = await result.getFirstAsync();
      if (!row) {
        throw new Error("No billing settings found");
      }
      return BillingSettings.fromRow(row);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findAll(): Promise<BillingSettings[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "billing-settings"
    `);

    try {
      const result = await statement.executeAsync({});
      const rows = await result.getAllAsync();
      return rows.map((row) => BillingSettings.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByTerminalId(terminalId: string): Promise<BillingSettings | null> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "billing-settings" WHERE terminalId = $terminalId
    `);

    try {
      const result = await statement.executeAsync({ $terminalId: terminalId });
      const rows = await result.getAllAsync();
      return rows.length > 0 ? BillingSettings.fromRow(rows[0]) : null;
    } finally {
      await statement.finalizeAsync();
    }
  }
}
