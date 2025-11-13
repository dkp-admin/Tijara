import { Column, Entity } from "typeorm";
import { BsonObjectIdTransformer } from "../../utils/bsonObjectIdTransformer";

@Entity("customer")
export class CustomersModel {
  @Column({
    primary: true, // Marks column as primary
    transformer: new BsonObjectIdTransformer(),
    /* Other options... */
  })
  _id: string;

  @Column({ nullable: true })
  profilePicture?: string;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true, length: 15 })
  vat?: string;

  @Column("simple-json")
  company: { name: string };

  @Column()
  companyRef: string;

  @Column("simple-array", { array: true, nullable: true })
  locations?: Object[];

  @Column("simple-json", { array: true, nullable: true })
  groups?: Object[];

  @Column("simple-array", { array: true, nullable: true })
  locationRefs?: string[];

  @Column("simple-array", { array: true, nullable: true })
  groupRefs?: string[];

  @Column({ nullable: true, default: false })
  allowCredit?: boolean;

  @Column({ nullable: true, default: 0 })
  maximumCredit?: number;

  @Column({ nullable: true, default: 0 })
  usedCredit?: number;

  @Column({ nullable: true, default: 0 })
  availableCredit?: number;

  @Column({ nullable: true, default: false })
  blockedCredit?: boolean;

  @Column({ nullable: true, default: false })
  blacklistCredit?: boolean;

  @Column("simple-json", { nullable: true })
  address?: {
    country: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    postalCode: string;
    state: string;
  };

  @Column("simple-json", { nullable: true, array: true })
  specialEvents?: SpecialEventsSchema[];

  @Column()
  totalSpend: number;

  @Column({ nullable: true, default: 0 })
  totalRefunded?: number;

  @Column()
  totalOrders: number;

  @Column("datetime")
  lastOrder: Date;

  @Column()
  status: string;

  @Column({ default: "local" })
  source: "local" | "server";
}

@Entity()
class SpecialEventsSchema {
  @Column("uuid")
  _id: string;

  @Column()
  name: string;

  @Column("date")
  date?: string;

  @Column()
  type?: string;
}
