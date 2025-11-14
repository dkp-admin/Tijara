import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("todos")
export class TodoModel {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  text: string;
}
