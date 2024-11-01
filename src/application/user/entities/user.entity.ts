import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  AutoIncrement,
  Column,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@ObjectType()
@Table
export class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column
  @Field(() => Int)
  id: number;

  @Column
  @Field(() => String)
  username: string;

  @Column
  @Field(() => String)
  password: string;

  @Column({ unique: true })
  @Field(() => String)
  email: string;

  @Column({ defaultValue: true })
  @Field(() => Boolean)
  isActive: boolean;

  @Column
  @Field(() => String)
  role: string;
}
