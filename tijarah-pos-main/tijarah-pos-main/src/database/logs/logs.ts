import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("logs")
export class LogsModel {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ nullable: true })
  entityName?: string;

  @Column({ nullable: true })
  eventName: string;

  @Column({ nullable: true })
  response: string;

  @Column({ nullable: true })
  eventType: string;

  @Column({ nullable: true })
  triggeredBy: string;

  @Column({ default: false, nullable: true })
  success: boolean;

  @Column({ type: "datetime", nullable: true })
  createdAt: Date;
}
