import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("device-user")
export abstract class UsersModel {
  @PrimaryGeneratedColumn("uuid")
  _id: string;

  @Column()
  name: string;

  @Column("simple-json")
  company: {
    name: string;
  };

  @Column()
  companyRef: string;

  @Column("simple-json")
  location: {
    name: string;
  };

  @Column()
  locationRef: string;

  @Column()
  profilePicture: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  userType: string;

  @Column("simple-array")
  permissions: string[];

  @Column()
  status: string;

  @Column()
  onboarded: boolean;

  @Column()
  createdAt: string;

  @Column()
  updatedAt: string;

  @Column()
  __v: number;

  @Column()
  pin: string;

  @Column()
  id: string;

  @Column()
  key: string;

  @Column()
  value: string;
}
