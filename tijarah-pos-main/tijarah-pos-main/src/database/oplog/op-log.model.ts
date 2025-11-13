import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("opLogs")
export class OplogModel {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ nullable: true })
  requestId?: string;

  @Column()
  data: string;

  @Column()
  tableName: string;

  @Column()
  action: string;

  @Column()
  timestamp: Date;

  @Column()
  status: "pushed" | "pending";
}
