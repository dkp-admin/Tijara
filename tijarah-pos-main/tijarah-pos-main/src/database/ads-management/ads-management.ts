import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
class SlidesData {
  @Column({ enum: ["image", "video", "text-with-image"], default: "image" })
  contentType: string;

  @Column()
  displayBrandLogo: boolean;

  @Column()
  heading: string;

  @Column()
  description?: string;

  @Column()
  imageUrl: string;

  @Column()
  videoUrl: string;

  @Column()
  qrImage: string;

  @Column()
  duration: number;

  @Column()
  mute: boolean;
}

@Entity()
class DateRange {
  @Column()
  from: string;

  @Column()
  to: string;
}

@Entity()
class Name {
  @Column()
  en: string;

  @Column()
  ar: string;
}

@Entity("ads-management")
export class AdsManagementModel {
  @Column({
    primary: true, // Marks column as primary
  })
  _id: string;

  @Column("simple-json")
  name: Name;

  @Column()
  type: string;

  @Column("simple-json", { array: true, default: [] })
  slidesData: SlidesData[];

  @Column()
  status: string;

  @Column()
  priority: string;

  @Column("simple-array", { array: true, nullable: true })
  locationRefs?: string[];

  @Column("simple-array", { array: true, nullable: true })
  companyRefs: string[];

  @Column("simple-array", { array: true, nullable: true })
  businessTypeRefs: string[];

  @Column("simple-json")
  dateRange: DateRange;

  @Column("simple-array", { array: true, nullable: true })
  excludedLocationRefs: string[];

  @Column("simple-array", { array: true, nullable: true })
  excludedCompanyRefs: string[];

  @Column()
  daysOfWeek: string;

  @Column()
  createdByRole: string;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "datetime", nullable: true, default: null })
  lastPlayedAt?: Date;

  @Column()
  sentToPos: boolean;
}
