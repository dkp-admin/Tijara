import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
class Name {
  @Column()
  en: string;

  @Column()
  ar: string;
}

@Entity()
class DateRange {
  @Column()
  from: string;

  @Column()
  to: string;
}

@Entity("ads-report")
export class AdsReportModel {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  adRef: string;

  @Column()
  type: string;

  @Column()
  adType: string;

  @Column()
  status: string;

  @Column()
  daysOfWeek: string;

  @Column()
  locationRef: string;

  @Column()
  deviceRef: string;

  @Column()
  companyRef: string;

  @Column()
  businessTypeRef: string;

  @Column()
  businessType: string;

  @Column()
  createdByRole: string;

  @Column("simple-json")
  adName: Name;

  @Column("simple-json")
  schedule: DateRange;

  @Column("simple-json")
  location: Name;

  @Column("simple-json")
  company: Name;

  @Column({ default: 0 })
  count: number;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}
