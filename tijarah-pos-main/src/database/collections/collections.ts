import { Column, Entity } from "typeorm";
import { BsonObjectIdTransformer } from "../../utils/bsonObjectIdTransformer";

@Entity("collections")
export abstract class CollectionsModel {
  @Column({
    primary: true, // Marks column as primary
    transformer: new BsonObjectIdTransformer(),
    /* Other options... */
  })
  _id: string;

  @Column("simple-json")
  name: { en: string; ar: string };

  @Column("simple-json")
  company: { name: string };

  @Column()
  companyRef: string;

  @Column({ nullable: true })
  localImage?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ default: "active" })
  status: string;

  @Column({ default: "local" })
  source: "local" | "server";
}
