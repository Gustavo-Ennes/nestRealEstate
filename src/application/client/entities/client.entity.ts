import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Table,
  PrimaryKey,
  AutoIncrement,
  Column,
  Model,
} from 'sequelize-typescript';

@ObjectType()
@Table
export class Client extends Model<Client> {
  @PrimaryKey
  @AutoIncrement
  @Column
  @Field(() => Int)
  id: number;

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
