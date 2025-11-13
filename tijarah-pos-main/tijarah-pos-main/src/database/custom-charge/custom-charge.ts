import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("custom-charge")
export class CustomChargeModel {
  @PrimaryGeneratedColumn("uuid")
  _id: string;

  @Column("simple-json")
  company: { name: { en: string; ar: string } };

  @Column()
  companyRef: string;

  @Column("simple-array", { array: true, nullable: true, default: [] })
  locationRefs?: string[];

  @Column("simple-json")
  name: { en: string; ar: string };

  @Column({ nullable: true })
  image?: string;

  @Column()
  value: number;

  @Column()
  type: string;

  @Column()
  chargeType: string;

  @Column()
  status: string;

  @Column({ default: "server" })
  source: "local" | "server";

  @Column({ default: "", nullable: true })
  taxRef?: string;

  @Column("simple-json", { nullable: true })
  tax?: { percentage?: number };

  @Column({ default: "", nullable: true })
  channel?: string;

  @Column({ default: false, nullable: true })
  applyAutoChargeOnOrders?: boolean;

  @Column({ default: false, nullable: true })
  skipIfOrderValueIsAbove?: boolean;

  @Column({ default: 0, nullable: true })
  orderValue?: number;
}
