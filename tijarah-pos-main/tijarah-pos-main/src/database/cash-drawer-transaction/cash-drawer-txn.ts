import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BsonObjectIdTransformer } from "../../utils/bsonObjectIdTransformer";

@Entity("cash-drawer-txns")
export class CashDrawerTransactionModel {
  @Column({
    primary: true, // Marks column as primary
    transformer: new BsonObjectIdTransformer(),
    /* Other options... */
  })
  _id: string;

  @Column()
  userRef: string;

  @Column("simple-json")
  user: { name: string };

  @Column("simple-json")
  location: { name: string };

  @Column()
  locationRef: string;

  @Column("simple-json")
  company: { name: string };

  @Column()
  companyRef: string;

  @Column({ nullable: true, type: "decimal", precision: 10, scale: 2 })
  openingActual?: number;

  @Column({ nullable: true, type: "decimal", precision: 10, scale: 2 })
  openingExpected?: number;

  @Column({ nullable: true, type: "decimal", precision: 10, scale: 2 })
  closingActual?: number;

  @Column({ nullable: true, type: "decimal", precision: 10, scale: 2 })
  closingExpected?: number;

  @Column({ nullable: true, type: "decimal", precision: 10, scale: 2 })
  difference?: number;

  @Column({ nullable: true, type: "decimal", precision: 10, scale: 2 })
  totalSales?: number;

  @Column()
  transactionType: string;

  @Column()
  description: string;

  @Column()
  shiftIn: boolean;

  @Column()
  dayEnd: boolean;

  @Column({ type: "datetime" })
  started: Date;

  @Column({ type: "datetime" })
  ended: Date;

  @Column({ default: "local" })
  source: "local" | "server";
}
