import { Column, Entity } from "typeorm";
import { BsonObjectIdTransformer } from "../../utils/bsonObjectIdTransformer";

@Entity("check-request")
export class CheckRequestModel {
  @Column({
    primary: true, // Marks column as primary
    transformer: new BsonObjectIdTransformer(),
    /* Other options... */
  })
  _id: string;

  @Column({})
  entityName: string;

  @Column({ default: () => "pending" })
  status: "success" | "failed" | "pending";

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  lastSync: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}
