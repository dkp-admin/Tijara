import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("void-comp")
export class VoidCompModel {
  @PrimaryGeneratedColumn("uuid")
  _id: string;

  @Column("simple-json")
  company: { name: string };

  @Column()
  companyRef: string;

  @Column("simple-json")
  reason: { en: string; ar: string };

  @Column()
  type: string;

  @Column()
  status: string;

  @Column()
  createdAt: string;

  @Column()
  updatedAt: string;

  @Column({ default: "server" })
  source: "local" | "server";
}
