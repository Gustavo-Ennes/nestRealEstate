import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  AllowNull,
  AutoIncrement,
  Column,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@ObjectType()
@Table
export class Tenant extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  @Field(() => Int)
  declare id: number;

  @Column
  @Field(() => String)
  declare name: string;

  @AllowNull
  @Column
  @Field(() => String, { nullable: true })
  declare cpf: string;

  @AllowNull
  @Column
  @Field(() => String, { nullable: true })
  declare cnpj: string;

  @Column
  @Field(() => String)
  declare email: string;

  @Column
  @Field(() => String)
  declare phone: string;
}
