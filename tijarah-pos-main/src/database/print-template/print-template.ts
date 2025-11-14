import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("print-template")
export class PrintTemplateModel {
  @PrimaryGeneratedColumn("uuid")
  _id: string;

  @Column()
  name: string;

  @Column()
  locationRef: string;

  @Column("simple-json")
  location: LocationSchema;

  @Column()
  footer: string;

  @Column({ nullable: true })
  returnPolicy?: string;

  @Column({ nullable: true })
  customText?: string;

  @Column({ default: false })
  printBarcode?: boolean;

  @Column({ default: false })
  showToken?: boolean;

  @Column({ default: false })
  resetCounterDaily?: boolean;

  @Column({ default: false })
  showOrderType?: boolean;

  @Column()
  status: string;

  @Column({ type: "datetime" })
  createdAt: Date;

  @Column({ default: "server" })
  source: "local" | "server";
}

@Entity()
class LocationSchema {
  @Column()
  name: { en: string; ar: string };

  @Column()
  vat: string;

  @Column()
  address: string;
}
