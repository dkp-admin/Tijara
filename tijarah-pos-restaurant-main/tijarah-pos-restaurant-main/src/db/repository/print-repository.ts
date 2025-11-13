import * as ExpoPrintHelp from "expo-print-help";
import { Printer } from "../schema/printer";
import { BaseRepository } from "./base-repository";

export class PrinterRepository extends BaseRepository<Printer, string> {
  private printerInited?: boolean;

  constructor() {
    super("printer");
    this.init();
  }

  async create(printer: Printer): Promise<Printer> {
    const id = printer._id;
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO printer (
        _id, name, device_name, device_id, product_id,
        vendor_id, printerType, printerSize, ip, port,
        enableReceipts, enableKOT, numberOfKots, enableBarcodes,
        printerWidthMM, charsPerLine, kitchen, kitchenRef, createdAt, updatedAt
      ) VALUES (
        $id, $name, $device_name, $device_id, $product_id,
        $vendor_id, $printerType, $printerSize, $ip, $port,
        $enableReceipts, $enableKOT, $numberOfKots, $enableBarcodes,
        $printerWidthMM, $charsPerLine, $kitchen, $kitchenRef, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT(_id) DO UPDATE SET
        name = $name,
        numberOfKots = $numberOfKots,
        device_name = $device_name,
        device_id = $device_id,
        product_id = $product_id,
        vendor_id = $vendor_id,
        printerType = $printerType,
        printerSize = $printerSize,
        ip = $ip,
        port = $port,
        enableReceipts = $enableReceipts,
        enableKOT = $enableKOT,
        enableBarcodes = $enableBarcodes,
        printerWidthMM = $printerWidthMM,
        charsPerLine = $charsPerLine,
        kitchen = $kitchen,
        kitchenRef = $kitchenRef,
        updatedAt = CURRENT_TIMESTAMP
    `);

    const params: any = {
      $id: printer._id,
      $name: printer.name,
      $device_name: printer.device_name,
      $device_id: printer.device_id,
      $product_id: printer.product_id,
      $vendor_id: printer.vendor_id,
      $printerType: printer.printerType,
      $numberOfKots: printer.numberOfKots || 1,
      $printerSize: printer.printerSize,
      $ip: printer.ip,
      $port: printer.port,
      $enableReceipts: Number(printer.enableReceipts),
      $enableKOT: Number(printer.enableKOT),
      $enableBarcodes: Number(printer.enableBarcodes),
      $printerWidthMM: printer.printerWidthMM,
      $charsPerLine: printer.charsPerLine,
      $kitchen: printer.kitchen ? JSON.stringify(printer.kitchen) : null,
      $kitchenRef: printer.kitchenRef || null,
    };

    try {
      await statement.executeAsync(params);
    } finally {
      await statement.finalizeAsync();
    }

    printer._id = id;
    return printer;
  }

  async createMany(printers: Printer[]): Promise<Printer[]> {
    const columns = [
      "_id",
      "name",
      "device_name",
      "numberOfKots",
      "device_id",
      "product_id",
      "vendor_id",
      "printerType",
      "printerSize",
      "ip",
      "port",
      "enableReceipts",
      "enableKOT",
      "enableBarcodes",
      "printerWidthMM",
      "charsPerLine",
      "kitchen",
      "kitchenRef",
    ];

    const generateParams = (printer: Printer) => {
      const toRow = Printer.toRow(printer);
      return [
        toRow._id,
        toRow.name,
        toRow.device_name,
        toRow.device_id,
        toRow.numberOfKots,
        toRow.product_id,
        toRow.vendor_id,
        toRow.printerType,
        toRow.printerSize,
        toRow.ip,
        toRow.port,
        toRow.enableReceipts,
        toRow.enableKOT,
        toRow.enableBarcodes,
        toRow.printerWidthMM,
        toRow.charsPerLine,
        toRow.kitchen,
        toRow.kitchenRef || null,
      ];
    };

    return this.createManyGeneric("printer", printers, columns, generateParams);
  }

  async update(id: string, printer: Printer): Promise<Printer> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE printer SET
        name = $name,
        device_name = $device_name,
        device_id = $device_id,
        product_id = $product_id,
        numberOfKots = $numberOfKots,
        vendor_id = $vendor_id,
        printerType = $printerType,
        printerSize = $printerSize,
        ip = $ip,
        port = $port,
        enableReceipts = $enableReceipts,
        enableKOT = $enableKOT,
        enableBarcodes = $enableBarcodes,
        printerWidthMM = $printerWidthMM,
        charsPerLine = $charsPerLine,
        kitchen = $kitchen,
        kitchenRef = $kitchenRef,
        updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
        $name: printer.name,
        $device_name: printer.device_name,
        $device_id: printer.device_id,
        $product_id: printer.product_id,
        $vendor_id: printer.vendor_id,
        $numberOfKots: printer.numberOfKots,
        $printerType: printer.printerType,
        $printerSize: printer.printerSize,
        $ip: printer.ip,
        $port: printer.port,
        $enableReceipts: Number(printer.enableReceipts),
        $enableKOT: Number(printer.enableKOT),
        $enableBarcodes: Number(printer.enableBarcodes),
        $printerWidthMM: printer.printerWidthMM,
        $charsPerLine: printer.charsPerLine,
        $kitchen: printer.kitchen ? JSON.stringify(printer.kitchen) : null,
        $kitchenRef: printer.kitchenRef || null,
      });
    } finally {
      await statement.finalizeAsync();
    }

    printer._id = id;
    return printer;
  }

  async delete(id: string): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM printer WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
      });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findById(id: string): Promise<Printer> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM printer WHERE _id = $id
    `);

    const result = await statement.executeAsync({
      $id: id,
    });

    const row = await result.getFirstAsync();
    if (!row) {
      throw new Error("Printer not found");
    }

    return Printer.fromRow(row);
  }

