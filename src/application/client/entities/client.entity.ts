import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Table,
  PrimaryKey,
  AutoIncrement,
  Column,
  Model,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from '../../user/entities/user.entity';

@ObjectType()
@Table
export class Client extends Model<Client> {
  @PrimaryKey
  @AutoIncrement
  @Column
  @Field(() => Int)
  id: number;

  @ForeignKey(() => User)
  @Column
  @Field(() => Int)
  userId: number;

  @Column
  @Field(() => String)
  name: string;

  @Column
  @Field(() => String)
  phone: string;

  @Column
  @Field(() => String)
  email: string;

  @Column
  @Field(() => String, { nullable: true })
  site?: string;

  @Column
  @Field(() => String)
  cnpj: string;

  @Column
  @Field(() => Boolean, { defaultValue: true })
  isActive: boolean;

  @Column
  @Field(() => String, { nullable: true })
  observation?: string;
}
