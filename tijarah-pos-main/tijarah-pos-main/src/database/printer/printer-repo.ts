import * as ExpoPrintHelp from "expo-print-help";
import { DataSource, Repository } from "typeorm";
import { db } from "../../utils/createDatabaseConnection";
import { PrinterModel } from "./printer";

interface ICreatePrinterDto {
  _id: string;
  name: string;
  device_id: string;
  device_name: string;
  product_id: string;
  vendor_id: string;
  enableBarcodes: boolean;
  enableReceipts: boolean;
  enableKOT: boolean;
}

export class PrinterRepository {
  private ormRepository: Repository<PrinterModel>;

  constructor(connection: DataSource, private printerInited?: boolean) {
    this.ormRepository = connection.getRepository(PrinterModel);
    // ExpoPrintHelp.initialize().then(() => {
    //   this.printerInited = true;
    // });
  }

  public async isConnected(): Promise<any> {
    const printerDoc = await this.ormRepository.findOne({
      where: { enableReceipts: true },
    });

    if (!printerDoc) return false;
    return true;
  }

  public async isKOTConnected(): Promise<any> {
    const printerDoc = await this.ormRepository.findOne({
      where: { enableKOT: true },
    });

    if (!printerDoc) return false;
    return true;
  }

  public async getAll(): Promise<PrinterModel[]> {
    const connection = db;

    const query = connection
      .createQueryBuilder()
      .select("printer")
      .from(PrinterModel, "printer")
      // .where("printer._id LIKE :id", { id: `%${id}%` })
      .getMany();

    return query;
  }

  public async create({
    name,
    device_id,
    device_name,
    vendor_id,
    product_id,
    enableBarcodes,
    enableReceipts,
    enableKOT,
  }: ICreatePrinterDto): Promise<PrinterModel> {
    const printer = this.ormRepository.create({
      name,
      device_id,
      device_name,
      vendor_id,
      product_id,
      enableBarcodes,
      enableReceipts,
      enableKOT,
    });

    await this.ormRepository.save(printer);

    return printer;
  }

  public async connect({ product_id }: { product_id: string }) {
    if (!this.printerInited)
      ExpoPrintHelp.initialize().then(() => {
        this.printerInited = true;
      });
    return await ExpoPrintHelp.connect(product_id);
  }

  public init() {
    if (!this.printerInited)
      ExpoPrintHelp.initialize().then(() => {
        this.printerInited = true;
      });
  }

  public isInitialized() {
    return this.printerInited;
  }

  public async printers() {
    if (!this.printerInited)
      ExpoPrintHelp.initialize().then(() => {
        this.printerInited = true;
      });
    return ExpoPrintHelp.getDeviceList();
  }

  public async update(
    _id: string,
    {
      name,
      device_id,
      device_name,
      product_id,
      vendor_id,
      enableBarcodes,
      enableReceipts,
      enableKOT,
    }: ICreatePrinterDto
  ): Promise<PrinterModel> {
    return await this.ormRepository.save({
      _id,
      name,
      device_id,
      device_name,
      product_id,
      vendor_id,
      enableBarcodes,
      enableReceipts,
      enableKOT,
    });
  }

  public async delete(_id: string): Promise<any> {
    this.ormRepository.delete(_id);
    return true;
  }

  public async deleteAll(): Promise<void> {
    await this.ormRepository.clear();
  }
}
