import { Column, Entity } from "typeorm";
import { BsonObjectIdTransformer } from "../../utils/bsonObjectIdTransformer";

@Entity("printer")
export abstract class PrinterModel {
  @Column({
    primary: true, // Marks column as primary
    transformer: new BsonObjectIdTransformer(),
    /* Other options... */
  })
  _id: string;

  @Column()
  name: string;

  @Column({ default: "usb" })
  printerType: string;

  @Column()
  device_name: string;

  @Column({ default: "3-inch" })
  printerSize: string;

  @Column()
  device_id: string;

  @Column()
  product_id: string;

  @Column()
  vendor_id: string;

  @Column()
  enableReceipts: boolean;

  @Column({ default: false, nullable: true })
  enableKOT: boolean;

  @Column()
  enableBarcodes: boolean;

  @Column({ default: "72" })
  printerWidthMM: string;

  @Column({ default: "44" })
  charsPerLine: string;

  @Column("simple-json", { nullable: true })
  kitchen?: { name?: string };

  @Column({ nullable: true, default: "" })
  kitchenRef?: string;
}
