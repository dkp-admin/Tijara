import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("section-tables")
export class SectionTablesModel {
  @PrimaryGeneratedColumn("uuid")
  _id: string;

  @Column("simple-json")
  company: { name: string };

  @Column()
  companyRef: string;

  @Column("simple-json")
  location: { name: string };

  @Column()
  locationRef: string;

  @Column("simple-json")
  name: { en: string; ar: string };

  @Column()
  floorType: string;

  @Column()
  tableNaming: string;

  @Column()
  numberOfTable: number;

  @Column("simple-json", { array: true })
  tables: TablesModal[];

  @Column()
  status: string;

  @Column({ default: "server" })
  source: "local" | "server";
}

@Entity()
class TablesModal {
  @Column()
  id: string;

  @Column()
  label: string;

  @Column()
  capacity: number;

  @Column()
  status: string;

  @Column()
  sectionRef: string;

  @Column()
  waiterRef: string;

  @Column("simple-json")
  waiter: { name: string };

  @Column("simple-json")
  childOne?: {};

  @Column("simple-json")
  childTwo?: {};

  @Column()
  openedAt: string;

  @Column()
  parentTable?: string;

  @Column()
  parentTableRef?: string;

  @Column()
  childTable?: boolean;

  @Column()
  parentTableCapacity?: number;

  @Column()
  noOfGuests?: number;
}