  async findAll(): Promise<Printer[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM printer
    `);

    const result = await statement.executeAsync({});
    const rows = await result.getAllAsync();
    return rows.map((row) => Printer.fromRow(row));
  }

  // Expo Print specific methods
  public async isConnected(): Promise<boolean> {
    const row = await this.db.getConnection().getFirstAsync(`
      SELECT * FROM printer WHERE enableReceipts = 1
    `);
    return !!row;
  }

  public async isKOTConnected(): Promise<boolean> {
    const row = await this.db.getConnection().getFirstAsync(`
      SELECT * FROM printer WHERE enableKOT = 1
    `);
    return !!row;
  }

  public async connect({ product_id }: { product_id: string }) {
    if (!this.printerInited) {
      await this.init();
    }
    return await ExpoPrintHelp.connect(product_id);
  }

  public async init() {
    await ExpoPrintHelp.initialize();
    this.printerInited = true;
  }

  public isInitialized(): boolean {
    return !!this.printerInited;
  }

  public async getDeviceList() {
    if (!this.printerInited) {
      await this.init();
    }

    return ExpoPrintHelp.getDeviceList();
  }

  // Additional utility methods
  async findByKitchen(kitchenRef: string | string[]): Promise<Printer[]> {
    // Convert single kitchen ID to array for consistent handling
    const kitchenRefs = Array.isArray(kitchenRef) ? kitchenRef : [kitchenRef];

    // Handle empty input
    if (kitchenRefs.length === 0) {
      return [];
    }

    const placeholders = kitchenRefs
      .map((_, index) => `$kitchenRef${index}`)
      .join(", ");

    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM printer 
      WHERE kitchenRef IN (${placeholders})
      AND enableKOT = 1
    `);

    const params = kitchenRefs.reduce((acc: any, ref, index) => {
      acc[`$kitchenRef${index}`] = ref;
      return acc;
    }, {});

    const result = await statement.executeAsync(params);
    const rows = await result.getAllAsync();
    return rows.map((row) => Printer.fromRow(row));
  }

  async findReceiptPrinters(): Promise<Printer[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM printer 
      WHERE enableReceipts = 1
    `);

    const result = await statement.executeAsync({});
    const rows = await result.getAllAsync();
    return rows.map((row) => Printer.fromRow(row));
  }

  async findKotPrinters(): Promise<Printer[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM printer 
      WHERE enableKOT = 1
    `);

    const result = await statement.executeAsync({});
    const rows = await result.getAllAsync();
    return rows.map((row) => Printer.fromRow(row));
  }

  async findByType(printerType: string): Promise<Printer[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM printer 
      WHERE printerType = $printerType
    `);

    const result = await statement.executeAsync({
      $printerType: printerType,
    });

    const rows = await result.getAllAsync();
    return rows.map((row) => Printer.fromRow(row));
  }

  async assignToKitchen(
    id: string,
    kitchenRef: string,
    kitchenName: string
  ): Promise<Printer> {
    const printer = await this.findById(id);
    printer.kitchenRef = kitchenRef;
    printer.kitchen = { name: kitchenName };
    printer.enableKOT = true;
    return this.update(id, printer);
  }
  async removeFromKitchen(id: string): Promise<Printer> {
    const printer = await this.findById(id);
    printer.kitchenRef = undefined;
    printer.kitchen = undefined;
    printer.enableKOT = false;
    return this.update(id, printer);
  }

  async deleteAll(): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM printer
    `);

    try {
      await statement.executeAsync({});
    } finally {
      await statement.finalizeAsync();
    }
  }
}
